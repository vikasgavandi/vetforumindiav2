import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    Trash2, Check, X, Loader2, AlertCircle, Plus, Calendar, Clock, DollarSign
} from 'lucide-react';
import { API_BASE_URL } from '../src/config';

interface Availability {
    id: number;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    consultationFee: number;
}

export const ExpertAvailability: React.FC = () => {
    const { user } = useAuth();
    const [expertProfile, setExpertProfile] = useState<any>(null);
    const [availabilities, setAvailabilities] = useState<Availability[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    const [formData, setFormData] = useState({
        dayOfWeek: 'monday',
        startTime: '09:00',
        endTime: '17:00',
        consultationFee: '500'
    });

    const API_BASE = API_BASE_URL;

    useEffect(() => {
        fetchExpertProfile();
    }, []);

    const fetchExpertProfile = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            // Fetch user's expert profile
            const response = await fetch(`${API_BASE}/experts/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setExpertProfile(data.data);
                fetchAvailability(data.data.id);
            } else {
                setLoading(false);
            }
        } catch (error) {
            console.error('Failed to fetch expert profile', error);
            setLoading(false);
        }
    };

    const fetchAvailability = async (id: number) => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_BASE}/appointments/doctors/${id}/availability`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setAvailabilities(data.data.weeklyAvailability);
            }
        } catch (error) {
            console.error('Failed to fetch availability', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!expertProfile) return;
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_BASE}/appointments/doctors/${expertProfile.id}/availability`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    consultationFee: parseFloat(formData.consultationFee)
                })
            });
            const data = await response.json();
            if (data.success) {
                setShowAddModal(false);
                fetchAvailability(expertProfile.id);
            } else {
                alert(data.message || 'Failed to add availability');
            }
        } catch (error) {
            console.error('Error adding availability', error);
            alert('Network error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to remove this time slot?')) return;
        try {
            const token = localStorage.getItem('auth_token');
            await fetch(`${API_BASE}/appointments/doctors/availability/${id}`, {
                method: 'DELETE', // Assuming DELETE endpoint exists or using PUT to deactivate
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            fetchAvailability(expertProfile.id);
        } catch (error) {
            console.error('Error deleting availability', error);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="animate-spin text-[#0065bd]" size={40} />
            </div>
        );
    }

    if (!expertProfile) {
        return (
            <div className="bg-orange-50 p-6 rounded-xl border border-orange-100 flex items-start gap-4">
                <AlertCircle className="text-orange-500 shrink-0" size={24} />
                <div>
                    <h3 className="font-bold text-orange-800">Expert Profile Required</h3>
                    <p className="text-orange-700 text-sm mt-1">
                        You don't have an expert profile associated with your account.
                        Please contact the administrator to set up your doctor profile.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">My Availability</h1>
                    <p className="text-slate-500 text-sm">Set your weekly consulting hours and fees.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 bg-[#0065bd] hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-md"
                >
                    <Plus size={20} /> Add Time Slot
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Day</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Start Time</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">End Time</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Consultation Fee</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {availabilities.map((slot) => (
                                <tr key={slot.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-bold capitalize text-slate-700">{slot.dayOfWeek}</td>
                                    <td className="px-6 py-4 text-slate-600 font-medium">{slot.startTime}</td>
                                    <td className="px-6 py-4 text-slate-600 font-medium">{slot.endTime}</td>
                                    <td className="px-6 py-4 text-slate-600 font-bold">₹{slot.consultationFee}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleDelete(slot.id)}
                                            className="text-slate-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {availabilities.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                                        No availability slots configured yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-800">Add Time Slot</h2>
                            <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
                                    <Calendar size={16} /> Day of Week
                                </label>
                                <select
                                    required
                                    value={formData.dayOfWeek}
                                    onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                                    className="w-full rounded-xl border-slate-200 border p-3 focus:ring-2 focus:ring-[#0065bd] outline-none"
                                >
                                    <option value="monday">Monday</option>
                                    <option value="tuesday">Tuesday</option>
                                    <option value="wednesday">Wednesday</option>
                                    <option value="thursday">Thursday</option>
                                    <option value="friday">Friday</option>
                                    <option value="saturday">Saturday</option>
                                    <option value="sunday">Sunday</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
                                        <Clock size={16} /> Start Time
                                    </label>
                                    <input
                                        required
                                        type="time"
                                        value={formData.startTime}
                                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                        className="w-full rounded-xl border-slate-200 border p-3 focus:ring-2 focus:ring-[#0065bd] outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
                                        <Clock size={16} /> End Time
                                    </label>
                                    <input
                                        required
                                        type="time"
                                        value={formData.endTime}
                                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                        className="w-full rounded-xl border-slate-200 border p-3 focus:ring-2 focus:ring-[#0065bd] outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
                                    <DollarSign size={16} /> Slot Consultation Fee (₹)
                                </label>
                                <input
                                    required
                                    type="number"
                                    min="0"
                                    value={formData.consultationFee}
                                    onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
                                    className="w-full rounded-xl border-slate-200 border p-3 focus:ring-2 focus:ring-[#0065bd] outline-none"
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    disabled={isSubmitting}
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-[#0065bd] text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                                    Save Slot
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
