const { Appointment, User, Expert } = require('../models');

async function seedAppointments() {
  try {
    console.log('🌱 Starting bulk seeder for Appointments...');

    // Fetch valid IDs to avoid FK constraint errors
    const users = await User.findAll({ attributes: ['id'] });
    const experts = await Expert.findAll({ attributes: ['id'] });

    if (users.length === 0 || experts.length === 0) {
      console.log('❌ Not enough users or experts to map appointments.');
      process.exit(1);
    }

    const newAppointments = [];
    const reasons = [
      'My dog has a weird rash on her belly.',
      'My cat hasn’t been eating for two days.',
      'General advice on proper large breed puppy nutrition.',
      'Second opinion regarding knee surgery for my retriever.',
      'Post-surgery checkup consultation.'
    ];

    const statuses = ['pending', 'confirmed', 'rescheduled', 'completed', 'cancelled'];

    // Create 20 Appointments
    for (let i = 0; i < 20; i++) {
        const selectedUser = users[Math.floor(Math.random() * users.length)];
        const selectedExpert = experts[Math.floor(Math.random() * experts.length)];
      
        let status = statuses[Math.floor(Math.random() * statuses.length)];
        let paymentStatus = 'pending';
        
        // Logical mapping of statuses
        if (status === 'completed' || status === 'confirmed') paymentStatus = 'paid';
        else if (status === 'cancelled') paymentStatus = 'refunded';

        const daysOffset = (i % 2 === 0 ? 1 : -1) * (Math.floor(Math.random() * 14) + 1);
        const aptDate = new Date();
        aptDate.setDate(aptDate.getDate() + daysOffset);
        aptDate.setHours(9 + (Math.floor(Math.random() * 8)), 0, 0, 0);

        newAppointments.push({
            userId: selectedUser.id,
            expertId: selectedExpert.id,
            appointmentDate: aptDate,
            duration: 30,
            consultationFee: 500 + (Math.floor(Math.random() * 5) * 100),
            reasonForConsultation: reasons[i % reasons.length],
            status: status,
            paymentStatus: paymentStatus,
            doctorNotes: status === 'completed' ? 'Great session! Recommended daily vitamins.' : null,
            prescriptions: status === 'completed' ? JSON.stringify([{ medicine: 'Amoxicillin', dosage: '250mg' }]) : null,
            zoomJoinUrl: status === 'confirmed' ? 'https://zoom.us/j/123456789' : null,
            zoomStartUrl: status === 'confirmed' ? 'https://zoom.us/s/123456789' : null
        });
    }

    console.log('⏳ Inserting 20 Appointments...');
    await Appointment.bulkCreate(newAppointments);

    console.log('✅ Successfully seeded 20 Appointments!');
    process.exit(0);

  } catch (err) {
    console.error('❌ Error during database seeding:', err);
    process.exit(1);
  }
}

seedAppointments();
