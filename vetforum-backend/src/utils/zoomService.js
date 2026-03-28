const axios = require('axios');
const logger = require('../middleware/logger');

class ZoomService {
  constructor() {
    this.accountId = process.env.ZOOM_ACCOUNT_ID;
    this.clientId = process.env.ZOOM_CLIENT_ID;
    this.clientSecret = process.env.ZOOM_CLIENT_SECRET;
    this.baseURL = 'https://api.zoom.us/v2';
    this.accessToken = null;
    this.tokenExpiresAt = 0;
  }

  async getAccessToken() {
    try {
      // Check if token is still valid (with 5-minute buffer)
      if (this.accessToken && Date.now() < this.tokenExpiresAt - 300000) {
        return this.accessToken;
      }

      const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      const response = await axios.post(
        `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${this.accountId}`,
        {},
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiresAt = Date.now() + (response.data.expires_in * 1000);
      
      return this.accessToken;
    } catch (error) {
      logger.error('Error getting Zoom access token:', error.response?.data || error.message);
      
      if (process.env.NODE_ENV === 'development') {
        return 'mock_token';
      }
      
      throw new Error('Failed to authenticate with Zoom');
    }
  }

  async createMeeting(meetingData) {
    try {
      const token = await this.getAccessToken();
      
      const meetingConfig = {
        topic: meetingData.topic || 'Veterinary Consultation',
        type: 2, // Scheduled meeting
        start_time: meetingData.startTime,
        duration: meetingData.duration || 30,
        timezone: 'Asia/Kolkata',
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: false,
          mute_upon_entry: true,
          waiting_room: true,
          audio: 'both',
          auto_recording: 'none'
        }
      };

      const response = await axios.post(
        `${this.baseURL}/users/me/meetings`,
        meetingConfig,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        meetingId: response.data.id,
        joinUrl: response.data.join_url,
        startUrl: response.data.start_url,
        password: response.data.password
      };
    } catch (error) {
      logger.error('Error creating Zoom meeting:', error.response?.data || error.message);
      
      // Fallback: Return mock meeting data for development
      if (process.env.NODE_ENV === 'development' || process.env.PAYMENT_BYPASS_MODE === 'true') {
        return {
          meetingId: `mock_${Date.now()}`,
          joinUrl: `https://zoom.us/j/mock_${Date.now()}`,
          startUrl: `https://zoom.us/s/mock_${Date.now()}`,
          password: '123456'
        };
      }
      
      throw new Error('Failed to create Zoom meeting');
    }
  }

  async updateMeeting(meetingId, updateData) {
    try {
      const token = await this.getAccessToken();
      
      const response = await axios.patch(
        `${this.baseURL}/meetings/${meetingId}`,
        updateData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      logger.error('Error updating Zoom meeting:', error.response?.data || error.message);
      
      if (process.env.NODE_ENV === 'development' || process.env.PAYMENT_BYPASS_MODE === 'true') {
        return { success: true };
      }
      
      throw new Error('Failed to update Zoom meeting');
    }
  }

  async deleteMeeting(meetingId) {
    try {
      const token = await this.getAccessToken();
      
      await axios.delete(
        `${this.baseURL}/meetings/${meetingId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return { success: true };
    } catch (error) {
      logger.error('Error deleting Zoom meeting:', error.response?.data || error.message);
      
      if (process.env.NODE_ENV === 'development' || process.env.PAYMENT_BYPASS_MODE === 'true') {
        return { success: true };
      }
      
      throw new Error('Failed to delete Zoom meeting');
    }
  }
}

module.exports = new ZoomService();