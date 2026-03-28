import { Expert, Announcement, JobVacancy } from '../models/index.js';
import logger from '../middleware/logger.js';

export const seedAllData = async () => {
  try {
    // Seed Announcements
    const announcementDocs = [
      {
        title: 'New Animal Welfare Guidelines 2024',
        content: 'The government has released updated guidelines for veterinary practices regarding animal welfare and handling.',
        postedBy: 'System Admin',
        isActive: true
      },
      {
        title: 'VetForum India Webinar Series',
        content: 'Join our upcoming webinar on "Advanced Small Animal Surgery" this Sunday at 10 AM.',
        postedBy: 'Moderator',
        isActive: true
      }
    ];

    for (const doc of announcementDocs) {
      const [record, created] = await Announcement.findOrCreate({
        where: { title: doc.title },
        defaults: doc
      });
      if (created) {
        logger.info(`Announcement seeded: ${doc.title}`);
      }
    }

    // Seed Job Vacancies
    const jobDocs = [
      {
        title: 'Senior Veterinary Surgeon',
        organization: 'City Animal Hospital',
        location: 'Mumbai, Maharashtra',
        salaryRange: '₹80,000 - ₹1,20,000 per month',
        experience: '5+ years',
        description: 'Looking for an experienced surgeon for specialized soft tissue and orthopedic surgeries.',
        requirements: 'MVSc (Surgery), Registered with VCI',
        contactEmail: 'hr@cityvethospital.com',
        isActive: true
      },
      {
        title: 'Junior Veterinarian',
        organization: 'Green Pet Clinic',
        location: 'Bangalore, Karnataka',
        salaryRange: '₹40,000 - ₹55,000 per month',
        experience: '0-2 years',
        description: 'Fresh graduates are welcome. General practice and consultation role.',
        requirements: 'BVSc & AH, Registered with VCI',
        contactEmail: 'clinic@greenpet.com',
        isActive: true
      }
    ];

    for (const doc of jobDocs) {
      const [record, created] = await JobVacancy.findOrCreate({
        where: { title: doc.title, organization: doc.organization },
        defaults: doc
      });
      if (created) {
        logger.info(`Job vacancy seeded: ${doc.title}`);
      }
    }

  } catch (error) {
    logger.error('Error seeding data:', error);
    throw error;
  }
};