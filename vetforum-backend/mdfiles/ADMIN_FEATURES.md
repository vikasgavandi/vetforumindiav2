# Admin Features - Vet Forum India

## 🔐 Admin Authentication

### Admin User Setup
- **Default Admin Credentials:**
  - Email: `admin@vetforumindia.com`
  - Password: `admin123456`
  - Role: Admin (isAdmin: true)

### Admin Access Control
- All admin endpoints require JWT authentication + admin role
- Middleware: `authenticateToken` + `requireAdmin`
- Non-admin users receive 403 Forbidden response

---

## 🧠 Quiz Card Management System

### Quiz Card Properties
```json
{
  "id": 1,
  "title": "Veterinary Nutrition Fundamentals",
  "description": "Test your knowledge of basic animal nutrition principles",
  "duration": 30,
  "numberOfQuestions": 20,
  "isActive": true,
  "createdBy": 1,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

### CRUD Operations

#### 1. Create Quiz Card
**Endpoint:** `POST /api/vetforumindia/v1/admin/quiz-cards`

**Request Body:**
```json
{
  "title": "Advanced Veterinary Surgery",
  "description": "Comprehensive surgical procedures quiz",
  "duration": 45,
  "numberOfQuestions": 25
}
```

**Validation Rules:**
- Title: Required, 3-200 characters
- Duration: Required, 1-180 minutes
- Number of Questions: Required, 1-100 questions
- Description: Optional

#### 2. Get All Quiz Cards
**Endpoint:** `GET /api/vetforumindia/v1/admin/quiz-cards`

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `isActive`: Filter by active status (true/false)

#### 3. Get Quiz Card by ID
**Endpoint:** `GET /api/vetforumindia/v1/admin/quiz-cards/:id`

#### 4. Update Quiz Card
**Endpoint:** `PUT /api/vetforumindia/v1/admin/quiz-cards/:id`

**Request Body (all fields optional):**
```json
{
  "title": "Updated Quiz Title",
  "description": "Updated description",
  "duration": 60,
  "numberOfQuestions": 30,
  "isActive": false
}
```

#### 5. Delete Quiz Card
**Endpoint:** `DELETE /api/vetforumindia/v1/admin/quiz-cards/:id`

---

## 🏆 Leaderboard System

### Top 3 Fastest Finishers
**Endpoint:** `GET /api/vetforumindia/v1/admin/quiz-cards/:quizCardId/leaderboard`

**Query Parameters:**
- `limit`: Number of top performers (default: 3)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "score": 18,
      "timeTaken": 420,
      "startTime": "2025-01-01T10:00:00.000Z",
      "endTime": "2025-01-01T10:07:00.000Z",
      "user": {
        "id": 5,
        "firstName": "Dr. Priya",
        "lastName": "Sharma",
        "email": "priya@example.com",
        "profilePhoto": "photo.jpg"
      }
    }
  ]
}
```

**Ranking Logic:**
1. **Primary Sort:** Fastest completion time (timeTaken ASC)
2. **Secondary Sort:** Highest score (score DESC)

---

## 📊 Quiz Analytics

### Quiz Statistics
**Endpoint:** `GET /api/vetforumindia/v1/admin/quiz-cards/:quizCardId/statistics`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalAttempts": 150,
    "completedAttempts": 120,
    "averageScore": 16.5,
    "averageTime": 1200
  }
}
```

**Metrics Tracked:**
- **Total Attempts:** All quiz starts
- **Completed Attempts:** Successfully finished quizzes
- **Average Score:** Mean score of completed attempts
- **Average Time:** Mean completion time in seconds

---

## 🎯 Use Case Scenarios

### Scenario 1: Creating Educational Assessment
```bash
# 1. Admin creates new quiz
POST /admin/quiz-cards
{
  "title": "Veterinary Pathology Assessment",
  "description": "Diagnostic pathology for veterinary students",
  "duration": 60,
  "numberOfQuestions": 40
}

# 2. Monitor quiz performance
GET /admin/quiz-cards/1/statistics

# 3. Check top performers
GET /admin/quiz-cards/1/leaderboard?limit=5
```

### Scenario 2: Competitive Quiz Event
```bash
# 1. Create timed challenge
POST /admin/quiz-cards
{
  "title": "Speed Diagnosis Challenge",
  "duration": 15,
  "numberOfQuestions": 20
}

# 2. Monitor real-time leaderboard
GET /admin/quiz-cards/2/leaderboard

# 3. Update quiz settings if needed
PUT /admin/quiz-cards/2
{
  "duration": 20
}
```

### Scenario 3: Quiz Management
```bash
# 1. List all quizzes
GET /admin/quiz-cards?page=1&limit=10

# 2. Deactivate outdated quiz
PUT /admin/quiz-cards/3
{
  "isActive": false
}

# 3. Delete unused quiz
DELETE /admin/quiz-cards/4
```

---

## 🔄 Database Schema

### QuizCard Table
```sql
CREATE TABLE quiz_cards (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  duration INT NOT NULL,
  numberOfQuestions INT NOT NULL,
  isActive BOOLEAN DEFAULT TRUE,
  createdBy INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (createdBy) REFERENCES users(id)
);
```

### QuizAttempt Table
```sql
CREATE TABLE quiz_attempts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  quizCardId INT NOT NULL,
  startTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  endTime TIMESTAMP NULL,
  score INT DEFAULT 0,
  totalQuestions INT NOT NULL,
  correctAnswers INT DEFAULT 0,
  timeTaken INT NULL,
  status ENUM('in_progress', 'completed', 'abandoned') DEFAULT 'in_progress',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (quizCardId) REFERENCES quiz_cards(id)
);
```

---

## 🛡️ Security Features

### Admin Role Verification
```javascript
// Middleware checks:
1. JWT token validation
2. User exists in database
3. User has isAdmin: true
4. Logs unauthorized access attempts
```

### Audit Logging
- Quiz card creation/modification logged
- Admin actions tracked with user ID
- Failed admin access attempts recorded

---

## 📈 Performance Considerations

### Leaderboard Optimization
- Indexed on `timeTaken` and `score` columns
- Limited result sets (default top 3)
- Cached frequently accessed leaderboards

### Statistics Calculation
- Aggregated queries for performance metrics
- Real-time calculation for accurate data
- Optimized for large datasets

---

## 🚀 Sample Data

### Pre-seeded Quiz Cards
1. **Veterinary Nutrition Fundamentals** (30 min, 20 questions)
2. **Small Animal Medicine Quiz** (45 min, 25 questions)
3. **Large Animal Surgery Challenge** (60 min, 30 questions)
4. **Veterinary Pharmacology Speed Test** (15 min, 15 questions)

### Admin Credentials
- **Email:** admin@vetforumindia.com
- **Password:** admin123456
- **Role:** Administrator

---

## 🔧 Implementation Notes

### Error Handling
- Comprehensive validation for all inputs
- Proper HTTP status codes
- Detailed error messages for debugging

### Response Format
- Consistent JSON response structure
- Success/failure indicators
- Pagination metadata where applicable

### Logging
- All admin actions logged
- Performance metrics tracked
- Security events monitored