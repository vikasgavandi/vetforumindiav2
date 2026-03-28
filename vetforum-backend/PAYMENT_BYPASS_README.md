# Payment Service Bypass Mode

## Overview
The payment services have been configured with a **bypass mode** that allows you to develop and test the application without Razorpay and Zoom integrations. All payments will return mock responses, and other services will not hang or error.

## Current Configuration

### Bypass Mode: **ENABLED** ✅
- **Environment Variable**: `PAYMENT_BYPASS_MODE=true` (in `.env`)
- **Location**: `/backend/.env`

## What's Bypassed

### 1. **Razorpay Payment Service** (`src/utils/razorpayService.js`)
- ✅ `createOrder()` - Returns mock order with bypass ID
- ✅ `verifyPaymentSignature()` - Always returns `true`
- ✅ `getPaymentDetails()` - Returns mock payment data
- ✅ `refundPayment()` - Returns mock refund with bypass ID

### 2. **Payment Controller** (`src/controllers/paymentController.js`)
- ✅ All endpoints return successful responses even if payment services fail
- ✅ Mock meeting data is created if Zoom fails
- ✅ Graceful error handling - services won't hang

### 3. **Service Behavior**
All payment/zoom operations return mock data when bypass is enabled:
```javascript
// Example mock order ID
order_bypass_1735654800000_abc123def

// Example mock refund ID
rfnd_bypass_1735654800000_xyz789

// Example mock meeting
meeting_bypass_1735654800000
```

## How to Use

### Current State (Bypass Enabled)
The application is currently configured to bypass all payment services. You can:

1. **Create appointments** without payment issues
2. **Book consultations** without Razorpay
3. **Generate mock payments** with fake transaction IDs
4. **Process refunds** without real payment service calls

### API Endpoints (All Working)
```
POST /api/vetforumindia/v1/payments/create-order
POST /api/vetforumindia/v1/payments/verify
POST /api/vetforumindia/v1/payments/failure
POST /api/vetforumindia/v1/payments/refund/:appointmentId
GET /api/vetforumindia/v1/payments/status/:appointmentId
```

## When You're Ready to Enable Real Payments

### Step 1: Get Razorpay Credentials
1. Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Get your API Key and Secret

### Step 2: Get Zoom Credentials
1. Sign up at [Zoom App Marketplace](https://marketplace.zoom.us)
2. Create a JWT app or OAuth app
3. Get your API Key and Secret

### Step 3: Update .env File
```bash
# Disable bypass mode
PAYMENT_BYPASS_MODE=false

# Add real Razorpay credentials
RAZORPAY_KEY_ID=your_actual_razorpay_key_id
RAZORPAY_KEY_SECRET=your_actual_razorpay_key_secret

# Add real Zoom credentials
ZOOM_API_KEY=your_actual_zoom_api_key
ZOOM_API_SECRET=your_actual_zoom_api_secret
```

### Step 4: Restart Server
```bash
npm run dev
```

## Service Logs

When bypass mode is enabled, you'll see logs like:
```
[BYPASS MODE] Mock Razorpay order created {
  orderId: 'order_bypass_1735654800000_abc123',
  amount: 500000,
  receipt: 'appointment_123'
}

[BYPASS MODE] Payment signature verified (bypass mode) {
  orderId: 'order_bypass_...',
  paymentId: 'pay_bypass_...',
  isValid: true
}

⚠️  PAYMENT BYPASS MODE ENABLED - All payments will be mocked
```

## Important Notes

### ✅ What Still Works
- User authentication and registration
- Appointment scheduling
- All CRUD operations
- Zoom API calls (with mock in bypass mode)
- Payment status tracking
- Refund processing (mock)
- Admin operations
- Quiz, Blogs, Posts, Jobs, etc.

### ⚠️ Bypass Mode Behavior
- All payment IDs are prefixed with `bypass_`
- Payment signatures always validate
- Zoom meeting URLs are mock URLs
- No actual transactions are processed
- Refunds are instant and mock

### 🚀 Testing Tips
1. Use mock payment IDs in your frontend
2. Test the entire appointment flow
3. Verify payment status tracking works
4. Test refund logic without real transactions
5. Ensure other services aren't affected

## Environment Setup

The bypass mode is already enabled. If you want to verify:

```bash
# Check current setting
grep PAYMENT_BYPASS_MODE .env
# Should output: PAYMENT_BYPASS_MODE=true
```

## Troubleshooting

### If Services Hang
- Check if `PAYMENT_BYPASS_MODE=true` in `.env`
- Restart the server: `npm run dev`
- Check logs for `[BYPASS MODE]` indicators

### If You See Razorpay Errors
- Make sure bypass mode is enabled
- Verify `.env` file has `PAYMENT_BYPASS_MODE=true`
- Check that razorpayService.js was updated correctly

### If Frontend Shows Payment Errors
- Use the mock order IDs from bypass mode
- Check the payment controller logs
- Verify appointment was created successfully

## Support

For real payment integration later, refer to:
- [Razorpay Documentation](https://razorpay.com/docs/payments/)
- [Zoom API Documentation](https://developers.zoom.com/docs/)
- API documentation in `mdfiles/RAZORPAY_INTEGRATION.md`

---

**Status**: ✅ Payment services bypassed and non-blocking
**Last Updated**: December 31, 2025
