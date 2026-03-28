const bcrypt = require('bcryptjs');
const { User, Expert, Quiz, Announcement, JobVacancy, Blog } = require('../models');

const createTestUsers = async () => {
  try {
    console.log('Creating test users...');

    // Hash password for all test users
    const hashedPassword = await bcrypt.hash('test123', 10);

    // Test Users Data
    const testUsers = [
      {
        firstName: 'Dr. Priya',
        lastName: 'Sharma',
        email: 'vet@test.com',
        mobile: '9876543210',
        state: 'Maharashtra',
        password: hashedPassword,
        isVeterinarian: true,
        veterinarianType: 'Graduated',
        year: null,
        college: null,
        university: 'Mumbai Veterinary College',
        veterinarianState: 'Maharashtra',
        bio: 'Experienced veterinary surgeon specializing in small animals',
        currentPosition: 'Clinician',
        publications: ['Advanced Surgical Techniques in Small Animals'],
        awards: ['Best Veterinarian Award 2023'],
        isAdmin: true
      },
      {
        firstName: 'Rahul',
        lastName: 'Patel',
        email: 'student@test.com',
        mobile: '9876543211',
        state: 'Gujarat',
        password: hashedPassword,
        isVeterinarian: true,
        veterinarianType: 'Student',
        year: '3rd',
        college: 'Gujarat Veterinary College',
        university: 'Gujarat Agricultural University',
        veterinarianState: 'Gujarat',
        bio: 'Third-year veterinary student passionate about animal welfare',
        currentPosition: 'Student'
      },
      {
        firstName: 'Anjali',
        lastName: 'Singh',
        email: 'nonvet@test.com',
        mobile: '9876543212',
        state: 'Delhi',
        password: hashedPassword,
        isVeterinarian: false,
        bio: 'Pet owner and animal lover'
      },
      {
        firstName: 'Dr. Amit',
        lastName: 'Kumar',
        email: 'admin@test.com',
        mobile: '9876543213',
        state: 'Karnataka',
        password: hashedPassword,
        isVeterinarian: true,
        veterinarianType: 'Graduated',
        veterinarianState: 'Karnataka',
        bio: 'Veterinary administrator and researcher',
        currentPosition: 'Government Officer',
        isAdmin: true
      }
    ];

    // Create users
    for (const userData of testUsers) {
      const existingUser = await User.findOne({ where: { email: userData.email } });
      if (!existingUser) {
        await User.create(userData);
        console.log(`✓ Created user: ${userData.email}`);
      } else {
        console.log(`- User already exists: ${userData.email}`);
      }
    }

    // Create test experts
    const testExperts = [
      {
        name: 'Dr. Jaishankar, N',
        designation: 'Professor',
        specialization: 'Animal Nutritionist',
        yearsOfExperience: 20,
        education: 'PhD in Animal Nutrition',
        publications: ['Advanced Animal Nutrition', 'Feed Technology in Livestock'],
        awards: ['Best Research Award 2020', 'Excellence in Teaching 2019'],
        consultationFee: 500,
        availability: 'Mon-Fri 9AM-5PM'
      },
      {
        name: 'Dr. Meera Reddy',
        designation: 'Senior Veterinarian',
        specialization: 'Small Animal Surgery',
        yearsOfExperience: 15,
        education: 'MVSc in Veterinary Surgery',
        publications: ['Minimally Invasive Surgery in Dogs'],
        awards: ['Surgical Excellence Award 2021'],
        consultationFee: 750,
        availability: 'Tue-Sat 10AM-6PM'
      },
      {
        name: 'Dr. Rajesh Gupta',
        designation: 'Consultant',
        specialization: 'Large Animal Medicine',
        yearsOfExperience: 12,
        education: 'BVSc & AH, MVSc',
        publications: ['Cattle Health Management'],
        awards: ['Rural Veterinary Service Award 2020'],
        consultationFee: 400,
        availability: 'Mon-Wed-Fri 8AM-4PM'
      }
    ];

    for (const expertData of testExperts) {
      const existingExpert = await Expert.findOne({ where: { name: expertData.name } });
      if (!existingExpert) {
        await Expert.create(expertData);
        console.log(`✓ Created expert: ${expertData.name}`);
      }
    }

    // Create test quiz questions
    const testQuizQuestions = [
      {
        questionText: 'What is the primary source of energy in cattle feed?',
        options: {
          A: 'Protein',
          B: 'Carbohydrates',
          C: 'Fats',
          D: 'Vitamins'
        },
        correctAnswer: 'B',
        difficulty: 'Easy',
        category: 'Nutrition'
      },
      {
        questionText: 'Which vitamin deficiency causes night blindness in animals?',
        options: {
          A: 'Vitamin A',
          B: 'Vitamin B',
          C: 'Vitamin C',
          D: 'Vitamin D'
        },
        correctAnswer: 'A',
        difficulty: 'Medium',
        category: 'Nutrition'
      },
      {
        questionText: 'What is the normal body temperature range for dogs?',
        options: {
          A: '36-37°C',
          B: '38-39°C',
          C: '40-41°C',
          D: '35-36°C'
        },
        correctAnswer: 'B',
        difficulty: 'Easy',
        category: 'Clinical'
      }
    ];

    for (const questionData of testQuizQuestions) {
      const existingQuestion = await Quiz.findOne({ where: { questionText: questionData.questionText } });
      if (!existingQuestion) {
        await Quiz.create(questionData);
        console.log(`✓ Created quiz question: ${questionData.questionText.substring(0, 50)}...`);
      }
    }

    // Create test announcements
    const testAnnouncements = [
      {
        title: 'Pet Health & Wellness Expo - Mumbai',
        eventDate: '2025-03-15',
        description: 'Premier event for pet health professionals featuring latest innovations in veterinary medicine, pet care products, and networking opportunities.',
        photo: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800',
        link: 'https://example.com/pet-expo-mumbai',
        venue: 'Bombay Exhibition Centre',
        organizer: 'Indian Veterinary Association'
      },
      {
        title: 'Veterinary Conference 2025 - Delhi',
        eventDate: '2025-04-20',
        description: 'Annual veterinary conference bringing together experts from across India to discuss latest research and developments.',
        photo: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800',
        link: 'https://example.com/vet-conference-delhi',
        venue: 'India Habitat Centre',
        organizer: 'Veterinary Council of India'
      }
    ];

    for (const announcementData of testAnnouncements) {
      const existingAnnouncement = await Announcement.findOne({ where: { title: announcementData.title } });
      if (!existingAnnouncement) {
        await Announcement.create(announcementData);
        console.log(`✓ Created announcement: ${announcementData.title}`);
      }
    }

    // Create test job vacancies
    const testJobs = [
      {
        title: 'Senior Veterinarian - Small Animal Practice',
        organization: 'Pet Care Clinic Mumbai',
        location: 'Mumbai',
        jobDescription: 'We are seeking an experienced veterinarian to join our busy small animal practice. Responsibilities include routine examinations, surgeries, and emergency care.',
        requirements: 'BVSc degree, 3+ years experience in small animal practice',
        salary: '₹8-12 LPA',
        contactEmail: 'careers@petcaremumbai.com',
        contactPhone: '+91-22-12345678',
        applicationDeadline: '2025-02-28',
        postedDate: new Date()
      },
      {
        title: 'Veterinary Research Associate',
        organization: 'Indian Veterinary Research Institute',
        location: 'Bareilly',
        jobDescription: 'Research position focusing on animal disease prevention and treatment. Opportunity to work on cutting-edge research projects.',
        requirements: 'MVSc/PhD in Veterinary Science, research experience preferred',
        salary: '₹6-10 LPA',
        contactEmail: 'recruitment@ivri.res.in',
        contactPhone: '+91-581-2301234',
        applicationDeadline: '2025-03-15',
        postedDate: new Date()
      },
      {
        title: 'Product Manager - Veterinary Pharmaceuticals',
        organization: 'Alembic Pharmaceuticals',
        location: 'Vadodara',
        jobDescription: 'Manage veterinary product portfolio, develop marketing strategies, and coordinate with sales teams for product promotion.',
        requirements: 'BVSc + MBA preferred, 2+ years in pharmaceutical industry',
        salary: '₹10-15 LPA',
        contactEmail: 'careers@alembic.com',
        contactPhone: '+91-265-1234567',
        applicationDeadline: '2025-02-15',
        postedDate: new Date()
      }
    ];

    for (const jobData of testJobs) {
      const existingJob = await JobVacancy.findOne({ where: { title: jobData.title } });
      if (!existingJob) {
        await JobVacancy.create(jobData);
        console.log(`✓ Created job: ${jobData.title}`);
      }
    }

    // Create test blog posts
    const testBlogs = [
      {
        title: 'Advanced Surgical Techniques in Small Animals',
        subtitle: 'Minimally invasive procedures for better outcomes',
        content: `# Introduction

Modern veterinary surgery has evolved significantly with the introduction of minimally invasive techniques. These procedures offer numerous benefits including reduced recovery time, less pain, and improved outcomes for our patients.

## Key Techniques

### Laparoscopic Surgery
Laparoscopic procedures allow veterinarians to perform complex surgeries through small incisions, reducing trauma to the patient.

### Arthroscopic Procedures
Joint surgeries can now be performed with minimal invasion, preserving joint function and reducing complications.

## Benefits
- Faster recovery times
- Reduced post-operative pain
- Smaller incisions and better cosmetic results
- Lower risk of complications

## Conclusion
These advanced techniques represent the future of veterinary surgery, providing better care for our animal patients.`,
        excerpt: 'Learn about cutting-edge surgical methods that improve patient outcomes and reduce recovery time in veterinary practice.',
        featuredImage: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800',
        images: ['https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400'],
        tags: ['surgery', 'small-animals', 'techniques', 'minimally-invasive'],
        status: 'published',
        readTime: 8,
        viewsCount: 245,
        likesCount: 32,
        commentsCount: 12,
        authorId: 1,
        publishedAt: new Date()
      },
      {
        title: 'Nutrition Guidelines for Growing Puppies',
        subtitle: 'Essential feeding practices for healthy development',
        content: `# Puppy Nutrition Essentials

Proper nutrition during the puppy stage is crucial for healthy growth and development. This guide covers everything you need to know about feeding your growing puppy.

## Age-Based Feeding

### 0-4 Weeks
Puppies should nurse from their mother or receive appropriate milk replacer.

### 4-8 Weeks
Begin introducing puppy food mixed with milk replacer or water.

### 8+ Weeks
Transition to high-quality puppy food appropriate for the breed size.

## Key Nutrients
- High-quality protein for muscle development
- DHA for brain and eye development
- Calcium and phosphorus for bone growth
- Essential fatty acids for coat health

## Feeding Schedule
- 8-12 weeks: 4 meals per day
- 3-6 months: 3 meals per day
- 6+ months: 2 meals per day

## Common Mistakes to Avoid
- Overfeeding leading to rapid growth
- Feeding adult food too early
- Inconsistent feeding schedules
- Poor quality food choices`,
        excerpt: 'Complete guide to puppy nutrition covering feeding schedules, essential nutrients, and common feeding mistakes to avoid.',
        featuredImage: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800',
        tags: ['nutrition', 'puppies', 'feeding', 'development'],
        status: 'published',
        readTime: 6,
        viewsCount: 189,
        likesCount: 28,
        commentsCount: 8,
        authorId: 1,
        publishedAt: new Date()
      }
    ];

    for (const blogData of testBlogs) {
      const existingBlog = await Blog.findOne({ where: { title: blogData.title } });
      if (!existingBlog) {
        await Blog.create(blogData);
        console.log(`✓ Created blog: ${blogData.title}`);
      }
    }

    console.log('\n🎉 Test data created successfully!');
    console.log('\n📋 TEST LOGIN CREDENTIALS:');
    console.log('================================');
    console.log('👨‍⚕️ VETERINARIAN (Admin):');
    console.log('   Email: vet@test.com');
    console.log('   Password: test123');
    console.log('   Role: Graduated Veterinarian + Admin');
    console.log('');
    console.log('🎓 VETERINARY STUDENT:');
    console.log('   Email: student@test.com');
    console.log('   Password: test123');
    console.log('   Role: 3rd Year Student');
    console.log('');
    console.log('🐕 NON-VETERINARIAN (Pet Owner):');
    console.log('   Email: nonvet@test.com');
    console.log('   Password: test123');
    console.log('   Role: Pet Owner');
    console.log('');
    console.log('👑 ADMIN USER:');
    console.log('   Email: admin@test.com');
    console.log('   Password: test123');
    console.log('   Role: Admin + Veterinarian');
    console.log('================================');

  } catch (error) {
    console.error('Error creating test users:', error);
  }
};

module.exports = { createTestUsers };