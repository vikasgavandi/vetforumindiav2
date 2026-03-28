const { Blog, User } = require('../models');
const logger = require('../middleware/logger');

const seedSampleBlogs = async () => {
  try {
    // Get admin and regular users for blog authoring
    const admin = await User.findOne({ where: { isAdmin: true } });
    const veterinarian = await User.findOne({ where: { isVeterinarian: true } });
    
    if (!admin) {
      logger.warn('No admin user found, skipping blog seeding');
      return;
    }

    const blogsData = [
      {
        title: 'Advanced Veterinary Nutrition: A Comprehensive Guide',
        subtitle: 'Understanding the fundamentals of animal nutrition for optimal health outcomes',
        content: `
# Introduction to Veterinary Nutrition

Veterinary nutrition plays a crucial role in maintaining animal health and preventing diseases. This comprehensive guide explores the latest research and best practices in animal nutrition.

## Key Nutritional Requirements

### Proteins
Proteins are essential for growth, tissue repair, and immune function. Different species have varying protein requirements based on their life stage, activity level, and health status.

### Carbohydrates
While not essential for all animals, carbohydrates provide readily available energy and support digestive health in many species.

### Fats and Lipids
Essential fatty acids support skin health, coat quality, and various metabolic processes.

## Species-Specific Considerations

### Small Animals
Dogs and cats have unique nutritional needs that differ significantly from their wild counterparts.

### Large Animals
Cattle, horses, and other large animals require specialized feeding programs to maintain optimal health and productivity.

## Conclusion

Proper nutrition is the foundation of veterinary medicine. By understanding these principles, veterinarians can provide better care and improve animal welfare.
        `,
        featuredImage: 'nutrition-guide.jpg',
        tags: ['nutrition', 'veterinary', 'health', 'guide'],
        status: 'published',
        authorId: admin.id
      },
      {
        title: 'Emergency Veterinary Procedures: Life-Saving Techniques',
        subtitle: 'Critical procedures every veterinarian should master',
        content: `
# Emergency Veterinary Medicine

Emergency situations require quick thinking and precise execution. This article covers essential life-saving procedures that every veterinarian should be prepared to perform.

## Cardiopulmonary Resuscitation (CPR)

### Assessment
- Check for responsiveness
- Evaluate breathing and pulse
- Position the animal appropriately

### Chest Compressions
- Rate: 100-120 compressions per minute
- Depth: 1/3 to 1/2 of chest width
- Allow complete chest recoil

## Airway Management

### Endotracheal Intubation
Step-by-step procedure for securing the airway in emergency situations.

### Oxygen Therapy
Proper administration and monitoring of oxygen therapy.

## Shock Management

Understanding different types of shock and appropriate treatment protocols.

## Conclusion

Emergency preparedness saves lives. Regular training and practice of these procedures is essential for all veterinary professionals.
        `,
        featuredImage: 'emergency-vet.jpg',
        tags: ['emergency', 'procedures', 'veterinary', 'critical-care'],
        status: 'published',
        authorId: veterinarian?.id || admin.id
      },
      {
        title: 'The Future of Veterinary Medicine: Technology and Innovation',
        subtitle: 'How emerging technologies are revolutionizing animal healthcare',
        content: `
# Technology in Veterinary Medicine

The veterinary field is experiencing rapid technological advancement. From AI-powered diagnostics to telemedicine, technology is transforming how we care for animals.

## Artificial Intelligence and Machine Learning

### Diagnostic Imaging
AI algorithms are improving the accuracy and speed of radiographic interpretation.

### Predictive Analytics
Machine learning models help predict disease outbreaks and treatment outcomes.

## Telemedicine

### Remote Consultations
Expanding access to veterinary care through virtual consultations.

### Monitoring Devices
Wearable technology for continuous health monitoring.

## Surgical Innovations

### Minimally Invasive Procedures
Advanced laparoscopic and arthroscopic techniques.

### Robotic Surgery
The potential for robotic-assisted procedures in veterinary medicine.

## Digital Health Records

Comprehensive electronic health records improving patient care coordination.

## Conclusion

Technology continues to enhance our ability to provide excellent veterinary care. Staying current with these innovations is crucial for modern practice.
        `,
        featuredImage: 'vet-technology.jpg',
        tags: ['technology', 'innovation', 'AI', 'telemedicine', 'future'],
        status: 'published',
        authorId: admin.id
      },
      {
        title: 'Draft: Upcoming Research in Animal Behavior',
        subtitle: 'Exploring new frontiers in understanding animal psychology',
        content: `
# Animal Behavior Research

This is a draft article about upcoming research in animal behavior. The content is still being developed and will be published once complete.

## Current Research Areas

- Cognitive abilities in different species
- Social behavior patterns
- Stress responses and welfare indicators

## Methodology

Research methodologies being employed in current studies.

## Preliminary Findings

Early results from ongoing research projects.

This article is still in development and will be updated with more comprehensive information.
        `,
        featuredImage: 'animal-behavior.jpg',
        tags: ['research', 'behavior', 'psychology', 'draft'],
        status: 'draft',
        authorId: admin.id
      }
    ];

    for (const blogData of blogsData) {
      const existingBlog = await Blog.findOne({ 
        where: { 
          title: blogData.title,
          authorId: blogData.authorId 
        } 
      });
      
      if (!existingBlog) {
        await Blog.create(blogData);
        logger.info(`Blog "${blogData.title}" seeded successfully`);
      }
    }
  } catch (error) {
    logger.error('Error seeding blogs:', error);
    throw error;
  }
};

module.exports = {
  seedSampleBlogs
};