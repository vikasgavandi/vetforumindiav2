-- Vet Forum India - Complete Database Schema
-- MySQL Database Schema for Veterinary Forum Platform

-- Create Database
CREATE DATABASE IF NOT EXISTS vetforumindia;
USE vetforumindia;

-- =============================================
-- 1. USERS TABLE (Enhanced with Admin & Profile Fields)
-- =============================================
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    mobile VARCHAR(15) NOT NULL,
    state VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    
    -- User Types
    isVeterinarian BOOLEAN DEFAULT FALSE,
    isAdmin BOOLEAN DEFAULT FALSE,
    approvalStatus ENUM('pending', 'approved', 'rejected') DEFAULT 'approved',
    dob DATE NULL,
    country VARCHAR(100) DEFAULT 'India',
    
    -- Veterinarian Fields
    veterinarianType ENUM('Student', 'Graduated') NULL,
    yearOfStudy ENUM('1st', '2nd', '3rd', '4th', 'Final year/Internship') NULL,
    studentId VARCHAR(50) NULL,
    college VARCHAR(200) NULL,
    university VARCHAR(200) NULL,
    veterinarianState VARCHAR(100) NULL,
    vetRegNo VARCHAR(100) NULL,
    qualification VARCHAR(200) NULL,
    
    -- Enhanced Profile Fields
    bio TEXT NULL,
    currentPosition ENUM('Student', 'Government Officer', 'Government Teaching Professional', 'Private Organization', 'Clinician') NULL,
    positionDetails TEXT NULL,
    publications JSON NULL,
    awards JSON NULL,
    profilePhoto VARCHAR(255) NULL,
    lastActiveAt DATETIME NULL,
    
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_isVeterinarian (isVeterinarian),
    INDEX idx_isAdmin (isAdmin)
);

-- =============================================
-- 2. EXPERTS TABLE (Veterinary Doctors)
-- =============================================
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
    consultationFee DECIMAL(10,2) DEFAULT 500.00,
    email VARCHAR(255) NULL,
    phone VARCHAR(20) NULL,
    bio TEXT NULL,
    userId INT NULL,
    isActive BOOLEAN DEFAULT TRUE,
    
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_specialization (specialization),
    INDEX idx_isActive (isActive),
    INDEX idx_userId (userId)
);

-- =============================================
-- 3. DOCTOR AVAILABILITY TABLE
-- =============================================
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
    
    FOREIGN KEY (expertId) REFERENCES experts(id) ON DELETE CASCADE,
    INDEX idx_expert_day (expertId, dayOfWeek),
    INDEX idx_isActive (isActive)
);

-- =============================================
-- 4. APPOINTMENTS TABLE (Video Consultations)
-- =============================================
CREATE TABLE appointments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    expertId INT NOT NULL,
    appointmentDate DATETIME NOT NULL,
    duration INT DEFAULT 30,
    consultationFee DECIMAL(10,2) NOT NULL,
    reasonForConsultation TEXT NOT NULL,
    
    -- Status Management
    status ENUM('pending', 'confirmed', 'rescheduled', 'completed', 'cancelled') DEFAULT 'pending',
    paymentStatus ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    paymentId VARCHAR(255) NULL,
    
    -- Zoom Integration
    zoomMeetingId VARCHAR(255) NULL,
    zoomJoinUrl TEXT NULL,
    zoomStartUrl TEXT NULL,
    zoomPassword VARCHAR(255) NULL,
    
    -- Consultation Records
    doctorNotes TEXT NULL,
    prescriptions JSON NULL,
    followUpRequired BOOLEAN DEFAULT FALSE,
    followUpDate DATETIME NULL,
    
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (expertId) REFERENCES experts(id) ON DELETE CASCADE,
    INDEX idx_user_appointments (userId),
    INDEX idx_expert_appointments (expertId),
    INDEX idx_appointment_date (appointmentDate),
    INDEX idx_status (status)
);

-- =============================================
-- 5. CONSULTATIONS TABLE (Legacy - Simple Requests)
-- =============================================
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
    FOREIGN KEY (expertId) REFERENCES experts(id) ON DELETE CASCADE,
    INDEX idx_user_consultations (userId),
    INDEX idx_expert_consultations (expertId)
);

-- =============================================
-- 6. QUIZ SYSTEM TABLES
-- =============================================

-- Quizzes are managed via quiz_cards and quiz_questions tables by Sequelize


-- Quiz Cards (Admin Created)
CREATE TABLE quiz_cards (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT NULL,
    category VARCHAR(100) DEFAULT 'General',
    difficulty ENUM('Easy', 'Medium', 'Hard') DEFAULT 'Medium',
    duration INT NOT NULL, -- in minutes
    numberOfQuestions INT NOT NULL,
    price DECIMAL(10, 2) DEFAULT 0.00,
    passingScore INT DEFAULT 50,
    status ENUM('upcoming', 'ongoing', 'completed', 'archived') DEFAULT 'upcoming',
    startDate DATETIME NULL,
    endDate DATETIME NULL,
    instructions TEXT NULL,
    isActive BOOLEAN DEFAULT TRUE,
    createdBy INT NOT NULL,
    
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_isActive (isActive),
    INDEX idx_createdBy (createdBy)
);

-- Quiz Attempts (Leaderboard)
CREATE TABLE quiz_attempts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    quizCardId INT NOT NULL,
    startTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    endTime TIMESTAMP NULL,
    score INT DEFAULT 0,
    totalQuestions INT NOT NULL,
    correctAnswers INT DEFAULT 0,
    timeTaken INT NULL, -- in seconds
    status ENUM('in_progress', 'completed', 'abandoned') DEFAULT 'in_progress',
    
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (quizCardId) REFERENCES quiz_cards(id) ON DELETE CASCADE,
    INDEX idx_user_attempts (userId),
    INDEX idx_quiz_attempts (quizCardId),
    INDEX idx_leaderboard (quizCardId, timeTaken, score)
);

-- User Quiz Progress (Legacy)
CREATE TABLE user_quiz_progress (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    quizCardId INT NOT NULL,
    currentQuestionNumber INT DEFAULT 1,
    totalQuestionsAnswered INT DEFAULT 0,
    correctAnswers INT DEFAULT 0,
    isCompleted BOOLEAN DEFAULT FALSE,
    startedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completedAt TIMESTAMP NULL,
    answers JSON NULL,
    
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (quizCardId) REFERENCES quiz_cards(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_quiz_progress (userId, quizCardId)
);

-- =============================================
-- 7. BLOG SYSTEM TABLES
-- =============================================

-- Blogs Table (Medium-like)
CREATE TABLE blogs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    subtitle VARCHAR(300) NULL,
    content LONGTEXT NOT NULL,
    excerpt TEXT NULL,
    featuredImage VARCHAR(255) NULL,
    images JSON NULL,
    tags JSON NULL,
    readTime INT NULL, -- in minutes
    viewsCount INT DEFAULT 0,
    likesCount INT DEFAULT 0,
    commentsCount INT DEFAULT 0,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    publishedAt TIMESTAMP NULL,
    authorId INT NOT NULL,
    slug VARCHAR(255) UNIQUE NULL,
    
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (authorId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_published_at (publishedAt),
    INDEX idx_author_id (authorId),
    INDEX idx_slug (slug),
    FULLTEXT idx_search (title, subtitle, content)
);

-- Blog Interactions Table
CREATE TABLE blog_interactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    blogId INT NOT NULL,
    type ENUM('like', 'comment', 'view') NOT NULL,
    content TEXT NULL, -- Only for comments
    
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (blogId) REFERENCES blogs(id) ON DELETE CASCADE,
    UNIQUE KEY unique_like_view (userId, blogId, type),
    INDEX idx_blog_interactions (blogId, type)
);

-- =============================================
-- 8. SOCIAL MEDIA POSTS TABLES
-- =============================================

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
    
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_posts (userId),
    INDEX idx_created_at (createdAt),
    INDEX idx_isActive (isActive)
);

-- Post Interactions Table
CREATE TABLE post_interactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    postId INT NOT NULL,
    type ENUM('like', 'comment', 'share') NOT NULL,
    content TEXT NULL, -- Only for comments
    
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_like_share (userId, postId, type),
    INDEX idx_post_interactions (postId, type)
);

-- =============================================
-- 9. ANNOUNCEMENTS TABLE
-- =============================================
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
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_event_date (eventDate),
    INDEX idx_isActive (isActive),
    INDEX idx_priority (priority)
);

-- =============================================
-- 10. JOB VACANCIES TABLE
-- =============================================
CREATE TABLE job_vacancies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    organization VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    jobDescription TEXT NULL,
    designation VARCHAR(100) NULL,
    salary VARCHAR(100) NULL,
    qualification TEXT NULL,
    noticePeriod VARCHAR(100) NULL,
    postDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    contactEmail VARCHAR(255) NULL,

    contactPhone VARCHAR(20) NULL,
    photo VARCHAR(255) NULL,
    link VARCHAR(255) NULL,
    isActive BOOLEAN DEFAULT TRUE,
    expiryDate DATETIME NULL,
    
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_location (location),
    INDEX idx_organization (organization),
    INDEX idx_isActive (isActive),
    INDEX idx_expiry_date (expiryDate)
);

-- =============================================
-- SAMPLE DATA INSERTION
-- =============================================

-- Insert Admin User
INSERT INTO users (firstName, lastName, email, mobile, state, password, isAdmin, isVeterinarian) VALUES
('Admin', 'User', 'admin@vetforumindia.com', '9999999999', 'Maharashtra', '$2a$10$example_hashed_password', TRUE, FALSE);

-- Insert Sample Experts
INSERT INTO experts (name, designation, qualification, specialization, yearsOfExperience, publications, awards, isActive) VALUES
('Dr. Jaishankar, N', 'Professor', 'BVSc & AH, MVSc, PhD', 'Animal Nutritionist', 20, 
 JSON_ARRAY('Advanced Animal Nutrition Principles', 'Veterinary Feed Technology', 'Nutritional Disorders in Livestock'),
 JSON_ARRAY('Best Research Paper Award 2020', 'Excellence in Teaching Award', 'Outstanding Contribution to Animal Nutrition'),
 TRUE),

('Dr. Venkanagouda Doddagoudar', 'Associate Professor (I/C)', 'BVSc & AH, MVSc, PhD', 'Veterinary Gynaecologist', 20,
 JSON_ARRAY('Reproductive Technologies in Cattle', 'Gynaecological Disorders in Small Animals', 'Advances in Veterinary Obstetrics'),
 JSON_ARRAY('Research Excellence Award', 'Best Clinical Practice Award', 'Innovation in Veterinary Medicine'),
 TRUE),

('Dr. Manjunatha, D. R', 'Associate Professor & Head', 'BVSc & AH, MVSc, PhD', 'Veterinary Surgeon', 20,
 JSON_ARRAY('Surgical Techniques in Large Animals', 'Minimally Invasive Surgery in Veterinary Practice', 'Emergency Surgical Procedures'),
 JSON_ARRAY('Surgical Excellence Award', 'Leadership in Veterinary Education', 'Outstanding Service Award'),
 TRUE),

('Dr. Vinayaka, M. N.', 'Veterinary Clinician', 'BVSc & AH, MVSc', 'Veterinary Surgeon', 7,
 JSON_ARRAY('Clinical Case Studies in Small Animal Surgery', 'Diagnostic Imaging in Veterinary Practice', 'Pain Management in Veterinary Surgery'),
 JSON_ARRAY('Young Veterinarian Award', 'Clinical Excellence Recognition', 'Best Case Presentation Award'),
 TRUE);

-- Sample Quizzes are handled via backend seeders


-- Insert Sample Announcements
INSERT INTO announcements (title, eventDate, description, priority, isActive) VALUES
('Pet Health & Wellness Expo (PHAW Expo) - Mumbai', '2025-11-08', 
 'The Pet Health & Wellness Expo in Mumbai is a premier event dedicated to enhancing the health and well-being of pets. Taking place from November 8 to November 9, 2025, this expo brings together pet owners, veterinarians, and industry experts under one roof to explore the latest advancements in pet care.',
 1, TRUE),

('International Conference of ISAGB 2025 - Kolkata', '2025-11-13',
 'The International Conference of the Indian Society of Animal Genetics and Breeding (ISAGB) is set to take place at the Biswa Bangla Convention Centre in Kolkata, India. The conference is themed around "Precision Animal Breeding through Genomics, Artificial Intelligence, and Machine Learning."',
 1, TRUE);

-- Insert Sample Job Vacancies
INSERT INTO job_vacancies (title, organization, location, jobDescription, contactEmail, contactPhone, isActive) VALUES
('Product Manager/ Product Executive', 'Alembic Pharmaceuticals', 'Mumbai', 
 'We are looking for an experienced Product Manager/Executive to join our veterinary pharmaceuticals division. The role involves product development, market analysis, and strategic planning for veterinary medicines and healthcare products.',
 'careers@alembicpharma.com', '+91-22-12345678', TRUE),

('Veterinary Research Scientist', 'Alembic Pharmaceuticals', 'Mumbai',
 'Seeking a qualified Veterinary Research Scientist to lead research and development activities in animal health products. Responsibilities include conducting clinical trials, regulatory submissions, and product innovation.',
 'research@alembicpharma.com', '+91-22-87654321', TRUE);

-- =============================================
-- DATABASE INDEXES FOR PERFORMANCE
-- =============================================

-- Additional Performance Indexes
CREATE INDEX idx_users_created_at ON users(createdAt);
CREATE INDEX idx_appointments_date_status ON appointments(appointmentDate, status);
CREATE INDEX idx_blogs_status_published ON blogs(status, publishedAt);
CREATE INDEX idx_posts_user_created ON posts(userId, createdAt);
CREATE INDEX idx_quiz_attempts_leaderboard ON quiz_attempts(quizCardId, status, timeTaken);

-- =============================================
-- DATABASE VIEWS FOR COMMON QUERIES
-- =============================================

-- Active Doctors with Availability View
CREATE VIEW active_doctors_with_availability AS
SELECT 
    e.*,
    COUNT(da.id) as availability_slots,
    MIN(da.consultationFee) as min_fee,
    MAX(da.consultationFee) as max_fee
FROM experts e
LEFT JOIN doctor_availability da ON e.id = da.expertId AND da.isActive = TRUE
WHERE e.isActive = TRUE
GROUP BY e.id;

-- Published Blogs with Author Info View
CREATE VIEW published_blogs_with_authors AS
SELECT 
    b.*,
    u.firstName,
    u.lastName,
    u.profilePhoto,
    u.isVeterinarian
FROM blogs b
JOIN users u ON b.authorId = u.id
WHERE b.status = 'published'
ORDER BY b.publishedAt DESC;

-- Quiz Leaderboard View
CREATE VIEW quiz_leaderboard AS
SELECT 
    qa.*,
    u.firstName,
    u.lastName,
    u.profilePhoto,
    qc.title as quiz_title,
    RANK() OVER (PARTITION BY qa.quizCardId ORDER BY qa.timeTaken ASC, qa.score DESC) as rank_position
FROM quiz_attempts qa
JOIN users u ON qa.userId = u.id
JOIN quiz_cards qc ON qa.quizCardId = qc.id
WHERE qa.status = 'completed';

-- =============================================
-- END OF DATABASE SCHEMA
-- =============================================