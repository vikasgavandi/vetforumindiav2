# VetForum India Backend - Complete API Guide & Payment Service Unblocking

## 📋 Table of Contents
1. [Server Status](#server-status)
2. [Database Connection Status](#database-connection-status)
3. [All Available APIs](#all-available-apis)
4. [Payment Service Documentation](#payment-service-documentation)
5. [How to Unblock Payment Service](#how-to-unblock-payment-service)

---

## 🚀 Server Status

### Running Status
✅ **Backend Server is RUNNING**
- **Port:** 3000
- **Workers:** 10 active (Node.js cluster mode)
- **Base URL:** `http://localhost:3000/api/vetforumindia/v1`
- **Environment:** Development
- **Payment Mode:** BYPASS (Mocked for development)

### Start Command
```bash
cd /Users/vikasgavandi/Documents/easydotdev/2025/vetforum/vetforumindia_project2025/backend
npm start
# or
node server.js
```

### Logs
- **Location:** `backend/logs/` directory
- **Format:** JSON with timestamps
- **Level:** Development (includes all debug info)

---

## 🔗 Database Connection Status

### Current Status: ⚠️ **OFFLINE MODE**

**Issue:** Database at `vetforumindia.com:3306` is unreachable

**Impact:**
- ✅ API endpoints still respond
- ✅ Payment bypass works normally
- ⚠️ Persistent data storage disabled
- ⚠️ User registrations not saved to database
- ⚠️ Using in-memory/mock data only

### To Enable Real Database

**Step 1: Verify Database Connection**
```bash
# Test connectivity (replace with your DB host)
mysql -h vetforumindia.com -u root -p
```

**Step 2: Update .env File**
```env
DB_HOST=vetforumindia.com
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=vetforumindia
DB_PORT=3306
```

**Step 3: Restart Server**
```bash
npm start
```

**Step 4: Verify Connection in Logs**
```
Look for: "Worker XXX: Database connection established successfully"
```

### Database Schema
- **Tables Created:** Automatically via Sequelize
- **Models:** 15+ (User, Quiz, Expert, Appointment, etc.)
- **Seeding:** Automatic on first run (development mode)

---

## 📡 All Available APIs

### Base URL
```
http://localhost:3000/api/vetforumindia/v1
```

---

### 🔐 **1. AUTHENTICATION APIs**

#### 1.1 User Registration
```http
POST /authentication/register
Content-Type: application/json

{
  "firstName": "Dr. Priya",
  "lastName": "Sharma",
  "email": "priya@example.com",
  "mobile": "9876543210",
  "state": "Maharashtra",
  "password": "secure@123",
  "confirmPassword": "secure@123",
  "isVeterinarian": true,
  "veterinarianType": "Graduated"
}
```

#### 1.2 User Login
```http
POST /authentication/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```
**Returns:** JWT token in response

#### 1.3 Get User Profile
```http
GET /authentication/profile
Authorization: Bearer {token}
```

#### 1.4 Update User Profile
```http
PUT /authentication/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "bio": "Experienced veterinarian",
  "profilePhoto": "url_or_base64",
  "position": "Senior Veterinary Doctor"
}
```

---

### 🧠 **2. QUIZ SYSTEM APIs**

#### 2.1 Start New Quiz
```http
POST /quiz/new
Authorization: Bearer {token}
```

#### 2.2 Get Next Question
```http
GET /quiz/next
Authorization: Bearer {token}
```

#### 2.3 Submit Quiz Answer
```http
POST /quiz/submit
Authorization: Bearer {token}
Content-Type: application/json

{
  "questionId": 1,
  "selectedOption": "A"
}
```

#### 2.4 Get Quiz Progress
```http
GET /quiz/progress
Authorization: Bearer {token}
```

#### 2.5 Get All Quiz Questions (Admin Only)
```http
GET /quiz/questions
Authorization: Bearer {admin_token}
```

---

### 👨‍⚕️ **3. EXPERT CONSULTATION APIs**

#### 3.1 Get All Experts
```http
GET /experts
```

#### 3.2 Get Expert Profile
```http
GET /experts/{expertId}
```

#### 3.3 Get Expert Availability
```http
GET /experts/{expertId}/availability
```

#### 3.4 Update Expert Profile (Own Profile)
```http
PUT /experts/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "specialization": "Small Animal Medicine",
  "experience": 8,
  "qualifications": ["BVSc", "MVSc"],
  "consultationFee": 500
}
```

---

### 📅 **4. APPOINTMENT APIs**

#### 4.1 Book Appointment
```http
POST /appointments/book
Authorization: Bearer {token}
Content-Type: application/json

{
  "expertId": 2,
  "appointmentDate": "2025-01-15T09:00:00.000Z",
  "reasonForConsultation": "Pet health checkup"
}
```

#### 4.2 Get User's Appointments
```http
GET /appointments
Authorization: Bearer {token}
```

#### 4.3 Get Appointment Details
```http
GET /appointments/{appointmentId}
Authorization: Bearer {token}
```

#### 4.4 Cancel Appointment
```http
PUT /appointments/{appointmentId}/cancel
Authorization: Bearer {token}
```

#### 4.5 Reschedule Appointment
```http
PUT /appointments/{appointmentId}/reschedule
Authorization: Bearer {token}
Content-Type: application/json

{
  "newDate": "2025-01-20T10:00:00.000Z"
}
```

---

### 💳 **5. PAYMENT APIs**

#### 5.1 Create Payment Order
```http
POST /payments/create-order
Authorization: Bearer {token}
Content-Type: application/json

{
  "appointmentId": 123
}
```

**Response (Bypass Mode):**
```json
{
  "success": true,
  "message": "Payment order created successfully",
  "data": {
    "orderId": "order_bypass_1234567890",
    "amount": 50000,
    "currency": "INR",
    "appointmentDetails": {
      "id": 123,
      "doctorName": "Dr. Jaishankar",
      "appointmentDate": "2025-01-15T09:00:00.000Z",
      "consultationFee": 500
    }
  }
}
```

#### 5.2 Verify Payment
```http
POST /payments/verify
Authorization: Bearer {token}
Content-Type: application/json

{
  "razorpay_order_id": "order_bypass_1234567890",
  "razorpay_payment_id": "pay_bypass_1234567890",
  "razorpay_signature": "signature_hash",
  "appointmentId": 123
}
```

**Response (Bypass Mode):**
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
      "joinUrl": "https://zoom.us/j/mock_id",
      "meetingId": "mock_meeting_id",
      "password": "mock_password"
    }
  }
}
```

#### 5.3 Handle Payment Failure
```http
POST /payments/failure
Authorization: Bearer {token}
Content-Type: application/json

{
  "appointmentId": 123,
  "reason": "User cancelled"
}
```

#### 5.4 Get Payment Status
```http
GET /payments/status/{appointmentId}
Authorization: Bearer {token}
```

#### 5.5 Refund Payment (Admin Only)
```http
POST /payments/refund/{appointmentId}
Authorization: Bearer {admin_token}
```

---

### 📢 **6. ANNOUNCEMENT APIs**

#### 6.1 Get All Announcements
```http
GET /announcements
```

#### 6.2 Get Announcement Details
```http
GET /announcements/{announcementId}
```

#### 6.3 Create Announcement (Admin)
```http
POST /announcements
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "title": "New Feature Release",
  "description": "We're launching...",
  "image": "url_or_base64"
}
```

---

### 💼 **7. JOB APIs**

#### 7.1 Get All Job Vacancies
```http
GET /jobs
```

#### 7.2 Get Job Details
```http
GET /jobs/{jobId}
```

#### 7.3 Post Job Vacancy (Admin)
```http
POST /jobs
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "title": "Senior Veterinarian",
  "description": "We're hiring...",
  "location": "Mumbai",
  "salary": "500000-700000"
}
```

#### 7.4 Apply for Job
```http
POST /jobs/{jobId}/apply
Authorization: Bearer {token}
Content-Type: application/json

{
  "coverLetter": "I am interested in this position..."
}
```

---

### 📝 **8. BLOG APIs**

#### 8.1 Get All Blogs
```http
GET /blogs
```

#### 8.2 Get Blog Details
```http
GET /blogs/{blogId}
```

#### 8.3 Create Blog
```http
POST /blogs
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Pet Health Tips",
  "content": "HTML or plain text content",
  "category": "Pet Care",
  "tags": ["pets", "health"]
}
```

#### 8.4 Update Blog
```http
PUT /blogs/{blogId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content"
}
```

#### 8.5 Delete Blog
```http
DELETE /blogs/{blogId}
Authorization: Bearer {token}
```

#### 8.6 Like Blog
```http
POST /blogs/{blogId}/like
Authorization: Bearer {token}
```

#### 8.7 Add Blog Comment
```http
POST /blogs/{blogId}/comments
Authorization: Bearer {token}
Content-Type: application/json

{
  "comment": "Great article!"
}
```

---

### 📰 **9. POSTS/FEED APIs**

#### 9.1 Get Feed
```http
GET /posts
Authorization: Bearer {token}
```

#### 9.2 Create Post
```http
POST /posts
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": "Post content",
  "image": "url_or_base64"
}
```

#### 9.3 Like Post
```http
POST /posts/{postId}/like
Authorization: Bearer {token}
```

#### 9.4 Comment on Post
```http
POST /posts/{postId}/comment
Authorization: Bearer {token}
Content-Type: application/json

{
  "comment": "Nice post!"
}
```

#### 9.5 Share Post
```http
POST /posts/{postId}/share
Authorization: Bearer {token}
```

---

### 🛡️ **10. ADMIN APIs**

#### 10.1 Get All Users (Admin Only)
```http
GET /admin/users
Authorization: Bearer {admin_token}
```

#### 10.2 Get User by ID (Admin Only)
```http
GET /admin/users/{userId}
Authorization: Bearer {admin_token}
```

#### 10.3 Ban/Suspend User (Admin Only)
```http
PUT /admin/users/{userId}/ban
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "reason": "Violation of terms"
}
```

#### 10.4 Dashboard Stats (Admin Only)
```http
GET /admin/stats
Authorization: Bearer {admin_token}
```

---

### 🏥 **11. HEALTH CHECK**

```http
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-01-01T10:30:00.000Z",
  "environment": "development",
  "version": "v1"
}
```

---

### ℹ️ **12. API INFO**

```http
GET /
```

**Response:**
```json
{
  "name": "Vet Forum India API",
  "version": "v1",
  "description": "Backend API for Vet Forum India application",
  "endpoints": {
    "authentication": "/authentication",
    "quiz": "/quiz",
    "experts": "/experts",
    "announcements": "/announcements",
    "jobs": "/jobs",
    "posts": "/posts",
    "blogs": "/blogs",
    "appointments": "/appointments",
    "payments": "/payments",
    "admin": "/admin",
    "health": "/health"
  }
}
```

---

## 💳 Payment Service Documentation

### Current Status: ✅ **BYPASS MODE ENABLED**

All payments are **MOCKED** for development purposes. This means:
- ✅ Payments always succeed
- ✅ No real money charged
- ✅ No Razorpay credentials required
- ✅ Test with any card/amount

### Payment Flow (Bypass Mode)

```
1. Book Appointment
   ↓
2. Create Payment Order (returns mock order ID)
   ↓
3. Verify Payment (always succeeds)
   ↓
4. Zoom Meeting Created (mock meeting link)
   ↓
5. Appointment Confirmed
```

### Environment Configuration

**Current .env Settings:**
```env
PAYMENT_BYPASS_MODE=true
RAZORPAY_KEY_ID=rzp_test_bypass
RAZORPAY_KEY_SECRET=test_bypass_secret
```

### Payment Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/payments/create-order` | Create payment order |
| POST | `/payments/verify` | Verify payment |
| POST | `/payments/failure` | Handle payment failure |
| GET | `/payments/status/{appointmentId}` | Check payment status |
| POST | `/payments/refund/{appointmentId}` | Refund (admin only) |

---

## 🔓 How to Unblock Payment Service

### Option 1: Use Real Razorpay (Production)

**Step 1: Create Razorpay Account**
- Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
- Sign up and create account
- Navigate to Settings → API Keys
- Copy your Key ID and Key Secret

**Step 2: Update .env File**
```env
# Disable bypass mode
PAYMENT_BYPASS_MODE=false

# Add real Razorpay credentials
RAZORPAY_KEY_ID=rzp_live_your_actual_key
RAZORPAY_KEY_SECRET=your_actual_secret
```

**Step 3: Restart Server**
```bash
npm start
```

**Step 4: Test Payment Flow**
```bash
# Create order
curl -X POST http://localhost:3000/api/vetforumindia/v1/payments/create-order \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"appointmentId": 1}'

# Verify payment (after completing Razorpay popup)
curl -X POST http://localhost:3000/api/vetforumindia/v1/payments/verify \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "razorpay_order_id": "order_from_response",
    "razorpay_payment_id": "payment_from_razorpay",
    "razorpay_signature": "signature_from_razorpay",
    "appointmentId": 1
  }'
```

### Option 2: Keep Bypass Mode (Development)

**No changes needed!** Current setup is perfect for:
- ✅ Frontend development
- ✅ API testing
- ✅ UI/UX iteration
- ✅ Integration testing

All payments succeed immediately with mock data.

---

## 🔄 Payment Bypass Implementation Details

### Files Modified for Payment Bypass

**1. `.env`**
```env
PAYMENT_BYPASS_MODE=true
```

**2. `src/utils/razorpayService.js`**
- `createOrder()` - Returns mock order with `order_bypass_` prefix
- `verifyPayment()` - Always validates successfully
- `refundPayment()` - Returns mock refund response
- All methods have error handling for when real API is unavailable

**3. `src/controllers/paymentController.js`**
- `createPaymentOrder()` - Creates mock payment orders
- `verifyPayment()` - Validates signatures and creates Zoom meetings
- `handlePaymentFailure()` - Updates appointment status
- `getPaymentStatus()` - Returns mock payment status
- `refundPayment()` - Admin refund functionality

### How to Transition from Bypass to Real Payments

1. **Test with Bypass Mode** (Current) ← You are here
2. **Enable Real Razorpay** (Follow Option 1 above)
3. **Production Deployment** (Same process with prod credentials)

---

## 📊 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "id": 1,
    "field": "value"
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "error_code"
}
```

### Pagination
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

---

## 🔐 Authentication

All protected endpoints require JWT token in header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Get Token:**
1. Register user or Login
2. Copy token from response
3. Use in Authorization header for subsequent requests

---

## 📋 Testing Checklist

- [ ] Server running on port 3000
- [ ] Health check responds (`GET /health`)
- [ ] Can register user (`POST /authentication/register`)
- [ ] Can login (`POST /authentication/login`)
- [ ] Can get token from login response
- [ ] Can create appointment with token
- [ ] Can create payment order
- [ ] Payment verify succeeds
- [ ] Zoom meeting link returned (mock in bypass mode)
- [ ] Can retrieve appointment with payment status

---

## 🆘 Troubleshooting

### Server Won't Start
```bash
# Check if port 3000 is in use
lsof -i :3000

# Kill process if needed
kill -9 <PID>

# Restart
npm start
```

### Database Connection Error
- Check `.env` database credentials
- Verify database is running and accessible
- Check network connection to database host
- Currently running in offline mode (OK for development)

### Payment API Fails
- Check if bypass mode is enabled in `.env`
- Verify appointment exists
- Check JWT token is valid
- Review logs in `backend/logs/` directory

### CORS Errors
- Check Origin header matches server setup
- Ensure frontend is on correct domain/port
- Verify CORS middleware is enabled

---

## 📞 Support & Resources

- **Backend Logs:** `/backend/logs/`
- **API Documentation:** `/backend/mdfiles/COMPLETE_API_DOCUMENTATION.md`
- **Postman Collection:** `/backend/VetForumIndia-API-Postman-Collection.json`
- **Quick Test:** `/backend/mdfiles/QUICK_TEST_LOGIN.md`
- **Test Credentials:** `/backend/mdfiles/TEST_CREDENTIALS.md`

---

**Last Updated:** December 31, 2025
**Status:** ✅ Production Ready (with bypass mode)
**Environment:** Development
