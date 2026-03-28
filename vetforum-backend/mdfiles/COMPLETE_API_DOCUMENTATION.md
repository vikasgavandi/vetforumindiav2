# Vet Forum India - Complete API Documentation

## Base Information
- **Base URL:** `http://localhost:3000/api/vetforumindia/v1`
- **Authentication:** JWT Bearer Token (where required)
- **Content-Type:** `application/json`
- **API Version:** v1

---

## 🔐 Authentication APIs

### 1. User Registration
**POST** `/authentication/register`

**Use Cases:** New user signup, veterinarian registration, student registration

**Request Body:**
```json
{
  "firstName": "Dr. Priya",
  "lastName": "Sharma", 
  "email": "priya.sharma@vet.com",
  "mobile": "9876543210",
  "state": "Maharashtra",
  "password": "securepass123",
  "confirmPassword": "securepass123",
  "isVeterinarian": true,
  "veterinarianType": "Graduated",
  "veterinarianState": "Maharashtra"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "firstName": "Dr. Priya",
    "email": "priya.sharma@vet.com",
    "isVeterinarian": true
  }
}
```

### 2. User Login
**POST** `/authentication/login`

**Use Cases:** User authentication, JWT token generation

**Request Body:**
```json
{
  "email": "priya.sharma@vet.com",
  "password": "securepass123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "firstName": "Dr. Priya",
    "lastName": "Sharma",
    "email": "priya.sharma@vet.com",
    "isVeterinarian": true
  }
}
```

### 3. Get User Profile
**GET** `/authentication/profile`
**Auth Required:** Yes

**Use Cases:** Display profile, profile verification

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "firstName": "Dr. Priya",
    "lastName": "Sharma",
    "email": "priya.sharma@vet.com",
    "mobile": "9876543210",
    "state": "Maharashtra",
    "isVeterinarian": true,
    "veterinarianType": "Graduated"
  }
}
```

---

## 🧠 Quiz System APIs

### 4. Start New Quiz
**POST** `/quiz/new`
**Auth Required:** Yes

**Use Cases:** Begin veterinary nutrition assessment, reset quiz progress

**Response:**
```json
{
  "message": "New quiz started successfully",
  "quizId": 123,
  "totalQuestions": 20
}
```

### 5. Get Next Question
**GET** `/quiz/next`
**Auth Required:** Yes

**Use Cases:** Sequential question delivery, progress tracking

**Response:**
```json
{
  "success": true,
  "question": {
    "id": 1,
    "questionText": "What is the primary source of energy in cattle feed?",
    "options": {
      "A": "Protein",
      "B": "Carbohydrates", 
      "C": "Fats",
      "D": "Vitamins"
    },
    "questionNumber": 1,
    "totalQuestions": 20
  }
}
```

### 6. Submit Answer
**POST** `/quiz/submit`
**Auth Required:** Yes

**Use Cases:** Record responses, calculate scoring

**Request Body:**
```json
{
  "answer": "B"
}
```

**Response:**
```json
{
  "success": true,
  "correct": true,
  "currentScore": 1,
  "questionsAnswered": 1,
  "totalQuestions": 20
}
```

### 7. Get Quiz Progress
**GET** `/quiz/progress`
**Auth Required:** Yes

**Use Cases:** Display completion percentage, show current score

**Response:**
```json
{
  "success": true,
  "progress": {
    "questionsAnswered": 15,
    "totalQuestions": 20,
    "currentScore": 12,
    "percentage": 75,
    "isCompleted": false
  }
}
```

---

## 👨⚕️ Expert Consultation APIs

### 8. Get All Experts
**GET** `/experts`

**Use Cases:** Browse available experts, filter by specialization

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Dr. Jaishankar, N",
      "designation": "Professor",
      "specialization": "Animal Nutritionist",
      "yearsOfExperience": 20,
      "publications": ["Advanced Animal Nutrition"],
      "awards": ["Best Research Award 2020"]
    }
  ]
}
```

### 9. Get Expert Details
**GET** `/experts/:id`

**Use Cases:** View detailed expert profile, check credentials

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Dr. Jaishankar, N",
    "designation": "Professor",
    "specialization": "Animal Nutritionist",
    "yearsOfExperience": 20,
    "education": "PhD in Animal Nutrition",
    "publications": ["Advanced Animal Nutrition", "Feed Technology"],
    "awards": ["Best Research Award 2020"],
    "consultationFee": 500,
    "availability": "Mon-Fri 9AM-5PM"
  }
}
```

### 10. Create Consultation Request
**POST** `/experts/consultation`
**Auth Required:** Yes

**Use Cases:** Book consultation, submit case details

**Request Body:**
```json
{
  "expertId": 1,
  "reasonForConsultation": "My cattle showing signs of nutritional deficiency. Need expert advice on feed supplementation."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Consultation request created successfully",
  "consultationId": 456,
  "status": "pending"
}
```

### 11. Get User Consultations
**GET** `/experts/consultation/my`
**Auth Required:** Yes

**Use Cases:** View consultation history, track status

**Response:**
```json
{
  "success": true,
  "consultations": [
    {
      "id": 456,
      "expertName": "Dr. Jaishankar, N",
      "reasonForConsultation": "Nutritional deficiency in cattle",
      "status": "completed",
      "createdAt": "2025-01-01T10:00:00Z",
      "response": "Recommend increasing protein content..."
    }
  ]
}
```

---

## 📢 Announcement APIs

### 12. Get All Announcements
**GET** `/announcements?page=1&limit=10`

**Use Cases:** Display events, show conferences, promote workshops

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Pet Health & Wellness Expo - Mumbai",
      "eventDate": "2025-11-08",
      "description": "Premier event for pet health professionals...",
      "photo": "event-photo.jpg",
      "link": "https://registration-link.com"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50
  }
}
```

### 13. Get Announcement Details
**GET** `/announcements/:id`

**Use Cases:** View complete event information, access registration links

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Pet Health & Wellness Expo - Mumbai",
    "eventDate": "2025-11-08",
    "description": "Premier event for pet health professionals featuring latest innovations...",
    "photo": "event-photo.jpg",
    "link": "https://registration-link.com",
    "venue": "Bombay Exhibition Centre",
    "organizer": "Indian Veterinary Association"
  }
}
```

---

## 💼 Job Vacancy APIs

### 14. Get All Job Vacancies
**GET** `/jobs?page=1&limit=10&location=Mumbai&organization=Alembic`

**Use Cases:** Browse job opportunities, filter by location/organization

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `location`: Filter by location
- `organization`: Filter by organization

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Product Manager/Executive",
      "organization": "Alembic Pharmaceuticals",
      "location": "Mumbai",
      "jobDescription": "Manage veterinary product portfolio...",
      "contactEmail": "careers@alembic.com",
      "contactPhone": "+91-22-12345678",
      "postedDate": "2025-01-01"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 25
  }
}
```

### 15. Get Job Details
**GET** `/jobs/:id`

**Use Cases:** View complete job description, check requirements

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Product Manager/Executive",
    "organization": "Alembic Pharmaceuticals",
    "location": "Mumbai",
    "jobDescription": "Manage veterinary product portfolio, develop marketing strategies...",
    "requirements": "BVSc degree, 3+ years experience",
    "salary": "₹8-12 LPA",
    "contactEmail": "careers@alembic.com",
    "contactPhone": "+91-22-12345678",
    "applicationDeadline": "2025-02-15"
  }
}
```

---

## 📱 Social Media Posts APIs

### 16. Create Post
**POST** `/posts`
**Auth Required:** Yes

**Use Cases:** Share experiences, post case studies, upload photos

**Request Body:**
```json
{
  "content": "Successfully treated a complex orthopedic case today. The new surgical technique showed excellent results!",
  "photos": ["surgery-photo1.jpg", "xray-image.jpg"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Post created successfully",
  "post": {
    "id": 789,
    "content": "Successfully treated a complex orthopedic case...",
    "photos": ["surgery-photo1.jpg", "xray-image.jpg"],
    "createdAt": "2025-01-01T12:00:00Z"
  }
}
```

### 17. Get Posts Feed
**GET** `/posts?page=1&limit=10`

**Use Cases:** Display social feed, browse community posts

**Response:**
```json
{
  "success": true,
  "posts": [
    {
      "id": 789,
      "content": "Successfully treated a complex orthopedic case...",
      "photos": ["surgery-photo1.jpg"],
      "author": {
        "id": 1,
        "firstName": "Dr. Priya",
        "lastName": "Sharma"
      },
      "likesCount": 15,
      "commentsCount": 3,
      "sharesCount": 2,
      "createdAt": "2025-01-01T12:00:00Z"
    }
  ]
}
```

### 18. Get User's Posts
**GET** `/posts/my?page=1&limit=10`
**Auth Required:** Yes

**Use Cases:** View personal post history, manage content

### 19. Get Specific User's Posts
**GET** `/posts/user/:userId?page=1&limit=10`

**Use Cases:** View another user's posts, follow veterinarians

### 20. Like/Unlike Post
**POST** `/posts/:postId/like`
**Auth Required:** Yes

**Use Cases:** Express appreciation, engage with community

**Response:**
```json
{
  "success": true,
  "message": "Post liked successfully",
  "likesCount": 16
}
```

### 21. Add Comment
**POST** `/posts/:postId/comment`
**Auth Required:** Yes

**Use Cases:** Provide feedback, ask questions, start discussions

**Request Body:**
```json
{
  "comment": "Great technique! Could you share more details about the procedure?"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Comment added successfully",
  "comment": {
    "id": 101,
    "comment": "Great technique! Could you share more details...",
    "author": {
      "firstName": "Dr. Amit",
      "lastName": "Patel"
    },
    "createdAt": "2025-01-01T13:00:00Z"
  }
}
```

### 22. Get Post Comments
**GET** `/posts/:postId/comments?page=1&limit=10`

**Use Cases:** Read discussions, follow conversation threads

**Response:**
```json
{
  "success": true,
  "comments": [
    {
      "id": 101,
      "comment": "Great technique! Could you share more details...",
      "author": {
        "id": 2,
        "firstName": "Dr. Amit",
        "lastName": "Patel"
      },
      "createdAt": "2025-01-01T13:00:00Z"
    }
  ]
}
```

### 23. Share Post
**POST** `/posts/:postId/share`
**Auth Required:** Yes

**Use Cases:** Amplify content, share educational material

**Response:**
```json
{
  "success": true,
  "message": "Post shared successfully",
  "sharesCount": 3
}
```

---

## 📝 Blog System APIs

### 24. Create Blog
**POST** `/blogs`
**Auth Required:** Yes

**Use Cases:** Write articles, share knowledge, create educational content

**Request Body:**
```json
{
  "title": "Advanced Surgical Techniques in Small Animals",
  "subtitle": "Minimally invasive procedures for better outcomes",
  "content": "# Introduction\n\nThis article explores the latest surgical techniques...",
  "excerpt": "Learn about cutting-edge surgical methods that improve patient outcomes.",
  "featuredImage": "surgery-techniques.jpg",
  "images": ["procedure1.jpg", "procedure2.jpg"],
  "tags": ["surgery", "small-animals", "techniques"],
  "status": "published"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Blog created successfully",
  "blog": {
    "id": 1,
    "title": "Advanced Surgical Techniques in Small Animals",
    "slug": "advanced-surgical-techniques-small-animals",
    "status": "published",
    "publishedAt": "2025-01-01T14:00:00Z"
  }
}
```

### 25. Get All Blogs
**GET** `/blogs?page=1&limit=10&status=published&tags=surgery&search=nutrition`

**Use Cases:** Browse articles, search topics, filter by tags

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `status`: Filter by status (published/draft/archived)
- `tags`: Filter by comma-separated tags
- `authorId`: Filter by specific author
- `search`: Search in title, subtitle, and content

**Response:**
```json
{
  "success": true,
  "blogs": [
    {
      "id": 1,
      "title": "Advanced Surgical Techniques",
      "subtitle": "Minimally invasive procedures",
      "excerpt": "Learn about cutting-edge surgical methods...",
      "featuredImage": "surgery.jpg",
      "tags": ["surgery", "techniques"],
      "readTime": 8,
      "viewsCount": 245,
      "likesCount": 32,
      "author": {
        "firstName": "Dr. Priya",
        "lastName": "Sharma"
      },
      "publishedAt": "2025-01-01T14:00:00Z"
    }
  ]
}
```

### 26. Get Blog Details
**GET** `/blogs/:id` or **GET** `/blogs/:slug`

**Use Cases:** Read complete article, track views, access via SEO-friendly URL

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Advanced Surgical Techniques",
    "subtitle": "Minimally invasive procedures",
    "content": "# Introduction\n\nThis article explores...",
    "excerpt": "Learn about cutting-edge surgical methods...",
    "featuredImage": "surgery.jpg",
    "images": ["procedure1.jpg", "procedure2.jpg"],
    "tags": ["surgery", "techniques"],
    "readTime": 8,
    "viewsCount": 246,
    "likesCount": 32,
    "commentsCount": 12,
    "status": "published",
    "author": {
      "id": 1,
      "firstName": "Dr. Priya",
      "lastName": "Sharma",
      "designation": "Veterinary Surgeon"
    },
    "publishedAt": "2025-01-01T14:00:00Z"
  }
}
```

---

## 🔧 System APIs

### 27. API Information
**GET** `/`

**Use Cases:** API discovery, health check

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
    "health": "/health"
  }
}
```

### 28. Health Check
**GET** `/health`

**Use Cases:** Server monitoring, uptime verification

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-01-01T15:00:00Z",
  "uptime": "2 days, 5 hours, 30 minutes"
}
```

---

## 🔒 Authentication & Security

### JWT Token Usage
Include JWT token in request headers:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Rate Limiting
- **Window:** 15 minutes
- **Max Requests:** 100 per window per IP
- **Headers:** `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

### Error Responses
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `429`: Too Many Requests
- `500`: Internal Server Error

---

## 📊 Data Models

### User Model
```json
{
  "id": 1,
  "firstName": "Dr. Priya",
  "lastName": "Sharma",
  "email": "priya.sharma@vet.com",
  "mobile": "9876543210",
  "state": "Maharashtra",
  "isVeterinarian": true,
  "veterinarianType": "Graduated",
  "year": null,
  "college": null,
  "university": null,
  "veterinarianState": "Maharashtra",
  "bio": "Experienced veterinary surgeon...",
  "position": "Senior Veterinarian",
  "publications": ["Research Paper 1"],
  "awards": ["Excellence Award 2023"],
  "profilePhoto": "profile.jpg",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

### Post Model
```json
{
  "id": 789,
  "content": "Post content here...",
  "photos": ["photo1.jpg", "photo2.jpg"],
  "userId": 1,
  "likesCount": 15,
  "commentsCount": 3,
  "sharesCount": 2,
  "createdAt": "2025-01-01T12:00:00Z",
  "updatedAt": "2025-01-01T12:00:00Z"
}
```

---

## 🚀 Getting Started

1. **Start Server:** `npm start` or `npm run dev`
2. **Base URL:** `http://localhost:3000/api/vetforumindia/v1`
3. **Register User:** POST `/authentication/register`
4. **Login:** POST `/authentication/login`
5. **Use Token:** Include in Authorization header for protected routes

## 📱 Postman Collection

Import the provided Postman collection: `VetForumIndia-API-Postman-Collection.json`

---

*This documentation covers all available API endpoints for the Vet Forum India platform. For additional support, refer to the README.md file.*