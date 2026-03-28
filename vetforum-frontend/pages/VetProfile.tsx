
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    MapPin, Clock, Award, BookOpen, Star,
    ArrowLeft, ShieldCheck, Mail, Edit2, Save, X, Plus, Trash2,
    Briefcase, Stethoscope, Banknote, Calendar as CalendarIcon, Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../src/config';
import { getExpertPhotoUrl } from '../services/imageUtils';

export const VetProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();

    const [vet, setVet] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch Vet Details
    useEffect(() => {
        const fetchVetDetails = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/experts/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setVet(data.data);
                } else {
                    setError('Veterinarian not found');
                }
            } catch (err) {
                console.error('Error fetching vet details:', err);
                setError('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchVetDetails();
        }
    }, [id]);


    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-8 h-8 border-4 border-[#0065bd] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !vet) {
        return (
            <div className="p-12 text-center">
                <h2 className="text-xl font-bold text-slate-800">{error || 'Veterinarian not found'}</h2>
                <button onClick={() => navigate(-1)} className="mt-4 text-teal-600 hover:underline">Go Back</button>
            </div>
        );
    }

    const isOwnProfile = currentUser?.email === vet.email; // Simple check, or use userId mapping if available

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in pb-12">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center text-slate-500 hover:text-slate-800 transition-colors"
            >
                <ArrowLeft size={18} className="mr-2" /> Back
            </button>

            {/* Header Profile Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative">
                <div className="h-32 bg-gradient-to-r from-teal-600 to-green-600"></div>
                <div className="px-8 pb-8">
                    <div className="flex flex-col md:flex-row items-start gap-6 -mt-12 relative">
                        {getExpertPhotoUrl(vet) ? (
                            <img
                                src={getExpertPhotoUrl(vet)!}
                                alt={vet.name}
                                className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-white object-cover"
                            />
                        ) : (
                            <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-4xl">
                                {vet.name?.charAt(0)}
                            </div>
                        )}
                        <div className="flex-1 pt-14 md:pt-14">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                                <div>
                                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                                        {vet.name}
                                        <ShieldCheck className="text-blue-500" size={24} />
                                    </h1>
                                    <p className="text-teal-700 font-medium text-lg mt-1">{vet.specialization}</p>
                                    <p className="text-slate-500 text-sm">{vet.designation} • {vet.qualification}</p>
                                </div>
                                <div className="mt-4 md:mt-0 flex gap-3">
                                    <div className="text-center px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                                        <p className="text-xs text-slate-400 uppercase font-bold">Experience</p>
                                        <p className="font-bold text-slate-800">{vet.yearsOfExperience} Years</p>
                                    </div>
                                    <div className="text-center px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                                        <p className="text-xs text-slate-400 uppercase font-bold">Consult Fee</p>
                                        <p className="font-bold text-green-600">₹{vet.consultationFee}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Details */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Professional Details Section */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Briefcase className="text-indigo-500" size={20} /> Professional Details
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                                <div className="flex items-center gap-2 mb-1">
                                    <Stethoscope size={16} className="text-indigo-600" />
                                    <span className="text-xs font-bold text-indigo-400 uppercase">Specialization</span>
                                </div>
                                <p className="font-bold text-slate-800">{vet.specialization}</p>
                            </div>
                            <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                                <div className="flex items-center gap-2 mb-1">
                                    <Clock size={16} className="text-orange-600" />
                                    <span className="text-xs font-bold text-orange-400 uppercase">Experience</span>
                                </div>
                                <p className="font-bold text-slate-800">{vet.yearsOfExperience} Years</p>
                            </div>
                            <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                                <div className="flex items-center gap-2 mb-1">
                                    <Banknote size={16} className="text-green-600" />
                                    <span className="text-xs font-bold text-green-400 uppercase">Consult Fee</span>
                                </div>
                                <p className="font-bold text-slate-800">₹{vet.consultationFee}</p>
                            </div>
                        </div>
                    </div>

                    {/* About */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Star className="text-yellow-500 fill-current" size={20} /> About Me
                        </h2>
                        <p className="text-slate-600 leading-relaxed">
                            {vet.bio || "No biography provided."}
                        </p>
                    </div>

                </div>

                {/* Right Column: Booking */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-teal-100 sticky top-8">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Book Appointment</h3>
                        <p className="text-slate-500 text-sm mb-6">Schedule a consultation with {vet.name}</p>

                        <div className="pt-4 border-t border-slate-100 mt-4">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-slate-500">Total Fee</span>
                                <span className="text-xl font-bold text-slate-900">₹{vet.consultationFee}</span>
                            </div>
                            <button
                                onClick={() => navigate(`/book-doctor/${vet.id}`)}
                                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2"
                            >
                                <CalendarIcon size={18} /> Book Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
