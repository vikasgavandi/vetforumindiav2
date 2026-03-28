const { Expert, Announcement, JobVacancy } = require('../models');
const logger = require('../middleware/logger');

const seedExperts = async () => {
  try {
    const expertsData = [
      {
        name: 'Dr. Jaishankar, N',
        designation: 'Professor',
        qualification: 'BVSc & AH, MVSc, PhD',
        specialization: 'Animal Nutritionist',
        yearsOfExperience: 20,
        publications: [
          'Advanced Animal Nutrition Principles',
          'Veterinary Feed Technology',
          'Nutritional Disorders in Livestock'
        ],
        awards: [
          'Best Research Paper Award 2020',
          'Excellence in Teaching Award',
          'Outstanding Contribution to Animal Nutrition'
        ],
        isActive: true
      },
      {
        name: 'Dr. Venkanagouda Doddagoudar',
        designation: 'Associate Professor (I/C)',
        qualification: 'BVSc & AH, MVSc, PhD',
        specialization: 'Veterinary Gynaecologist',
        yearsOfExperience: 20,
        publications: [
          'Reproductive Technologies in Cattle',
          'Gynaecological Disorders in Small Animals',
          'Advances in Veterinary Obstetrics'
        ],
        awards: [
          'Research Excellence Award',
          'Best Clinical Practice Award',
          'Innovation in Veterinary Medicine'
        ],
        isActive: true
      },
      {
        name: 'Dr. Manjunatha, D. R',
        designation: 'Associate Professor & Head',
        qualification: 'BVSc & AH, MVSc, PhD',
        specialization: 'Veterinary Surgeon',
        yearsOfExperience: 20,
        publications: [
          'Surgical Techniques in Large Animals',
          'Minimally Invasive Surgery in Veterinary Practice',
          'Emergency Surgical Procedures'
        ],
        awards: [
          'Surgical Excellence Award',
          'Leadership in Veterinary Education',
          'Outstanding Service Award'
        ],
        isActive: true
      },
      {
        name: 'Dr. Vinayaka, M. N.',
        designation: 'Veterinary Clinician',
        qualification: 'BVSc & AH, MVSc',
        specialization: 'Veterinary Surgeon',
        yearsOfExperience: 7,
        publications: [
          'Clinical Case Studies in Small Animal Surgery',
          'Diagnostic Imaging in Veterinary Practice',
          'Pain Management in Veterinary Surgery'
        ],
        awards: [
          'Young Veterinarian Award',
          'Clinical Excellence Recognition',
          'Best Case Presentation Award'
        ],
        isActive: true
      }
    ];

    for (const expertData of expertsData) {
      const existingExpert = await Expert.findOne({ where: { name: expertData.name } });
      if (!existingExpert) {
        await Expert.create(expertData);
        logger.info(`Expert ${expertData.name} seeded successfully`);
      }
    }
  } catch (error) {
    logger.error('Error seeding experts:', error);
  }
};

const seedAnnouncements = async () => {
  try {
    const announcementsData = [
      {
        title: 'Pet Health & Wellness Expo (PHAW Expo) - Mumbai',
        eventDate: '2025-11-08',
        description: 'The Pet Health & Wellness Expo in Mumbai is a premier event dedicated to enhancing the health and well-being of pets. Taking place from November 8 to November 9, 2025, this expo brings together pet owners, veterinarians, and industry experts under one roof to explore the latest advancements in pet care. Attendees can expect a wide range of informative seminars, interactive workshops, and engaging demonstrations focused on nutrition, preventive care, and innovative health products for pets.',
        priority: 1,
        isActive: true
      },
      {
        title: 'International Conference of ISAGB 2025 - Kolkata',
        eventDate: '2025-11-13',
        description: 'The International Conference of the Indian Society of Animal Genetics and Breeding (ISAGB) is set to take place at the Biswa Bangla Convention Centre in Kolkata, India. This event, organized by the West Bengal University of Animal and Fishery Sciences, promises to be a significant gathering for professionals in the field of animal sciences. The conference is themed around "Precision Animal Breeding through Genomics, Artificial Intelligence, and Machine Learning," aiming to explore the latest advancements and innovations in animal breeding practices.',
        priority: 1,
        isActive: true
      }
    ];

    for (const announcementData of announcementsData) {
      const existingAnnouncement = await Announcement.findOne({ where: { title: announcementData.title } });
      if (!existingAnnouncement) {
        await Announcement.create(announcementData);
        logger.info(`Announcement "${announcementData.title}" seeded successfully`);
      }
    }
  } catch (error) {
    logger.error('Error seeding announcements:', error);
  }
};

const seedJobVacancies = async () => {
  try {
    const jobsData = [
      {
        title: 'Product Manager/ Product Executive',
        organization: 'Alembic Pharmaceuticals',
        location: 'Mumbai',
        jobDescription: 'We are looking for an experienced Product Manager/Executive to join our veterinary pharmaceuticals division.',
        designation: 'Product Manager',
        qualification: 'BVSc / MVSc / MBA',
        contactEmail: 'careers@alembicpharma.com',
        contactPhone: '+91-22-12345678',
        isActive: true
      },
      {
        title: 'Veterinary Research Scientist',
        organization: 'Alembic Pharmaceuticals',
        location: 'Mumbai',
        jobDescription: 'Seeking a qualified Veterinary Research Scientist to lead research and development activities in animal health products.',
        designation: 'Research Scientist',
        qualification: 'PhD in Veterinary Science',
        contactEmail: 'research@alembicpharma.com',
        contactPhone: '+91-22-87654321',
        isActive: true
      },
      {
        title: 'Clinical Veterinarian',
        organization: 'Alembic Pharmaceuticals',
        location: 'Mumbai',
        jobDescription: 'Join our clinical team as a Veterinarian to support field trials and provide technical support.',
        designation: 'Clinician',
        qualification: 'BVSc & AH',
        contactEmail: 'clinical@alembicpharma.com',
        contactPhone: '+91-22-11223344',
        isActive: true
      }
    ];

    for (const jobData of jobsData) {
      const existingJob = await JobVacancy.findOne({ 
        where: { 
          title: jobData.title,
          organization: jobData.organization,
          location: jobData.location
        } 
      });
      if (!existingJob) {
        await JobVacancy.create(jobData);
        logger.info(`Job "${jobData.title}" at ${jobData.organization} seeded successfully`);
      }
    }
  } catch (error) {
    logger.error('Error seeding job vacancies:', error);
  }
};

const seedAllData = async () => {
  try {
    logger.info('Starting data seeding...');
    await seedExperts();
    await seedAnnouncements();
    await seedJobVacancies();
    logger.info('Data seeding completed successfully');
  } catch (error) {
    logger.error('Error in data seeding:', error);
    throw error;
  }
};

module.exports = {
  seedExperts,
  seedAnnouncements,
  seedJobVacancies,
  seedAllData
};