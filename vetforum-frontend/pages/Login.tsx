
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { User, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { OtpInput } from '../components/OtpInput';
import { API_BASE_URL } from '../src/config';
import vetLogo from '../images/vetLogo.svg';
// import vetfulllogo from '../images/Vet forum india logo final.svg';
import shieldCheck from '../images/shieldCheck.svg';
import loginImage from '../images/login.svg';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.USER);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState<'email' | 'otp' | 'password'>('email');
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const { login, authError, clearAuthError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, role, password);
    if (success) {
      navigate('/');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setForgotError('');

    try {
      if (forgotStep === 'email') {
        const response = await fetch(`${API_BASE_URL}/authentication/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: forgotEmail })
        });

        if (response.ok) {
          setForgotStep('otp');
        } else {
          const error = await response.json();
          setForgotError(error.message || 'Failed to send OTP');
        }
      } else if (forgotStep === 'otp') {
        const response = await fetch(`${API_BASE_URL}/authentication/verify-reset-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: forgotEmail, otp })
        });

        if (response.ok) {
          setForgotStep('password');
        } else {
          const error = await response.json();
          setForgotError(error.message || 'Invalid OTP');
        }
      } else if (forgotStep === 'password') {
        if (newPassword !== confirmPassword) {
          setForgotError('Passwords do not match');
          return;
        }

        const response = await fetch(`${API_BASE_URL}/authentication/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: forgotEmail, otp, newPassword })
        });

        if (response.ok) {
          alert('Password reset successfully!');
          setShowForgotPassword(false);
          setForgotStep('email');
          setForgotEmail('');
          setOtp('');
          setNewPassword('');
          setConfirmPassword('');
        } else {
          const error = await response.json();
          setForgotError(error.message || 'Failed to reset password');
        }
      }
    } catch (err) {
      setForgotError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0065bd] overflow-hidden">
      {/* Left Side - Form */}
      <div className="w-full flex flex-col justify-center px-8 md:px-20 lg:px-20 py-12 relative z-10 bg-[#0065bd]">
        <img src={shieldCheck} className='absolute top-0 right-0 w-64 max-sm:w-32' />
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center p-2">
              {/* <ShieldCheck className="text-[#0065bd]" size={32} /> */}
              <img src={vetLogo} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">VET<br />FORUM<br />INDIA</h1>
            </div>
          </div>
        </div>

        <div className="space-y-6 max-w-md">
          <h2 className="text-2xl font-semibold text-white mb-8">Sign In</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative group">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 group-focus-within:text-white transition-colors" size={20} />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (clearAuthError) clearAuthError(); }}
                className="w-full bg-white/10 border border-white/20 rounded-xl py-4 pl-12 pr-4 text-white placeholder-white/50 focus:outline-none focus:bg-white/20 focus:border-white/40 transition-all"
                placeholder="Enter your username or email"
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 group-focus-within:text-white transition-colors" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (clearAuthError) clearAuthError(); }}
                className="w-full bg-white/10 border border-white/20 rounded-xl py-4 pl-12 pr-4 text-white placeholder-white/50 focus:outline-none focus:bg-white/20 focus:border-white/40 transition-all"
                placeholder="Enter your password"
              />
            </div>

            {/* Role Toggle for Demo purposes */}
            {/* <div className="flex bg-white/10 p-1 rounded-lg">
                    {[UserRole.USER, UserRole.VET].map((r) => (
                        <button
                            key={r}
                            type="button"
                            onClick={() => { setRole(r); if (clearAuthError) clearAuthError(); }}
                            className={`flex-1 py-1 text-xs font-medium rounded capitalize transition-all ${
                                role === r 
                                ? 'bg-white text-[#0065bd] shadow-sm' 
                                : 'text-white/70 hover:text-white'
                            }`}
                        >
                            {r}
                        </button>
                    ))}
                </div> */}

            {authError && (
              <div className="mt-2 p-3 bg-red-600 text-white rounded-md text-sm">
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 bg-[#7ab84f] hover:bg-[#6ca545] text-white font-bold rounded-xl transition-all shadow-lg shadow-green-900/10 flex items-center justify-center gap-2 mt-4"
            >
              Login / Register <ArrowRight size={20} />
            </button>
          </form>

          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setShowForgotPassword(true)}
              className="text-white/80 text-sm hover:text-white underline hover:no-underline transition-all"
            >
              Forgot Password?
            </button>
          </div>

          <div className="mt-8">
            <Link to="/register" className="text-white/80 text-sm hover:text-white underline hover:no-underline transition-all">
              Don't have an account? Register here
            </Link>
          </div>

          {/* <div className="mt-8 p-4 bg-white/5 rounded-xl text-xs text-white/40 border border-white/10">
                <p className="font-bold mb-1 text-white/60">Demo Credentials:</p>
                <p>Admin: admin@vetforumindia.com</p>
                <p>Vet: sarah@vetforumindia.com</p>
                <p>User: Any valid email</p>
            </div> */}
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                {forgotStep === 'email' && 'Reset Password'}
                {forgotStep === 'otp' && 'Verify OTP'}
                {forgotStep === 'password' && 'New Password'}
              </h2>
              <button
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotStep('email');
                  setForgotEmail('');
                  setOtp('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setForgotError('');
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              {forgotStep === 'email' && (
                <>
                  <p className="text-slate-600 mb-4">Enter your email address and we'll send you an OTP to reset your password.</p>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Enter your email"
                    />
                  </div>
                </>
              )}

              {forgotStep === 'otp' && (
                <>
                  <p className="text-slate-600 mb-6 text-center text-sm">Enter the 6-digit OTP sent to <span className="font-semibold text-slate-800">{forgotEmail}</span></p>
                  <OtpInput
                    value={otp}
                    onChange={(val) => setOtp(val)}
                    error={!!forgotError}
                  />
                </>
              )}

              {forgotStep === 'password' && (
                <>
                  <p className="text-slate-600 mb-4">Create a new password for your account.</p>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="New password"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Confirm new password"
                    />
                  </div>
                </>
              )}

              {forgotError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {forgotError}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    {forgotStep === 'email' && 'Send OTP'}
                    {forgotStep === 'otp' && 'Verify OTP'}
                    {forgotStep === 'password' && 'Reset Password'}
                    <ArrowRight size={20} />
                  </>
                )}
              </button>

              {forgotStep === 'otp' && (
                <button
                  type="button"
                  onClick={() => {
                    setForgotStep('email');
                    setOtp('');
                    setForgotError('');
                  }}
                  className="w-full py-2 text-slate-600 hover:text-slate-800 text-sm transition-colors"
                >
                  Back to Email
                </button>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Right Side - Illustration */}
      <div className="hidden lg:flex w-full bg-[#0065bd] relative items-center justify-end overflow-hidden">
        {/* Background Circles */}
        {/* <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border-[40px] border-white/5 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border-[40px] border-white/5 rounded-full"></div> */}

        {/* Icons Pattern */}
        {/* <div className="relative z-10 grid grid-cols-3 gap-12 opacity-80 p-12">
              <div className="bg-white p-6 rounded-3xl shadow-xl rotate-12 transform hover:scale-110 transition-transform"><img src="https://cdn-icons-png.flaticon.com/512/3047/3047928.png" className="w-16 h-16 opacity-80" alt="med kit"/></div>
              <div className="bg-white p-6 rounded-3xl shadow-xl -rotate-6 transform hover:scale-110 transition-transform mt-12"><img src="https://cdn-icons-png.flaticon.com/512/616/616408.png" className="w-16 h-16 opacity-80" alt="cat"/></div>
              <div className="bg-white p-6 rounded-3xl shadow-xl rotate-6 transform hover:scale-110 transition-transform"><img src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png" className="w-16 h-16 opacity-80" alt="thermometer"/></div>
              <div className="bg-white p-6 rounded-3xl shadow-xl -rotate-12 transform hover:scale-110 transition-transform"><img src="https://cdn-icons-png.flaticon.com/512/194/194279.png" className="w-16 h-16 opacity-80" alt="bone"/></div>
              <div className="bg-white p-6 rounded-3xl shadow-xl rotate-3 transform hover:scale-110 transition-transform mt-8"><img src="https://cdn-icons-png.flaticon.com/512/2313/2313936.png" className="w-16 h-16 opacity-80" alt="stethoscope"/></div>
              <div className="bg-white p-6 rounded-3xl shadow-xl -rotate-3 transform hover:scale-110 transition-transform"><img src="https://cdn-icons-png.flaticon.com/512/3028/3028578.png" className="w-16 h-16 opacity-80" alt="microscope"/></div>
          </div> */}
        <img src={loginImage} />
      </div>
    </div>
  );
};
