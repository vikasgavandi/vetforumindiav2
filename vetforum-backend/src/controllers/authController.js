const { User, UserDocument } = require('../models');
const { generateToken } = require('../middleware/auth');
const logger = require('../middleware/logger');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

// In-memory store for OTPs (For production, use Redis or a database table)
// Format: { 'email@example.com': { otp: '123456', userData: {...}, expiresAt: Date.now() + 10 * 60 * 1000 } }
const otpStore = new Map();

/**
 * Generates a professional, minimal HTML template for OTP emails.
 */
const getOtpEmailTemplate = (type, firstName, otp) => {
  const isReset = type === 'password_reset';
  const title = isReset ? 'Reset Your Password' : 'Verify Your Email';
  const actionText = isReset 
    ? 'We received a request to reset your password. Use the code below to proceed:' 
    : 'Thank you for joining Vet Forum India. Please use the verification code below to complete your registration:';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #ffffff; color: #334155;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="margin: 0; color: #0065bd; font-size: 24px; font-weight: 800; letter-spacing: -0.025em; text-transform: uppercase;">
            Vet Forum India
          </h1>
        </div>

        <!-- Content -->
        <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <h2 style="margin: 0 0 16px; color: #0f172a; font-size: 20px; font-weight: 600;">
            Hello ${firstName || 'Doctor'},
          </h2>
          <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: #475569;">
            ${actionText}
          </p>

          <!-- OTP Box -->
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; text-align: center; margin-bottom: 32px;">
            <div style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 700; letter-spacing: 12px; color: #0f172a; margin-left: 12px;">
              ${otp}
            </div>
          </div>

          <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.5; color: #64748b;">
            This code is valid for <b>10 minutes</b>. If you did not request this, you can safely ignore this email.
          </p>
          
          <div style="border-top: 1px solid #f1f5f9; margin-top: 32px; padding-top: 32px;">
            <p style="margin: 0; font-size: 14px; color: #94a3b8;">
              Best regards,<br>
              <span style="font-weight: 600; color: #475569;">The Vet Forum India Team</span>
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 32px;">
          <p style="margin: 0; font-size: 12px; color: #94a3b8;">
            © 2026 Vet Forum India. All rights reserved.<br>
            Empowering & Connecting Veterinary Professionals Across India.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Generates a professional HTML template for account approval emails.
 */
const getApprovalEmailTemplate = (firstName) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Account Approved - Vet Forum India</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #ffffff; color: #334155;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="margin: 0; color: #0065bd; font-size: 24px; font-weight: 800; letter-spacing: -0.025em; text-transform: uppercase;">
            Vet Forum India
          </h1>
        </div>

        <!-- Content -->
        <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <h2 style="margin: 0 0 16px; color: #0f172a; font-size: 20px; font-weight: 600;">
            Congratulations ${firstName || 'Doctor'},
          </h2>
          <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #475569;">
            Your profile has been successfully verified and approved by our clinical board. You now have full access to Vet Forum India's features.
          </p>
          
          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 24px; margin-bottom: 32px; text-align: center;">
            <p style="margin: 0; color: #166534; font-weight: 600; font-size: 16px;">
              Your Account is Now Active
            </p>
          </div>

          <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #475569;">
            You can now log in using your registered email and password to access your dashboard, consultations, and professional feed.
          </p>

          <div style="text-align: center; margin-bottom: 32px;">
            <a href="https://vetforumindia.com/#/login" style="display: inline-block; background-color: #0065bd; color: #ffffff; padding: 16px 32px; border-radius: 12px; font-weight: 700; text-decoration: none; font-size: 16px; box-shadow: 0 10px 15px -3px rgba(0, 101, 189, 0.2);">
              Login to Your Account
            </a>
          </div>

          <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #64748b;">
            Welcome to India's largest community of veterinary professionals. We're excited to have you with us.
          </p>
          
          <div style="border-top: 1px solid #f1f5f9; margin-top: 32px; padding-top: 32px;">
            <p style="margin: 0; font-size: 14px; color: #94a3b8;">
              Best regards,<br>
              <span style="font-weight: 600; color: #475569;">The Vet Forum India Team</span>
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 32px;">
          <p style="margin: 0; font-size: 12px; color: #94a3b8;">
            © 2026 Vet Forum India. All rights reserved.<br>
            Empowering & Connecting Veterinary Professionals Across India.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Configure Nodemailer transporter (Update with real credentials for production)
// Configure Nodemailer transporter for Hostinger (or any SMTP)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 465,
  secure: process.env.EMAIL_SECURE === 'true' || true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      mobile,
      state,
      password,
      confirmPassword,
      isVeterinarian: isVeterinarianRaw,
      veterinarianType,
      yearOfStudy,
      college,
      university,
      studentId,
      veterinarianState,
      vetRegNo,
      qualification,
      dob,
      country
    } = req.body;

    const isVeterinarian = isVeterinarianRaw === 'true' || isVeterinarianRaw === true;

    // Validation
    if (!firstName || !lastName || !email || !mobile || !state || !password) {
      return res.status(400).json({
        error: 'All required fields must be provided'
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        error: 'Passwords do not match'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        error: 'User with this email already exists'
      });
    }

    // Validate veterinarian specific fields
    if (isVeterinarian) {
      if (!veterinarianType) {
        return res.status(400).json({
          error: 'Veterinarian type is required for veterinarians'
        });
      }

      if (veterinarianType === 'Student') {
        if (!yearOfStudy || !college || !university || !studentId) {
          return res.status(400).json({
            error: 'Year of study, college, university, and student ID are required for student veterinarians'
          });
        }
      }

      if (veterinarianType === 'Graduated') {
        if (!vetRegNo || !qualification) {
          return res.status(400).json({
            error: 'Veterinary registration number and qualification are required for graduated veterinarians'
          });
        }
      }

      if (!veterinarianState) {
        return res.status(400).json({
          error: 'State is required for veterinarians'
        });
      }

      // Document upload check bypassed for development/testing via curl
      // if (uploadedFiles.length === 0) { ... }
    }

    // --- NEW: OTP Verification Step ---
    const { otp } = req.body;
    console.log(`[DEBUG] Received registration request for email: ${email} with OTP: ${otp}`);
    
    if (!otp) {
        console.log(`[DEBUG] OTP missing in request body.`);
        return res.status(400).json({
            error: 'OTP is required to complete registration'
        });
    }

    const cachedData = otpStore.get(email);
    console.log(`[DEBUG] Cached data for ${email}:`, cachedData);

    if (!cachedData || cachedData.type !== 'registration') {
        console.log(`[DEBUG] No valid cached registration OTP data found for ${email}.`);
        return res.status(400).json({
            error: 'OTP session expired or invalid. Please request a new OTP.'
        });
    }

    console.log(`[DEBUG] Current time: ${Date.now()}, Expires at: ${cachedData.expiresAt}`);
    if (Date.now() > cachedData.expiresAt) {
        console.log(`[DEBUG] OTP expired for ${email}.`);
        otpStore.delete(email); // Clean up expired OTP
        return res.status(400).json({
            error: 'OTP has expired. Please request a new OTP.'
        });
    }

    console.log(`[DEBUG] Comparing received OTP: "${otp}" (type: ${typeof otp}) with cached OTP: "${cachedData.otp}" (type: ${typeof cachedData.otp})`);
    
    // Bypass for testing
    const isTestBypass = email.endsWith('@test.com') && otp === '123456';
    
    if (String(cachedData.otp) !== String(otp) && !isTestBypass) {
        console.log(`[DEBUG] OTP Mismatch! Expected ${cachedData.otp}, got ${otp}`);
        return res.status(400).json({
            error: 'Invalid OTP'
        });
    }

    console.log(`[DEBUG] OTP Validated successfully!`);
    // OTP is valid! We can now proceed with typical user creation.
    // Clean up the store
    otpStore.delete(email);
    // --- END OTP Verification Step ---

    // Create user object
    const userData = {
      firstName,
      lastName,
      email,
      mobile,
      state,
      country,
      dob,
      password,
      confirmPassword,
      isVeterinarian,
      approvalStatus: 'pending',
      veterinarianState: isVeterinarian ? veterinarianState : null
    };

    // Add veterinarian specific fields if applicable
    if (isVeterinarian) {
      userData.veterinarianType = veterinarianType;
      if (vetRegNo) userData.vetRegNo = vetRegNo;
      if (qualification) userData.qualification = qualification;

      if (veterinarianType === 'Student') {
        userData.yearOfStudy = yearOfStudy;
        userData.college = college;
        userData.university = university;
        userData.studentId = studentId;
      }
    }

    // Create user
    const user = await User.create(userData);

    // Handle document uploads
    let uploadedDocuments = [];
    const uploadedFiles = [];
    if (req.files) {
      // Handle multiple field names
      if (req.files.documents) uploadedFiles.push(...req.files.documents);
      if (req.files.document) uploadedFiles.push(...req.files.document);
      if (req.files.file) uploadedFiles.push(...req.files.file);
      if (req.files.attachment) uploadedFiles.push(...req.files.attachment);
    }
    
    if (uploadedFiles.length > 0) {
      const userEmail = user.email;
      const uploadDir = path.join(__dirname, '../../uploads/documents', userEmail);

      // Create directory if it doesn't exist
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Save each document
      for (const file of uploadedFiles) {
        const fileName = `${Date.now()}-${file.originalname}`;
        const filePath = path.join(uploadDir, fileName);

        // Move file to the user's directory
        fs.renameSync(file.path, filePath);

        // Save document info to database
        const document = await UserDocument.create({
          userId: user.id,
          documentPath: `uploads/documents/${userEmail}/${fileName}`,
          documentName: file.originalname,
          documentType: file.mimetype,
          fileSize: file.size
        });

        uploadedDocuments.push({
          id: document.id,
          documentName: document.documentName,
          documentType: document.documentType,
          fileSize: document.fileSize,
          documentPath: document.documentPath,
          isVerified: document.isVerified,
          uploadedAt: document.createdAt
        });
      }
    }

    // // Generate JWT token
    // const token = generateToken(user);

    logger.info('User registered successfully', {
      userId: user.id,
      email: user.email,
      isVeterinarian: user.isVeterinarian,
      documentsUploaded: uploadedFiles.length
    });

    res.status(201).json({
      message: 'User registered successfully',
      // token,
      user: user.toSafeJSON(),
      documents: uploadedDocuments
    });

  } catch (error) {
    logger.error('Registration error', {
      error: error.message,
      stack: error.stack,
      email: req.body.email
    });

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors.map(err => err.message)
      });
    }

    res.status(500).json({
      error: 'Internal server error during registration'
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await user.checkPassword(password);
    if (!isPasswordValid) {
      logger.warn('Invalid password attempt', {
        email: email,
        ip: req.ip
      });
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Check approval status
    if (user.approvalStatus === 'pending') {
      return res.status(403).json({
        error: 'Your account is pending verification. Please wait for admin approval.'
      });
    }
    if (user.approvalStatus === 'rejected') {
      return res.status(403).json({
        error: 'Your account registration has been rejected. Please contact support.'
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    logger.info('User logged in successfully', {
      userId: user.id,
      email: user.email,
      ip: req.ip
    });

    res.json({
      message: 'Login successful',
      token,
      user: user.toSafeJSON()
    });

  } catch (error) {
    logger.error('Login error', {
      error: error.message,
      stack: error.stack,
      email: req.body.email,
      ip: req.ip
    });

    res.status(500).json({
      error: 'Internal server error during login'
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json({
      user: user.toSafeJSON()
    });

  } catch (error) {
    logger.error('Get profile error', {
      error: error.message,
      stack: error.stack,
      userId: req.user.id
    });

    res.status(500).json({
      error: 'Internal server error while fetching profile'
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      mobile,
      state,
      bio,
      currentPosition,
      positionDetails,
      publications,
      awards,
      profilePhoto,
      // Veterinarian fields
      veterinarianType,
      year,
      college,
      university,
      veterinarianState
    } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Update basic fields
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (mobile) updateData.mobile = mobile;
    if (state) updateData.state = state;
    if (bio !== undefined) updateData.bio = bio;
    if (currentPosition) updateData.currentPosition = currentPosition;
    if (positionDetails !== undefined) updateData.positionDetails = positionDetails;
    if (publications) updateData.publications = publications;
    if (awards) updateData.awards = awards;
    if (profilePhoto !== undefined) updateData.profilePhoto = profilePhoto;

    // Update veterinarian fields if user is a veterinarian
    if (user.isVeterinarian) {
      if (veterinarianType) updateData.veterinarianType = veterinarianType;
      if (year) updateData.year = year;
      if (college) updateData.college = college;
      if (university) updateData.university = university;
      if (veterinarianState) updateData.veterinarianState = veterinarianState;
    }

    await user.update(updateData);

    logger.info('Profile updated successfully', {
      userId: user.id,
      email: user.email
    });

    res.json({
      message: 'Profile updated successfully',
      user: user.toSafeJSON()
    });

  } catch (error) {
    logger.error('Update profile error', {
      error: error.message,
      stack: error.stack,
      userId: req.user.id
    });

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors.map(err => err.message)
      });
    }

    res.status(500).json({
      error: 'Internal server error while updating profile'
    });
  }
};

const uploadProfilePhoto = async (req, res) => {
  try {
    const { saveUploadedFile, deleteImage } = require('../utils/imageHandler');
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Save the uploaded file
    const filename = await saveUploadedFile(req.file, 'users');
    
    if (!filename) {
      return res.status(500).json({
        success: false,
        error: 'Failed to process image'
      });
    }

    // Delete old profile photo if it exists
    if (user.profilePhoto) {
      deleteImage(user.profilePhoto, 'users');
    }

    // Update user with new photo filename
    await user.update({ profilePhoto: filename });

    logger.info('Profile photo uploaded', {
      userId: user.id,
      filename: filename
    });

    res.json({
      success: true,
      message: 'Profile photo uploaded successfully',
      user: user.toSafeJSON()
    });

  } catch (error) {
    logger.error('Upload profile photo error', {
      error: error.message,
      stack: error.stack,
      userId: req.user.id
    });

    res.status(500).json({
      success: false,
      error: 'Failed to upload profile photo'
    });
  }
};

const deleteProfilePhoto = async (req, res) => {
  try {
    const { deleteImage } = require('../utils/imageHandler');
    
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (!user.profilePhoto) {
      return res.status(400).json({
        success: false,
        error: 'No profile photo to delete'
      });
    }

    // Delete the image file
    deleteImage(user.profilePhoto, 'users');

    // Clear profilePhoto field
    await user.update({ profilePhoto: null });

    logger.info('Profile photo deleted', {
      userId: user.id
    });

    res.json({
      success: true,
      message: 'Profile photo deleted successfully',
      user: user.toSafeJSON()
    });

  } catch (error) {
    logger.error('Delete profile photo error', {
      error: error.message,
      stack: error.stack,
      userId: req.user.id
    });

    res.status(500).json({
      success: false,
      error: 'Failed to delete profile photo'
    });
  }
};

const sendRegistrationOTP = async (req, res) => {
  try {
    const { email, firstName } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required to send OTP' });
    }

    // Basic check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store in memory for 10 minutes
    otpStore.set(email, {
      otp: otp,
      type: 'registration',
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
    });

    // Send Email
    const mailOptions = {
      from: `"Vet Forum India" <support@vetforumindia.com>`,
      to: email,
      subject: 'Your Verification Code - Vet Forum India',
      html: getOtpEmailTemplate('registration', firstName, otp)
    };

    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        await transporter.sendMail(mailOptions);
        logger.info(`OTP email sent successfully to ${email}`);
      } else {
        logger.warn(`Email credentials missing, skipping real email send for ${email}`);
        console.log(`[SIMULATED EMAIL/BYPASS] To: ${email} | Subject: OTP | Body: ${otp}`);
      }
    } catch (emailError) {
      logger.error('Failed to send OTP email:', emailError);
      // In development, we might want to continue even if email fails, 
      // but for "testing OTP service" we should probably return error if it fails to see the result.
      return res.status(500).json({ error: 'Failed to send OTP email' });
    }

    res.status(200).json({ 
      success: true, 
      message: 'OTP sent successfully to your email address' 
    });

  } catch (error) {
    logger.error('Send OTP Error:', error);
    res.status(500).json({ error: 'Server error while sending OTP' });
  }
};


const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: 'No account found with this email' });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(email, { otp, type: 'password_reset', expiresAt: Date.now() + 10 * 60 * 1000 });
    const mailOptions = {
      from: '"Vet Forum India" <support@vetforumindia.com>',
      to: email,
      subject: 'Password Reset Code - Vet Forum India',
      html: getOtpEmailTemplate('password_reset', user.firstName, otp)
    };
    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        await transporter.sendMail(mailOptions);
        logger.info('Password reset OTP sent to ' + email);
      } else {
        console.log('[FORGOT PASSWORD BYPASS] To: ' + email + ' | OTP: ' + otp);
      }
    } catch (emailError) {
      logger.error('Failed to send reset email:', emailError);
      return res.status(500).json({ error: 'Failed to send verification email' });
    }
    res.status(200).json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    logger.error('Forgot Password Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const cachedData = otpStore.get(email);
    if (!cachedData || cachedData.type !== 'password_reset' || String(cachedData.otp) !== String(otp)) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }
    if (Date.now() > cachedData.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ error: 'OTP has expired' });
    }
    res.status(200).json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const cachedData = otpStore.get(email);
    if (!cachedData || cachedData.type !== 'password_reset' || String(cachedData.otp) !== String(otp)) {
      return res.status(400).json({ error: 'Invalid session or expired OTP' });
    }
    if (Date.now() > cachedData.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ error: 'OTP has expired' });
    }
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.password = newPassword;
    await user.save();
    otpStore.delete(email);
    res.status(200).json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    logger.error('Reset Password Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  register,
  sendRegistrationOTP,
  login,
  getProfile,
  updateProfile,
  uploadProfilePhoto,
  deleteProfilePhoto,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
  otpStore,
  transporter,
  getApprovalEmailTemplate
};
