import { DoctorAvailability, Expert } from '../models/index.js';
import logger from '../middleware/logger.js';

export const seedDoctorAvailability = async () => {
  try {
    const experts = await Expert.findAll({
      where: { isActive: true },
      limit: 5
    });

    if (experts.length === 0) {
      logger.warn('No active experts found to seed availability.');
      return;
    }

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timeSlots = [
      { start: '09:00:00', end: '11:00:00' },
      { start: '14:00:00', end: '16:00:00' },
      { start: '18:00:00', end: '20:00:00' }
    ];

    for (const expert of experts) {
      for (const day of days) {
        for (const slot of timeSlots) {
          const [availability, created] = await DoctorAvailability.findOrCreate({
            where: {
              expertId: expert.id,
              dayOfWeek: day,
              startTime: slot.start
            },
            defaults: {
              expertId: expert.id,
              dayOfWeek: day,
              startTime: slot.start,
              endTime: slot.end,
              consultationFee: expert.consultationFee || 500
            }
          });

          if (created) {
            // logger.info(`Availability slot created for expert ${expert.id} on ${day}`);
          }
        }
      }
    }

    logger.info('Doctor availability seeding completed');
  } catch (error) {
    logger.error('Error seeding doctor availability:', error);
    throw error;
  }
};