import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Calendar as CalendarIcon, Clock, IndianRupee,
    MapPin, Award, Check, ChevronLeft, ChevronRight,
    ShieldCheck, Loader2, Video
} from 'lucide-react';
import { API_BASE_URL } from '../src/config';

interface Slot {
    startTime: string;
    endTime: string;
    fee: number;
}

export const ExpertBooking: React.FC = () => {
    const { expertId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [expert, setExpert] = useState<any>(null);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(false);

    const getImageUrl = (imagePath: string | null) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        return `${API_BASE_URL.replace('/api/vetforumindia/v1', '')}/uploads/${imagePath}`;
    };

    // Use centralized API_BASE_URL from config
    const API_BASE = API_BASE_URL;

    useEffect(() => {
        fetchExpertDetails();
    }, [expertId]);

    useEffect(() => {
        if (expertId && selectedDate) {
            fetchAvailability();
        }
    }, [expertId, selectedDate]);

    const fetchExpertDetails = async () => {
        try {
            const response = await fetch(`${API_BASE}/experts/${expertId}`);
            const data = await response.json();
            if (data.success) {
                setExpert(data.data);
            }
        } catch (error) {
            console.error('Error fetching expert', error);
        }
    };

    const fetchAvailability = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/appointments/doctors/${expertId}/availability?date=${selectedDate}`);
            const data = await response.json();
            if (data.success) {
                setAvailableSlots(data.data.availableSlots);
            }
        } catch (error) {
            console.error('Error fetching availability', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBook = async () => {
        if (!selectedSlot) return;
        setBooking(true);
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_BASE}/appointments/book`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    expertId: parseInt(expertId!),
                    appointmentDate: `${selectedDate} ${selectedSlot.startTime}`,
                    reasonForConsultation: reason
                })
            });

            const data = await response.json();
            if (data.success) {
                // Redirect to payment or success page
                alert('Booking initiated! Proceed to pay to confirm.');
                navigate('/consultations');
            } else {
                alert(data.message || 'Booking failed');
            }
        } catch (error) {
            console.error('Error booking', error);
            alert('Network error');
        } finally {
            setBooking(false);
        }
    };

    if (!expert) return <div className="p-8 text-center text-slate-500">Loading doctor details...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-[#0065bd] to-[#004a8b] p-8 text-white flex flex-col md:flex-row gap-8 items-center">
                    <div className="w-32 h-32 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 overflow-hidden">
                        {expert.professionalPhoto ? (
                            <img src={getImageUrl(expert.professionalPhoto) || ''} alt={expert.name} className="w-full h-full object-cover" />
                        ) : (
                            <ShieldCheck size={64} className="text-white" />
                        )}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-2">
                            <span className="bg-green-400 text-green-950 text-xs font-black uppercase px-2 py-1 rounded">Verified Expert</span>
                            <span className="bg-blue-400 text-blue-950 text-xs font-black uppercase px-2 py-1 rounded">{expert.specialization}</span>
                        </div>
                        <h1 className="text-3xl font-black mb-1">{expert.name}</h1>
                        <p className="text-blue-100 font-medium opacity-90">{expert.qualification}</p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4 text-sm font-bold">
                            <div className="flex items-center gap-1.5"><CalendarIcon size={16} /> {expert.yearsOfExperience} Years Exp.</div>
                            <div className="flex items-center gap-1.5"><MapPin size={16} /> Online Consultation</div>
                            <div className="flex items-center gap-1.5 text-green-400"><IndianRupee size={16} /> ₹{expert.consultationFee} Fee</div>
                        </div>
                    </div>
                </div>

                <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left Column: Calendar & Info */}
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                                <CalendarIcon size={20} className="text-[#0065bd]" /> Select Appointment Date
                            </h3>
                            <input
                                type="date"
                                min={new Date().toISOString().split('T')[0]}
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-700 focus:border-[#0065bd] focus:bg-white outline-none transition-all shadow-inner"
                            />
                        </div>

                        <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                            <h4 className="font-black text-blue-900 mb-2 flex items-center gap-2">
                                <Video size={18} /> Zoom Consultation
                            </h4>
                            <p className="text-blue-800 text-sm leading-relaxed">
                                Consultation will be conducted via Zoom. Once your payment is confirmed, a meeting link will be sent to your email and visible in your dashboard.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-black text-slate-900">About the Doctor</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                {expert.bio || `Dr. ${expert.name.split(' ').pop()} is a highly skilled ${expert.specialization} with years of dedicated experience in veterinary medicine. Known for compassionate care and precise diagnostics.`}
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Slots & Reason */}
                    <div className="space-y-8">
                        <div className="relative">
                            <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                                <Clock size={20} className="text-[#0065bd]" /> Available Time Slots
                            </h3>

                            {loading ? (
                                <div className="flex flex-col items-center justify-center p-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                    <Loader2 size={32} className="animate-spin text-[#0065bd] mb-2" />
                                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Finding Slots...</p>
                                </div>
                            ) : availableSlots.length > 0 ? (
                                <div className="grid grid-cols-2 gap-3">
                                    {availableSlots.map((slot, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedSlot(slot)}
                                            className={`p-4 rounded-2xl font-black text-sm transition-all border-2 
                                        ${selectedSlot?.startTime === slot.startTime
                                                    ? 'bg-[#0065bd] border-[#0065bd] text-white shadow-lg scale-105'
                                                    : 'bg-white border-slate-100 text-slate-700 hover:border-blue-300 hover:bg-blue-50'}`}
                                        >
                                            {slot.startTime}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 text-center bg-red-50 rounded-2xl border-2 border-dashed border-red-100">
                                    <p className="text-red-400 font-bold text-sm">No slots available for this date.</p>
                                    <p className="text-red-300 text-xs mt-1">Please try another day.</p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-black text-slate-900">Reason for Consultation</h3>
                            <textarea
                                rows={4}
                                placeholder="Please describe symptoms or reason for visit..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-medium text-slate-700 focus:border-[#0065bd] focus:bg-white outline-none transition-all"
                            />
                        </div>

                        <button
                            disabled={!selectedSlot || !reason || booking}
                            onClick={handleBook}
                            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-slate-200 disabled:cursor-not-allowed text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-green-100 transition-all flex items-center justify-center gap-3 transform hover:-translate-y-1 active:scale-95"
                        >
                            {booking ? <Loader2 className="animate-spin" /> : <Check size={24} />}
                            {selectedSlot ? `Book Slot at ${selectedSlot.startTime}` : 'Choose a Time Slot'}
                        </button>

                        <p className="text-center text-slate-400 text-xs font-medium">
                            By booking, you agree to our <a href="/#/payment-policy" target="_blank" className="text-[#0065bd] hover:underline">Payment Policy</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
