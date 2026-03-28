import React, { useState, useEffect } from 'react';
import { Webinar, WebinarRegistration, UserRole } from '../types';
import {
    Video, Users, Calendar, IndianRupee, User, Mail, Phone,
    Briefcase, Building, CheckSquare, Square, ExternalLink,
    Plus, Edit2, Trash2, Power, PowerOff, Loader, ChevronDown, ChevronUp, X, Save, Download
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../src/config';

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Helpers                                                                    */
/* ─────────────────────────────────────────────────────────────────────────── */
const formatDateTime = (dt?: string) => {
    if (!dt) return '—';
    return new Date(dt).toLocaleString('en-IN', {
        weekday: 'long', year: 'numeric', month: 'long',
        day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
};

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Admin: Webinar Form                                                        */
/* ─────────────────────────────────────────────────────────────────────────── */
interface WebinarFormProps {
    initial?: Webinar;
    onSave: (data: Partial<Webinar>) => Promise<void>;
    onCancel: () => void;
}

const WebinarForm: React.FC<WebinarFormProps> = ({ initial, onSave, onCancel }) => {
    const [topic, setTopic] = useState(initial?.topic ?? '');
    const [speakerName, setSpeakerName] = useState(initial?.speakerName ?? '');
    const [dateTime, setDateTime] = useState(
        initial?.dateTime ? new Date(initial.dateTime).toISOString().slice(0, 16) : ''
    );
    const [registrationFees, setRegistrationFees] = useState(initial?.registrationFees ?? '');
    const [paymentLink, setPaymentLink] = useState(initial?.paymentLink ?? '');
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await onSave({ topic, speakerName, dateTime: dateTime || undefined, registrationFees, paymentLink });
        } finally {
            setSaving(false);
        }
    };

    const inputCls = 'w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-slate-800';
    const labelCls = 'block text-sm font-semibold text-slate-600 mb-1.5';

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <label className={labelCls}>Webinar Topic *</label>
                    <input className={inputCls} value={topic} onChange={e => setTopic(e.target.value)}
                        placeholder="e.g. Advanced Veterinary Surgery" required disabled={saving} />
                </div>
                <div>
                    <label className={labelCls}>Speaker Name *</label>
                    <input className={inputCls} value={speakerName} onChange={e => setSpeakerName(e.target.value)}
                        placeholder="Dr. Full Name" required disabled={saving} />
                </div>
                <div>
                    <label className={labelCls}>Date &amp; Time</label>
                    <input type="datetime-local" className={inputCls} value={dateTime}
                        onChange={e => setDateTime(e.target.value)} disabled={saving} />
                </div>
                <div>
                    <label className={labelCls}>Registration Fees</label>
                    <input className={inputCls} value={registrationFees} onChange={e => setRegistrationFees(e.target.value)}
                        placeholder="e.g. ₹499 or Free" disabled={saving} />
                </div>
            </div>
            <div>
                <label className={labelCls}>Google Meet / Join Link</label>
                <input className={inputCls} value={paymentLink} onChange={e => setPaymentLink(e.target.value)}
                    placeholder="https://meet.google.com/xxx-xxxx-xxx" disabled={saving} />
            </div>
            <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={onCancel} disabled={saving}
                    className="px-5 py-2 text-slate-500 hover:text-slate-800 font-medium transition-colors">
                    Cancel
                </button>
                <button type="submit" disabled={saving}
                    className="flex items-center gap-2 px-7 py-2.5 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-600/20 disabled:opacity-50">
                    {saving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
                    {saving ? 'Saving…' : (initial ? 'Save Changes' : 'Create Webinar')}
                </button>
            </div>
        </form>
    );
};

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Admin: Registrations Table                                                 */
/* ─────────────────────────────────────────────────────────────────────────── */
const RegistrationsTable: React.FC<{ webinarId: number }> = ({ webinarId }) => {
    const [regs, setRegs] = useState<WebinarRegistration[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        if (!expanded) return;
        const fetch_ = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('auth_token');
                const r = await fetch(`${API_BASE_URL}/webinars/${webinarId}/registrations`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const d = await r.json();
                if (d.success) setRegs(d.data);
            } finally {
                setLoading(false);
            }
        };
        fetch_();
    }, [webinarId, expanded]);

    const exportToCSV = () => {
        if (regs.length === 0) return;
        const headers = ['#', 'Name', 'Email', 'Phone', 'Job Title', 'Organization', 'Registered On'];
        const csvRows = [
            headers.join(','),
            ...regs.map((r, i) => [
                i + 1,
                `"${r.name || ''}"`,
                `"${r.email || ''}"`,
                `"${r.phone || ''}"`,
                `"${r.jobTitle || ''}"`,
                `"${r.organization || ''}"`,
                `"${r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `webinar_registrations_${webinarId}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="mt-4 border border-slate-100 rounded-xl overflow-hidden shadow-sm">
            <div className="w-full flex items-center justify-between px-5 py-4 bg-slate-50 border-b border-slate-100">
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="flex items-center gap-2 font-semibold text-slate-700 text-sm hover:text-purple-600 transition-colors"
                >
                    <Users size={16} /> View Registrations
                    {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {expanded && regs.length > 0 && (
                    <button
                        onClick={exportToCSV}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 hover:text-purple-600 transition-all shadow-sm"
                        title="Download as CSV"
                    >
                        <Download size={14} /> Export CSV
                    </button>
                )}
            </div>

            {expanded && (
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex justify-center py-8"><Loader className="animate-spin text-slate-400" size={24} /></div>
                    ) : regs.length === 0 ? (
                        <p className="text-center py-8 text-slate-400 text-sm">No registrations yet.</p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider">
                                    <th className="px-4 py-3 text-left">#</th>
                                    <th className="px-4 py-3 text-left">Name</th>
                                    <th className="px-4 py-3 text-left">Email</th>
                                    <th className="px-4 py-3 text-left">Phone</th>
                                    <th className="px-4 py-3 text-left">Job Title</th>
                                    <th className="px-4 py-3 text-left">Organization</th>
                                    <th className="px-4 py-3 text-left">Registered On</th>
                                </tr>
                            </thead>
                            <tbody>
                                {regs.map((r, i) => (
                                    <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                                        <td className="px-4 py-3 font-medium text-slate-800">{r.name}</td>
                                        <td className="px-4 py-3 text-slate-600">{r.email}</td>
                                        <td className="px-4 py-3 text-slate-600">{r.phone}</td>
                                        <td className="px-4 py-3 text-slate-600">{r.jobTitle || '—'}</td>
                                        <td className="px-4 py-3 text-slate-600">{r.organization || '—'}</td>
                                        <td className="px-4 py-3 text-slate-500 text-xs">
                                            {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────────────────── */
/*  User: Registration Form                                                    */
/* ─────────────────────────────────────────────────────────────────────────── */
interface UserRegFormProps {
    webinar: Webinar;
}

const UserRegistrationForm: React.FC<UserRegFormProps> = ({ webinar }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [organization, setOrganization] = useState('');
    const [consent, setConsent] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [paymentLink, setPaymentLink] = useState<string | null>(null);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!consent) { setError('You must agree to the Terms & Conditions.'); return; }
        setError('');
        setSubmitting(true);
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`${API_BASE_URL}/webinars/${webinar.id}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ name, email, phone, jobTitle, organization, consentGiven: consent })
            });
            const data = await res.json();
            if (data.success) {
                setSuccess(true);
                setPaymentLink(data.paymentLink || null);
            } else {
                setError(data.message || 'Registration failed. Please try again.');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const inputCls = 'w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all text-slate-800 placeholder-slate-400';
    const labelCls = 'block text-sm font-semibold text-slate-600 mb-1.5';

    if (success) {
        return (
            <div className="flex flex-col items-center text-center py-10 space-y-5 animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckSquare size={40} className="text-green-600" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-slate-800">Registration Successful!</h3>
                    <p className="text-slate-500 mt-2 text-sm">You have successfully registered for <b>{webinar.topic}</b>.</p>
                </div>
                {paymentLink && (
                    <a
                        href={paymentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-8 py-3.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-600/30 text-lg"
                    >
                        <IndianRupee size={20} /> Proceed to Payment <ExternalLink size={16} />
                    </a>
                )}
                {!paymentLink && (
                    <p className="text-slate-600 bg-green-50 px-5 py-3 rounded-lg text-sm font-medium">
                        You will receive further details via email.
                    </p>
                )}
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <p className="text-slate-500 text-sm font-medium border-b border-slate-100 pb-4">
                Fill in your details below to register for this webinar.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <label className={labelCls}><User size={14} className="inline mr-1" />Name *</label>
                    <input className={inputCls} value={name} onChange={e => setName(e.target.value)}
                        placeholder="Your full name" required disabled={submitting} />
                </div>
                <div>
                    <label className={labelCls}><Mail size={14} className="inline mr-1" />Email ID *</label>
                    <input type="email" className={inputCls} value={email} onChange={e => setEmail(e.target.value)}
                        placeholder="you@email.com" required disabled={submitting} />
                </div>
                <div>
                    <label className={labelCls}><Phone size={14} className="inline mr-1" />Phone Number *</label>
                    <input type="tel" className={inputCls} value={phone} onChange={e => setPhone(e.target.value)}
                        placeholder="+91 XXXXX XXXXX" required disabled={submitting} />
                </div>
                <div>
                    <label className={labelCls}><Briefcase size={14} className="inline mr-1" />Veterinarian / Student / Job Title</label>
                    <input className={inputCls} value={jobTitle} onChange={e => setJobTitle(e.target.value)}
                        placeholder="e.g. Veterinarian, Student, Manager" disabled={submitting} />
                </div>
            </div>

            <div>
                <label className={labelCls}><Building size={14} className="inline mr-1" />University / Company / Organization Name</label>
                <input className={inputCls} value={organization} onChange={e => setOrganization(e.target.value)}
                    placeholder="Your institution or employer" disabled={submitting} />
            </div>

            {/* Consent */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                    <button
                        type="button"
                        onClick={() => setConsent(!consent)}
                        className="mt-0.5 flex-shrink-0 transition-transform hover:scale-110"
                        disabled={submitting}
                    >
                        {consent
                            ? <CheckSquare size={22} className="text-purple-600" />
                            : <Square size={22} className="text-slate-400" />
                        }
                    </button>
                    <p className="text-sm text-slate-700 leading-relaxed">
                        By clicking <strong>'Register'</strong> and completing this transaction, I acknowledge and agree that the
                        registration fee is <strong>non-refundable</strong>. I understand that no refunds will be issued for
                        cancellations, no-shows, or technical issues on the attendee's end.
                        <br /><br />
                        <strong>☐ I agree to the Terms &amp; Conditions.</strong>
                    </p>
                </label>
            </div>

            {error && (
                <div className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 px-4 py-3 rounded-xl text-sm font-medium">
                    <X size={16} /> {error}
                </div>
            )}

            <button
                type="submit"
                disabled={submitting || !consent}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-lg rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-xl shadow-purple-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
                {submitting ? <Loader size={20} className="animate-spin" /> : <Video size={20} />}
                {submitting ? 'Registering…' : 'Register Now'}
            </button>
        </form>
    );
};

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Main Webinar Page                                                          */
/* ─────────────────────────────────────────────────────────────────────────── */
export const WebinarPage: React.FC = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === UserRole.ADMIN || user?.isAdmin === true || user?.isAdmin === 1;

    // ── Shared state ──────────────────────────────────────
    const [loading, setLoading] = useState(true);

    // ── Admin state ───────────────────────────────────────
    const [allWebinars, setAllWebinars] = useState<Webinar[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingWebinar, setEditingWebinar] = useState<Webinar | null>(null);
    const [toggling, setToggling] = useState<number | null>(null);
    const [deleting, setDeleting] = useState<number | null>(null);

    // ── User state ────────────────────────────────────────
    const [liveWebinar, setLiveWebinar] = useState<Webinar | null>(null);

    const token = () => localStorage.getItem('auth_token');

    /* fetch */
    const fetchData = async () => {
        setLoading(true);
        try {
            if (isAdmin) {
                const r = await fetch(`${API_BASE_URL}/webinars`, {
                    headers: { Authorization: `Bearer ${token()}` }
                });
                const d = await r.json();
                if (d.success) setAllWebinars(d.data);
            } else {
                const r = await fetch(`${API_BASE_URL}/webinars/active`);
                const d = await r.json();
                setLiveWebinar(d.data);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [isAdmin]);

    /* Admin: create */
    const handleCreate = async (data: Partial<Webinar>) => {
        const r = await fetch(`${API_BASE_URL}/webinars`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
            body: JSON.stringify(data)
        });
        const d = await r.json();
        if (d.success) { setShowForm(false); await fetchData(); }
        else alert(d.message || 'Failed to create');
    };

    /* Admin: update */
    const handleUpdate = async (data: Partial<Webinar>) => {
        if (!editingWebinar) return;
        const r = await fetch(`${API_BASE_URL}/webinars/${editingWebinar.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
            body: JSON.stringify(data)
        });
        const d = await r.json();
        if (d.success) { setEditingWebinar(null); await fetchData(); }
        else alert(d.message || 'Failed to update');
    };

    /* Admin: toggle live */
    const handleToggleLive = async (webinar: Webinar) => {
        setToggling(webinar.id);
        try {
            const r = await fetch(`${API_BASE_URL}/webinars/${webinar.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
                body: JSON.stringify({ isLive: !webinar.isLive })
            });
            const d = await r.json();
            if (d.success) await fetchData();
            else alert(d.message || 'Failed to update');
        } finally {
            setToggling(null);
        }
    };

    /* Admin: delete */
    const handleDelete = async (id: number) => {
        if (!window.confirm('Delete this webinar? This cannot be undone.')) return;
        setDeleting(id);
        try {
            const r = await fetch(`${API_BASE_URL}/webinars/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token()}` }
            });
            const d = await r.json();
            if (d.success) await fetchData();
            else alert(d.message || 'Failed to delete');
        } finally {
            setDeleting(null);
        }
    };

    /* ── Render ────────────────────────────── */
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader className="animate-spin text-purple-400" size={36} />
            </div>
        );
    }

    /* ═══════════════════════════════════════
       ADMIN VIEW
    ═══════════════════════════════════════ */
    if (isAdmin) {
        return (
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <Video className="text-purple-600" size={26} /> Webinar Management
                        </h1>
                        <p className="text-slate-500 mt-1 text-sm">Create webinars and go live so users can register.</p>
                    </div>
                    {!showForm && !editingWebinar && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-600/20"
                        >
                            <Plus size={18} /> Create Webinar
                        </button>
                    )}
                </div>

                {/* Create form */}
                {showForm && (
                    <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6 border-t-4 border-t-purple-500">
                        <h3 className="text-lg font-bold text-slate-800 mb-5">New Webinar</h3>
                        <WebinarForm onSave={handleCreate} onCancel={() => setShowForm(false)} />
                    </div>
                )}

                {/* Edit modal */}
                {editingWebinar && (
                    <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 p-6 border-t-4 border-t-indigo-500">
                        <h3 className="text-lg font-bold text-slate-800 mb-5">Edit Webinar</h3>
                        <WebinarForm initial={editingWebinar} onSave={handleUpdate} onCancel={() => setEditingWebinar(null)} />
                    </div>
                )}

                {/* List */}
                {allWebinars.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-16 text-center">
                        <Video size={40} className="mx-auto text-slate-300 mb-3" />
                        <p className="text-slate-400 font-medium">No webinars yet. Click <strong>Create Webinar</strong> to get started.</p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {allWebinars.map(w => (
                            <div key={w.id}
                                className={`bg-white rounded-2xl shadow-sm border transition-all p-6 ${w.isLive ? 'border-green-300 ring-2 ring-green-100' : 'border-slate-100'}`}>

                                {/* Top row */}
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${w.isLive ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                                            <Video size={22} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="text-lg font-bold text-slate-800">{w.topic}</h3>
                                                {w.isLive && (
                                                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide animate-pulse">
                                                        ● LIVE
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-500 mt-1">Speaker: <strong>{w.speakerName}</strong></p>
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-400 font-medium">
                                                {w.dateTime && <span className="flex items-center gap-1"><Calendar size={12} />{formatDateTime(w.dateTime)}</span>}
                                                <span className="flex items-center gap-1"><IndianRupee size={12} />{w.registrationFees || 'Free'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <button
                                            onClick={() => handleToggleLive(w)}
                                            disabled={toggling === w.id}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all shadow ${w.isLive
                                                ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                                                : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'}`}
                                        >
                                            {toggling === w.id
                                                ? <Loader size={14} className="animate-spin" />
                                                : w.isLive ? <PowerOff size={14} /> : <Power size={14} />}
                                            {w.isLive ? 'Take Offline' : 'Go Live'}
                                        </button>
                                        <button
                                            onClick={() => setEditingWebinar(w)}
                                            className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-100 transition-all"
                                            title="Edit"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(w.id)}
                                            disabled={deleting === w.id}
                                            className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-100 transition-all"
                                            title="Delete"
                                        >
                                            {deleting === w.id ? <Loader size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Registrations sub-table */}
                                <RegistrationsTable webinarId={w.id} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    /* ═══════════════════════════════════════
       USER VIEW
    ═══════════════════════════════════════ */
    return (
        <div className="max-w-3xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Video className="text-purple-600" size={26} /> Webinar
                </h1>
                <p className="text-slate-500 mt-1 text-sm">Register for upcoming live webinars hosted by Vet Forum India.</p>
            </div>

            {!liveWebinar ? (
                /* No live webinar */
                <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-16 flex flex-col items-center text-center gap-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
                        <Video size={32} className="text-slate-300" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-700 text-lg">No Webinar Scheduled</h3>
                        <p className="text-slate-400 mt-1 text-sm">There is no live webinar at the moment. Check back soon!</p>
                    </div>
                </div>
            ) : (
                <>
                    {/* Webinar Info Card */}
                    <div className="relative bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-800 rounded-2xl text-white p-8 shadow-2xl shadow-purple-600/30 overflow-hidden">
                        {/* decorative circles */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full -ml-10 -mb-10 pointer-events-none" />

                        <div className="relative z-10">
                            <span className="inline-flex items-center gap-1.5 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide mb-4 animate-pulse">
                                ● LIVE NOW
                            </span>
                            <h2 className="text-3xl font-bold leading-tight">{liveWebinar.topic}</h2>
                            <p className="text-purple-200 mt-2 font-medium text-lg">with {liveWebinar.speakerName}</p>

                            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {liveWebinar.dateTime && (
                                    <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 flex items-center gap-3">
                                        <Calendar size={20} className="text-purple-200 flex-shrink-0" />
                                        <div>
                                            <p className="text-purple-300 text-xs font-semibold uppercase tracking-wider">Date &amp; Time</p>
                                            <p className="text-white font-semibold text-sm mt-0.5">{formatDateTime(liveWebinar.dateTime)}</p>
                                        </div>
                                    </div>
                                )}
                                <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 flex items-center gap-3">
                                    <IndianRupee size={20} className="text-purple-200 flex-shrink-0" />
                                    <div>
                                        <p className="text-purple-300 text-xs font-semibold uppercase tracking-wider">Registration Fees</p>
                                        <p className="text-white font-bold text-xl mt-0.5">{liveWebinar.registrationFees || 'Free'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Registration Form */}
                    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
                        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <Users size={20} className="text-purple-600" /> Registration Details
                        </h3>
                        <UserRegistrationForm webinar={liveWebinar} />
                    </div>
                </>
            )}
        </div>
    );
};
