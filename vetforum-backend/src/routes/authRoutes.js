import express from 'express';
import { 
  register, 
  sendRegistrationOTP, 
  login, 
  getProfile, 
  updateProfile, 
  uploadProfilePhoto, 
  deleteProfilePhoto,
  forgotPassword,
  verifyResetOTP,
  resetPassword
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for document uploads (registration)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Temporary storage, files will be moved to user-specific folder after user creation
    const tempDir = path.join(__dirname, '../../uploads/temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common document formats
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      return cb(null, true);
    } else {
      return cb(new Error('Invalid file type. Only PDF, JPG, PNG, DOC, DOCX files are allowed.'));
    }
  }
});

// Configure multer for profile photo uploads (memory storage for processing)
const profilePhotoUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for profile photos
  },
  fileFilter: (req, file, cb) => {
    // Allow only image formats
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      return cb(null, true);
    } else {
      return cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'));
    }
  }
});

// Send OTP for registration
router.post('/send-otp', sendRegistrationOTP);

// Forgot Password routes
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOTP);
router.post('/reset-password', resetPassword);

// Registration route - handle both single and multiple file uploads
router.post('/register', upload.fields([
  { name: 'documents', maxCount: 10 },
  { name: 'document', maxCount: 10 },
  { name: 'file', maxCount: 10 },
  { name: 'attachment', maxCount: 10 }
]), register);

// Login route
router.post('/login', login);

// Get profile route (protected)
router.get('/profile', authenticateToken, getProfile);

// Update profile route (protected)
router.put('/profile', authenticateToken, updateProfile);

// Upload profile photo route (protected)
router.post('/profile/upload-photo', authenticateToken, profilePhotoUpload.single('photo'), uploadProfilePhoto);

// Delete profile photo route (protected)
router.delete('/profile/delete-photo', authenticateToken, deleteProfilePhoto);

export default router;