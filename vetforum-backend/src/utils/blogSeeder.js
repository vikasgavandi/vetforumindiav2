import { Blog, User } from '../models/index.js';
import logger from '../middleware/logger.js';

export const seedSampleBlogs = async () => {
  try {
    const admin = await User.findOne({ where: { isAdmin: true } });
    if (!admin) {
      logger.warn('No admin user found for blog seeding');
      return;
    }

    const sampleBlogs = [
      {
        title: 'New Animal Welfare Guidelines 2024',
        content: 'The government has released updated guidelines for veterinary practices regarding animal welfare and handling. Key changes include enhanced documentation requirements for surgical procedures and increased emphasis on post-operative pain management protocols. Veterinarians are encouraged to review these changes and update their internal clinic procedures by July 2024.',
        excerpt: 'Updated government guidelines for animal welfare and handling in veterinary practices.',
        category: 'Policy',
        authorId: admin.id,
        isPublished: true,
        publishedAt: new Date()
      },
      {
        title: 'Advanced Small Animal Surgery Webinar',
        content: 'Join our upcoming webinar on "Advanced Small Animal Surgery" this Sunday at 10 AM. We will cover minimally invasive techniques for abdominal procedures and recent updates in orthopedic surgery for senior patients. This session is eligible for 2 hours of continuing education credit. Registration is required to receive the Zoom link and certificates.',
        excerpt: 'Register for our upcoming webinar on minimally invasive surgical techniques.',
        category: 'Education',
        authorId: admin.id,
        isPublished: true,
        publishedAt: new Date()
      }
    ];

    for (const blogData of sampleBlogs) {
      const [record, created] = await Blog.findOrCreate({
        where: { title: blogData.title },
        defaults: blogData
      });
      if (created) {
        logger.info(`Sample blog created: ${blogData.title}`);
      }
    }
  } catch (error) {
    logger.error('Error seeding sample blogs:', error);
    throw error;
  }
};