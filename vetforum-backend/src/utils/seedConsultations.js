import { Consultation, User, Expert } from '../models/index.js';

export const seedConsultations = async () => {
  try {
    const consultationDocs = [
      {
        userId: 1,
        expertId: 1,
        consultationDate: new Date(),
        reasonForConsultation: 'My pet is having trouble breathing.',
        status: 'pending'
      },
      {
        userId: 2,
        expertId: 2,
        consultationDate: new Date(),
        reasonForConsultation: 'What is the best diet for a senior dog?',
        status: 'completed'
      }
    ];

    for (const doc of consultationDocs) {
      await Consultation.findOrCreate({
        where: { userId: doc.userId, expertId: doc.expertId, reasonForConsultation: doc.reasonForConsultation },
        defaults: doc
      });
    }

  } catch (error) {
    console.error('Error seeding consultations:', error);
  }
};
