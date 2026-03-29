import { Expert, Announcement, JobVacancy } from '../models/index.js';
import logger from '../middleware/logger.js';

export const seedAllData = async () => {
  try {
    // Seed Announcements
    const announcementDocs = [
      {
        title: 'New Animal Welfare Guidelines 2024',
        description: 'The government has released updated guidelines for veterinary practices regarding animal welfare and handling.',
        isActive: true
      },
      {
        title: 'VetForum India Webinar Series',
        description: 'Join our upcoming webinar on "Advanced Small Animal Surgery" this Sunday at 10 AM.',
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
        salary: '₹80,000 - ₹1,20,000 per month',
        jobDescription: 'Looking for an experienced surgeon for specialized soft tissue and orthopedic surgeries.',
        qualification: 'MVSc (Surgery), Registered with VCI',
        designation: 'Senior Surgeon',
        contactEmail: 'hr@cityvethospital.com',
        isActive: true
      },
      {
        title: 'Junior Veterinarian',
        organization: 'Green Pet Clinic',
        location: 'Bangalore, Karnataka',
        salary: '₹40,000 - ₹55,000 per month',
        jobDescription: 'Fresh graduates are welcome. General practice and consultation role.',
        qualification: 'BVSc & AH, Registered with VCI',
        designation: 'Junior Veterinarian',
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