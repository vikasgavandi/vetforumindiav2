import React, { useState, useEffect } from 'react';
import { Post, UserRole, Announcement } from '../types';
import { Megaphone, Bell, Calendar, Plus, X, Loader, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../src/config';
import { EditAnnouncementModal } from '../components/EditAnnouncementModal';

export const Announcements: React.FC = () => {
    const { user } = useAuth();
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

    const isAdmin = user?.role === UserRole.ADMIN || user?.isAdmin === true || user?.isAdmin === 1;

    // Fetch announcements
    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/announcements`);
            const data = await response.json();

            if (data.success) {
                setAnnouncements(data.data);
            }
        } catch (err) {
            console.error('Error fetching announcements:', err);
            setError('Failed to load announcements');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        try {
            setSubmitting(true);
            const token = localStorage.getItem('auth_token');

            const response = await fetch(`${API_BASE_URL}/announcements`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title,
                    content
                })
            });

            const data = await response.json();

            if (data.success) {
                // Refresh list
                await fetchAnnouncements();
                setIsCreating(false);
                setTitle('');
                setContent('');
            } else {
                alert(data.message || 'Failed to create announcement');
            }
        } catch (err) {
            console.error('Error creating announcement:', err);
            alert('Failed to create announcement');
        } finally {
            setSubmitting(false);
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

    const handleDelete = async (id: number) => {
        if (!isAdmin) return;

        if (!confirm('Are you sure you want to delete this announcement?')) {
            return;
        }

        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_BASE_URL}/announcements/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (data.success || response.ok) {
                await fetchAnnouncements();
            } else {
                alert(data.message || 'Failed to delete announcement');
            }
        } catch (error) {
            console.error('Error deleting announcement:', error);
            alert('Error deleting announcement');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader className="animate-spin text-slate-400" size={32} />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Edit Modal */}
            {editingAnnouncement && (
                <EditAnnouncementModal
                    announcement={editingAnnouncement}
                    onClose={() => setEditingAnnouncement(null)}
                    onSave={handleSaveAnnouncement}
                />
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        Official Announcements <Megaphone className="text-red-500" size={24} />
                    </h1>
                    <p className="text-slate-500 mt-1">Stay updated with the latest news, events, and system updates.</p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => setIsCreating(!isCreating)}
                        className="mt-4 md:mt-0 px-6 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium shadow-lg transition-all flex items-center gap-2"
                    >
                        {isCreating ? <X size={18} /> : <Plus size={18} />}
                        {isCreating ? 'Cancel' : 'New Announcement'}
                    </button>
                )}
            </div>

            {isCreating && (
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-red-100 animate-in fade-in slide-in-from-top-4 border-l-4 border-l-red-500">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Post New Announcement</h3>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <input
                            type="text"
                            placeholder="Title"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none font-bold"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            disabled={submitting}
                        />
                        <textarea
                            placeholder="Details..."
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none h-32 resize-none"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                            disabled={submitting}
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="px-4 py-2 text-slate-500 hover:text-slate-800"
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 flex items-center gap-2"
                                disabled={submitting}
                            >
                                {submitting && <Loader size={16} className="animate-spin" />}
                                {submitting ? 'Posting...' : 'Post Now'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                    {error}
                </div>
            )}

            <div className="relative border-l-2 border-slate-200 ml-4 md:ml-8 space-y-12 py-4">
                {announcements.map((item) => (
                    <div key={item.id} className="relative pl-8 md:pl-12 group">
                        {/* Timeline Dot */}
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-4 border-slate-300 group-hover:border-red-500 transition-colors z-10"></div>

                        <div
                            className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all group-hover:border-red-100 ${isAdmin ? 'cursor-edit' : ''}`}
                            onDoubleClick={() => isAdmin && setEditingAnnouncement(item)}
                            title={isAdmin ? "Double-click to edit" : ""}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="text-lg font-bold text-slate-800 group-hover:text-red-600 transition-colors flex items-center gap-2">
                                    {item.title}
                                    {isAdmin && (
                                        <div className="flex items-center gap-2">
                                            <span className="opacity-0 group-hover:opacity-100 text-[10px] bg-blue-600 px-1.5 py-0.5 rounded text-white font-medium uppercase transition-opacity">
                                                Edit
                                            </span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(item.id);
                                                }}
                                                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all p-1"
                                                title="Delete Announcement"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    )}
                                </h3>
                                <span className="flex items-center gap-1 text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">
                                    <Calendar size={12} />
                                    {new Date(item.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap">
                                {item.description}
                            </p>

                            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                                    <Bell size={12} className="text-red-500" />
                                    <span>Posted by Admin</span>
                                </div>
                                {item.link && (
                                    <a
                                        href={item.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs font-bold text-red-600 hover:text-red-700 underline flex items-center gap-1"
                                    >
                                        Visit Link
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {!loading && announcements.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-slate-400">No announcements at this time.</p>
                </div>
            )}
        </div>
    );
};
