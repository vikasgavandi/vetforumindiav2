import { Webinar, WebinarRegistration } from '../models/index.js';
import logger from '../middleware/logger.js';

// ─── Public: Get the single live webinar ────────────────────────────────────
export const getActiveWebinar = async (req, res) => {
  try {
    const webinar = await Webinar.findOne({
      where: { isLive: true },
      order: [['updatedAt', 'DESC']]
    });

    res.json({
      success: true,
      data: webinar || null
    });
  } catch (error) {
    logger.error('Error fetching active webinar:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch webinar' });
  }
};

// ─── Admin: Get all webinars ─────────────────────────────────────────────────
export const getAllWebinars = async (req, res) => {
  try {
    const webinars = await Webinar.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: webinars });
  } catch (error) {
    logger.error('Error fetching all webinars:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch webinars' });
  }
};

// ─── Admin: Create a webinar ─────────────────────────────────────────────────
export const createWebinar = async (req, res) => {
  try {
    const { topic, speakerName, dateTime, registrationFees, paymentLink } = req.body;

    if (!topic || !speakerName) {
      return res.status(400).json({ success: false, message: 'Topic and Speaker Name are required' });
    }

    const webinar = await Webinar.create({
      topic,
      speakerName,
      dateTime: dateTime || null,
      registrationFees: registrationFees || 'Free',
      paymentLink: paymentLink || null,
      isLive: false
    });

    logger.info('Webinar created', { webinarId: webinar.id, createdBy: req.user.id });

    res.status(201).json({ success: true, message: 'Webinar created successfully', data: webinar });
  } catch (error) {
    logger.error('Error creating webinar:', error);
    res.status(500).json({ success: false, message: 'Failed to create webinar' });
  }
};

// ─── Admin: Update / toggle webinar ─────────────────────────────────────────
export const updateWebinar = async (req, res) => {
  try {
    const { id } = req.params;
    const { topic, speakerName, dateTime, registrationFees, paymentLink, isLive } = req.body;

    const webinar = await Webinar.findByPk(id);
    if (!webinar) {
      return res.status(404).json({ success: false, message: 'Webinar not found' });
    }

    // If setting this webinar to live, take all others offline first
    if (isLive === true) {
      await Webinar.update({ isLive: false }, { where: {} });
    }

    const updates = {};
    if (topic !== undefined) updates.topic = topic;
    if (speakerName !== undefined) updates.speakerName = speakerName;
    if (dateTime !== undefined) updates.dateTime = dateTime;
    if (registrationFees !== undefined) updates.registrationFees = registrationFees;
    if (paymentLink !== undefined) updates.paymentLink = paymentLink;
    if (isLive !== undefined) updates.isLive = isLive;

    await webinar.update(updates);

    logger.info('Webinar updated', { webinarId: id, updatedBy: req.user.id });

    res.json({ success: true, message: 'Webinar updated successfully', data: webinar });
  } catch (error) {
    logger.error('Error updating webinar:', error);
    res.status(500).json({ success: false, message: 'Failed to update webinar' });
  }
};

// ─── Admin: Delete a webinar ─────────────────────────────────────────────────
export const deleteWebinar = async (req, res) => {
  try {
    const { id } = req.params;
    const webinar = await Webinar.findByPk(id);

    if (!webinar) {
      return res.status(404).json({ success: false, message: 'Webinar not found' });
    }

    await webinar.destroy();

    logger.info('Webinar deleted', { webinarId: id, deletedBy: req.user.id });

    res.json({ success: true, message: 'Webinar deleted successfully' });
  } catch (error) {
    logger.error('Error deleting webinar:', error);
    res.status(500).json({ success: false, message: 'Failed to delete webinar' });
  }
};

// ─── Admin: Get all registrations for a webinar ──────────────────────────────
export const getWebinarRegistrations = async (req, res) => {
  try {
    const { id } = req.params;
    const registrations = await WebinarRegistration.findAll({
      where: { webinarId: id },
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: registrations });
  } catch (error) {
    logger.error('Error fetching webinar registrations:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch registrations' });
  }
};

// ─── User: Register for the live webinar ─────────────────────────────────────
export const registerForWebinar = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, jobTitle, organization, consentGiven } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ success: false, message: 'Name, email, and phone are required' });
    }

    if (!consentGiven) {
      return res.status(400).json({ success: false, message: 'You must agree to the Terms & Conditions' });
    }

    const webinar = await Webinar.findByPk(id);
    if (!webinar || !webinar.isLive) {
      return res.status(404).json({ success: false, message: 'Webinar not found or not currently live' });
    }

    // Check for duplicate email registration
    const existing = await WebinarRegistration.findOne({ where: { webinarId: id, email } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'This email is already registered for the webinar.' });
    }

    const registration = await WebinarRegistration.create({
      webinarId: id,
      name,
      email,
      phone,
      jobTitle: jobTitle || null,
      organization: organization || null,
      consentGiven: true
    });

    logger.info('Webinar registration created', { registrationId: registration.id, webinarId: id });

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      data: registration,
      paymentLink: webinar.paymentLink || null
    });
  } catch (error) {
    logger.error('Error registering for webinar:', error);
    res.status(500).json({ success: false, message: 'Failed to register for webinar' });
  }
};
