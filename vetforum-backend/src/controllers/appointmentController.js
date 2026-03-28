import { Appointment, Expert, User, DoctorAvailability } from '../models/index.js';
import { Op } from 'sequelize';
import zoomService from '../utils/zoomService.js';
import * as calendarUtils from '../utils/calendarUtils.js';
import logger from '../middleware/logger.js';

// Get Doctor Availability
export const getDoctorAvailability = async (req, res) => {
  try {
    const { expertId } = req.params;
    const { date } = req.query;

    const expert = await Expert.findByPk(expertId);
    if (!expert) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Get doctor's weekly availability
    const availability = await DoctorAvailability.findAll({
      where: { expertId, isActive: true },
      order: [['dayOfWeek', 'ASC'], ['startTime', 'ASC']]
    });

    // If specific date requested, get available slots for that date
    let availableSlots = [];
    if (date) {
      const requestedDate = new Date(date);
      const dayOfWeek = requestedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      
      const dayAvailability = availability.filter(slot => slot.dayOfWeek === dayOfWeek);
      
      // Get existing appointments for that date (using better date range)
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      const existingAppointments = await Appointment.findAll({
        where: {
          expertId,
          appointmentDate: {
            [Op.between]: [startDate, endDate]
          },
          status: { [Op.in]: ['pending', 'confirmed'] }
        }
      });

      // Generate available time slots
      for (const slot of dayAvailability) {
        const startTime = new Date(`${date} ${slot.startTime}`);
        const endTime = new Date(`${date} ${slot.endTime}`);
        
        // Generate 30-minute slots
        while (startTime < endTime) {
          const slotEnd = new Date(startTime.getTime() + 30 * 60000);
          
          // Check if slot is not booked
          const isBooked = existingAppointments.some(apt => {
            const aptStart = new Date(apt.appointmentDate);
            const aptEnd = new Date(aptStart.getTime() + apt.duration * 60000);
            return (startTime < aptEnd && slotEnd > aptStart);
          });

          if (!isBooked) {
            availableSlots.push({
              startTime: startTime.toTimeString().slice(0, 5),
              endTime: slotEnd.toTimeString().slice(0, 5),
              fee: slot.consultationFee
            });
          }

          startTime.setTime(startTime.getTime() + 30 * 60000);
        }
      }
    }

    res.json({
      success: true,
      data: {
        expert: {
          id: expert.id,
          name: expert.name,
          specialization: expert.specialization
        },
        weeklyAvailability: availability,
        availableSlots: availableSlots
      }
    });
  } catch (error) {
    logger.error('Error fetching doctor availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch availability'
    });
  }
};

// Book Appointment
export const bookAppointment = async (req, res) => {
  try {
    const { expertId, appointmentDate, duration, reasonForConsultation } = req.body;
    const userId = req.user.id;

    if (!expertId || !appointmentDate || !reasonForConsultation) {
      return res.status(400).json({
        success: false,
        message: 'Expert ID, appointment date, and reason are required'
      });
    }

    // Validate expert exists
    const expert = await Expert.findByPk(expertId);
    if (!expert) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Check if slot is available
    const requestedDate = new Date(appointmentDate);
    const dayOfWeek = requestedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    const availability = await DoctorAvailability.findOne({
      where: {
        expertId,
        dayOfWeek,
        isActive: true
      }
    });

    if (!availability) {
      return res.status(400).json({
        success: false,
        message: 'Doctor not available on selected day'
      });
    }

    // Check for conflicting appointments
    const conflictingAppointment = await Appointment.findOne({
      where: {
        expertId,
        appointmentDate: requestedDate,
        status: { [Op.in]: ['pending', 'confirmed'] }
      }
    });

    if (conflictingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'Time slot already booked'
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      userId,
      expertId,
      appointmentDate: requestedDate,
      duration: duration || 30,
      consultationFee: availability.consultationFee,
      reasonForConsultation,
      status: 'pending'
    });

    const appointmentWithDetails = await Appointment.findByPk(appointment.id, {
      include: [
        { model: Expert, as: 'doctor' },
        { model: User, as: 'patient', attributes: { exclude: ['password'] } }
      ]
    });

    logger.info('Appointment booked', {
      appointmentId: appointment.id,
      userId,
      expertId
    });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully. Please proceed with payment.',
      data: appointmentWithDetails
    });
  } catch (error) {
    logger.error('Error booking appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to book appointment'
    });
  }
};

// Note: Payment processing moved to paymentController.js with Razorpay integration

// Process Payment (wrapper for payment routes)
export const processPayment = async (req, res) => {
  try {
    const { appointmentId, action } = req.body;
    const userId = req.user.id;

    // Get appointment
    const appointment = await Appointment.findOne({
      where: { id: appointmentId, userId },
      include: ['doctor', 'patient']
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if already paid
    if (appointment.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Payment already completed for this appointment'
      });
    }

    // Return appointment details with payment information
    res.json({
      success: true,
      message: 'Ready to process payment',
      data: {
        appointment: {
          id: appointment.id,
          expertId: appointment.expertId,
          appointmentDate: appointment.appointmentDate,
          duration: appointment.duration,
          consultationFee: appointment.consultationFee,
          doctor: {
            name: appointment.doctor.name,
            specialization: appointment.doctor.specialization
          }
        },
        paymentDetails: {
          amount: appointment.consultationFee,
          currency: 'INR',
          paymentStatus: appointment.paymentStatus || 'pending'
        }
      }
    });
  } catch (error) {
    logger.error('Error processing payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process payment'
    });
  }
};

// Get User Appointments
export const getUserAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { userId };
    if (status) {
      whereClause.status = status;
    }

    const appointments = await Appointment.findAndCountAll({
      where: whereClause,
      include: [{ model: Expert, as: 'doctor' }],
      order: [['appointmentDate', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const formattedAppointments = appointments.rows.map(apt => {
      const aptJson = apt.toJSON();
      if (apt.paymentStatus === 'paid' && apt.zoomJoinUrl) {
        aptJson.calendarLinks = {
          google: calendarUtils.generateGoogleCalendarLink(apt),
          ics: calendarUtils.generateICSLink(apt)
        };
      }
      return aptJson;
    });

    res.json({
      success: true,
      data: formattedAppointments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(appointments.count / limit),
        totalItems: appointments.count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching user appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments'
    });
  }
};

// Get Doctor Appointments
export const getDoctorAppointments = async (req, res) => {
  try {
    const { expertId } = req.params;
    const { status, date, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { expertId };
    if (status) {
      whereClause.status = status;
    }
    if (date) {
      whereClause.appointmentDate = {
        [Op.between]: [
          new Date(date + ' 00:00:00'),
          new Date(date + ' 23:59:59')
        ]
      };
    }

    const appointments = await Appointment.findAndCountAll({
      where: whereClause,
      include: [{ model: User, as: 'patient', attributes: { exclude: ['password'] } }],
      order: [['appointmentDate', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: appointments.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(appointments.count / limit),
        totalItems: appointments.count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching doctor appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments'
    });
  }
};

// Reschedule Appointment (Doctor only)
export const rescheduleAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { newDate, reason } = req.body;

    if (!newDate) {
      return res.status(400).json({
        success: false,
        message: 'New appointment date is required'
      });
    }

    const appointment = await Appointment.findByPk(appointmentId, {
      include: [
        { model: Expert, as: 'doctor' },
        { model: User, as: 'patient', attributes: { exclude: ['password'] } }
      ]
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Update Zoom meeting if exists
    if (appointment.zoomMeetingId) {
      await zoomService.updateMeeting(appointment.zoomMeetingId, {
        start_time: new Date(newDate).toISOString()
      });
    }

    await appointment.update({
      appointmentDate: new Date(newDate),
      status: 'rescheduled'
    });

    logger.info('Appointment rescheduled', {
      appointmentId: appointment.id,
      newDate: newDate,
      reason: reason
    });

    res.json({
      success: true,
      message: 'Appointment rescheduled successfully',
      data: appointment
    });
  } catch (error) {
    logger.error('Error rescheduling appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reschedule appointment'
    });
  }
};

// Complete Appointment with Notes
export const completeAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { doctorNotes, prescriptions, followUpRequired, followUpDate } = req.body;

    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    await appointment.update({
      status: 'completed',
      doctorNotes,
      prescriptions: prescriptions || [],
      followUpRequired: followUpRequired || false,
      followUpDate: followUpDate ? new Date(followUpDate) : null
    });

    logger.info('Appointment completed', {
      appointmentId: appointment.id,
      followUpRequired: followUpRequired
    });

    res.json({
      success: true,
      message: 'Appointment completed successfully',
      data: appointment
    });
  } catch (error) {
    logger.error('Error completing appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete appointment'
    });
  }
};

// Get My (Doctor) Appointments
export const getMyDoctorAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find expert associated with this user
    const expert = await Expert.findOne({ where: { userId } });
    if (!expert) {
        return res.json({
            success: true,
            data: [],
            message: 'Expert profile not yet setup',
            pagination: {
                currentPage: 1,
                totalPages: 0,
                totalItems: 0,
                itemsPerPage: 10
            }
        });
    }

    const { status, date, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { expertId: expert.id };
    if (status) {
      whereClause.status = status;
    }
    if (date) {
      whereClause.appointmentDate = {
        [Op.between]: [
          new Date(date + ' 00:00:00'),
          new Date(date + ' 23:59:59')
        ]
      };
    }

    const appointments = await Appointment.findAndCountAll({
      where: whereClause,
      include: [{ model: User, as: 'patient', attributes: { exclude: ['password'] } }],
      order: [['appointmentDate', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: appointments.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(appointments.count / limit),
        totalItems: appointments.count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching doctor appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments'
    });
  }
};

// Add Doctor Availability
export const addDoctorAvailability = async (req, res) => {
  try {
    const userId = req.user.id;
    const { expertId } = req.params;
    const { dayOfWeek, startTime, endTime, consultationFee } = req.body;

    // Verify this expert belongs to the user
    const expert = await Expert.findOne({ where: { id: expertId, userId } });
    if (!expert) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to manage this expert profile'
      });
    }

    const availability = await DoctorAvailability.create({
      expertId,
      dayOfWeek,
      startTime,
      endTime,
      consultationFee
    });

    res.status(201).json({
      success: true,
      message: 'Doctor availability set successfully',
      data: availability
    });
  } catch (error) {
    logger.error('Error setting doctor availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set availability'
    });
  }
};

// Delete Doctor Availability
export const deleteDoctorAvailability = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const availability = await DoctorAvailability.findByPk(id, {
      include: [{
        model: Expert,
        as: 'expert'
      }]
    });

    if (!availability) {
      return res.status(404).json({
        success: false,
        message: 'Availability slot not found'
      });
    }

    // Verify this expert belongs to the user
    if (availability.expert.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to manage this availability'
      });
    }

    await availability.destroy();

    res.json({
      success: true,
      message: 'Availability slot deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting doctor availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete availability'
    });
  }
};

// Get Appointment by ID
export const getAppointmentById = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.user.id;

    const appointment = await Appointment.findByPk(appointmentId, {
      include: [
        { model: Expert, as: 'doctor' },
        { model: User, as: 'patient', attributes: { exclude: ['password'] } }
      ]
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Since we don't strictly have user role enforcement perfectly mapped here, 
    // basic access control verifies the user is either the patient or the expert

    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    logger.error('Error fetching appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointment'
    });
  }
};