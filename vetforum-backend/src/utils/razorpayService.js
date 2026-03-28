const crypto = require('crypto');
const logger = require('../middleware/logger');

// Check if payment bypass mode is enabled
const BYPASS_PAYMENT = process.env.PAYMENT_BYPASS_MODE === 'true';

let Razorpay;
if (!BYPASS_PAYMENT) {
  try {
    Razorpay = require('razorpay');
  } catch (error) {
    logger.warn('Razorpay package not available, payment bypass mode will be used');
  }
}

class RazorpayService {
  constructor() {
    this.bypassMode = BYPASS_PAYMENT;
    
    if (!this.bypassMode && Razorpay) {
      this.razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
      });
    }
    
    if (this.bypassMode) {
      logger.warn('⚠️  PAYMENT BYPASS MODE ENABLED - All payments will be mocked');
    }
  }

  async createOrder(amount, currency = 'INR', receipt, notes = {}) {
    try {
      // If bypass mode is enabled, return mock order
      if (this.bypassMode) {
        const mockOrderId = `order_bypass_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        logger.info('[BYPASS MODE] Mock Razorpay order created', {
          orderId: mockOrderId,
          amount: Math.round(amount * 100),
          receipt: receipt,
          notes: notes
        });
        
        return {
          id: mockOrderId,
          amount: Math.round(amount * 100),
          amount_paid: 0,
          amount_due: Math.round(amount * 100),
          currency: currency,
          receipt: receipt,
          status: 'created',
          notes: notes,
          created_at: Math.floor(Date.now() / 1000)
        };
      }

      // Real Razorpay implementation
      const options = {
        amount: Math.round(amount * 100), // Convert to paise
        currency,
        receipt,
        notes
      };

      const order = await this.razorpay.orders.create(options);
      
      logger.info('Razorpay order created', {
        orderId: order.id,
        amount: order.amount,
        receipt: order.receipt
      });

      return order;
    } catch (error) {
      logger.error('Error creating Razorpay order:', error);
      throw new Error('Failed to create payment order');
    }
  }

  verifyPaymentSignature(orderId, paymentId, signature) {
    try {
      // If bypass mode is enabled, always return valid signature
      if (this.bypassMode) {
        logger.info('[BYPASS MODE] Payment signature verified (bypass mode)', {
          orderId,
          paymentId,
          isValid: true
        });
        return true;
      }

      const body = orderId + '|' + paymentId;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

      const isValid = expectedSignature === signature;
      
      logger.info('Payment signature verification', {
        orderId,
        paymentId,
        isValid
      });

      return isValid;
    } catch (error) {
      logger.error('Error verifying payment signature:', error);
      return false;
    }
  }

  async getPaymentDetails(paymentId) {
    try {
      // If bypass mode is enabled, return mock payment details
      if (this.bypassMode) {
        logger.info('[BYPASS MODE] Mock payment details returned', {
          paymentId,
          status: 'captured'
        });
        
        return {
          id: paymentId,
          entity: 'payment',
          amount: 10000,
          currency: 'INR',
          status: 'captured',
          method: 'card',
          description: 'Consultation Payment (Bypass Mode)',
          amount_refunded: 0,
          refund_status: null,
          captured: true,
          card_id: 'card_bypass',
          bank: null,
          wallet: null,
          vpa: null,
          email: 'test@example.com',
          contact: '+919999999999',
          notes: {},
          fee: 0,
          tax: 0,
          error_code: null,
          error_description: null,
          created_at: Math.floor(Date.now() / 1000)
        };
      }

      const payment = await this.razorpay.payments.fetch(paymentId);
      
      logger.info('Payment details fetched', {
        paymentId,
        status: payment.status
      });

      return payment;
    } catch (error) {
      logger.error('Error fetching payment details:', error);
      throw new Error('Failed to fetch payment details');
    }
  }

  async refundPayment(paymentId, amount = null, notes = {}) {
    try {
      // If bypass mode is enabled, return mock refund
      if (this.bypassMode) {
        const mockRefundId = `rfnd_bypass_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        logger.info('[BYPASS MODE] Mock payment refunded', {
          paymentId,
          refundId: mockRefundId,
          amount: amount
        });
        
        return {
          id: mockRefundId,
          entity: 'refund',
          payment_id: paymentId,
          amount: Math.round((amount || 0) * 100),
          currency: 'INR',
          status: 'processed',
          speed_processed: 'normal',
          speed_requested: 'normal',
          notes: notes || {},
          reason: notes.reason || 'Appointment cancelled',
          created_at: Math.floor(Date.now() / 1000)
        };
      }

      const refundData = {
        notes
      };
      
      if (amount) {
        refundData.amount = Math.round(amount * 100); // Convert to paise
      }

      const refund = await this.razorpay.payments.refund(paymentId, refundData);
      
      logger.info('Payment refunded', {
        paymentId,
        refundId: refund.id,
        amount: refund.amount
      });

      return refund;
    } catch (error) {
      logger.error('Error processing refund:', error);
      throw new Error('Failed to process refund');
    }
  }
}

module.exports = new RazorpayService();