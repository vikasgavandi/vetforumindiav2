# Video Consultation System - Setup & Integration Guide

## 🎯 Overview

The Vet Forum India platform includes a comprehensive video consultation system that allows users to book appointments with veterinary experts and conduct video consultations via Zoom integration.

---

## 🔧 System Architecture

### Core Components
1. **Appointment Booking System** - Schedule consultations with doctors
2. **Payment Integration** - Process consultation fees
3. **Zoom Video Integration** - Automated meeting creation and management
4. **Doctor Availability Management** - Configure schedules and fees
5. **Consultation Records** - Notes, prescriptions, and follow-ups

---

## 📋 Database Models

### Appointment Model
```sql
CREATE TABLE appointments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  expertId INT NOT NULL,
  appointmentDate DATETIME NOT NULL,
  duration INT DEFAULT 30,
  consultationFee DECIMAL(10,2) NOT NULL,
  reasonForConsultation TEXT NOT NULL,
  status ENUM('pending', 'confirmed', 'rescheduled', 'completed', 'cancelled') DEFAULT 'pending',
  paymentStatus ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
  paymentId VARCHAR(255),
  zoomMeetingId VARCHAR(255),
  zoomJoinUrl TEXT,
  zoomStartUrl TEXT,
  zoomPassword VARCHAR(255),
  doctorNotes TEXT,
  prescriptions JSON,
  followUpRequired BOOLEAN DEFAULT FALSE,
  followUpDate DATETIME,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Doctor Availability Model
```sql
CREATE TABLE doctor_availability (
  id INT PRIMARY KEY AUTO_INCREMENT,
  expertId INT NOT NULL,
  dayOfWeek ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday') NOT NULL,
  startTime TIME NOT NULL,
  endTime TIME NOT NULL,
  consultationFee DECIMAL(10,2) NOT NULL,
  isActive BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 🔐 Zoom Integration Setup

### Environment Variables
Add these to your `.env` file:
```env
# Zoom API Credentials
ZOOM_API_KEY=your_zoom_api_key
ZOOM_API_SECRET=your_zoom_api_secret
```

### Zoom App Configuration
1. **Create Zoom App**:
   - Go to [Zoom Marketplace](https://marketplace.zoom.us/)
   - Create a JWT App (for server-to-server integration)
   - Get API Key and API Secret

2. **App Permissions**:
   - Meeting: Create, Read, Update, Delete
   - User: Read
   - Recording: Read (optional)

### Development Fallback
The system includes development fallbacks when Zoom credentials are not available:
```javascript
// Mock meeting data for development
{
  meetingId: `mock_${Date.now()}`,
  joinUrl: `https://zoom.us/j/mock_${Date.now()}`,
  startUrl: `https://zoom.us/s/mock_${Date.now()}`,
  password: '123456'
}
```

---

## 📊 API Workflow

### 1. Check Doctor Availability
```http
GET /api/vetforumindia/v1/appointments/doctors/1/availability?date=2025-01-15
```

**Response:**
```json
{
  "success": true,
  "data": {
    "expert": {
      "id": 1,
      "name": "Dr. Jaishankar, N",
      "specialization": "Animal Nutritionist"
    },
    "availableSlots": [
      {
        "startTime": "09:00",
        "endTime": "09:30",
        "fee": 1500.00
      }
    ]
  }
}
```

### 2. Book Appointment
```http
POST /api/vetforumindia/v1/appointments/book
Authorization: Bearer <token>

{
  "expertId": 1,
  "appointmentDate": "2025-01-15T09:00:00.000Z",
  "duration": 30,
  "reasonForConsultation": "Pet nutrition consultation needed"
}
```

### 3. Process Payment & Create Meeting
```http
POST /api/vetforumindia/v1/appointments/payment
Authorization: Bearer <token>

{
  "appointmentId": 123,
  "paymentId": "pay_abc123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "meetingDetails": {
      "joinUrl": "https://zoom.us/j/1234567890",
      "meetingId": "1234567890",
      "password": "abc123"
    }
  }
}
```

---

## 👨⚕️ Doctor Management

### Setting Doctor Availability
```http
POST /api/vetforumindia/v1/admin/doctors/1/availability
Authorization: Bearer <admin_token>

{
  "dayOfWeek": "monday",
  "startTime": "09:00:00",
  "endTime": "17:00:00",
  "consultationFee": 1500.00
}
```

### Managing Appointments
```http
# View doctor's appointments
GET /api/vetforumindia/v1/appointments/doctor/1?date=2025-01-15

# Reschedule appointment
PUT /api/vetforumindia/v1/appointments/123/reschedule
{
  "newDate": "2025-01-16T10:00:00.000Z",
  "reason": "Emergency case"
}

# Complete consultation
PUT /api/vetforumindia/v1/appointments/123/complete
{
  "doctorNotes": "Patient consultation completed successfully",
  "prescriptions": [
    {
      "medication": "Probiotics",
      "dosage": "1 capsule daily",
      "duration": "2 weeks"
    }
  ]
}
```

---

## 💳 Payment Integration

### Payment Flow
1. **Appointment Booking** - Creates pending appointment
2. **Payment Processing** - Validates payment with gateway
3. **Meeting Creation** - Generates Zoom meeting automatically
4. **Confirmation** - Sends meeting details to both parties

### Payment Statuses
- `pending` - Awaiting payment
- `paid` - Payment successful, meeting created
- `failed` - Payment failed, appointment cancelled
- `refunded` - Payment refunded, meeting cancelled

---

## 📅 Appointment Lifecycle

### Status Flow
```
pending → confirmed → completed
    ↓         ↓
cancelled  rescheduled → confirmed → completed
```

### Appointment Statuses
- **pending** - Booked but payment not completed
- **confirmed** - Paid and meeting scheduled
- **rescheduled** - Date/time changed by doctor
- **completed** - Consultation finished with notes
- **cancelled** - Appointment cancelled

---

## 🔔 Notifications & Reminders

### Email Notifications (Future Enhancement)
- Appointment confirmation with meeting details
- Reminder 24 hours before consultation
- Rescheduling notifications
- Consultation completion summary

### SMS Notifications (Future Enhancement)
- Meeting link and password
- Appointment reminders
- Last-minute changes

---

## 📊 Sample Data

### Pre-seeded Doctor Availability
```javascript
// Dr. Jaishankar - Animal Nutritionist
Monday, Wednesday, Friday: 09:00-17:00 (₹1,500)

// Dr. Venkanagouda - Veterinary Gynaecologist  
Tuesday, Thursday: 10:00-18:00, Saturday: 09:00-15:00 (₹2,000)

// Dr. Manjunatha - Veterinary Surgeon
Monday, Wednesday, Friday: 08:00-16:00 (₹2,500)

// Dr. Vinayaka - Veterinary Clinician
Tuesday, Thursday: 11:00-19:00, Saturday: 10:00-16:00 (₹1,200)
```

---

## 🛡️ Security Features

### Access Control
- **Users** - Can book and view own appointments
- **Doctors** - Can view and manage their appointments
- **Admins** - Can manage all appointments and availability

### Data Protection
- Zoom meeting URLs are secured and time-limited
- Payment information is handled securely
- Patient data is protected with proper access controls

---

## 🔧 Technical Implementation

### Zoom Service Class
```javascript
class ZoomService {
  async createMeeting(meetingData) {
    // Creates scheduled Zoom meeting
    // Returns meeting ID, join URL, start URL, password
  }
  
  async updateMeeting(meetingId, updateData) {
    // Updates existing meeting details
  }
  
  async deleteMeeting(meetingId) {
    // Cancels/deletes meeting
  }
}
```

### Appointment Controller Features
- Availability checking with conflict detection
- Automatic 30-minute slot generation
- Payment processing with Zoom integration
- Appointment lifecycle management
- Doctor notes and prescription handling

---

## 📈 Analytics & Reporting

### Metrics Tracked
- Appointment booking rates
- Consultation completion rates
- Doctor utilization rates
- Revenue per consultation
- Patient satisfaction scores

### Admin Dashboard Data
- Daily/weekly appointment counts
- Revenue analytics
- Doctor performance metrics
- Popular consultation times
- Cancellation/rescheduling rates

---

## 🚀 Future Enhancements

### Planned Features
1. **In-app Video Calling** - Custom video solution
2. **Screen Sharing** - For sharing medical records
3. **Recording Capabilities** - Consultation recordings
4. **Multi-language Support** - Regional language support
5. **Mobile App Integration** - Native mobile experience
6. **AI-powered Scheduling** - Smart appointment suggestions
7. **Telemedicine Compliance** - Healthcare regulation compliance

### Integration Possibilities
- **Electronic Health Records (EHR)** - Patient history integration
- **Prescription Management** - Digital prescription system
- **Laboratory Integration** - Test results sharing
- **Insurance Processing** - Insurance claim automation
- **Pharmacy Integration** - Direct medication ordering

This video consultation system provides a complete telemedicine solution for veterinary professionals, enabling remote consultations while maintaining professional standards and patient care quality.