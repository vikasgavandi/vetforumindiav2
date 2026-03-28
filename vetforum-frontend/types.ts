// Image module declarations
declare module "*.svg";
declare module "*.png";
declare module "*.jpg";
declare module "*.jpeg";
declare module "*.gif";

export enum UserRole {
  USER = 'user',
  VET = 'veterinarian',
  ADMIN = 'admin'
}

export enum VetType {
  STUDENT = 'student',
  GRADUATED = 'graduated'
}

export interface TimeSlot {
  start: string;
  end: string;
}

export interface Availability {
  day: string; // Mon, Tue, Wed...
  isAvailable: boolean;
  slots: TimeSlot[];
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isAdmin?: boolean;
  isVeterinarian?: boolean;
  avatar?: string;
  
  // Common Profile Fields
  phone?: string;
  dob?: string;
  location?: string; // State, Country
  state?: string;
  country?: string;
  bio?: string; // About Me
  
  // User Specific
  currentPosition?: string; // Student, Professional, etc.
  
  // Vet Specific
  isVet?: boolean;
  vetType?: VetType; // Student or Graduated
  specialization?: string;
  isApproved?: boolean;
  experience?: string;
  qualification?: string;
  designation?: string;
  fee?: number;
  availability?: Availability[];
  publications?: string[];
  awards?: string[];
  
  // Student/Education Specific
  yearOfStudy?: string;
  college?: string;
  university?: string;
  studentId?: string;
  
  // Official Specific
  vetRegNo?: string;
  documentUrl?: string; // Proof of being a vet
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  documents?: {
    id: number;
    documentPath: string;
    documentName: string;
    documentType: string;
  }[];
}

export interface Consultation {
  id: string;
  userId: string;
  vetId: string;
  vetName: string;
  userName: string;
  date: string; // ISO String
  reason: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  fee: number;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  content: string;
  likes: number;
  createdAt: string;
  title?: string; // For blogs
  imageUrl?: string; // URL or Base64 data for post image
  type: 'post' | 'blog' | 'announcement';
  tags?: string[];
}

export interface Job {
  id: string;
  title: string;
  organization: string;
  location: string;
  qualification: string;
  description: string;
  salary?: string;
  experience?: string;
  type: 'Full-time' | 'Part-time' | 'Contract';
  postedAt: string;
  contactEmail?: string;
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: QuizOption[];
}

export interface Contest {
  id: string;
  title: string;
  category: string;
  status: 'upcoming' | 'live' | 'completed';
  date: string;
  duration: string; // e.g., "60 mins"
  prize: string;
  participants: number;
  price: number;
  credits?: string; // e.g., "2 CEU Credits"
  questions?: QuizQuestion[];
  description?: string; // The specific context or details of the contest
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface Announcement {
  id: number;
  title: string;
  description: string;
  eventDate?: string;
  photo?: string;
  link?: string;
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface Webinar {
  id: number;
  topic: string;
  speakerName: string;
  dateTime?: string;
  registrationFees: string;
  paymentLink?: string;
  isLive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WebinarRegistration {
  id: number;
  webinarId: number;
  name: string;
  email: string;
  phone: string;
  jobTitle?: string;
  organization?: string;
  consentGiven: boolean;
  createdAt?: string;
}
