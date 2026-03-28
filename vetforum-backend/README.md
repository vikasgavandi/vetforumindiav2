# Vet Forum India Backend

A Node.js backend application for the Vet Forum India platform with user authentication and veterinarian-specific features.

## Features

- **Clustering Support**: Multi-process architecture using Node.js cluster module
- **Quiz System**: Sequential quiz functionality with 20 veterinary nutrition questions
- **Expert Consultation**: Connect users with veterinary experts for professional consultation
- **Social Media Features**: User posts with likes, comments, and shares
- **Announcements**: Event and conference announcements
- **Job Portal**: Veterinary job vacancy listings
- **Enhanced User Profiles**: Extended profile fields including bio, publications, awards
- User registration and login with JWT authentication
- Support for two user types: Veterinarian and Non-Veterinarian
- Veterinarian-specific fields (Student/Graduated, Year, College, University, State)
- Password hashing with bcryptjs
- Rate limiting and security middleware
- Comprehensive logging with Winston
- CORS support
- Request compression
- MySQL database with Sequelize ORM
- API Versioning: `/api/vetforumindia/v1`

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **ORM**: Sequelize
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Logging**: Winston
- **Caching**: node-cache
- **CORS**: cors
- **Compression**: compression
- **Rate Limiting**: express-rate-limit

## Project Structure

```
vetforumindia-backend/
├── src/
│   ├── config/
│   │   └── database.js          # Database configuration
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── quizController.js    # Quiz management logic
│   │   ├── expertController.js  # Expert consultation logic
│   │   ├── announcementController.js # Announcements logic
│   │   ├── jobController.js     # Job vacancy logic
│   │   └── postController.js    # Social posts logic
│   ├── middleware/
│   │   ├── auth.js             # JWT authentication middleware
│   │   ├── logger.js           # Winston logger configuration
│   │   ├── rateLimiter.js      # Rate limiting configuration
│   │   └── index.js            # Common middleware setup
│   ├── models/
│   │   ├── User.js             # User model with enhanced profile fields
│   │   ├── Quiz.js             # Quiz questions model
│   │   ├── UserQuizProgress.js # User quiz progress tracking
│   │   ├── Expert.js           # Expert/doctor profiles
│   │   ├── Consultation.js     # Consultation requests
│   │   ├── Announcement.js     # Events and announcements
│   │   ├── JobVacancy.js       # Job vacancy listings
│   │   ├── Post.js             # User posts
│   │   ├── PostInteraction.js  # Post likes, comments, shares
│   │   └── index.js            # Models index
│   ├── routes/
│   │   ├── index.js            # Main routes manager
│   │   ├── authRoutes.js       # Authentication routes
│   │   ├── quizRoutes.js       # Quiz routes
│   │   ├── expertRoutes.js     # Expert consultation routes
│   │   ├── announcementRoutes.js # Announcement routes
│   │   ├── jobRoutes.js        # Job vacancy routes
│   │   └── postRoutes.js       # Social post routes
│   └── utils/
│       ├── quizSeeder.js       # Quiz questions database seeder
│       └── dataSeeder.js       # Sample data seeder
├── .env                        # Environment variables
├── package.json                # Dependencies and scripts
├── server.js                   # Application entry point with clustering
├── README.md                   # Project documentation
├── API_DOCUMENTATION.md        # Complete API documentation
├── POSTMAN_SETUP.md            # Postman collection setup guide
└── VetForumIndia-API-Postman-Collection.json # Complete API collection
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vetforumindia-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Copy `.env` and update the values:
   ```bash
   cp .env .env.local
   ```

   Update the following variables in `.env`:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=vetforumindia
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   JWT_SECRET=your-super-secret-jwt-key-here
   ```

4. **Set up MySQL database**
   - Create a MySQL database named `vetforumindia`
   - Update the database credentials in `.env`

5. **Start the application**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

The server will start on `http://localhost:3000` by default with clustering enabled.

**Features Added:**
- **Clustering**: Automatically utilizes all CPU cores for better performance
- **API Versioning**: Structured URL paths (`/api/vetforumindia/v1`)
- **Centralized Routing**: All routes managed through `src/routes/index.js`

## API Endpoints

### Base URL
```
http://localhost:3000/api/vetforumindia/v1
```

### API Information
```http
GET /api/vetforumindia/v1/
```

Response:
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
    "health": "/health"
  }
}
```

### Health Check
```http
GET /api/vetforumindia/v1/health
```

### Authentication Routes

#### Register User
```http
POST /api/vetforumindia/v1/authentication/register
Content-Type: application/json

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

**For Non-Veterinarian users:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "mobile": "1234567890",
  "state": "Maharashtra",
  "password": "password123",
  "confirmPassword": "password123",
  "isVeterinarian": false
}
```

#### Login
```http
POST /api/vetforumindia/v1/authentication/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "mobile": "1234567890",
    "state": "Maharashtra",
    "isVeterinarian": true,
    "veterinarianType": "Student",
    "year": "3rd",
    "college": "Veterinary College",
    "university": "University Name",
    "veterinarianState": "Maharashtra",
    "createdAt": "2023-10-01T00:00:00.000Z",
    "updatedAt": "2023-10-01T00:00:00.000Z"
  }
}
```

#### Get Profile
```http
GET /api/vetforumindia/v1/authentication/profile
Authorization: Bearer <jwt_token>
```

### Quiz Routes (Sequential Quiz System)

#### Start New Quiz
```http
POST /api/vetforumindia/v1/quiz/new
Authorization: Bearer <jwt_token>
```

#### Get Next Question
```http
GET /api/vetforumindia/v1/quiz/next
Authorization: Bearer <jwt_token>
```

#### Submit Answer
```http
POST /api/vetforumindia/v1/quiz/submit
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "answer": "A"
}
```

#### Get Quiz Progress
```http
GET /api/vetforumindia/v1/quiz/progress
Authorization: Bearer <jwt_token>
```

#### Get All Questions (Admin)
```http
GET /api/vetforumindia/v1/quiz/questions?page=1&limit=10
Authorization: Bearer <jwt_token>
```

## User Types

### Veterinarian Users
- **Student**: First, 2nd, 3rd, 4th, Final year/Internship
- **Graduated**: Completed veterinary education
- Additional fields: Year, College, University, State

### Non-Veterinarian Users
- Basic user information only
- No veterinarian-specific fields required

## Validation Rules

### Registration
- All basic fields are required (firstName, lastName, email, mobile, state, password, confirmPassword)
- Password must be at least 6 characters long
- Password and confirmPassword must match
- Email must be unique
- Mobile number must be 10-15 digits

### Veterinarian-Specific Validation
- `veterinarianType` is required if `isVeterinarian` is true
- For students: `year`, `college`, `university` are required
- `veterinarianState` is required for veterinarians

## Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Stateless token-based authentication
- **Rate Limiting**: Prevents brute force attacks
- **CORS**: Configurable cross-origin requests
- **Input Validation**: Sequelize model validation
- **Error Handling**: Comprehensive error logging and handling

## Logging

The application uses Winston for logging:
- **Info**: General information, successful operations
- **Warn**: Warning messages, failed authentication attempts
- **Error**: Error messages, exceptions, failures

Logs are stored in the `logs/` directory:
- `combined.log`: All log messages
- `error.log`: Error messages only

## Development

### Available Scripts
```bash
npm start      # Start production server
npm run dev    # Start development server with nodemon
npm test       # Run tests (if implemented)
```

### Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `3306` |
| `DB_NAME` | Database name | `vetforumindia` |
| `DB_USER` | Database user | `root` |
| `DB_PASSWORD` | Database password | `password` |
| `JWT_SECRET` | JWT secret key | - |
| `JWT_EXPIRES_IN` | JWT expiration | `7d` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |
| `CORS_ORIGIN` | CORS allowed origin | `http://localhost:3000` |
| `LOG_LEVEL` | Logging level | `info` |

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  firstName VARCHAR(50) NOT NULL,
  lastName VARCHAR(50) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  mobile VARCHAR(15) NOT NULL,
  state VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  isVeterinarian BOOLEAN DEFAULT FALSE,
  veterinarianType ENUM('Student', 'Graduated'),
  year ENUM('1st', '2nd', '3rd', '4th', 'Final year/Internship'),
  college VARCHAR(100),
  university VARCHAR(100),
  veterinarianState VARCHAR(100),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Testing

### Postman Collection

A complete Postman collection is provided for API testing:

- **`VetForumIndia-API-Postman-Collection.json`**: Import this file directly into Postman
- **`POSTMAN_SETUP.md`**: Detailed setup guide and usage instructions

#### Quick Start Testing

1. **Import Collection**: File → Import → `VetForumIndia-API-Postman-Collection.json`
2. **Start Server**: Run `npm start` or `npm run dev`
3. **Test Health**: Run "Health Check" request
4. **Register User**: Use one of the registration endpoints
5. **Login**: Use login endpoint (token auto-saved)
6. **Get Profile**: Test authenticated endpoint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

ISC