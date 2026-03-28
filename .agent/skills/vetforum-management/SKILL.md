---
name: vetforum-management
description: Comprehensive guide for maintaining, running, and deploying the Vet Forum India project.
---

# Vet Forum India - AI Management Skill

This skill provides the internal SOP for managing the **Vet Forum India** application, a platform for veterinarians, students, and pet owners. 

## 🏗 Technology Stack
- **Frontend**: React (Vite), TypeScript, Lucide Icons, Tailwind-style CSS.
- **Backend**: Node.js, Express, Sequelize ORM.
- **Database**: MySQL (Homebrew or XAMPP).
- **Orchestration**: Docker & Docker Compose.

---

## 🏛 Architectural Design

### 1. Decoupled Architecture
- **Separation of Concerns**: The Frontend (React/Vite) and Backend (Express) are entirely decoupled. They communicate exclusively via a RESTful API.
- **Stateless Authentication**: Uses JWT (JSON Web Tokens) to maintain user sessions without storing state on the server, allowing for better horizontal scaling.

### 2. Data Access Layer
- **Sequelize ORM**: All database interactions are abstracted through Sequelize models, preventing raw SQL injection vulnerabilities and providing a clear schema definition.
- **Relational Integrity**: Uses Foreign Key constraints between Users, Experts, and Appointments to maintain data consistency.

### 3. Containerized Environment
- **Docker Orchestration**: The entire stack is containerized using `docker-compose`. This ensures the same database and Node.js environment across developer machines and the VPS.

---

## 🛡 Cybersecurity & Security Measures

### 1. Authentication & Identity
- **Password Hashing**: Uses `bcryptjs` with a salt round of 10. Raw passwords are *never* stored in the database.
- **JWT Protection**: Secure API routes are protected by a JWT middleware. Tokens are expired frequently (`7d` by default) to minimize the window for compromised credentials.

### 2. Network & API Security
- **CORS Configuration**: Restricts which domains can interact with the API, preventing unauthorized cross-origin requests.
- **Rate Limiting**: Implemented `express-rate-limit` to prevent Brute Force and Denial of Service (DoS) attacks on authentication routes.
- **Input Validation**: Uses Sequelize built-in validation and manual middleware to sanitize user inputs before they reach the database layer.

### 3. Data Privacy
- **Environment Isolation**: Sensitive keys (JWT Secret, DB Passwords) are kept in `.env` files and excluded from version control via `.gitignore`.
- **Payment Bypass Mode**: A secure flag (`PAYMENT_BYPASS_MODE`) is used for local development, ensuring no real transactions are processed during testing.

---

## 🚀 Getting Started

### 1. Environment Configuration
Ensure `.env` files are correctly set in both directories.

**Backend (`vetforum-backend/.env`):**
- Use `DB_HOST=127.0.0.1` instead of `localhost` to avoid Unix socket path mismatches on macOS.
- `PORT=4000` is the default.
- `PAYMENT_BYPASS_MODE=true` for local development.

### 2. Database Commands
If the database `vetforumindia` is missing or needs a reset:
- **Setup Schema**: `node setup-database.js` (Run from backend root).
- **Force Reset**: `node setup-database.js --force` (⚠️ Deletes all data).

### 3. Running Locally
- **Backend**: `cd vetforum-backend && npm start`
- **Frontend**: `cd vetforum-frontend && npm run dev`

---

## 🧪 Seeding Test Data
The project has several custom seeders to populate the platform with realistic data.

| Script | Action |
| :--- | :--- |
| `node src/utils/seed25.js` | Adds 25 Users, 25 Experts, and 25 Blogs. |
| `node src/utils/seedWebinars.js` | Adds 15 Webinars (Upcoming & past). |
| `node src/utils/seedAppointments.js` | Adds 20 Consultations/Appointments. |
| `node reset-admin-password.js` | Resets `admin@vetforumindia.com` to `Admin@123`. |

---

## 🔐 Authentication & Roles
Default high-level accounts for testing:
- **Super Admin**: `admin@vetforumindia.com` / `Admin@123`
- **Veterinarian**: `vet@test.com` / `test123`
- **Standard User**: `nonvet@test.com` / `test123`

---

## 🐳 Deployment (Docker)
The project is containerized for Hostinger VPS deployment.

1. **Build & Start**: 
   ```bash
   docker-compose up -d --build
   ```
2. **Architecture**:
   - `db`: MySQL 8.0 container (mapped to `db_data` volume).
   - `backend`: Express API on port 4000.
   - `frontend`: Nginx server on port 80 (proxies `/api` to backend).

---

## 🛠 Troubleshooting
- **DB Connection Failed**: Check if MySQL is running (`brew services list`). Ensure `DB_HOST` in `.env` is `127.0.0.1`.
- **phpMyAdmin Error**: If using XAMPP phpMyAdmin with Homebrew MySQL, check `/Applications/XAMPP/xamppfiles/phpmyadmin/config.inc.php` for `$cfg['Servers'][$i]['socket'] = '/tmp/mysql.sock';`.
- **401 Unauthorized**: If login fails for correct credentials, run `node reset-admin-password.js` to refresh the hash in the DB.
