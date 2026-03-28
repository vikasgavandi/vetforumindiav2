import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Consultations } from './pages/Consultations';
import { VideoRoom } from './pages/VideoRoom';
import { Feed } from './pages/Feed';
import { Blogs } from './pages/Blogs';
import { Announcements } from './pages/Announcements';
import { Contests } from './pages/Contests';
import { Jobs } from './pages/Jobs';
import { Profile } from './pages/Profile';
import { VetProfile } from './pages/VetProfile';
import { LandingPage } from './pages/LandingPage';
import { AdminApprovals } from './pages/AdminApprovals';
import { AdminDoctorManagement } from './pages/AdminDoctorManagement';
import { DoctorList } from './pages/DoctorList';
import { ExpertBooking } from './pages/ExpertBooking';
import { ExpertAvailability } from './pages/ExpertAvailability';
import { PaymentPolicy } from './pages/PaymentPolicy';
import { WebinarPage } from './pages/Webinar';
import { UserRole } from './types';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return <Layout>{children}</Layout>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes - Landing Page is Default */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/payment-policy" element={<Layout><PaymentPolicy /></Layout>} />

      {/* Protected Application Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/consultations" element={<ProtectedRoute><Consultations /></ProtectedRoute>} />
      <Route path="/consultation/:id/room" element={<ProtectedRoute><VideoRoom /></ProtectedRoute>} />

      {/* Expert Consultation Routes */}
      <Route path="/doctors" element={<ProtectedRoute><DoctorList /></ProtectedRoute>} />
      <Route path="/book-doctor/:expertId" element={<ProtectedRoute><ExpertBooking /></ProtectedRoute>} />
      <Route path="/doctor/availability" element={<ProtectedRoute><ExpertAvailability /></ProtectedRoute>} />

      <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
      <Route path="/blogs" element={<ProtectedRoute><Blogs /></ProtectedRoute>} />
      <Route path="/announcements" element={<ProtectedRoute><Announcements /></ProtectedRoute>} />

      <Route path="/contests" element={<ProtectedRoute><Contests /></ProtectedRoute>} />
      <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
      <Route path="/webinar" element={<ProtectedRoute><WebinarPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/vet/:id" element={<ProtectedRoute><VetProfile /></ProtectedRoute>} />

      {/* Admin Routes */}
      <Route path="/admin/approvals" element={<ProtectedRoute><AdminApprovals /></ProtectedRoute>} />
      <Route path="/admin/doctors" element={<ProtectedRoute><AdminDoctorManagement /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><div className="p-8 text-center text-2xl font-bold text-slate-400">Admin Panel Under Construction</div></ProtectedRoute>} />

      {/* Catch-all: Redirect invalid paths to Landing Page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;