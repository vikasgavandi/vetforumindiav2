import { Announcement } from '../models/index.js';
import logger from '../middleware/logger.js';

// Get all announcements
export const getAnnouncements = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const announcements = await Announcement.findAndCountAll({
      where: { isActive: true },
      order: [['createdAt', 'DESC'], ['priority', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: announcements.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(announcements.count / limit),
        totalItems: announcements.count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching announcements:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch announcements'
    });
  }
};

// Get announcement by ID
export const getAnnouncementById = async (req, res) => {
  try {
    const { id } = req.params;
    const announcement = await Announcement.findByPk(id);

    if (!announcement || !announcement.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    res.json({
      success: true,
      data: announcement
    });
  } catch (error) {
    logger.error('Error fetching announcement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch announcement'
    });
  }
};

// Create a new announcement (Admin only)
export const createAnnouncement = async (req, res) => {
  try {
    const { title, content, eventDate, link, venue, organizer, photo } = req.body;
    const authorId = req.user.id; // From auth middleware

    // Basic validation
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    const announcement = await Announcement.create({
      title,
      description: content, // Map content to description
      eventDate: eventDate || null,
      link: link || null,
      venue: venue || null,
      organizer: organizer || null,
      photo: photo || null,
      isActive: true,
      priority: 0 // Default priority
    });

    logger.info('Announcement created successfully', {
      announcementId: announcement.id,
      title: announcement.title,
      createdBy: authorId
    });

    res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      data: announcement
    });
  } catch (error) {
    logger.error('Error creating announcement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create announcement'
    });
  }
};

// Update an announcement (Admin only)
export const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, eventDate, link, venue, organizer, photo, isActive, priority } = req.body;

    const announcement = await Announcement.findByPk(id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (content) updateData.description = content;
    if (eventDate !== undefined) updateData.eventDate = eventDate;
    if (link !== undefined) updateData.link = link;
    if (venue !== undefined) updateData.venue = venue;
    if (organizer !== undefined) updateData.organizer = organizer;
    if (photo !== undefined) updateData.photo = photo;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (priority !== undefined) updateData.priority = priority;

    await announcement.update(updateData);

    logger.info('Announcement updated successfully', {
      announcementId: id,
      updatedBy: req.user.id
    });

    res.json({
      success: true,
      message: 'Announcement updated successfully',
      data: announcement
    });
  } catch (error) {
    logger.error('Error updating announcement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update announcement'
    });
  }
};

// Delete an announcement (Admin only)
export const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const announcement = await Announcement.findByPk(id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    await announcement.destroy();

    logger.info('Announcement deleted successfully', {
      announcementId: id,
      deletedBy: req.user.id
    });

    res.json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting announcement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete announcement'
    });
  }
};