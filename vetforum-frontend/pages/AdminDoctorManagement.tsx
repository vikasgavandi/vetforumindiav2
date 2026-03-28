import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    Plus, Search, User, Mail, Phone, Award,
    Stethoscope, Briefcase, DollarSign, Trash2,
    Edit2, Check, X, Loader2
} from 'lucide-react';
import { API_BASE_URL } from '../src/config';

interface Expert {
    id: number;
    name: string;
    designation: string;
    specialization: string;
    consultationFee: number;
    email: string;
    phone: string;
    isActive: boolean;
    userAccount?: {
        email: string;
    };
}

export const AdminDoctorManagement: React.FC = () => {
    const { user } = useAuth();
    const [doctors, setDoctors] = useState<Expert[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    const getImageUrl = (imagePath: string | null) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        return `${API_BASE_URL.replace('/api/vetforumindia/v1', '')}/uploads/${imagePath}`;
    };

    const [formData, setFormData] = useState({
        name: '',
        designation: 'Veterinary Doctor',
        qualification: '',
        specialization: '',
        yearsOfExperience: '',
        consultationFee: '500',
        email: '',
        phone: '',
        bio: '',
        password: 'password123' // Default password for new accounts
    });

    const API_BASE = API_BASE_URL;

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_BASE}/admin/doctors`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setDoctors(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch doctors', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_BASE}/admin/doctors`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    yearsOfExperience: parseInt(formData.yearsOfExperience),
                    consultationFee: parseFloat(formData.consultationFee)
                })
            });
            const data = await response.json();
            if (data.success) {
                setShowAddModal(false);
                fetchDoctors();
                // Reset form
                setFormData({
                    name: '',
                    designation: 'Veterinary Doctor',
                    qualification: '',
                    specialization: '',
                    yearsOfExperience: '',
                    consultationFee: '500',
                    email: '',
                    phone: '',
                    bio: '',
                    password: 'password123'
                });
            } else {
                alert(data.message || 'Failed to create doctor');
            }
        } catch (error) {
            console.error('Error creating doctor', error);
            alert('Network error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeactivate = async (id: number) => {
        if (!confirm('Are you sure you want to deactivate this doctor?')) return;
        try {
            const token = localStorage.getItem('auth_token');
            await fetch(`${API_BASE}/admin/doctors/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            fetchDoctors();
        } catch (error) {
            console.error('Error deactivating doctor', error);
        }
    };

    if (!user?.isAdmin) return <div className="p-8 text-center text-red-500">Access Denied</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Doctor Management</h1>
                    <p className="text-slate-500 text-sm">Register and manage expert veterinarians for consultations.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 bg-[#0065bd] hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-md"
                >
                    <Plus size={20} /> Register New Doctor
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="animate-spin text-[#0065bd] duration-1000" size={40} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {doctors.map((doc) => (
                        <div key={doc.id} className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all hover:shadow-md ${!doc.isActive ? 'opacity-60 bg-slate-50' : ''}`}>
                            <div className="p-5">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-[#0065bd] overflow-hidden">
                                        {doc.professionalPhoto ? (
                                            <img src={getImageUrl(doc.professionalPhoto) || ''} alt={doc.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={32} />
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDeactivate(doc.id)}
                                            className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold text-slate-800">{doc.name}</h3>
                                <p className="text-[#0065bd] text-sm font-semibold mb-3">{doc.specialization}</p>

                                <div className="space-y-2 mt-4">
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Mail size={14} className="text-slate-400" /> {doc.email}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Phone size={14} className="text-slate-400" /> {doc.phone || 'No phone'}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <DollarSign size={14} className="text-slate-400" /> ₹{doc.consultationFee} per session
                                    </div>
                                </div>

                                <div className="mt-5 pt-5 border-t border-slate-100 flex justify-between items-center">
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${doc.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {doc.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                    <span className="text-xs text-slate-400">ID: DOC-{doc.id}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Doctor Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8 animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white rounded-t-2xl z-10">
                            <h2 className="text-xl font-bold text-slate-800">Register New Doctor</h2>
                            <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
                                        <User size={16} /> Full Name
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Dr. John Doe"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full rounded-xl border-slate-200 border p-3 focus:ring-2 focus:ring-[#0065bd] outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
                                        <Stethoscope size={16} /> Specialization
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Canine Orthopedics"
                                        value={formData.specialization}
                                        onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                        className="w-full rounded-xl border-slate-200 border p-3 focus:ring-2 focus:ring-[#0065bd] outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
                                        <Mail size={16} /> Email Address
                                    </label>
                                    <input
                                        required
                                        type="email"
                                        placeholder="doctor@vetforumindia.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full rounded-xl border-slate-200 border p-3 focus:ring-2 focus:ring-[#0065bd] outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
                                        <Phone size={16} /> Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="+91 9988776655"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full rounded-xl border-slate-200 border p-3 focus:ring-2 focus:ring-[#0065bd] outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
                                        <Award size={16} /> Qualification
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="BVSc & AH, MVSc"
                                        value={formData.qualification}
                                        onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                                        className="w-full rounded-xl border-slate-200 border p-3 focus:ring-2 focus:ring-[#0065bd] outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
                                        <Briefcase size={16} /> Experience (Years)
                                    </label>
                                    <input
                                        required
                                        type="number"
                                        min="0"
                                        placeholder="5"
                                        value={formData.yearsOfExperience}
                                        onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                                        className="w-full rounded-xl border-slate-200 border p-3 focus:ring-2 focus:ring-[#0065bd] outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
                                        <DollarSign size={16} /> Consultation Fee (₹)
                                    </label>
                                    <input
                                        required
                                        type="number"
                                        min="0"
                                        placeholder="500"
                                        value={formData.consultationFee}
                                        onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
                                        className="w-full rounded-xl border-slate-200 border p-3 focus:ring-2 focus:ring-[#0065bd] outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Initial Password</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full rounded-xl border-slate-200 border p-3 focus:ring-2 focus:ring-[#0065bd] outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Short Bio</label>
                                <textarea
                                    rows={3}
                                    placeholder="Tell us about the doctor's background..."
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    className="w-full rounded-xl border-slate-200 border p-3 focus:ring-2 focus:ring-[#0065bd] outline-none transition-all"
                                />
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    disabled={isSubmitting}
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-[#0065bd] text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                                    Complete Registration
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
