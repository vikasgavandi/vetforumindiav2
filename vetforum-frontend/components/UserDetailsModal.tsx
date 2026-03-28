import React from 'react';
import { X, User, Calendar, Mail, CheckCircle } from 'lucide-react';
import { getImageUrl } from '../services/imageUtils';

interface UserDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'total' | 'active' | null;
    users: any[];
    isLoading: boolean;
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ isOpen, onClose, type, users, isLoading }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">
                            {type === 'active' ? 'Active Users (Last 15 Mins)' : 'Total Users Directory'}
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            {users.length} {users.length === 1 ? 'user' : 'users'} found
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                    >
                        <X size={24} className="text-slate-500" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto bg-slate-50/30 flex-1">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-48">
                            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                            <User size={48} className="mb-4 opacity-50" />
                            <p>No users found matching these criteria.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {users.map((u) => (
                                <div key={u.id} className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-md transition-all flex gap-4">
                                    <div className="w-14 h-14 rounded-full bg-slate-100 flex-shrink-0 overflow-hidden flex items-center justify-center shadow-sm">
                                        {getImageUrl(u.profilePhoto, 'profiles', null) ? (
                                            <img src={getImageUrl(u.profilePhoto, 'profiles', null)!} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={24} className="text-slate-400" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-bold text-slate-800 truncate pr-2">
                                                {u.firstName} {u.lastName}
                                            </h4>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                                u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                                u.role === 'vet' ? 'bg-blue-100 text-blue-700' :
                                                'bg-slate-100 text-slate-700'
                                            }`}>
                                                {u.role}
                                            </span>
                                        </div>
                                        <div className="space-y-1.5 mt-2">
                                            <div className="flex items-center gap-2 text-xs text-slate-500 truncate">
                                                <Mail size={14} className="text-slate-400 flex-shrink-0"/>
                                                <span className="truncate">{u.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <Calendar size={14} className="text-slate-400 flex-shrink-0"/>
                                                Joined {new Date(u.createdAt).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <CheckCircle size={14} className={type === 'active' ? "text-green-500 flex-shrink-0" : "text-slate-400 flex-shrink-0"}/>
                                                Last active: {new Date(u.lastActiveAt).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
