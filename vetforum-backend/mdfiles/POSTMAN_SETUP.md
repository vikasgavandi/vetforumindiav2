# Postman Collection Setup Guide

## Import Collection

1. **Open Postman**
2. **Click Import** button (top left)
3. **Select File** and choose `VetForumIndia-API-Postman-Collection.json`
4. **Collection will be imported** with all endpoints configured

## Collection Structure

```
Vet Forum India API/
├── General/
│   ├── API Information
│   └── Health Check
├── Authentication/
│   ├── Register Veterinarian (Student)
│   ├── Register Veterinarian (Graduated)
│   ├── Register Non-Veterinarian
│   ├── Login
│   └── Get Profile
└── Quiz/
    ├── Start New Quiz
    ├── Get Next Question
    ├── Submit Answer
    ├── Get Quiz Progress
    └── Get All Questions (Admin)
```

## Variables

The collection uses these variables:

- **`baseUrl`**: `http://localhost:3000/api/vetforumindia/v1` (Update if your server runs on different port)
- **`authToken`**: Automatically set after successful login/registration

## How to Use

### 1. Start Your Server
Make sure your Node.js server is running:
```bash
npm start
# or
npm run dev
```

### 2. Test Health Check
- Run **"Health Check"** request
- Should return status: "OK"

### 3. Register a User
Choose one of the registration endpoints:

**For Veterinarian Student:**
- Use **"Register Veterinarian (Student)"**
- Includes all veterinarian-specific fields

**For Veterinarian (Graduated):**
- Use **"Register Veterinarian (Graduated)"**
- No year/college fields needed

**For Non-Veterinarian:**
- Use **"Register Non-Veterinarian"**
- Basic user information only

### 4. Login
- After registration, use **"Login"** with same email/password
- The `authToken` variable will be automatically updated
- Token is valid for 7 days

### 5. Get Profile
- Use **"Get Profile"** (requires authentication)
- Will show your complete user information
- Password is excluded from response

## Testing Workflow

### Authentication Testing

1. **Register** a new user
2. **Login** with the same credentials
3. **Get Profile** to verify authentication works
4. **Health Check** to verify server status

### Quiz Testing

1. **Register/Login** to get authentication token
2. **Start New Quiz** to begin quiz session
3. **Get Next Question** to receive first question
4. **Submit Answer** with your choice (A, B, C, or D)
5. **Repeat** steps 3-4 until quiz is completed
6. **Get Quiz Progress** to see final results and score

### Quiz Features

- **Sequential Questions**: One question at a time
- **Progress Tracking**: Automatic score calculation
- **Answer Validation**: Immediate feedback on correctness
- **Quiz Reset**: Start new quiz anytime
- **20 Questions**: Veterinary nutrition topics

## Troubleshooting

### Common Issues

**401 Unauthorized on Get Profile:**
- Make sure you've run Login first
- Check if `authToken` variable is set in Postman

**400 Bad Request on Registration:**
- Check all required fields are provided
- Password must be at least 6 characters
- Email must be unique

**404 Not Found:**
- Verify server is running on correct port
- Check `baseUrl` variable matches your server

**Connection Refused:**
- Make sure server is running (`npm start`)
- Check if port 3000 is available

## Response Examples

### Successful Registration (201)
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "mobile": "9876543210",
    "state": "Maharashtra",
    "isVeterinarian": true,
    "veterinarianType": "Student",
    "year": "3rd",
    "college": "Mumbai Veterinary College",
    "university": "Maharashtra Animal and Fishery Sciences University",
    "veterinarianState": "Maharashtra",
    "createdAt": "2023-10-01T00:00:00.000Z",
    "updatedAt": "2023-10-01T00:00:00.000Z"
  }
}
```

### Successful Login (200)
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "mobile": "9876543210",
    "state": "Maharashtra",
    "isVeterinarian": true,
    "veterinarianType": "Student",
    "year": "3rd",
    "college": "Mumbai Veterinary College",
    "university": "Maharashtra Animal and Fishery Sciences University",
    "veterinarianState": "Maharashtra",
    "createdAt": "2023-10-01T00:00:00.000Z",
    "updatedAt": "2023-10-01T00:00:00.000Z"
  }
}
```

### Error Response (400/401/404/500)
```json
{
  "error": "Error message description"
}
```

## Tips

- **Use Environment**: Create a Postman environment to easily switch between different server configurations
- **Generate New Token**: If token expires, just run Login again
- **Test Validation**: Try sending incomplete data to see validation errors
- **Check Console**: Tests log helpful information to Postman's console

## Security Notes

- JWT tokens are valid for 7 days by default
- Passwords are hashed before storage (bcryptjs)
- Rate limiting is applied to prevent abuse
- CORS is configured for cross-origin requests

## Next Steps

After testing authentication, you can:
1. Add more API endpoints to the collection
2. Create automated tests
3. Add environment-specific configurations
4. Integrate with CI/CD pipelines