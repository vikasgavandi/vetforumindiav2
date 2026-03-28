const bcrypt = require('bcryptjs');
const { User, Expert, Blog } = require('../models');

async function seedData() {
  try {
    console.log('🌱 Starting bulk seeder for 25 Users, Experts, and Blogs...');

    const hashedPassword = await bcrypt.hash('test123', 10);
    const firstNames = ['Amit', 'Priya', 'Rahul', 'Anjali', 'Vikram', 'Meera', 'Ravi', 'Sita', 'Karan', 'Pooja', 'Suresh', 'Deepa', 'Gaurav', 'Neha', 'Arjun'];
    const lastNames = ['Sharma', 'Patel', 'Singh', 'Kumar', 'Reddy', 'Gupta', 'Verma', 'Jain', 'Das', 'Roy', 'Nair', 'Menon', 'Iyer', 'Bose', 'Chatterjee'];
    const states = ['Maharashtra', 'Gujarat', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Kerala', 'Punjab', 'Rajasthan'];

    const newUsers = [];
    const newExperts = [];
    const newBlogs = [];

    // --- Generate 25 Users (Mix of Roles) ---
    for (let i = 1; i <= 25; i++) {
        const isVet = i % 3 !== 0; // 2/3 are Vets, 1/3 Non-Vet
        const isStudent = isVet && i % 2 === 0; // Half of Vets are Students

        const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const state = states[Math.floor(Math.random() * states.length)];

        newUsers.push({
            firstName: `${fName} ${i}`,
            lastName: lName,
            email: `user${i}@test.com`,
            mobile: `9000000${i.toString().padStart(3, '0')}`,
            state: state,
            password: 'test123', // Will be hashed by beforeCreate hook
            isVeterinarian: isVet,
            veterinarianType: isVet ? (isStudent ? 'Student' : 'Graduated') : null,
            yearOfStudy: isStudent ? '3rd' : null,
            studentId: isStudent ? `STU${1000 + i}` : null,
            college: isStudent ? 'Test Veterinary College' : null,
            university: isVet ? 'Test University' : null,
            veterinarianState: isVet ? state : null,
            vetRegNo: isVet && !isStudent ? `VET${1000 + i}` : null,
            qualification: isVet && !isStudent ? 'BVSc & AH' : null,
            bio: `This is a test bio for ${fName} ${lName}.`,
            currentPosition: isStudent ? 'Student' : (isVet ? 'Clinician' : null),
            isAdmin: false,
            approvalStatus: 'approved'
        });
    }

    console.log('⏳ Inserting 25 Users...');
    for (const u of newUsers) {
      try {
        await User.create(u);
      } catch (err) {
        console.warn(`Could not create user ${u.email}:`, err.message);
      }
    }

    // Get an author ID for blogs
    const authorUser = await User.findOne({ where: { email: 'user1@test.com' } });
    const authorId = authorUser ? authorUser.id : 1;

    // --- Generate 25 Experts ---
    const specializations = ['Small Animal Surgery', 'Large Animal Medicine', 'Animal Nutrition', 'Orthopedics', 'Dermatology'];
    for (let i = 1; i <= 25; i++) {
        const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lName = lastNames[Math.floor(Math.random() * lastNames.length)];

        newExperts.push({
            name: `Dr. ${fName} ${lName} (Expert ${i})`,
            designation: i % 2 === 0 ? 'Senior Consultant' : 'Surgeon',
            specialization: specializations[i % specializations.length],
            yearsOfExperience: 5 + (i % 15),
            education: 'MVSc',
            publications: ['Recent Advances in Vet Med'],
            awards: ['Best Doctor Award'],
            consultationFee: 500 + (i * 10),
            availability: 'Mon-Fri 10AM-4PM'
        });
    }

    console.log('⏳ Inserting 25 Experts...');
    await Expert.bulkCreate(newExperts);

    // --- Generate 25 Blogs ---
    for (let i = 1; i <= 25; i++) {
        newBlogs.push({
            title: `Veterinary Insights & Tips - Volume ${i}`,
            subtitle: `Everything you need to know about pet care (Part ${i})`,
            content: `# Introduction \nThis is a generated blog post number ${i}.\n\n## Details\nHere are some amazing details about veterinary practices.`,
            excerpt: `Learn the best veterinary practices in our latest volume ${i}.`,
            featuredImage: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800',
            tags: ['tips', 'veterinary', `volume-${i}`],
            status: 'published',
            readTime: 3 + (i % 4),
            viewsCount: i * 12,
            likesCount: i * 3,
            commentsCount: i,
            authorId: authorId,
            slug: `veterinary-insights-tips-volume-${i}-${Date.now()}`,
            publishedAt: new Date()
        });
    }

    console.log('⏳ Inserting 25 Blogs...');
    await Blog.bulkCreate(newBlogs);

    console.log('✅ Successfully seeded 25 Users, Experts, and Blogs!');
    process.exit(0);

  } catch (err) {
    console.error('❌ Error during database seeding:', err);
    process.exit(1);
  }
}

seedData();
