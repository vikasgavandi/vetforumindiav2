const { Consultation, User, Expert } = require('../models');

async function seedConsultations() {
  try {
    console.log('🌱 Starting bulk seeder for Consultations...');

    // Fetch valid IDs to avoid FK constraint errors
    const users = await User.findAll({ attributes: ['id'] });
    const experts = await Expert.findAll({ attributes: ['id'] });

    if (users.length === 0 || experts.length === 0) {
      console.log('❌ Not enough users or experts to map consultations. Please make sure the DB is seeded.');
      process.exit(1);
    }

    const newConsultations = [];
    const reasons = [
      'My dog has a weird rash on her belly.',
      'My cat hasn’t been eating for two days.',
      'General advice on proper large breed puppy nutrition.',
      'Second opinion regarding knee surgery for my golden retriever.',
      'Lethargy and unexplained weight loss in my parrot.',
      'Looking for behavioral tips to stop aggressive biting.',
      'Post-surgery checkup consultation.',
      'Recurring ear infections in my cocker spaniel.',
      'Advice on transitioning to a raw food diet.',
      'Preventative care for my aging senior cat.'
    ];

    const statuses = ['pending', 'paid', 'scheduled', 'completed', 'cancelled'];
    const paymentStatuses = ['pending', 'completed', 'failed', 'refunded'];

    // Create 20 Consultations
    for (let i = 0; i < 20; i++) {
        const selectedUser = users[Math.floor(Math.random() * users.length)];
        const selectedExpert = experts[Math.floor(Math.random() * experts.length)];
      
        // Vary the statuses realistically
        let status = statuses[Math.floor(Math.random() * statuses.length)];
        let paymentStatus = 'pending';
        
        if (status === 'completed' || status === 'scheduled' || status === 'paid') paymentStatus = 'completed';
        else if (status === 'cancelled') paymentStatus = 'refunded';

        const daysOffset = (i % 2 === 0 ? 1 : -1) * (Math.floor(Math.random() * 14) + 1);
        const consultDate = new Date();
        consultDate.setDate(consultDate.getDate() + daysOffset);
        consultDate.setHours(9 + (Math.floor(Math.random() * 8)), 0, 0, 0);

        newConsultations.push({
            userId: selectedUser.id,
            expertId: selectedExpert.id,
            reasonForConsultation: reasons[i % reasons.length],
            status: status,
            paymentStatus: paymentStatus,
            consultationDate: (status === 'completed' || status === 'scheduled') ? consultDate : null,
            notes: status === 'completed' ? 'Great session! Recommended daily vitamins and a switch in dog food brand.' : null
        });
    }

    console.log('⏳ Inserting 20 Consultations...');
    await Consultation.bulkCreate(newConsultations);

    console.log('✅ Successfully seeded 20 Consultations!');
    process.exit(0);

  } catch (err) {
    console.error('❌ Error during database seeding:', err);
    process.exit(1);
  }
}

seedConsultations();
