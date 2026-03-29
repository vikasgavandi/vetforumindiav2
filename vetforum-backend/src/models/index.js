import { Sequelize } from 'sequelize';
import sequelize from '../config/database.js';

import User from './User.js';
import UserDocument from './UserDocument.js';
import Quiz from './Quiz.js';
import UserQuizProgress from './UserQuizProgress.js';
import QuizCard from './QuizCard.js';
import QuizAttempt from './QuizAttempt.js';
import Expert from './Expert.js';
import Consultation from './Consultation.js';
import Announcement from './Announcement.js';
import JobVacancy from './JobVacancy.js';
import Post from './Post.js';
import PostInteraction from './PostInteraction.js';
import Blog from './Blog.js';
import BlogInteraction from './BlogInteraction.js';
import Appointment from './Appointment.js';
import DoctorAvailability from './DoctorAvailability.js';
import QuizRegistration from './QuizRegistration.js';
import Webinar from './Webinar.js';
import WebinarRegistration from './WebinarRegistration.js';

const db = {
  sequelize,
  Sequelize,
  User,
  UserDocument,
  Quiz,
  UserQuizProgress,
  QuizCard,
  QuizAttempt,
  Expert,
  Consultation,
  Announcement,
  JobVacancy,
  Post,
  PostInteraction,
  Blog,
  BlogInteraction,
  Appointment,
  DoctorAvailability,
  QuizRegistration,
  Webinar,
  WebinarRegistration
};

// Quiz associations
QuizCard.hasMany(Quiz, {
  foreignKey: 'quizCardId',
  as: 'questions'
});

Quiz.belongsTo(QuizCard, {
  foreignKey: 'quizCardId',
  as: 'quizCard'
});

User.hasMany(UserQuizProgress, {
  foreignKey: 'userId',
  as: 'quizProgress'
});

UserQuizProgress.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

QuizCard.hasMany(UserQuizProgress, {
  foreignKey: 'quizCardId',
  as: 'userProgress'
});

UserQuizProgress.belongsTo(QuizCard, {
  foreignKey: 'quizCardId',
  as: 'quizCard'
});

// Consultation associations
User.hasMany(Consultation, {
  foreignKey: 'userId',
  as: 'consultations'
});

Expert.hasMany(Consultation, {
  foreignKey: 'expertId',
  as: 'consultations'
});

Consultation.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

Consultation.belongsTo(Expert, {
  foreignKey: 'expertId',
  as: 'expert'
});

// Post associations
User.hasMany(Post, {
  foreignKey: 'userId',
  as: 'posts'
});

Post.belongsTo(User, {
  foreignKey: 'userId',
  as: 'author'
});

// Post interaction associations
User.hasMany(PostInteraction, {
  foreignKey: 'userId',
  as: 'interactions'
});

Post.hasMany(PostInteraction, {
  foreignKey: 'postId',
  as: 'interactions'
});

PostInteraction.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

PostInteraction.belongsTo(Post, {
  foreignKey: 'postId',
  as: 'post'
});

// Quiz card associations
User.hasMany(QuizCard, {
  foreignKey: 'createdBy',
  as: 'createdQuizCards'
});

QuizCard.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator'
});

// Quiz attempt associations
User.hasMany(QuizAttempt, {
  foreignKey: 'userId',
  as: 'quizAttempts'
});

QuizCard.hasMany(QuizAttempt, {
  foreignKey: 'quizCardId',
  as: 'attempts'
});

QuizAttempt.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

QuizAttempt.belongsTo(QuizCard, {
  foreignKey: 'quizCardId',
  as: 'quizCard'
});

// Blog associations
User.hasMany(Blog, {
  foreignKey: 'authorId',
  as: 'blogs'
});

Blog.belongsTo(User, {
  foreignKey: 'authorId',
  as: 'author'
});

// Blog interaction associations
User.hasMany(BlogInteraction, {
  foreignKey: 'userId',
  as: 'blogInteractions'
});

Blog.hasMany(BlogInteraction, {
  foreignKey: 'blogId',
  as: 'interactions'
});

BlogInteraction.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

BlogInteraction.belongsTo(Blog, {
  foreignKey: 'blogId',
  as: 'blog'
});

// Appointment associations
User.hasMany(Appointment, {
  foreignKey: 'userId',
  as: 'appointments'
});

Expert.hasMany(Appointment, {
  foreignKey: 'expertId',
  as: 'doctorAppointments'
});

Appointment.belongsTo(User, {
  foreignKey: 'userId',
  as: 'patient'
});

Appointment.belongsTo(Expert, {
  foreignKey: 'expertId',
  as: 'doctor'
});

// Doctor availability associations
Expert.hasMany(DoctorAvailability, {
  foreignKey: 'expertId',
  as: 'availability'
});

DoctorAvailability.belongsTo(Expert, {
  foreignKey: 'expertId',
  as: 'expert'
});

// User document associations
User.hasMany(UserDocument, {
  foreignKey: 'userId',
  as: 'documents'
});

UserDocument.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// Expert-User association
Expert.belongsTo(User, {
  foreignKey: 'userId',
  as: 'userAccount',
  onDelete: 'CASCADE'
});

User.hasOne(Expert, {
  foreignKey: 'userId',
  as: 'expertProfile',
  onDelete: 'CASCADE',
  hooks: true
});

// Quiz registration associations
User.hasMany(QuizRegistration, {
  foreignKey: 'userId',
  as: 'quizRegistrations'
});

QuizCard.hasMany(QuizRegistration, {
  foreignKey: 'quizCardId',
  as: 'registrations'
});

QuizRegistration.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

QuizRegistration.belongsTo(QuizCard, {
  foreignKey: 'quizCardId',
  as: 'quizCard'
});

// Webinar associations
Webinar.hasMany(WebinarRegistration, {
  foreignKey: 'webinarId',
  as: 'registrations'
});

WebinarRegistration.belongsTo(Webinar, {
  foreignKey: 'webinarId',
  as: 'webinar'
});

export default db;
export {
  sequelize,
  User,
  UserDocument,
  Quiz,
  UserQuizProgress,
  QuizCard,
  QuizAttempt,
  Expert,
  Consultation,
  Announcement,
  JobVacancy,
  Post,
  PostInteraction,
  Blog,
  BlogInteraction,
  Appointment,
  DoctorAvailability,
  QuizRegistration,
  Webinar,
  WebinarRegistration
};