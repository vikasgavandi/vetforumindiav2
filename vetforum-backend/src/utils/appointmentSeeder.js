const { DoctorAvailability, Expert } = require('../models');
const logger = require('../middleware/logger');

const seedDoctorAvailability = async () => {
  try {
    const experts = await Expert.findAll({ limit: 4 });
    
    if (experts.length === 0) {
      logger.warn('No experts found, skipping availability seeding');
      return;
    }

    const availabilityData = [
      // Dr. Jaishankar - Animal Nutritionist
      {
        expertId: experts[0]?.id,
        dayOfWeek: 'monday',
        startTime: '09:00:00',
        endTime: '17:00:00',
        consultationFee: 1500.00
      },
      {
        expertId: experts[0]?.id,
        dayOfWeek: 'wednesday',
        startTime: '09:00:00',
        endTime: '17:00:00',
        consultationFee: 1500.00
      },
      {
        expertId: experts[0]?.id,
        dayOfWeek: 'friday',
        startTime: '09:00:00',
        endTime: '17:00:00',
        consultationFee: 1500.00
      },
      
      // Dr. Venkanagouda - Veterinary Gynaecologist
      {
        expertId: experts[1]?.id,
        dayOfWeek: 'tuesday',
        startTime: '10:00:00',
        endTime: '18:00:00',
        consultationFee: 2000.00
      },
      {
        expertId: experts[1]?.id,
        dayOfWeek: 'thursday',
        startTime: '10:00:00',
        endTime: '18:00:00',
        consultationFee: 2000.00
      },
      {
        expertId: experts[1]?.id,
        dayOfWeek: 'saturday',
        startTime: '09:00:00',
        endTime: '15:00:00',
        consultationFee: 2000.00
      },
      
      // Dr. Manjunatha - Veterinary Surgeon
      {
        expertId: experts[2]?.id,
        dayOfWeek: 'monday',
        startTime: '08:00:00',
        endTime: '16:00:00',
        consultationFee: 2500.00
      },
      {
        expertId: experts[2]?.id,
        dayOfWeek: 'wednesday',
        startTime: '08:00:00',
        endTime: '16:00:00',
        consultationFee: 2500.00
      },
      {
        expertId: experts[2]?.id,
        dayOfWeek: 'friday',
        startTime: '08:00:00',
        endTime: '16:00:00',
        consultationFee: 2500.00
      },
      
      // Dr. Vinayaka - Veterinary Clinician
      {
        expertId: experts[3]?.id,
        dayOfWeek: 'tuesday',
        startTime: '11:00:00',
        endTime: '19:00:00',
        consultationFee: 1200.00
      },
      {
        expertId: experts[3]?.id,
        dayOfWeek: 'thursday',
        startTime: '11:00:00',
        endTime: '19:00:00',
        consultationFee: 1200.00
      },
      {
        expertId: experts[3]?.id,
        dayOfWeek: 'saturday',
        startTime: '10:00:00',
        endTime: '16:00:00',
        consultationFee: 1200.00
      }
    ];

    for (const availData of availabilityData) {
      if (!availData.expertId) continue;
      
      const existingAvailability = await DoctorAvailability.findOne({
        where: {
          expertId: availData.expertId,
          dayOfWeek: availData.dayOfWeek,
          startTime: availData.startTime
        }
      });
      
      if (!existingAvailability) {
        await DoctorAvailability.create(availData);
        logger.info(`Availability created for expert ${availData.expertId} on ${availData.dayOfWeek}`);
      }
    }
  } catch (error) {
    logger.error('Error seeding doctor availability:', error);
    throw error;
  }
};

module.exports = {
  seedDoctorAvailability
};