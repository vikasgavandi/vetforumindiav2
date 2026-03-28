const { Webinar } = require('../models');

async function seedWebinars() {
  try {
    console.log('🌱 Starting bulk seeder for Webinars...');

    const newWebinars = [];
    const topics = [
      'Advanced Cardiology in Small Animals',
      'Nutrition Requirements for Large Breeds',
      'Emergency Interventions for Trauma Cases',
      'Dealing with Feline Kidney Diseases',
      'Modern Surgical Techniques Round-table',
      'Exotic Pet Care: Avian Health',
      'Dermatology Best Practices in Canines',
      'Understanding Behavioral Issues in Pets',
      'Veterinary Clinic Management & Ethics',
      'Innovations in Livestock Vaccination'
    ];

    const speakers = [
      'Dr. Meera Reddy', 'Dr. Ramesh Kumar', 'Dr. Priya Sharma', 'Dr. John Doe', 'Dr. Sanjay Gupta'
    ];

    // Create 15 Webinars
    for (let i = 0; i < 15; i++) {
      // Half in the future, half in the past
      const daysOffset = (i % 2 === 0 ? 1 : -1) * (Math.floor(Math.random() * 30) + 1);
      const eventDate = new Date();
      eventDate.setDate(eventDate.getDate() + daysOffset);
      eventDate.setHours(10 + (Math.floor(Math.random() * 8)), 0, 0, 0); // Random hour between 10am and 6pm

      const isLiveNow = daysOffset === 0;

      newWebinars.push({
        topic: topics[i % topics.length] + ` (Session ${Math.floor(i / topics.length) + 1})`,
        speakerName: speakers[i % speakers.length],
        dateTime: eventDate,
        registrationFees: i % 3 === 0 ? 'Free' : `₹${(Math.floor(Math.random() * 5) + 1) * 100}`,
        paymentLink: i % 3 === 0 ? null : `https://example.com/pay/webinar-${i}`,
        isLive: isLiveNow
      });
    }

    console.log('⏳ Inserting 15 Webinars...');
    await Webinar.bulkCreate(newWebinars);

    console.log('✅ Successfully seeded 15 Webinars!');
    process.exit(0);

  } catch (err) {
    console.error('❌ Error during database seeding:', err);
    process.exit(1);
  }
}

seedWebinars();
