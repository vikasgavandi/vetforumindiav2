# Razorpay Integration for Video Consultation Payments

## 🎯 Overview

Integrated Razorpay payment gateway for secure video consultation payments with automatic Zoom meeting creation upon successful payment.

---

## 🔧 Setup & Configuration

### Environment Variables
Add to your `.env` file:
```env
# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### Razorpay Dashboard Setup
1. **Create Account**: Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. **Get API Keys**: Navigate to Settings → API Keys
3. **Enable Payment Methods**: Configure accepted payment methods
4. **Webhook Setup**: Configure webhooks for payment notifications

---

## 📊 Payment Flow

### 1. Book Appointment
```http
POST /api/vetforumindia/v1/appointments/book
Authorization: Bearer <token>

{
  "expertId": 1,
  "appointmentDate": "2025-01-15T09:00:00.000Z",
  "reasonForConsultation": "Pet health consultation"
}
```

### 2. Create Payment Order
```http
POST /api/vetforumindia/v1/payments/create-order
Authorization: Bearer <token>

{
  "appointmentId": 123
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "order_abc123",
    "amount": 150000,
    "currency": "INR",
    "appointmentDetails": {
      "id": 123,
      "doctorName": "Dr. Jaishankar, N",
      "appointmentDate": "2025-01-15T09:00:00.000Z",
      "consultationFee": 1500.00
    }
  }
}
```

### 3. Frontend Payment Integration
```javascript
// Frontend Razorpay integration
const options = {
  key: 'rzp_test_your_key_id',
  amount: orderData.amount,
  currency: orderData.currency,
  name: 'Vet Forum India',
  description: 'Video Consultation Payment',
  order_id: orderData.orderId,
  handler: function(response) {
    // Verify payment on backend
    verifyPayment(response);
  },
  prefill: {
    name: 'User Name',
    email: 'user@example.com',
    contact: '9999999999'
  },
  theme: {
    color: '#3399cc'
  }
};

const rzp = new Razorpay(options);
rzp.open();
```

### 4. Verify Payment
```http
POST /api/vetforumindia/v1/payments/verify
Authorization: Bearer <token>

{
  "razorpay_order_id": "order_abc123",
  "razorpay_payment_id": "pay_xyz789",
  "razorpay_signature": "signature_hash",
  "appointmentId": 123
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment successful. Video consultation scheduled.",
  "data": {
    "appointment": {
      "id": 123,
      "status": "confirmed",
      "paymentStatus": "paid"
    },
    "meetingDetails": {
      "joinUrl": "https://zoom.us/j/1234567890",
      "meetingId": "1234567890",
      "password": "abc123",
      "startTime": "2025-01-15T09:00:00.000Z"
    }
  }
}
```

---

## 💳 Payment APIs

### Create Payment Order
**Endpoint:** `POST /payments/create-order`
**Purpose:** Generate Razorpay order for appointment payment

### Verify Payment
**Endpoint:** `POST /payments/verify`
**Purpose:** Verify payment signature and create Zoom meeting

### Payment Failure
**Endpoint:** `POST /payments/failure`
**Purpose:** Handle payment failures and update appointment status

### Payment Status
**Endpoint:** `GET /payments/status/:appointmentId`
**Purpose:** Check current payment status of appointment

### Refund Payment (Admin)
**Endpoint:** `POST /payments/refund/:appointmentId`
**Purpose:** Process refunds for cancelled appointments

---

## 🔒 Security Features

### Payment Signature Verification
```javascript
// Server-side signature verification
const crypto = require('crypto');

const verifySignature = (orderId, paymentId, signature) => {
  const body = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');
  
  return expectedSignature === signature;
};
```

### Amount Validation
- Server-side amount verification
- Currency validation (INR)
- Order ID matching with appointment

### Payment Status Tracking
- Real-time payment status updates
- Automatic appointment confirmation
- Zoom meeting creation on success

---

## 📱 Frontend Integration Example

### React Payment Component
```jsx
import { useState } from 'react';

const PaymentComponent = ({ appointmentId, amount, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      // Create order
      const orderResponse = await fetch('/api/vetforumindia/v1/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ appointmentId })
      });
      
      const orderData = await orderResponse.json();
      
      // Initialize Razorpay
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: orderData.data.amount,
        currency: orderData.data.currency,
        name: 'Vet Forum India',
        description: 'Video Consultation Payment',
        order_id: orderData.data.orderId,
        handler: async (response) => {
          // Verify payment
          const verifyResponse = await fetch('/api/vetforumindia/v1/payments/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              ...response,
              appointmentId
            })
          });
          
          const result = await verifyResponse.json();
          if (result.success) {
            onSuccess(result.data);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          }
        }
      };
      
      const rzp = new window.Razorpay(options);
      rzp.open();
      
    } catch (error) {
      console.error('Payment error:', error);
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handlePayment} 
      disabled={loading}
      className="payment-button"
    >
      {loading ? 'Processing...' : `Pay ₹${amount}`}
    </button>
  );
};
```

---

## 🔄 Payment States

### Appointment Payment Status
- `pending` - Payment not initiated
- `paid` - Payment successful, meeting created
- `failed` - Payment failed, appointment cancelled
- `refunded` - Payment refunded, appointment cancelled

### Appointment Status Flow
```
pending → (payment) → confirmed → completed
    ↓                      ↓
cancelled              cancelled (with refund)
```

---

## 📊 Error Handling

### Payment Errors
```javascript
// Common payment error scenarios
const handlePaymentError = (error) => {
  switch (error.code) {
    case 'BAD_REQUEST_ERROR':
      return 'Invalid payment request';
    case 'GATEWAY_ERROR':
      return 'Payment gateway error';
    case 'NETWORK_ERROR':
      return 'Network connection error';
    case 'SERVER_ERROR':
      return 'Server error, please try again';
    default:
      return 'Payment failed, please try again';
  }
};
```

### Retry Mechanism
- Automatic retry for network failures
- Manual retry option for users
- Payment status polling for confirmation

---

## 💰 Pricing & Fees

### Razorpay Pricing (India)
- **Domestic Cards**: 2% + GST
- **International Cards**: 3% + GST
- **Net Banking**: 2% + GST
- **UPI**: 2% + GST
- **Wallets**: 2% + GST

### Settlement
- **Instant Settlement**: Available for verified accounts
- **Standard Settlement**: T+2 working days
- **Settlement Account**: Configure bank account in dashboard

---

## 🧪 Testing

### Test Credentials
```env
# Test Mode
RAZORPAY_KEY_ID=rzp_test_your_test_key
RAZORPAY_KEY_SECRET=your_test_secret
```

### Test Cards
```
# Successful Payment
Card: 4111 1111 1111 1111
CVV: Any 3 digits
Expiry: Any future date

# Failed Payment
Card: 4000 0000 0000 0002
```

### Test UPI
```
# Successful UPI
UPI ID: success@razorpay

# Failed UPI
UPI ID: failure@razorpay
```

---

## 📈 Analytics & Reporting

### Payment Metrics
- Total revenue from consultations
- Payment success/failure rates
- Popular payment methods
- Refund statistics

### Dashboard Integration
- Real-time payment tracking
- Revenue analytics
- Doctor-wise earnings
- Monthly/yearly reports

This Razorpay integration provides a complete payment solution for the video consultation service with secure payment processing, automatic meeting creation, and comprehensive error handling.