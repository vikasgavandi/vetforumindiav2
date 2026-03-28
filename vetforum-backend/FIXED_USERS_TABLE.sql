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
    
    -- Veterinarian Fields
    veterinarianType ENUM('Student', 'Graduated') NULL,
    year ENUM('1st', '2nd', '3rd', '4th', 'Final year/Internship') NULL,
    college VARCHAR(100) NULL,
    university VARCHAR(100) NULL,
    veterinarianState VARCHAR(100) NULL,
    
    -- Enhanced Profile Fields
    bio TEXT NULL,
    currentPosition ENUM('Student', 'Government Officer', 'Government Teaching Professional', 'Private Organization', 'Clinician') NULL,
    positionDetails TEXT NULL,
    publications JSON NULL,
    awards JSON NULL,
    profilePhoto VARCHAR(255) NULL,
    
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_isVeterinarian (isVeterinarian),
    INDEX idx_isAdmin (isAdmin)
);