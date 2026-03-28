# Vet Forum India API Documentation

## Base URL
```
http://localhost:3000/api/vetforumindia/v1
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## 1. Authentication Endpoints

### Register User
```http
POST /authentication/register
```

**Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "mobile": "1234567890",
  "state": "Maharashtra",
  "password": "password123",
  "confirmPassword": "password123",
  "isVeterinarian": true,
  "veterinarianType": "Student",
  "year": "3rd",
  "college": "Veterinary College",
  "university": "University Name",
  "veterinarianState": "Maharashtra"
}
```

### Login
```http
POST /authentication/login
```

**Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

### Get Profile
```http
GET /authentication/profile
Authorization: Bearer <token>
```

### Update Profile
```http
PUT /authentication/profile
Authorization: Bearer <token>
```

**Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "mobile": "1234567890",
  "state": "Maharashtra",
  "bio": "Experienced veterinarian specializing in small animals",
  "currentPosition": "Clinician",
  "positionDetails": "Senior Veterinarian at ABC Animal Hospital",
  "publications": ["Research Paper 1", "Research Paper 2"],
  "awards": ["Best Veterinarian Award 2023"],
  "profilePhoto": "https://example.com/photo.jpg"
}
```

---

## 2. Expert/Consultation Endpoints

### Get All Experts
```http
GET /experts
```

### Get Expert by ID
```http
GET /experts/:id
```

### Create Consultation Request
```http
POST /experts/consultation
Authorization: Bearer <token>
```

**Body:**
```json
{
  "expertId": 1,
  "reasonForConsultation": "My pet has been showing symptoms of lethargy and loss of appetite for the past 3 days."
}
```

### Get User Consultations
```http
GET /experts/consultation/my
Authorization: Bearer <token>
```

---

## 3. Announcement Endpoints

### Get All Announcements
```http
GET /announcements?page=1&limit=10
```

### Get Announcement by ID
```http
GET /announcements/:id
```

---

## 4. Job Vacancy Endpoints

### Get All Job Vacancies
```http
GET /jobs?page=1&limit=10&location=Mumbai&organization=Alembic
```

### Get Job Vacancy by ID
```http
GET /jobs/:id
```

---

## 5. Post Endpoints

### Create Post
```http
POST /posts
Authorization: Bearer <token>
```

**Body:**
```json
{
  "content": "Just attended an amazing veterinary conference! Learned so much about new treatment methods.",
  "photos": ["https://example.com/photo1.jpg", "https://example.com/photo2.jpg"]
}
```

### Get All Posts (Feed)
```http
GET /posts?page=1&limit=10
Authorization: Bearer <token>
```

### Get User's Posts
```http
GET /posts/my?page=1&limit=10
Authorization: Bearer <token>
```

### Get Specific User's Posts
```http
GET /posts/user/:userId?page=1&limit=10
Authorization: Bearer <token>
```

### Like/Unlike Post
```http
POST /posts/:postId/like
Authorization: Bearer <token>
```

### Add Comment to Post
```http
POST /posts/:postId/comment
Authorization: Bearer <token>
```

**Body:**
```json
{
  "content": "Great post! Thanks for sharing this information."
}
```

### Get Post Comments
```http
GET /posts/:postId/comments?page=1&limit=10
Authorization: Bearer <token>
```

### Share Post
```http
POST /posts/:postId/share
Authorization: Bearer <token>
```

---

## 6. Quiz Endpoints (Existing)

### Start New Quiz
```http
POST /quiz/new
Authorization: Bearer <token>
```

### Get Next Question
```http
GET /quiz/next
Authorization: Bearer <token>
```

### Submit Answer
```http
POST /quiz/submit
Authorization: Bearer <token>
```

**Body:**
```json
{
  "answer": "A"
}
```

### Get Quiz Progress
```http
GET /quiz/progress
Authorization: Bearer <token>
```

---

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10
  }
}
```

---

## Data Models

### User Profile Fields
- **Basic Fields**: firstName, lastName, email, mobile, state, password
- **Profile Fields**: bio, currentPosition, positionDetails, publications, awards, profilePhoto
- **Veterinarian Fields**: isVeterinarian, veterinarianType, year, college, university, veterinarianState

### Current Position Options
- Student
- Government Officer
- Government Teaching Professional
- Private Organization
- Clinician

### Veterinarian Types
- Student (requires: year, college, university)
- Graduated

### Student Years
- 1st, 2nd, 3rd, 4th, Final year/Internship

---

## Status Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **404**: Not Found
- **409**: Conflict
- **500**: Internal Server Error

---

## Rate Limiting

- **General**: 100 requests per 15 minutes
- **Authentication**: 5 requests per 15 minutes per IP

---

## Health Check

```http
GET /health
```

Returns server status and environment information.