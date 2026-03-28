# Test Login Credentials for Vet Forum India

## 🚀 Quick Setup

1. **Start Backend Server:**
   ```bash
   cd Backend/vetforumindia_Backend-main
   npm install
   npm run seed:test  # Creates test data
   npm run dev        # Starts server on port 3001
   ```

2. **Start Frontend:**
   ```bash
   cd frontend/unified-vet-forum
   npm install
   npm run dev        # Starts on port 3000
   ```

3. **Open in Browser:** `http://localhost:3000`

---

## 👥 Test User Accounts

### 👨⚕️ **VETERINARIAN (Admin Access)**
- **Email:** `vet@test.com`
- **Password:** `test123`
- **Role:** Graduated Veterinarian + Admin
- **Features Access:**
  - ✅ Dashboard with full stats
  - ✅ Quiz system (all questions)
  - ✅ Expert consultation booking
  - ✅ Blog reading and creation
  - ✅ Job listings
  - ✅ Admin panel (user management, content management)
  - ✅ All social features

### 🎓 **VETERINARY STUDENT**
- **Email:** `student@test.com`
- **Password:** `test123`
- **Role:** 3rd Year Veterinary Student
- **Features Access:**
  - ✅ Dashboard with student stats
  - ✅ Quiz system (educational focus)
  - ✅ Expert consultation booking
  - ✅ Blog reading
  - ✅ Job listings (internships/entry-level)
  - ✅ Social features
  - ❌ Admin panel (restricted)

### 🐕 **NON-VETERINARIAN (Pet Owner)**
- **Email:** `nonvet@test.com`
- **Password:** `test123`
- **Role:** Pet Owner/Animal Lover
- **Features Access:**
  - ✅ Basic dashboard
  - ✅ Limited quiz access (general knowledge)
  - ✅ Expert consultation booking (pet care)
  - ✅ Blog reading (pet care articles)
  - ❌ Professional job listings
  - ✅ Basic social features
  - ❌ Admin panel (restricted)

### 👑 **SUPER ADMIN**
- **Email:** `admin@test.com`
- **Password:** `test123`
- **Role:** System Administrator
- **Features Access:**
  - ✅ Full system access
  - ✅ Complete admin panel
  - ✅ User management
  - ✅ Content moderation
  - ✅ System analytics
  - ✅ All features unlocked

---

## 🧪 Test Data Included

### **Quiz Questions (3 sample questions)**
- Animal nutrition questions
- Clinical knowledge questions
- Difficulty levels: Easy, Medium

### **Expert Profiles (3 experts)**
- Dr. Jaishankar, N - Animal Nutritionist
- Dr. Meera Reddy - Small Animal Surgeon  
- Dr. Rajesh Gupta - Large Animal Medicine

### **Job Listings (3 positions)**
- Senior Veterinarian - Mumbai
- Research Associate - Bareilly
- Product Manager - Vadodara

### **Blog Posts (2 articles)**
- Advanced Surgical Techniques
- Puppy Nutrition Guidelines

### **Announcements (2 events)**
- Pet Health Expo - Mumbai
- Veterinary Conference - Delhi

---

## 🔍 Testing Scenarios

### **Scenario 1: Veterinarian Workflow**
1. Login as `vet@test.com`
2. Check dashboard stats
3. Take nutrition quiz
4. Book consultation with expert
5. Read/create blog posts
6. Browse job opportunities
7. Access admin panel

### **Scenario 2: Student Experience**
1. Login as `student@test.com`
2. View student dashboard
3. Take educational quiz
4. Book consultation for learning
5. Read educational blogs
6. Look for internship opportunities

### **Scenario 3: Pet Owner Journey**
1. Login as `nonvet@test.com`
2. View basic dashboard
3. Take general knowledge quiz
4. Book consultation for pet care
5. Read pet care articles
6. Engage with community

### **Scenario 4: Admin Management**
1. Login as `admin@test.com`
2. Access admin dashboard
3. Manage users and content
4. View system analytics
5. Moderate community posts

---

## 🌐 API Testing

### **Base URL:** `http://localhost:3001/api/vetforumindia/v1`

### **Quick API Tests:**
```bash
# Health Check
curl http://localhost:3001/api/vetforumindia/v1/health

# Login Test
curl -X POST http://localhost:3001/api/vetforumindia/v1/authentication/login \
  -H "Content-Type: application/json" \
  -d '{"email":"vet@test.com","password":"test123"}'

# Get Experts
curl http://localhost:3001/api/vetforumindia/v1/experts

# Get Jobs
curl http://localhost:3001/api/vetforumindia/v1/jobs
```

---

## 🎯 Feature Testing Checklist

### **Authentication System**
- [ ] Login with all test accounts
- [ ] Registration flow
- [ ] Password validation
- [ ] JWT token handling
- [ ] Role-based access control

### **Dashboard Features**
- [ ] User stats display
- [ ] Quick action buttons
- [ ] Role-specific content
- [ ] Navigation menu

### **Quiz System**
- [ ] Start new quiz
- [ ] Answer questions sequentially
- [ ] Progress tracking
- [ ] Score calculation
- [ ] Completion flow

### **Expert Consultation**
- [ ] Browse expert profiles
- [ ] Book consultation
- [ ] View consultation history
- [ ] Expert details display

### **Blog System**
- [ ] Read blog posts
- [ ] Create new posts (vet users)
- [ ] Blog listing and filtering
- [ ] Article view with metadata

### **Job Portal**
- [ ] Browse job listings
- [ ] Filter by location/organization
- [ ] View job details
- [ ] Contact information display

### **Admin Panel**
- [ ] User management
- [ ] Content management
- [ ] System analytics
- [ ] Role-based restrictions

---

## 🐛 Common Issues & Solutions

### **Backend Issues**
- **Database Connection:** Check MySQL is running and credentials in `.env`
- **Port Conflicts:** Ensure port 3001 is available
- **Missing Dependencies:** Run `npm install` in backend directory

### **Frontend Issues**
- **API Connection:** Verify backend is running on port 3001
- **Build Errors:** Check all dependencies installed with `npm install`
- **Routing Issues:** Ensure React Router is properly configured

### **Authentication Issues**
- **Login Fails:** Verify test data is seeded with `npm run seed:test`
- **Token Errors:** Check JWT secret in backend `.env` file
- **Role Access:** Confirm user roles are properly set in database

---

## 📞 Support

For testing issues or questions:
1. Check console logs in browser developer tools
2. Verify backend server logs
3. Ensure all test data is properly seeded
4. Confirm environment variables are set correctly

**Happy Testing! 🎉**