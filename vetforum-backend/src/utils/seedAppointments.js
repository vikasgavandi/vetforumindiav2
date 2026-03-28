import { Appointment, User, Expert } from '../models/index.js';

export const seedAppointments = async () => {
  try {
    const appointmentDocs = [
      {
        userId: 1,
        expertId: 1,
        appointmentDate: new Date(),
        duration: 30,
        consultationFee: 500,
        status: 'confirmed',
        paymentStatus: 'paid'
      },
      {
        userId: 2,
        expertId: 2,
        appointmentDate: new Date(),
        duration: 45,
        consultationFee: 750,
        status: 'pending',
        paymentStatus: 'pending'
      }
    ];

    for (const doc of appointmentDocs) {
      await Appointment.findOrCreate({
        where: { userId: doc.userId, expertId: doc.expertId, appointmentDate: doc.appointmentDate },
        defaults: doc
      });
    }

  } catch (error) {
    console.error('Error seeding appointments:', error);
  }
};
