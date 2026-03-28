import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Search, Stethoscope, Star, Globe,
    ChevronRight, Award, Clock, Loader2
} from 'lucide-react';
import { API_BASE_URL } from '../src/config';

interface Doctor {
    id: number;
    name: string;
    designation: string;
    specialization: string;
    consultationFee: number;
    yearsOfExperience: number;
    professionalPhoto: string;
}

export const DoctorList: React.FC = () => {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const API_BASE = API_BASE_URL;

    const getImageUrl = (imagePath: string | null) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        return `${API_BASE_URL.replace('/api/vetforumindia/v1', '')}/uploads/${imagePath}`;
    };

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const response = await fetch(`${API_BASE}/experts`);
            const data = await response.json();
            if (data.success) {
                setDoctors(data.data);
            }
        } catch (error) {
            console.error('Error fetching doctors', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredDoctors = doctors.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.specialization.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="relative h-64 rounded-3xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-[#0065bd] to-[#004a8b] opacity-90"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">Expert Consultations</h1>
                    <p className="text-blue-100 text-lg md:text-xl max-w-2xl font-medium opacity-90">Book private video sessions with India's top veterinary specialists.</p>

                    <div className="mt-8 w-full max-w-xl relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0065bd] transition-colors" size={24} />
                        <input
                            type="text"
                            placeholder="Search by name, specialty or condition..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white rounded-2xl py-5 pl-14 pr-6 text-slate-900 font-bold focus:ring-4 focus:ring-blue-400/30 outline-none transition-all shadow-xl"
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center p-20">
                    <Loader2 className="animate-spin text-[#0065bd] mb-4" size={48} />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Searching for experts...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredDoctors.map((doc) => (
                        <Link
                            to={`/book-doctor/${doc.id}`}
                            key={doc.id}
                            className="group bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col"
                        >
                            <div className="relative h-48 overflow-hidden bg-slate-100">
                                {doc.professionalPhoto ? (
                                    <img src={getImageUrl(doc.professionalPhoto) || ''} alt={doc.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-blue-50">
                                        <Stethoscope size={64} className="text-[#0065bd] opacity-40" />
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[#0065bd] text-xs font-black shadow-lg">
                                    ₹{doc.consultationFee} / session
                                </div>
                            </div>

                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="text-xl font-black text-slate-900 leading-tight">{doc.name}</h3>
                                    <div className="flex items-center gap-1 text-orange-400">
                                        <Star size={18} fill="currentColor" />
                                        <span className="text-slate-900 font-black text-sm">4.9</span>
                                    </div>
                                </div>

                                <p className="text-[#0065bd] font-bold text-sm mb-4">{doc.specialization}</p>

                                <div className="space-y-3 mt-auto">
                                    <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
                                        <Award size={18} className="text-slate-400" />
                                        <span>{doc.yearsOfExperience}+ Years Experience</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
                                        <Clock size={18} className="text-slate-400" />
                                        <span>Mon - Sat (Available Today)</span>
                                    </div>
                                </div>

                                <div className="mt-8 flex items-center justify-between">
                                    <div className="flex -space-x-2">
                                        <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-50 flex items-center justify-center text-[10px] font-black text-[#0065bd]">
                                            +50
                                        </div>
                                    </div>
                                    <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 group-hover:bg-[#0065bd] transition-colors shadow-lg">
                                        Book Now <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        </Link>
                    ))}

                    {filteredDoctors.length === 0 && (
                        <div className="md:col-span-2 lg:col-span-3 text-center p-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                            <Search size={48} className="mx-auto text-slate-200 mb-4" />
                            <h3 className="text-xl font-bold text-slate-400">No experts found matching your search.</h3>
                            <button
                                onClick={() => setSearchTerm('')}
                                className="mt-4 text-[#0065bd] font-bold hover:underline"
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Banner / Trust Section */}
            <div className="bg-white border border-slate-100 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-[#0065bd]">
                        <Globe size={32} />
                    </div>
                    <div>
                        <h4 className="text-xl font-black text-slate-900">PAN India Coverage</h4>
                        <p className="text-slate-500 font-medium">Access top specialists from anywhere in India within minutes.</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                        <span className="text-3xl font-black text-[#0065bd]">100%</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Secure</span>
                    </div>
                    <div className="w-[1px] h-12 bg-slate-100"></div>
                    <div className="flex flex-col items-center">
                        <span className="text-3xl font-black text-[#0065bd]">24/7</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Support</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
