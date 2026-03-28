import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Calendar, Clock, Video, FileText,
  CreditCard, Loader2, CheckCircle2, AlertCircle,
  ExternalLink, ChevronRight, User as UserIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../src/config';

interface Appointment {
  id: number;
  appointmentDate: string;
  duration: number;
  consultationFee: number;
  reasonForConsultation: string;
  status: 'pending' | 'confirmed' | 'rescheduled' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  zoomJoinUrl?: string;
  zoomStartUrl?: string;
  zoomPassword?: string;
  calendarLinks?: {
    google: string;
    ics: string;
  };
  doctor?: {
    id: number;
    name: string;
    specialization: string;
  };
  patient?: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

export const Consultations: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [payingId, setPayingId] = useState<number | null>(null);

  const API_BASE = API_BASE_URL;

  useEffect(() => {
    fetchAppointments();
  }, [user, filter]);

  const fetchAppointments = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const headers = { 'Authorization': `Bearer ${token}` };
      const statusParam = filter !== 'all' ? `?status=${filter}` : '';

      if (user.role === 'veterinarian') {
        const [doctorRes, userRes] = await Promise.all([
          fetch(`${API_BASE}/appointments/doctors/me${statusParam}`, { headers }),
          fetch(`${API_BASE}/appointments/user${statusParam}`, { headers })
        ]);

        const doctorData = await doctorRes.json();
        const userData = await userRes.json();

        // Combine and sort by date
        const combined = [
          ...(doctorData.success ? doctorData.data : []),
          ...(userData.success ? userData.data : [])
        ].sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime());

        setAppointments(combined);
      } else {
        const response = await fetch(`${API_BASE}/appointments/user${statusParam}`, { headers });
        const data = await response.json();
        if (data.success) {
          setAppointments(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching appointments', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (appointmentId: number) => {
    setPayingId(appointmentId);
    try {
      const token = localStorage.getItem('auth_token');
      // 1. Create Order
      const orderResponse = await fetch(`${API_BASE}/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ appointmentId })
      });
      const orderData = await orderResponse.json();

      if (orderData.success) {
        // 2. Simulate Payment Verification (since we are in dev/bypass mode)
        // In a real app, this would be the Razorpay callback
        const verifyResponse = await fetch(`${API_BASE}/payments/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            appointmentId,
            razorpay_order_id: orderData.data.orderId,
            razorpay_payment_id: 'pay_simulated_' + Date.now(),
            razorpay_signature: 'simulated_sig'
          })
        });

        const verifyData = await verifyResponse.json();
        if (verifyData.success) {
          alert('Payment Successful! Video consultation link activated.');
          fetchAppointments();
        }
      }
    } catch (error) {
      console.error('Payment failed', error);
      alert('Payment processing failed');
    } finally {
      setPayingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Consultations</h1>
          <p className="text-slate-500 font-medium">Manage your video appointments and health records.</p>
        </div>
        <Link
          to="/doctors"
          className="bg-[#0065bd] hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black transition-all shadow-xl shadow-blue-100 flex items-center gap-2"
        >
          Book New Specialist
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex p-1.5 bg-slate-100 rounded-2xl w-fit border border-slate-200">
        {(['all', 'pending', 'confirmed', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-6 py-2 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-white text-[#0065bd] shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20">
          <Loader2 className="animate-spin text-[#0065bd] mb-4" size={40} />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Syncing Appointments...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {appointments.map((appt) => (
            <div key={appt.id} className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start md:items-center">

              {/* Status Circle */}
              <div className="shrink-0 flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-50 border border-slate-100 relative group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                <Calendar className="text-slate-300 group-hover:text-[#0065bd] transition-colors" size={32} />
                <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center
                      ${appt.status === 'confirmed' ? 'bg-green-500' :
                    appt.status === 'pending' ? 'bg-orange-400' :
                      appt.status === 'completed' ? 'bg-blue-500' : 'bg-red-400'}`}>
                  {appt.status === 'confirmed' && <CheckCircle2 size={12} className="text-white" />}
                </div>
              </div>

              {/* Appointment Info */}
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md 
                          ${appt.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {appt.paymentStatus === 'paid' ? 'Paid' : 'Payment Required'}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-sm font-bold text-slate-400 flex items-center gap-1.5">
                    <Clock size={14} /> {appt.duration} Minutes
                  </span>
                </div>

                <h3 className="text-xl font-black text-slate-800">
                  {user?.role === 'veterinarian'
                    ? `Patient: ${appt.patient?.firstName} ${appt.patient?.lastName}`
                    : `Dr. ${appt.doctor?.name}`
                  }
                </h3>

                <p className="text-slate-500 font-medium line-clamp-1 italic">"{appt.reasonForConsultation}"</p>

                <div className="flex items-center gap-4 pt-2">
                  <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 font-black text-xs">
                    {new Date(appt.appointmentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                  <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 font-black text-xs">
                    {new Date(appt.appointmentDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="shrink-0 w-full md:w-auto flex flex-col gap-3">
                {appt.paymentStatus === 'pending' && user?.role !== 'veterinarian' ? (
                  <button
                    onClick={() => handlePayment(appt.id)}
                    disabled={payingId === appt.id}
                    className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-green-100 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {payingId === appt.id ? <Loader2 className="animate-spin" /> : <CreditCard size={20} />}
                    Pay ₹{appt.consultationFee}
                  </button>
                ) : appt.status === 'confirmed' && appt.paymentStatus === 'paid' ? (
                  <div className="flex flex-col gap-3">
                    {appt.zoomJoinUrl || appt.zoomStartUrl ? (
                      <Link
                        to={`/consultation/${appt.id}/room`}
                        className="bg-[#0065bd] hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-100 transition-all animate-pulse"
                      >
                        <Video size={20} /> {user?.role === 'veterinarian' ? 'Start Meeting' : 'Join Meeting'}
                      </Link>
                    ) : (
                      <div className="bg-slate-50 p-3 rounded-2xl border border-dashed border-slate-200 text-center mb-1">
                        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-tighter">Meeting details being prepared</p>
                      </div>
                    )}

                    {appt.calendarLinks && (
                      <div className="flex gap-2">
                        <a
                          href={appt.calendarLinks.google}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Calendar size={12} /> Google
                        </a>
                        <a
                          href={appt.calendarLinks.ics}
                          download={`consultation_${appt.id}.ics`}
                          className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all"
                        >
                          <FileText size={12} /> iCal/Outlook
                        </a>
                      </div>
                    )}
                  </div>
                ) : appt.status === 'completed' ? (
                  <button className="bg-slate-800 hover:bg-slate-900 text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all">
                    <FileText size={20} /> View Summary
                  </button>
                ) : (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-200 text-center">
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-tighter">Waiting for confirmation</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {appointments.length === 0 && !loading && (
        <div className="text-center p-20 bg-slate-50 rounded-[40px] border-4 border-dashed border-slate-200">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl text-slate-200">
            <Calendar size={40} />
          </div>
          <h3 className="text-2xl font-black text-slate-300">No appointments found.</h3>
          <p className="text-slate-400 font-medium mt-2">Your scheduled consultations will appear here.</p>
          <Link to="/doctors" className="mt-8 inline-flex items-center gap-2 text-[#0065bd] font-black hover:underline group">
            Browse Specialists <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      )}
    </div>
  );
};
