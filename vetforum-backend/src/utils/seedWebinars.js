import { Webinar } from '../models/index.js';

export const seedWebinars = async () => {
  try {
    const webinarDocs = [
      {
        topic: 'New Animal Welfare Guidelines 2024',
        speakerName: 'Dr. John Doe',
        dateTime: new Date(),
        registrationFees: 'Free',
        paymentLink: null,
        isLive: true
      },
      {
        topic: 'Advanced Equine Surgery',
        speakerName: 'Dr. Jane Smith',
        dateTime: new Date(),
        registrationFees: '₹499',
        paymentLink: 'https://paymentlink.com',
        isLive: false
      }
    ];

    for (const doc of webinarDocs) {
      await Webinar.findOrCreate({
        where: { topic: doc.topic },
        defaults: doc
      });
    }

  } catch (error) {
    console.error('Error seeding webinars:', error);
  }
};
