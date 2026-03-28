const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');
const { User, Expert, DoctorAvailability, Appointment } = require('../src/models');
const sequelize = require('../src/config/database');

async function seedData() {
  try {
    await sequelize.sync();
    console.log('Database synced. Starting to seed 5 new Experts and Consultation data...');

    // Find a regular user to act as the patient (create one if doesn't exist)
    let patient = await User.findOne({ where: { email: 'patient@vetforumindia.com' } });
    if (!patient) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      patient = await User.create({
        firstName: 'Test',
        lastName: 'Patient',
        email: 'patient@vetforumindia.com',
        password: hashedPassword,
        phone: '9876543210',
        mobile: '9876543210',
        state: 'Maharashtra',
        role: 'user',
        isApproved: true
      });
      console.log('Created test patient.');
    }

    const expertDataArr = [
      { first: 'Rakesh', last: 'Sharma', spec: 'Small Animal Surgery', exp: '10 Years', qual: 'MVSc (Surgery)', fee: 800 },
      { first: 'Anjali', last: 'Patil', spec: 'Avian Specialist', exp: '5 Years', qual: 'BVSc & AH', fee: 500 },
      { first: 'Gaurav', last: 'Singh', spec: 'Equine Medicine', exp: '15 Years', qual: 'PhD (Veterinary Medicine)', fee: 1200 },
      { first: 'Priya', last: 'Nair', spec: 'Dermatology', exp: '8 Years', qual: 'MVSc (Medicine)', fee: 600 },
      { first: 'Vikram', last: 'Rathore', spec: 'Exotic Pets', exp: '12 Years', qual: 'BVSc & AH', fee: 1000 }
    ];

    const password = await bcrypt.hash('password123', 10);
    const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    for (let i = 0; i < expertDataArr.length; i++) {
        const doc = expertDataArr[i];
        const email = `dr.${doc.first.toLowerCase()}@vetforumindia.com`;

        let user = await User.findOne({ where: { email } });
        if (!user) {
            user = await User.create({
                firstName: doc.first,
                lastName: doc.last,
                email: email,
                password: password,
                phone: `999999999${i}`,
                mobile: `999999999${i}`,
                state: 'Maharashtra',
                role: 'veterinarian',
                isVeterinarian: true,
                isApproved: true
            });
            console.log(`Created User for Dr. ${doc.first}`);
        }

        let expert = await Expert.findOne({ where: { userId: user.id } });
        if (!expert) {
            expert = await Expert.create({
                userId: user.id,
                name: `Dr. ${doc.first} ${doc.last}`,
                email: email,
                specialization: doc.spec,
                yearsOfExperience: parseInt(doc.exp),
                designation: 'Senior Consultant',
                qualification: doc.qual,
                phone: `999999999${i}`,
                address: 'Veterinary Clinic, Mumbai',
                isActive: true
            });
            console.log(`Created Expert Profile for Dr. ${doc.first}`);

            // Add Availability slots
            await DoctorAvailability.create({
                expertId: expert.id,
                dayOfWeek: 'monday',
                startTime: '09:00',
                endTime: '13:00',
                consultationFee: doc.fee,
                isActive: true
            });
            await DoctorAvailability.create({
                expertId: expert.id,
                dayOfWeek: 'wednesday',
                startTime: '14:00',
                endTime: '18:00',
                consultationFee: doc.fee,
                isActive: true
            });
            await DoctorAvailability.create({
                expertId: expert.id,
                dayOfWeek: 'friday',
                startTime: '09:00',
                endTime: '17:00',
                consultationFee: doc.fee,
                isActive: true
            });
            
            // Create Appointments
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - 2);
            pastDate.setHours(10, 30, 0, 0);

            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 2);
            futureDate.setHours(14, 0, 0, 0);

            // 1. Completed appointment
            await Appointment.create({
                userId: patient.id,
                expertId: expert.id,
                appointmentDate: pastDate,
                duration: 30,
                consultationFee: doc.fee,
                reasonForConsultation: 'Routine Checkup',
                status: 'completed',
                paymentStatus: 'paid',
                doctorNotes: 'Dog is healthy.',
                zoomJoinUrl: 'http://test.zoom.us/join',
                zoomStartUrl: 'http://test.zoom.us/start'
            });

            // 2. Scheduled appointment
            await Appointment.create({
                userId: patient.id,
                expertId: expert.id,
                appointmentDate: futureDate,
                duration: 30,
                consultationFee: doc.fee,
                reasonForConsultation: 'Vaccination Query',
                status: 'confirmed',
                paymentStatus: 'paid',
                zoomJoinUrl: 'http://test.zoom.us/join2',
                zoomStartUrl: 'http://test.zoom.us/start2'
            });
            
            console.log(`Created Availability and Appointments for Dr. ${doc.first}`);
        }
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
