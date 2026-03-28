import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { MOCK_CONTESTS, MOCK_CONSULTATIONS, MOCK_POSTS } from '../services/mockDatabase';
import { UserRole, Consultation, Announcement } from '../types';
import { Calendar, Clock, ChevronRight, CheckCircle, Award, Briefcase, Video, Newspaper, Megaphone, Users, ArrowUpRight, ArrowRight, Loader, Trophy, X, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getImageUrl } from '../services/imageUtils';
import { API_BASE_URL } from '../src/config';

import { EditAnnouncementModal } from '../components/EditAnnouncementModal';
import { UserDetailsModal } from '../components/UserDetailsModal';

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
};

export const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<{totalUsers: number, activeUsers: number, growth: string, registrationData?: any[]}>({
        totalUsers: 0,
        activeUsers: 0,
        growth: '0%',
        registrationData: []
    });
    const [loading, setLoading] = useState(true);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

    const [upcomingContest, setUpcomingContest] = useState<any>(null);
    const [recentArticles, setRecentArticles] = useState<any[]>([]);
    const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
    const [jobsCount, setJobsCount] = useState<number>(0);
    const [showUsersModal, setShowUsersModal] = useState<'total' | 'active' | null>(null);
    const [modalUsersData, setModalUsersData] = useState<any[]>([]);
    const [isModalLoading, setIsModalLoading] = useState(false);

    const fetchAnnouncements = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/announcements?limit=3`);
            const data = await response.json();
            if (data.success) {
                setAnnouncements(data.data);
            }
        } catch (error) {
            console.error('Error fetching announcements:', error);
        }
    };

    const handleSaveAnnouncement = async (updated: Partial<Announcement>) => {
        if (!editingAnnouncement) return;
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_BASE_URL}/announcements/${editingAnnouncement.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updated)
            });

            const data = await response.json();
            if (data.success) {
                await fetchAnnouncements();
            } else {
                throw new Error(data.message || 'Failed to update');
            }
        } catch (error) {
            console.error('Error saving announcement:', error);
            throw error;
        }
    };

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const response = await fetch(`${API_BASE_URL}/admin/users/stats`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = await response.json();

                if (data.success) {
                    setStats(data.data);
                }
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchWidgetsData = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const headers = { 'Authorization': `Bearer ${token}` };

                // Fetch Quiz/Contests
                fetch(`${API_BASE_URL}/quiz/available`, { headers }).then(r => r.json()).then(data => {
                    const quizData = Array.isArray(data) ? data : data.data || [];
                    if (quizData.length > 0) {
                        const upcoming = quizData.find((c: any) => c.status === 'upcoming');
                        if (upcoming) setUpcomingContest(upcoming);
                    }
                }).catch(console.error);

                // Fetch Articles
                fetch(`${API_BASE_URL}/posts?type=blog`, { headers }).then(r => r.json()).then(data => {
                    if (data.success && data.data) {
                        setRecentArticles(data.data.slice(0, 2));
                    }
                }).catch(console.error);

                 // Fetch Appointments
                const appointmentsUrl = user?.role === 'veterinarian' ? `${API_BASE_URL}/appointments/doctors/me` : `${API_BASE_URL}/appointments/user`;
                fetch(appointmentsUrl, { headers }).then(r => r.json()).then(data => {
                    if (data.success && data.data) {
                        setUpcomingAppointments(data.data.filter((a: any) => a.status === 'scheduled').slice(0, 3));
                    }
                }).catch(console.error);

                // Fetch Jobs
                fetch(`${API_BASE_URL}/jobs`, { headers }).then(r => r.json()).then(data => {
                    if (data.success && data.data) {
                        setJobsCount(data.data.length);
                    }
                }).catch(console.error);
            } catch (error) {
                console.error('Error fetching widget data:', error);
            }
        };

        let intervalId: NodeJS.Timeout;

        const isAdmin = user?.role === UserRole.ADMIN || user?.isAdmin === true || user?.isAdmin === 1;
        fetchAnnouncements();
        fetchWidgetsData();

        if (isAdmin) {
            fetchStats();
            // Poll every 30 seconds
            intervalId = setInterval(fetchStats, 30000);
        } else {
            setLoading(false);
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [user]);

    // Fetch users for modal
    useEffect(() => {
        const fetchModalUsers = async () => {
            if (!showUsersModal) return;
            setIsModalLoading(true);
            try {
                const token = localStorage.getItem('auth_token');
                const url = showUsersModal === 'active' 
                    ? `${API_BASE_URL}/admin/users?active=true`
                    : `${API_BASE_URL}/admin/users`;
                    
                const response = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (data.success) {
                    setModalUsersData(data.data);
                }
            } catch (error) {
                console.error('Error fetching users for modal:', error);
            } finally {
                setIsModalLoading(false);
            }
        };

        fetchModalUsers();
    }, [showUsersModal]);

    if (!user) return null;

    const isAdmin = user.role === UserRole.ADMIN || user.isAdmin === true || user.isAdmin === 1;
    const latestAnnouncement = announcements[0];

    return (
        <div className="space-y-8">
            {/* Edit Modal */}
            {editingAnnouncement && (
                <EditAnnouncementModal
                    announcement={editingAnnouncement}
                    onClose={() => setEditingAnnouncement(null)}
                    onSave={handleSaveAnnouncement}
                />
            )}

            <UserDetailsModal
                isOpen={showUsersModal !== null}
                onClose={() => setShowUsersModal(null)}
                type={showUsersModal}
                users={modalUsersData}
                isLoading={isModalLoading}
            />

            {/* Welcome Card */}
            <div className="bg-gradient-to-r from-slate-100 via-neutral-50 to-amber-50 rounded-3xl p-8 flex flex-col md:flex-row justify-between items-center shadow-sm border relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-200 rounded-full blur-3xl opacity-20 -mr-16 -mt-16 pointer-events-none"></div>

                <div className="space-y-4 relative z-10">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-500">
                            Hello!<br />
                            {getGreeting()}, <span className="text-blue-600">{user.firstName == 'Admin' ? 'Preetam' : user.firstName}!</span>
                        </h1>
                        <p className="text-slate-500 mt-2 text-sm">
                            Let's make today productive. Here is your overview.
                        </p>
                    </div>

                    {user.role === UserRole.VET && (
                        <Link to="/consultations" className="inline-block bg-teal-600 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-teal-700 transition-colors shadow-lg shadow-teal-600/20">
                            Check Appointments
                        </Link>
                    )}
                </div>

                <div className="hidden md:block relative z-10">
                    <div className="bg-white/60 backdrop-blur-md p-4 rounded-xl border border-white/60 shadow-sm">
                        <div className="flex items-center gap-3 text-slate-600">
                            <CheckCircle className="text-blue-500" />
                            <span className="font-medium">Profile Verified</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Users in number - Only Visible to Admin */}
            {user.role === UserRole.ADMIN && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="flex flex-col shadow-sm border border-slate-100 rounded-b-xl bg-white">
                        <div className="flex justify-between items-center bg-slate-50 p-8 rounded-t-xl border-b border-slate-100">
                            <div>
                                <p className="text-slate-500 font-medium">Total Users</p>
                                <h2 className="text-3xl font-bold text-slate-800 mt-2">
                                    {loading ? <Loader className="animate-spin" size={24} /> : stats.totalUsers}
                                </h2>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                                <Users size={32} />
                            </div>
                        </div>
                        <div className="flex justify-between items-center p-6">
                            <div className="flex items-center gap-2 text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-lg">
                                <ArrowUpRight size={16} />
                                <span>{stats.growth} Last month</span>
                            </div>
                            <button onClick={() => setShowUsersModal('total')} className="flex items-center gap-1 text-slate-400 text-sm hover:text-slate-600 cursor-pointer transition-colors">
                                <span>View details</span>
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                    <div className="flex flex-col shadow-sm border border-slate-100 rounded-b-xl bg-white">
                        <div className="flex justify-between items-center bg-slate-50 p-8 rounded-t-xl border-b border-slate-100">
                            <div>
                                <p className="text-slate-500 font-medium">Active Users</p>
                                <h2 className="text-3xl font-bold text-slate-800 mt-2">
                                    {loading ? <Loader className="animate-spin" size={24} /> : stats.activeUsers}
                                </h2>
                            </div>
                            <div className="bg-green-100 p-3 rounded-xl text-green-600">
                                <Users size={32} />
                            </div>
                        </div>
                        <div className="flex justify-between items-center p-6 rounded-b-xl">
                            <div className="flex items-center gap-2 text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-lg">
                                <ArrowUpRight size={16} />
                                <span>{stats.growth} Last month</span>
                            </div>
                            <button onClick={() => setShowUsersModal('active')} className="flex items-center gap-1 text-slate-400 text-sm hover:text-slate-600 cursor-pointer transition-colors">
                                <span>View details</span>
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Registration Graph - Only Visible to Admin */}
            {isAdmin && stats.registrationData && stats.registrationData.length > 0 && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Users className="text-blue-600" size={24} /> User Registration Growth
                    </h2>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats.registrationData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                                <Tooltip 
                                    cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '5 5' }} 
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="users" 
                                    stroke="#2563eb" 
                                    strokeWidth={3} 
                                    dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} 
                                    activeDot={{ r: 6, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }} 
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Announcements Section */}
            {announcements.length > 0 && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            Announcements
                        </h2>
                        {isAdmin && <span className="text-xs text-slate-400">Double-click any card to edit</span>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {announcements.map((ann) => (
                            <div
                                key={ann.id}
                                className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-all group relative ${isAdmin ? 'cursor-edit' : ''}`}
                                onDoubleClick={() => isAdmin && setEditingAnnouncement(ann)}
                                title={isAdmin ? "Double click to edit announcement" : ""}
                            >
                                {isAdmin && (
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-[10px] bg-blue-600 px-1.5 py-0.5 rounded text-blue-50 font-medium uppercase">Edit</span>
                                    </div>
                                )}
                                <div className="space-y-4">
                                    <div className="bg-red-50 w-10 h-10 rounded-xl flex items-center justify-center text-red-600">
                                        <Megaphone size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 line-clamp-1">{ann.title}</h4>
                                        <p className="text-sm text-slate-500 line-clamp-2 mt-1">{ann.description}</p>
                                    </div>
                                </div>
                                <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                                    <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                                        <Calendar size={12} /> {new Date(ann.createdAt).toLocaleDateString()}
                                    </span>
                                    {ann.link ? (
                                        <a href={ann.link} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1">
                                            Read More <ArrowUpRight size={14} />
                                        </a>
                                    ) : (
                                        <Link to="/announcements" className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1">
                                            Details <ArrowRight size={14} />
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Left Column */}
                <div className="space-y-8">

                    {/* Recommended Learning / Contest */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                Featured Contest
                            </h2>
                            <Link to="/contests" className="text-teal-600 text-sm font-medium">View All</Link>
                        </div>

                        {upcomingContest ? (
                            <div className="bg-slate-50 p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg font-bold text-slate-800 w-2/3">{upcomingContest.title}</h3>
                                    <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full uppercase">
                                        Upcoming
                                    </span>
                                </div>
                                <p className="text-slate-500 text-sm mb-6">{upcomingContest.category}</p>

                                <div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-6">
                                    <div className="flex items-center gap-2 text-slate-600 text-sm">
                                        <span className="bg-orange-100 p-1 rounded text-orange-600"><Award size={14} /></span>
                                        <span>Intermediate</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-600 text-sm">
                                        <span className="bg-yellow-100 p-1 rounded text-yellow-600"><Award size={14} /></span>
                                        <span>{upcomingContest.credits}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-600 text-sm">
                                        <Calendar size={16} className="text-green-600" />
                                        <span>{upcomingContest.date}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-600 text-sm">
                                        <Clock size={16} className="text-green-600" />
                                        <span>{upcomingContest.duration}</span>
                                    </div>
                                </div>

                                <div className="bg-green-50 rounded-xl p-4 flex justify-between items-center border border-green-100">
                                    <span className="text-2xl font-bold text-slate-700">₹{upcomingContest.price}</span>
                                    <button className="bg-green-600 text-white px-8 py-2.5 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20">
                                        Register
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white p-8 rounded-2xl text-center text-slate-400 border border-slate-100">
                                No active contests.
                            </div>
                        )}
                    </div>

                    {/* Latest Articles Summary */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-800">Latest Articles</h2>
                            <Link to="/blogs" className="text-teal-600 text-sm font-medium">Read More</Link>
                        </div>
                        <div className="grid gap-4">
                            {recentArticles.map(article => (
                                <Link key={article.id} to="/blogs" className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex gap-4 hover:border-teal-200 transition-colors">
                                    <div className="w-16 h-16 bg-slate-100 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center">
                                        {getImageUrl(article.imageUrl, 'blogs', null) ? (
                                            <img src={getImageUrl(article.imageUrl, 'blogs', null)!} className="w-full h-full object-cover" alt="Blog" />
                                        ) : (
                                            <Newspaper size={24} className="text-slate-300" />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{article.title}</h4>
                                        <p className="text-xs text-slate-500 line-clamp-2 mt-1">{article.content}</p>
                                        <div className="mt-2 text-[10px] text-slate-400 font-bold uppercase">
                                            {article.authorName} • {new Date(article.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Right Column */}
                <div className="space-y-8">
                    {/* Schedule */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-slate-800">Your Schedule</h2>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                            {upcomingAppointments.map((consult) => (
                                <div key={consult.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-teal-200 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-white p-3 rounded-full shadow-sm text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                                            <Video size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-800 text-sm">{user.role === UserRole.VET ? consult.userName : consult.vetName}</h4>
                                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                                                <Clock size={12} /> {new Date(consult.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                {new Date(consult.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <Link to={`/consultation/${consult.id}/room`} className="text-teal-600 hover:bg-teal-50 p-2 rounded-full">
                                        <ChevronRight size={18} />
                                    </Link>
                                </div>
                            ))}
                            {upcomingAppointments.length === 0 && (
                                <div className="text-center py-8">
                                    <Calendar className="mx-auto text-slate-300 mb-2" size={32} />
                                    <p className="text-slate-400 text-sm">No upcoming appointments.</p>
                                </div>
                            )}

                            <Link to="/consultations" className="block text-center text-xs font-bold uppercase text-teal-600 py-2 hover:underline tracking-wide">
                                View Full Calendar
                            </Link>
                        </div>
                    </div>

                    {/* Job Alerts Snippet */}
                    <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex flex-col gap-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-slate-800">Job Alerts</h3>
                                <p className="text-xs text-slate-500 mt-1">{jobsCount > 0 ? `${jobsCount} new positions available matching your profile` : 'No new open positions'}</p>
                            </div>
                            <div className="bg-white p-2 rounded-lg text-blue-600">
                                <Briefcase size={20} />
                            </div>
                        </div>
                        <Link to="/jobs" className="bg-blue-600 text-white px-4 py-3 rounded-xl text-sm font-medium hover:bg-blue-700 transition-all text-center shadow-lg shadow-blue-600/20">
                            Explore Opportunities
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
};
