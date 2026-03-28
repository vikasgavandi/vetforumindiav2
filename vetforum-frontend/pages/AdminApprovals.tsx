import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User } from '../types';
import { Check, X, FileText, Loader2, ArrowLeft } from 'lucide-react';
import { API_BASE_URL } from '../src/config';

export const AdminApprovals: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [actioningId, setActioningId] = useState<string | null>(null);

    const API_BASE = API_BASE_URL;

    const SERVER_BASE = API_BASE_URL.replace('/api/vetforumindia/v1', '');

    useEffect(() => {
        fetchPendingUsers();
    }, []);

    const fetchPendingUsers = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_BASE}/admin/users/pending`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setUsers(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (userId: string, action: 'approve' | 'reject') => {
        setActioningId(userId);
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_BASE}/admin/users/${userId}/${action}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                // Remove from list
                setUsers(prev => prev.filter(u => u.id !== userId));
            } else {
                alert('Failed to perform action');
            }
        } catch (error) {
            console.error('Action failed', error);
            alert('Network error');
        } finally {
            setActioningId(null);
        }
    };

    if (!user?.isAdmin) {
        return <div className="p-8 text-center text-red-500">Access Denied</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-full transition-colors">
                        <ArrowLeft size={24} className="text-slate-600" />
                    </button>
                    <h1 className="text-3xl font-bold text-slate-800">Veterinarian Approvals</h1>
                </div>

                {loading ? (
                    <div className="flex justify-center p-12">
                        <Loader2 className="animate-spin text-[#0065bd]" size={40} />
                    </div>
                ) : users.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 text-center shadow-sm">
                        <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check className="text-green-600" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-700 mb-2">All Caught Up!</h3>
                        <p className="text-slate-500">There are no pending approval requests at the moment.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {users.map(u => (
                            <div key={u.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6">
                                    {/* User Info */}
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-xl font-bold text-slate-800">{u.firstName} {u.lastName}</h3>
                                                <p className="text-slate-500 text-sm flex items-center gap-2 mt-1">
                                                    {u.email} • {u.mobile}
                                                </p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                            ${u.vetType === 'student' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}
                        `}>
                                                {u.vetType}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg text-sm">
                                            <div>
                                                <span className="text-slate-400 block text-xs uppercase mb-1">State / Country</span>
                                                <span className="font-medium text-slate-700">{u.state || 'N/A'}, {u.country || 'India'}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 block text-xs uppercase mb-1">Date of Birth</span>
                                                <span className="font-medium text-slate-700">{u.dob ? new Date(u.dob).toLocaleDateString() : 'N/A'}</span>
                                            </div>
                                            {u.vetType === 'graduated' ? (
                                                <>
                                                    <div>
                                                        <span className="text-slate-400 block text-xs uppercase mb-1">Qualification</span>
                                                        <span className="font-medium text-slate-700">{u.qualification || 'N/A'}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-400 block text-xs uppercase mb-1">Registration Number</span>
                                                        <span className="font-medium text-slate-700">{u.vetRegNo || 'N/A'}</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div>
                                                        <span className="text-slate-400 block text-xs uppercase mb-1">College</span>
                                                        <span className="font-medium text-slate-700">{u.college || 'N/A'}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-400 block text-xs uppercase mb-1">University</span>
                                                        <span className="font-medium text-slate-700">{u.university || 'N/A'}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-400 block text-xs uppercase mb-1">Year</span>
                                                        <span className="font-medium text-slate-700">{u.yearOfStudy || 'N/A'}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-400 block text-xs uppercase mb-1">Student ID</span>
                                                        <span className="font-medium text-slate-700">{u.studentId || 'N/A'}</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {/* Documents */}
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                                                <FileText size={16} /> Submitted Documents
                                            </h4>
                                            <div className="flex flex-wrap gap-3">
                                                {u.documents && u.documents.length > 0 ? (
                                                    u.documents.map(doc => (
                                                        <a
                                                            key={doc.id}
                                                            href={`${SERVER_BASE}/${doc.documentPath}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-[#0065bd] rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors text-sm font-medium"
                                                        >
                                                            <FileText size={16} />
                                                            {doc.documentName}
                                                        </a>
                                                    ))
                                                ) : (
                                                    <span className="text-slate-400 text-sm italic">No documents uploaded</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex md:flex-col justify-end gap-3 min-w-[140px]">
                                        <button
                                            onClick={() => handleAction(u.id, 'approve')}
                                            disabled={actioningId === u.id}
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl font-bold shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {actioningId === u.id ? <Loader2 className="animate-spin" /> : <Check size={20} />}
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleAction(u.id, 'reject')}
                                            disabled={actioningId === u.id}
                                            className="flex-1 bg-white hover:bg-red-50 text-red-600 border border-red-200 py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            <X size={20} />
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div >
    );
};
