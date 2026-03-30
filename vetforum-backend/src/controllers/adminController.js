import { QuizCard, QuizAttempt, User, UserDocument, Expert, DoctorAvailability, Quiz } from '../models/index.js';
import { Op } from 'sequelize';
import logger from '../middleware/logger.js';
import bcrypt from 'bcryptjs';
import { getTransporter, getApprovalEmailTemplate } from './authController.js';

// --- Doctor (Expert) Management ---

// Get all doctors
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Expert.findAll({
      include: [{
        model: User,
        as: 'userAccount',
        attributes: ['email', 'firstName', 'lastName']
      }]
    });

    res.json({
      success: true,
      data: doctors
    });
  } catch (error) {
    logger.error('Error fetching doctors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctors'
    });
  }
};

// Create a new doctor (Expert profile)
export const createDoctor = async (req, res) => {
  try {
    const { 
      name, designation, qualification, specialization, 
      yearsOfExperience, consultationFee, email, phone, bio,
      password // Optional: if provided, create a user account
    } = req.body;

    let userId = null;

    // If email and password provided, create or link to a user account
    if (email && password) {
      let user = await User.findOne({ where: { email } });
      if (!user) {
        user = await User.create({
          firstName: name.split(' ')[0],
          lastName: name.split(' ').slice(1).join(' ') || 'Doctor',
          email,
          mobile: phone || '0000000000', // mobile is required
          state: 'Other',               // state is required
          password,
          isVeterinarian: true,
          approvalStatus: 'approved'     // Auto-approve doctors created via admin
        });
      }
      userId = user.id;
    }

    const expert = await Expert.create({
      name,
      designation,
      qualification,
      specialization,
      yearsOfExperience,
      consultationFee,
      email,
      phone,
      bio,
      userId
    });

    // Send Approval/Welcome Email if a new user was created
    if (userId) {
      try {
        const user = await User.findByPk(userId);
        if (user) {
          const mailOptions = {
            from: `"Vet Forum India" <support@vetforumindia.com>`,
            to: user.email,
            subject: 'Account Approved - Vet Forum India',
            html: getApprovalEmailTemplate(user.firstName)
          };
          
          if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            await getTransporter().sendMail(mailOptions);
            logger.info(`Approval email sent to ${user.email} (Admin Created)`);
          } else {
            logger.warn(`Email credentials missing, skipping real approval email for ${user.email}`);
            console.log(`[SIMULATED APPROVAL EMAIL] To: ${user.email} | Subject: Account Approved (Admin Created)`);
          }
        }
      } catch (emailError) {
        logger.error('Failed to send approval email for admin-created doctor:', emailError);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Doctor profile created successfully',
      data: expert
    });
  } catch (error) {
    logger.error('Error creating doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create doctor profile',
      error: error.message,
      details: error.errors?.map(e => e.message)
    });
  }
};

// Update doctor profile
export const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const expert = await Expert.findByPk(id);
    if (!expert) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    await expert.update(updateData);

    res.json({
      success: true,
      message: 'Doctor profile updated successfully',
      data: expert
    });
  } catch (error) {
    logger.error('Error updating doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update doctor profile'
    });
  }
};

// Delete doctor profile
export const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const expert = await Expert.findByPk(id);

    if (!expert) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Instead of deletion, we could just deactivate
    expert.isActive = false;
    await expert.save();

    res.json({
      success: true,
      message: 'Doctor profile deactivated successfully'
    });
  } catch (error) {
    logger.error('Error deleting doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate doctor profile'
    });
  }
};


// Create Quiz Card (Admin Only)
export const createQuizCard = async (req, res) => {
  try {
    console.log('--- DEBUG: createQuizCard Request ---');
    console.log('Body:', JSON.stringify(req.body, null, 2));
    logger.info('DEBUG: createQuizCard Request Body', { body: req.body });

    const {
      title,
      description,
      category,
      difficulty,
      duration,
      numberOfQuestions,
      price,
      passingScore,
      status,
      startDate,
      endDate,
      instructions,
      questions // Array of questions from frontend
    } = req.body;
    const createdBy = req.user.id;

    console.log('DEBUG: Extracted fields:', { title, duration, numberOfQuestions, questionsCount: questions?.length });

    // Validation for required fields
    if (!title || !duration || !numberOfQuestions) {
      console.log('DEBUG: Validation failed: missing required fields', { title: !!title, duration: !!duration, numberOfQuestions: !!numberOfQuestions });
      return res.status(400).json({
        success: false,
        message: 'Title, duration, and number of questions are required'
      });
    }

    // Validate title length
    if (title.length < 3 || title.length > 200) {
      return res.status(400).json({
        success: false,
        message: 'Title must be between 3 and 200 characters'
      });
    }

    // Validate duration (1-180 minutes)
    if (duration < 1 || duration > 180) {
      return res.status(400).json({
        success: false,
        message: 'Duration must be between 1 and 180 minutes'
      });
    }

    // Validate numberOfQuestions (1-100)
    if (numberOfQuestions < 1 || numberOfQuestions > 100) {
      return res.status(400).json({
        success: false,
        message: 'Number of questions must be between 1 and 100'
      });
    }

    // Validate price
    if (price !== undefined && price < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price cannot be negative'
      });
    }

    // Validate passing score
    if (passingScore !== undefined && (passingScore < 0 || passingScore > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Passing score must be between 0 and 100 percent',
        error: 'Invalid passing score'
      });
    }

    // Validate dates if provided
    if (startDate && endDate) {
      if (new Date(startDate) >= new Date(endDate)) {
        return res.status(400).json({
          success: false,
          message: 'End date must be after start date'
        });
      }
    }

    // Use transaction to ensure both card and questions are created
    const result = await QuizCard.sequelize.transaction(async (t) => {
      // Create quiz card
      const quizCard = await QuizCard.create({
        title,
        description: description || null,
        category: category || 'General',
        difficulty: difficulty || 'Medium',
        duration,
        numberOfQuestions: questions && questions.length > 0 ? questions.length : numberOfQuestions,
        price: price || 0.00,
        passingScore: passingScore || 50,
        status: status || 'upcoming',
        startDate: startDate || null,
        endDate: endDate || null,
        instructions: instructions || null,
        createdBy
      }, { transaction: t });

      // Create questions if provided
      if (questions && Array.isArray(questions)) {
        if (questions.length === 0) {
           throw new Error('At least one question is required');
        }

        const questionsToCreate = questions.map((q, index) => {
          // Robust mapping with defaults and validation
          const questionText = q.text || q.question;
          const opts = q.options || [];
          
          if (!questionText) {
            throw new Error(`Question ${index + 1} is missing text`);
          }

          // Ensure at least 2 options are provided
          const optA = (opts[0]?.text || q.optionA || '').trim();
          const optB = (opts[1]?.text || q.optionB || '').trim();
          const optC = (opts[2]?.text || q.optionC || '').trim() || null;
          const optD = (opts[3]?.text || q.optionD || '').trim() || null;

          if (!optA || !optB) {
            throw new Error(`Question ${index + 1} must have at least 2 non-empty options (A and B)`);
          }

          let correctAns = q.correctAnswer;
          const correctIndex = opts.findIndex(opt => opt.isCorrect);
          if (correctIndex !== -1) {
            correctAns = ['A', 'B', 'C', 'D'][correctIndex];
          }

          if (!correctAns || !['A', 'B', 'C', 'D'].includes(correctAns)) {
            // If it's a number/index, map it
            if (typeof q.correctAnswer === 'number' && q.correctAnswer >= 0 && q.correctAnswer < opts.length) {
              correctAns = ['A', 'B', 'C', 'D'][q.correctAnswer];
            } else {
              // Default to A if none marked as correct
              correctAns = 'A';
            }
          }

          // Ensure the selected correct answer actually has content
          const currentOptions = { 'A': optA, 'B': optB, 'C': optC, 'D': optD };
          if (!currentOptions[correctAns]) {
             // Fallback to first available option if the marked correct one is empty
             correctAns = 'A';
          }

          return {
            quizCardId: quizCard.id,
            questionNumber: index + 1,
            question: questionText,
            optionA: optA,
            optionB: optB,
            optionC: optC,
            optionD: optD,
            correctAnswer: correctAns,
            explanation: q.explanation || null,
            category: quizCard.category || category || 'General',
            difficulty: quizCard.difficulty || difficulty || 'Medium'
          };
        });

        await Quiz.bulkCreate(questionsToCreate, { transaction: t });
      }

      return quizCard;
    });

    const quizCardWithCreator = await QuizCard.findByPk(result.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: { exclude: ['password'] }
        },
        {
          model: Quiz,
          as: 'questions'
        }
      ]
    });

    logger.info('Quiz card created successfully', {
      quizCardId: result.id,
      title: result.title,
      createdBy
    });

    res.status(201).json({
      success: true,
      message: 'Quiz card created successfully',
      data: quizCardWithCreator
    });
  } catch (error) {
    logger.error('Error in createQuizCard:', {
      message: error.message,
      stack: error.stack,
      body: req.body
    });

    // Check for Sequelize validation errors specifically
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors.map(e => e.message)
      });
    }

    const isBadRequest = error.message.includes('missing') || 
                        error.message.includes('required') || 
                        error.message.includes('must have');

    res.status(isBadRequest ? 400 : 500).json({
      success: false,
      message: isBadRequest ? error.message : 'Failed to create quiz card',
      error: isBadRequest ? error.message : (process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error')
    });
  }
};

// Get All Quiz Cards
export const getQuizCards = async (req, res) => {
  try {
    // Parse query parameters with validation
    let { page = 1, limit = 10, isActive } = req.query;

    // Validate and parse page and limit
    page = parseInt(page);
    limit = parseInt(limit);

    if (isNaN(page) || page < 1) {
      page = 1;
    }

    if (isNaN(limit) || limit < 1 || limit > 100) {
      limit = 10;
    }

    const offset = (page - 1) * limit;

    const whereClause = {};
    
    // Handle isActive parameter safely
    if (isActive !== undefined && isActive !== null && isActive !== '') {
      // Convert string to boolean safely
      whereClause.isActive = String(isActive).toLowerCase() === 'true';
    }

    const quizCards = await QuizCard.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'creator',
        attributes: { exclude: ['password'] }
      }],
      order: [['createdAt', 'DESC']],
      limit: limit,
      offset: offset
    });

    res.json({
      success: true,
      data: quizCards.rows,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(quizCards.count / limit),
        totalItems: quizCards.count,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    logger.error('Error fetching quiz cards:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz cards',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get Quiz Card by ID
export const getQuizCardById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const quizCard = await QuizCard.findByPk(id, {
      include: [{
        model: User,
        as: 'creator',
        attributes: { exclude: ['password'] }
      }]
    });

    if (!quizCard) {
      return res.status(404).json({
        success: false,
        message: 'Quiz card not found'
      });
    }

    res.json({
      success: true,
      data: quizCard
    });
  } catch (error) {
    logger.error('Error fetching quiz card:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz card'
    });
  }
};

// Update Quiz Card
export const updateQuizCard = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      category,
      difficulty,
      duration,
      numberOfQuestions,
      price,
      passingScore,
      status,
      startDate,
      endDate,
      instructions,
      isActive
    } = req.body;

    const quizCard = await QuizCard.findByPk(id);
    if (!quizCard) {
      return res.status(404).json({
        success: false,
        message: 'Quiz card not found'
      });
    }

    // Validate if fields are being updated
    if (title && (title.length < 3 || title.length > 200)) {
      return res.status(400).json({
        success: false,
        message: 'Title must be between 3 and 200 characters'
      });
    }

    if (duration && (duration < 1 || duration > 180)) {
      return res.status(400).json({
        success: false,
        message: 'Duration must be between 1 and 180 minutes'
      });
    }

    if (numberOfQuestions && (numberOfQuestions < 1 || numberOfQuestions > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Number of questions must be between 1 and 100'
      });
    }

    if (price !== undefined && price < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price cannot be negative'
      });
    }

    if (passingScore !== undefined && (passingScore < 0 || passingScore > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Passing score must be between 0 and 100'
      });
    }

    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    // Build update object with all possible fields
    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category) updateData.category = category;
    if (difficulty) updateData.difficulty = difficulty;
    if (duration) updateData.duration = duration;
    if (numberOfQuestions) updateData.numberOfQuestions = numberOfQuestions;
    if (price !== undefined) updateData.price = price;
    if (passingScore !== undefined) updateData.passingScore = passingScore;
    if (status) updateData.status = status;
    if (startDate) updateData.startDate = startDate;
    if (endDate) updateData.endDate = endDate;
    if (instructions !== undefined) updateData.instructions = instructions;
    if (isActive !== undefined) updateData.isActive = isActive;

    await quizCard.update(updateData);

    const updatedQuizCard = await QuizCard.findByPk(id, {
      include: [{
        model: User,
        as: 'creator',
        attributes: { exclude: ['password'] }
      }]
    });

    logger.info('Quiz card updated by admin', {
      quizCardId: id,
      updatedBy: req.user.id,
      updatedFields: Object.keys(updateData)
    });

    res.json({
      success: true,
      message: 'Quiz card updated successfully',
      data: updatedQuizCard
    });
  } catch (error) {
    logger.error('Error updating quiz card:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update quiz card',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete Quiz Card
export const deleteQuizCard = async (req, res) => {
  try {
    const { id } = req.params;

    const quizCard = await QuizCard.findByPk(id);
    if (!quizCard) {
      return res.status(404).json({
        success: false,
        message: 'Quiz card not found'
      });
    }

    await quizCard.destroy();

    logger.info('Quiz card deleted', {
      quizCardId: id,
      deletedBy: req.user.id
    });

    res.json({
      success: true,
      message: 'Quiz card deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting quiz card:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete quiz card'
    });
  }
};

// Get Quiz Leaderboard (Top 3 fastest finishers)
export const getQuizLeaderboard = async (req, res) => {
  try {
    const { quizCardId } = req.params;
    const { limit = 3 } = req.query;

    const leaderboard = await QuizAttempt.findAll({
      where: {
        quizCardId,
        status: 'completed'
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email', 'profilePhoto']
      }],
      order: [
        ['timeTaken', 'ASC'], // Fastest first
        ['score', 'DESC']     // Then by highest score
      ],
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    logger.error('Error fetching quiz leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz leaderboard'
    });
  }
};

// Get Quiz Statistics
export const getQuizStatistics = async (req, res) => {
  try {
    const { quizCardId } = req.params;

    const stats = await QuizAttempt.findAll({
      where: { quizCardId },
      attributes: [
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'totalAttempts'],
        [Sequelize.fn('COUNT', Sequelize.literal("CASE WHEN status = 'completed' THEN 1 END")), 'completedAttempts'],
        [Sequelize.fn('AVG', Sequelize.col('score')), 'averageScore'],
        [Sequelize.fn('AVG', Sequelize.col('timeTaken')), 'averageTime']
      ],
      raw: true
    });

    res.json({
      success: true,
      data: stats[0]
    });
  } catch (error) {
    logger.error('Error fetching quiz statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz statistics'
    });
  }
};


// Get Pending Users (Admin Only)
export const getPendingUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { approvalStatus: 'pending' },
      attributes: { exclude: ['password'] },
      include: [{
        model: UserDocument,
        as: 'documents'
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    logger.error('Error fetching pending users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending users'
    });
  }
};

// Approve User
export const approveUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    user.approvalStatus = 'approved';
    await user.save();

    // NOTE: Expert profile is NOT auto-created on approval.
    // Only Admin can explicitly promote a vet to Expert using POST /admin/doctors/promote.
    // This ensures D, E, F (regular vets) do NOT become consultable Experts automatically.
    
    logger.info('User approved by admin', {
      userId: user.id,
      adminId: req.user.id
    });

    // Send Approval Email
    try {
      const mailOptions = {
        from: `"Vet Forum India" <support@vetforumindia.com>`,
        to: user.email,
        subject: 'Account Approved - Vet Forum India',
        html: getApprovalEmailTemplate(user.firstName)
      };
      
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        await getTransporter().sendMail(mailOptions);
        logger.info(`Approval email sent to ${user.email}`);
      } else {
        logger.warn(`Email credentials missing, skipping real approval email for ${user.email}`);
        console.log(`[SIMULATED APPROVAL EMAIL] To: ${user.email} | Subject: Account Approved`);
      }
    } catch (emailError) {
      logger.error('Failed to send approval email:', emailError);
      // We don't fail the request if email fails, but we log it
    }
    
    res.json({
      success: true,
      message: 'User approved successfully'
    });
  } catch (error) {
    logger.error('Error approving user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve user'
    });
  }
};

// Reject User
export const rejectUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    user.approvalStatus = 'rejected';
    await user.save();
    
    logger.info('User rejected by admin', {
      userId: user.id,
      adminId: req.user.id
    });
    
    res.json({
      success: true,
      message: 'User rejected successfully'
    });
  } catch (error) {
    logger.error('Error rejecting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject user'
    });
  }
};

// Promote a Vet to Expert (Admin Only)
// Admin provides the vet's email to explicitly grant them Expert/consultation access.
// This is the ONLY way D, E, F can become Experts — A must call this route.
export const promoteToExpert = async (req, res) => {
  try {
    const { email, designation, specialization, yearsOfExperience, consultationFee, bio, qualification } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required to promote a user to Expert' });
    }

    // Find the user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: `No user found with email: ${email}` });
    }

    if (!user.isVeterinarian) {
      return res.status(400).json({ success: false, message: 'Only veterinarians can be promoted to Expert' });
    }

    if (user.approvalStatus !== 'approved') {
      return res.status(400).json({ success: false, message: 'User must be approved before being promoted to Expert' });
    }

    // Check if they already have an Expert profile
    const existingExpert = await Expert.findOne({ where: { userId: user.id } });
    if (existingExpert) {
      // Re-activate if previously deactivated
      if (!existingExpert.isActive) {
        await existingExpert.update({ isActive: true });
        return res.json({ success: true, message: `${user.firstName} ${user.lastName} has been re-activated as an Expert`, data: existingExpert });
      }
      return res.status(409).json({ success: false, message: `${user.firstName} ${user.lastName} is already an Expert` });
    }

    // Create Expert profile for this vet
    const expert = await Expert.create({
      name: `${user.firstName} ${user.lastName}`,
      designation: designation || user.currentPosition || 'Veterinary Expert',
      qualification: qualification || user.qualification || null,
      specialization: specialization || 'General Veterinary',
      yearsOfExperience: yearsOfExperience || 0,
      userId: user.id,
      isActive: true,
      email: user.email,
      phone: user.mobile,
      bio: bio || user.bio || null,
      consultationFee: consultationFee || 500.00
    });

    logger.info('User promoted to Expert by admin', {
      promotedUserId: user.id,
      promotedEmail: user.email,
      adminId: req.user.id
    });

    res.status(201).json({
      success: true,
      message: `${user.firstName} ${user.lastName} has been successfully promoted to Expert`,
      data: expert
    });
  } catch (error) {
    logger.error('Error promoting user to Expert:', error);
    res.status(500).json({ success: false, message: 'Failed to promote user to Expert' });
  }
};

// Get User Statistics
export const getUserStats = async (req, res) => {
  try {
    logger.info('Fetching user statistics... (req.user: ' + (req.user ? req.user.email : 'None') + ')');
    const totalUsers = await User.count();
    
    // Define active users as those active in the last 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const activeUsers = await User.count({
      where: {
        lastActiveAt: {
          [Op.gte]: fifteenMinutesAgo
        }
      }
    });

    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const newUsersLastMonth = await User.count({
      where: {
        createdAt: {
          [Op.gte]: lastMonth
        }
      }
    });
    
    // Calculate growth percentage
    const previousTotal = totalUsers - newUsersLastMonth;
    const growth = previousTotal > 0 ? ((newUsersLastMonth / previousTotal) * 100).toFixed(2) : 0;

    // Generate Registration Data for the last 6 months
    const registrationData = [];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    for (let i = 5; i >= 0; i--) {
      const startOfMonth = new Date();
      startOfMonth.setMonth(startOfMonth.getMonth() - i);
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const endOfMonth = new Date(startOfMonth);
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);
      
      const count = await User.count({
        where: {
          createdAt: {
            [Op.gte]: startOfMonth,
            [Op.lt]: endOfMonth
          }
        }
      });
      
      registrationData.push({
        name: monthNames[startOfMonth.getMonth()],
        users: count
      });
    }

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        growth: `${growth}%`,
        registrationData
      }
    });
  } catch (error) {
    logger.error('Error fetching user statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics'
    });
  }
};

// Get All Users
export const getAllUsers = async (req, res) => {
  try {
    const { active } = req.query;
    let whereClause = {};

    if (active === 'true') {
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
      whereClause.lastActiveAt = {
        [Op.gte]: fifteenMinutesAgo
      };
    }

    const users = await User.findAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    logger.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
};