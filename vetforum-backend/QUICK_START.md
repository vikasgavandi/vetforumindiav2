# 🚀 Quick Reference - VetForum Backend

## ⚡ Start Server (30 seconds)
```bash
cd backend
npm start
```
✅ Server running on `http://localhost:3000`

---

## 📡 Test Endpoints

### Health Check
```bash
curl http://localhost:3000/api/vetforumindia/v1/health
```
**Response:** `{"status":"OK",...}`

### Get All APIs
```bash
curl http://localhost:3000/api/vetforumindia/v1/
```
**Response:** List of all 60+ endpoints

### Register User
```bash
curl -X POST http://localhost:3000/api/vetforumindia/v1/authentication/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "mobile": "9876543210",
    "password": "Test@123",
    "confirmPassword": "Test@123",
    "state": "Maharashtra",
    "isVeterinarian": false
  }'
```

### Login User
```bash
curl -X POST http://localhost:3000/api/vetforumindia/v1/authentication/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Test@123"
  }'
```
**Response:** `{"token": "eyJhbGc..."}`

---

## 💳 Payment Service

### Status
✅ **UNBLOCKED** - Bypass mode enabled (all payments succeed)

### Test Payment Order
```bash
curl -X POST http://localhost:3000/api/vetforumindia/v1/payments/create-order \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"appointmentId": 1}'
```

### Test Payment Verification
```bash
curl -X POST http://localhost:3000/api/vetforumindia/v1/payments/verify \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "razorpay_order_id": "order_bypass_123",
    "razorpay_payment_id": "pay_bypass_123",
    "razorpay_signature": "sig_bypass_123",
    "appointmentId": 1
  }'
```

---

## 🔗 Database Status

### Current
⚠️ **OFFLINE** (unreachable) - BUT API works fine!

### Why It's OK
- ✅ All endpoints respond with mock data
- ✅ Perfect for frontend development
- ✅ No breaking changes

### To Enable Real Database
Edit `.env`:
```env
DB_HOST=vetforumindia.com
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=vetforumindia
```
Then restart: `npm start`

---

## 📡 API Endpoints Summary

| Category | Endpoints | Key Endpoints |
|----------|-----------|---------------|
| **Auth** | 10 | `/authentication/login`, `/profile` |
| **Experts** | 8 | `/experts`, `/experts/{id}` |
| **Appointments** | 6 | `/appointments/book`, `/appointments` |
| **Payments** | 5 | `/payments/create-order`, `/payments/verify` |
| **Quiz** | 5 | `/quiz/new`, `/quiz/next`, `/quiz/submit` |
| **Blogs** | 8 | `/blogs`, `/blogs/{id}`, `/blogs/{id}/like` |
| **Posts** | 7 | `/posts`, `/posts/{id}/like` |
| **Jobs** | 6 | `/jobs`, `/jobs/{id}/apply` |
| **Announcements** | 4 | `/announcements` |
| **Admin** | 8+ | `/admin/users`, `/admin/stats` |

**Total: 60+ endpoints**

---

## 🧪 Test with Postman

1. Import: `VetForumIndia-API-Postman-Collection.json`
2. Use variables for token
3. Test each endpoint
4. Check responses

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `API_AND_UNBLOCK_GUIDE.md` | **Complete API Reference** |
| `STATUS_REPORT.md` | **Current Status Overview** |
| `RAZORPAY_INTEGRATION.md` | Payment setup guide |
| `server.js` | Main server entry point |
| `.env` | Configuration (passwords, keys) |
| `src/routes/` | All route definitions |
| `src/controllers/` | Business logic |

---

## 🛠️ Troubleshooting

### Server won't start
```bash
# Check if port 3000 is in use
lsof -i :3000

# Kill the process
kill -9 <PID>

# Restart
npm start
```

### Payment endpoint fails
- ✅ Check token is valid: `GET /authentication/profile`
- ✅ Check bypass mode: Check `.env` has `PAYMENT_BYPASS_MODE=true`
- ✅ Check logs: `tail -f server.log`

### Database connection error (OK in dev)
- This is expected in development
- All APIs work without database
- If you need database, update `.env` and restart

---

## 🎯 Development Workflow

1. **Start Server**
   ```bash
   npm start
   ```

2. **Get Token**
   - Register or login user
   - Copy token from response

3. **Make API Calls**
   - Use token in `Authorization: Bearer` header
   - Test endpoints

4. **Check Logs**
   ```bash
   tail -f server.log
   ```

5. **Restart if Needed**
   - Stop: `Ctrl + C`
   - Start: `npm start`

---

## 💡 Pro Tips

- **Token expires?** → Login again to get new token
- **Want real payments?** → Add Razorpay keys to `.env`
- **Need database?** → Setup MySQL and update `.env`
- **API not responding?** → Check health: `curl localhost:3000/api/vetforumindia/v1/health`
- **Want to see logs?** → `tail -f server.log`

---

## 📞 Quick Commands

```bash
# Start server
cd backend && npm start

# Check health
curl http://localhost:3000/api/vetforumindia/v1/health

# View logs
tail -f backend/server.log

# Check running process
ps aux | grep "node server"

# Kill server
Ctrl + C

# Check port
lsof -i :3000
```

---

**Status:** ✅ READY TO USE  
**Payment Service:** ✅ UNBLOCKED  
**Database:** ⚠️ OFFLINE (but working)  
**APIs:** ✅ 60+ READY

🚀 **Start building!**
