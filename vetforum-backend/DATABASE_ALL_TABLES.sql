-- Vet Forum India - All Database Tables
CREATE DATABASE IF NOT EXISTS vetforumindia;
USE vetforumindia;

-- Users Table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    mobile VARCHAR(15) NOT NULL,
    state VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    isVeterinarian BOOLEAN DEFAULT FALSE,
    isAdmin BOOLEAN DEFAULT FALSE,
    veterinarianType ENUM('Student', 'Graduated') NULL,
    year ENUM('1st', '2nd', '3rd', '4th', 'Final year/Internship') NULL,
    college VARCHAR(100) NULL,
    university VARCHAR(100) NULL,
    veterinarianState VARCHAR(100) NULL,
    bio TEXT NULL,
    currentPosition ENUM('Student', 'Government Officer', 'Government Teaching Professional', 'Private Organization', 'Clinician') NULL,
    positionDetails TEXT NULL,
    publications JSON NULL,
    awards JSON NULL,
    profilePhoto VARCHAR(255) NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Experts Table
CREATE TABLE experts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    qualification TEXT NULL,
    specialization VARCHAR(100) NOT NULL,
    yearsOfExperience INT NOT NULL,
    publications JSON NULL,
    awards JSON NULL,
    professionalPhoto VARCHAR(255) NULL,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Doctor Availability Table
CREATE TABLE doctor_availability (
    id INT PRIMARY KEY AUTO_INCREMENT,
    expertId INT NOT NULL,
    dayOfWeek ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday') NOT NULL,
    startTime TIME NOT NULL,
    endTime TIME NOT NULL,
    consultationFee DECIMAL(10,2) NOT NULL,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (expertId) REFERENCES experts(id) ON DELETE CASCADE
);

-- Appointments Table
CREATE TABLE appointments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    expertId INT NOT NULL,
    appointmentDate DATETIME NOT NULL,
    duration INT DEFAULT 30,
    consultationFee DECIMAL(10,2) NOT NULL,
    reasonForConsultation TEXT NOT NULL,
    status ENUM('pending', 'confirmed', 'rescheduled', 'completed', 'cancelled') DEFAULT 'pending',
    paymentStatus ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    paymentId VARCHAR(255) NULL,
    zoomMeetingId VARCHAR(255) NULL,
    zoomJoinUrl TEXT NULL,
    zoomStartUrl TEXT NULL,
    zoomPassword VARCHAR(255) NULL,
    doctorNotes TEXT NULL,
    prescriptions JSON NULL,
    followUpRequired BOOLEAN DEFAULT FALSE,
    followUpDate DATETIME NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (expertId) REFERENCES experts(id) ON DELETE CASCADE
);

-- Consultations Table
CREATE TABLE consultations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    expertId INT NOT NULL,
    reasonForConsultation TEXT NOT NULL,
    status ENUM('pending', 'paid', 'scheduled', 'completed', 'cancelled') DEFAULT 'pending',
    paymentStatus ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    consultationDate DATETIME NULL,
    notes TEXT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (expertId) REFERENCES experts(id) ON DELETE CASCADE
);

-- Quiz Questions Table
CREATE TABLE quizzes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    question TEXT NOT NULL,
    optionA VARCHAR(255) NOT NULL,
    optionB VARCHAR(255) NOT NULL,
    optionC VARCHAR(255) NOT NULL,
    optionD VARCHAR(255) NOT NULL,
    correctAnswer ENUM('A', 'B', 'C', 'D') NOT NULL,
    explanation TEXT NULL,
    category VARCHAR(100) DEFAULT 'Veterinary Nutrition',
    difficulty ENUM('Easy', 'Medium', 'Hard') DEFAULT 'Medium',
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Quiz Cards Table
CREATE TABLE quiz_cards (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT NULL,
    duration INT NOT NULL,
    numberOfQuestions INT NOT NULL,
    isActive BOOLEAN DEFAULT TRUE,
    createdBy INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE CASCADE
);

-- Quiz Attempts Table
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
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (quizCardId) REFERENCES quiz_cards(id) ON DELETE CASCADE
);

-- User Quiz Progress Table
CREATE TABLE user_quiz_progress (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    currentQuestionId INT NULL,
    currentQuestionNumber INT DEFAULT 1,
    score INT DEFAULT 0,
    correctAnswers INT DEFAULT 0,
    totalQuestions INT DEFAULT 20,
    isCompleted BOOLEAN DEFAULT FALSE,
    startedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completedAt TIMESTAMP NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (currentQuestionId) REFERENCES quizzes(id) ON DELETE SET NULL,
    UNIQUE KEY unique_user_progress (userId)
);

-- Blogs Table
CREATE TABLE blogs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    subtitle VARCHAR(300) NULL,
    content LONGTEXT NOT NULL,
    excerpt TEXT NULL,
    featuredImage VARCHAR(255) NULL,
    images JSON NULL,
    tags JSON NULL,
    readTime INT NULL,
    viewsCount INT DEFAULT 0,
    likesCount INT DEFAULT 0,
    commentsCount INT DEFAULT 0,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    publishedAt TIMESTAMP NULL,
    authorId INT NOT NULL,
    slug VARCHAR(255) UNIQUE NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (authorId) REFERENCES users(id) ON DELETE CASCADE
);

-- Blog Interactions Table
CREATE TABLE blog_interactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    blogId INT NOT NULL,
    type ENUM('like', 'comment', 'view') NOT NULL,
    content TEXT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (blogId) REFERENCES blogs(id) ON DELETE CASCADE
);

-- Posts Table
CREATE TABLE posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    content TEXT NOT NULL,
    photos JSON NULL,
    likesCount INT DEFAULT 0,
    commentsCount INT DEFAULT 0,
    sharesCount INT DEFAULT 0,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Post Interactions Table
CREATE TABLE post_interactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    postId INT NOT NULL,
    type ENUM('like', 'comment', 'share') NOT NULL,
    content TEXT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE
);

-- Announcements Table
CREATE TABLE announcements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    eventDate DATE NULL,
    description TEXT NOT NULL,
    photo VARCHAR(255) NULL,
    link VARCHAR(255) NULL,
    isActive BOOLEAN DEFAULT TRUE,
    priority INT DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Job Vacancies Table
CREATE TABLE job_vacancies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    organization VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    jobDescription TEXT NULL,
    contactEmail VARCHAR(255) NULL,
    contactPhone VARCHAR(20) NULL,
    photo VARCHAR(255) NULL,
    link VARCHAR(255) NULL,
    isActive BOOLEAN DEFAULT TRUE,
    expiryDate DATETIME NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Sample Data
INSERT INTO users (firstName, lastName, email, mobile, state, password, isAdmin) VALUES
('Admin', 'User', 'admin@vetforumindia.com', '9999999999', 'Maharashtra', '$2a$10$example_hashed_password', TRUE);

INSERT INTO experts (name, designation, specialization, yearsOfExperience, isActive) VALUES
('Dr. Jaishankar, N', 'Professor', 'Animal Nutritionist', 20, TRUE),
('Dr. Venkanagouda Doddagoudar', 'Associate Professor', 'Veterinary Gynaecologist', 20, TRUE),
('Dr. Manjunatha, D. R', 'Associate Professor & Head', 'Veterinary Surgeon', 20, TRUE),
('Dr. Vinayaka, M. N.', 'Veterinary Clinician', 'Veterinary Surgeon', 7, TRUE);

INSERT INTO quizzes (question, optionA, optionB, optionC, optionD, correctAnswer, explanation) VALUES
('What is the primary source of energy for most animals?', 'Proteins', 'Carbohydrates', 'Fats', 'Vitamins', 'B', 'Carbohydrates are the primary source of readily available energy for most animals.'),
('Which vitamin is essential for blood clotting?', 'Vitamin A', 'Vitamin D', 'Vitamin K', 'Vitamin C', 'C', 'Vitamin K is essential for the synthesis of clotting factors in the liver.');

INSERT INTO announcements (title, eventDate, description, priority, isActive) VALUES
('Pet Health & Wellness Expo - Mumbai', '2025-11-08', 'Premier event for pet health professionals and pet owners.', 1, TRUE),
('International Conference of ISAGB 2025 - Kolkata', '2025-11-13', 'Conference on Precision Animal Breeding through Genomics and AI.', 1, TRUE);

INSERT INTO job_vacancies (title, organization, location, jobDescription, contactEmail, isActive) VALUES
('Product Manager/Executive', 'Alembic Pharmaceuticals', 'Mumbai', 'Product development and market analysis for veterinary medicines.', 'careers@alembicpharma.com', TRUE),
('Veterinary Research Scientist', 'Alembic Pharmaceuticals', 'Mumbai', 'Lead research and development in animal health products.', 'research@alembicpharma.com', TRUE);