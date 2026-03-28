
import { User, UserRole, Consultation, Post, Job, Contest } from '../types';

// Initial Mock Data
// Initial Mock Data
export const MOCK_USERS: User[] = [
  { 
    id: '1', 
    firstName: 'Admin', 
    lastName: 'User', 
    email: 'admin@vetforumindia.com', 
    role: UserRole.ADMIN, 
    location: 'Mumbai, India'
  },
  { 
    id: '2', 
    firstName: 'Dr. Sarah', 
    lastName: 'Connor', 
    email: 'sarah@vetforumindia.com', 
    role: UserRole.VET, 
    specialization: 'Small Animal Surgeon', 
    isApproved: true, 
    phone: '+91 98765 43210',
    location: 'Bangalore, India',
    bio: 'Experienced surgeon with over 10 years of practice in small animal care. Passionate about animal welfare and advanced surgical procedures. I specialize in orthopedic and soft tissue surgeries for cats and dogs.',
    qualification: 'BVSc & AH, MVSc (Surgery)',
    designation: 'Senior Surgeon',
    experience: '10+ Years',
    fee: 500,
    publications: [
      'Advances in Feline Orthopedics (2022) - Veterinary Journal',
      'Minimally Invasive Surgery Techniques (2020) - Pet Health Monthly',
      'Post-operative Care in Canines (2018) - Global Vet Science'
    ],
    awards: [
      'Best Veterinarian of the Year 2023 - Bangalore Vet Association',
      'Excellence in Surgery Award 2021'
    ],
    availability: [
      { day: 'Mon', isAvailable: true, slots: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }] },
      { day: 'Tue', isAvailable: true, slots: [{ start: '09:00', end: '17:00' }] },
      { day: 'Wed', isAvailable: true, slots: [{ start: '09:00', end: '17:00' }] },
      { day: 'Thu', isAvailable: true, slots: [{ start: '09:00', end: '17:00' }] },
      { day: 'Fri', isAvailable: true, slots: [{ start: '09:00', end: '13:00' }] },
      { day: 'Sat', isAvailable: false, slots: [] },
      { day: 'Sun', isAvailable: false, slots: [] },
    ]
  },
  { 
    id: '3', 
    firstName: 'Preetam', 
    lastName: 'Kumar', 
    email: 'preetam@vetforumindia.com', 
    role: UserRole.USER, 
    location: 'Delhi, India',
    currentPosition: 'Pet Owner',
    bio: 'Proud owner of a Golden Retriever named Max. Interested in learning more about pet nutrition.'
  },
  { 
    id: '4', 
    firstName: 'Dr. Mark', 
    lastName: 'Sloan', 
    email: 'mark@vetforumindia.com', 
    role: UserRole.VET, 
    specialization: 'Dermatology', 
    isApproved: false, 
    location: 'Pune, India',
    fee: 400,
    experience: '5 Years',
    qualification: 'BVSc',
    bio: 'Specialist in skin conditions and allergies in pets.',
    availability: [
        { day: 'Mon', isAvailable: true, slots: [{ start: '10:00', end: '18:00' }] },
        { day: 'Tue', isAvailable: true, slots: [{ start: '10:00', end: '18:00' }] },
        { day: 'Wed', isAvailable: true, slots: [{ start: '10:00', end: '18:00' }] },
        { day: 'Thu', isAvailable: false, slots: [] },
        { day: 'Fri', isAvailable: true, slots: [{ start: '10:00', end: '18:00' }] },
        { day: 'Sat', isAvailable: true, slots: [{ start: '10:00', end: '14:00' }] },
        { day: 'Sun', isAvailable: false, slots: [] },
      ]
  },
];

export const MOCK_CONSULTATIONS: Consultation[] = [
  { id: 'c1', userId: '3', vetId: '2', vetName: 'Dr. Sarah Connor', userName: 'Preetam Kumar', date: new Date(Date.now() + 86400000).toISOString(), reason: 'Dog has a limp', status: 'scheduled', fee: 299 },
  { id: 'c2', userId: '3', vetId: '2', vetName: 'Dr. Sarah Connor', userName: 'Preetam Kumar', date: new Date(Date.now() - 86400000).toISOString(), reason: 'Annual Vaccination', status: 'completed', notes: 'Vaccine administered successfully.', fee: 299 },
];

export const MOCK_POSTS: Post[] = [
  { id: 'p1', authorId: '2', authorName: 'Dr. Sarah Connor', authorRole: UserRole.VET, content: 'Remember to keep your pets hydrated during this summer heatwave!', likes: 12, createdAt: new Date().toISOString(), type: 'post' },
  { id: 'p2', authorId: '1', authorName: 'Admin', authorRole: UserRole.ADMIN, content: 'System Maintenance scheduled for Sunday 2 AM.', likes: 50, createdAt: new Date().toISOString(), type: 'announcement', title: 'System Update' },
  { id: 'b1', authorId: '2', authorName: 'Dr. Sarah Connor', authorRole: UserRole.VET, content: 'Detailed guide on feline nutrition...', likes: 34, createdAt: new Date().toISOString(), type: 'blog', title: 'Feline Nutrition 101' },
  { id: 'b2', authorId: '2', authorName: 'Dr. Sarah Connor', authorRole: UserRole.VET, content: 'Advances in Veterinary Surgery techniques...', likes: 34, createdAt: new Date().toISOString(), type: 'blog', title: 'Modern Surgery' },
  { id: 'b3', authorId: '2', authorName: 'Dr. Sarah Connor', authorRole: UserRole.VET, content: 'Everything you need to know about canine parvovirus...', likes: 45, createdAt: new Date().toISOString(), type: 'blog', title: 'Prevention is Better' },
  { id: 'b4', authorId: '2', authorName: 'Dr. Sarah Connor', authorRole: UserRole.VET, content: 'Latest trends in pet healthcare technology...', likes: 56, createdAt: new Date().toISOString(), type: 'blog', title: 'Pet Tech 2026' },
  { id: 'b5', authorId: '2', authorName: 'Dr. Sarah Connor', authorRole: UserRole.VET, content: 'Effective strategies for managing pet allergies...', likes: 23, createdAt: new Date().toISOString(), type: 'blog', title: 'Allergy Management' },
  { id: 'b6', authorId: '2', authorName: 'Dr. Sarah Connor', authorRole: UserRole.VET, content: 'Understanding animal behavior and communication...', likes: 89, createdAt: new Date().toISOString(), type: 'blog', title: 'Animal Whispering' },
];

export const MOCK_JOBS: Job[] = [
  { id: 'j1', title: 'Marketing Expert Pharma', organization: 'Narmada Hospital', location: 'Hybrid - Mumbai', description: 'Looking for an experienced marketer.', salary: 'Not Disclosed', experience: '3-7 years', type: 'Full-time', postedAt: new Date().toISOString(), qualification: 'MBA' },
  { id: 'j2', title: 'Senior Veterinarian', organization: 'Apollo Clinics', location: 'Bangalore', description: 'Experienced surgeon needed.', salary: '₹12L - ₹18L', experience: '5+ years', type: 'Full-time', postedAt: new Date().toISOString(), qualification: 'BVSc' },
  { id: 'j3', title: 'Vet Assistant', organization: 'City Zoo', location: 'Delhi', description: 'Entry level position for exotic animals.', salary: '₹4L - ₹6L', experience: '0-2 years', type: 'Full-time', postedAt: new Date().toISOString(), qualification: 'Diploma' },
];

export const MOCK_CONTESTS: Contest[] = [
  { id: 'q1', title: 'Small Animal Surgery Fundamentals', category: 'Surgery', status: 'upcoming', date: '2025-01-15', duration: '60 mins', prize: '₹15000 prize', participants: 847, price: 299, credits: '2 CEU Credits' },
  { id: 'q2', title: 'Emergency & Critical Care', category: 'Emergency', status: 'live', date: '2025-01-15', duration: '60 mins', prize: '₹15000 prize', participants: 1200, price: 299, credits: '1 CEU Credits' },
  { id: 'q3', title: 'Veterinary Pharmacology Mastery', category: 'Pharmacology', status: 'upcoming', date: '2025-02-01', duration: '60 mins', prize: '₹10000 prize', participants: 540, price: 299, credits: '2 CEU Credits' },
  { id: 'q4', title: 'Large Animal Internal Medicine', category: 'Medicine', status: 'completed', date: '2026-12-20', duration: '60 mins', prize: '₹15000 prize', participants: 847, price: 299, credits: '2 CEU Credits' },
];

// Helper to simulate API delay
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
