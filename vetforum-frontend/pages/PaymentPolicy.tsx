import React from 'react';
import { Clock, CreditCard, ShieldCheck, RefreshCw, AlertCircle, Mail, ChevronRight, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PaymentPolicy: React.FC = () => {
    return (
        <div className="min-h-screen bg-white">
            {/* Dynamic Hero Section */}
            <div className="relative pt-16 pb-24 px-4 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-6xl pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] opacity-60"></div>
                    <div className="absolute bottom-0 right-[-5%] w-[30%] h-[30%] bg-indigo-50 rounded-full blur-[100px] opacity-40"></div>
                </div>

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 font-bold text-[10px] uppercase tracking-wider mb-8">
                        <ShieldCheck size={14} /> Secure Platform Transactions
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tight leading-[1.1]">
                        Transparency in every <span className="text-blue-600">Transaction</span>
                    </h1>
                    <p className="text-slate-500 text-xl font-medium leading-relaxed max-w-2xl mx-auto mb-12">
                        Transparent fees and fair refund policies designed for your peace of mind.
                    </p>
                    
                    {/* Important Platform Note Integration */}
                    <div className="bg-slate-900 rounded-[32px] p-8 md:p-10 text-left shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                            <Info size={120} className="text-white" />
                        </div>
                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-widest mb-4">
                                <AlertCircle size={14} /> Important Note
                            </div>
                            <h3 className="text-2xl font-black text-white mb-4 leading-tight">
                                Platform Contribution & Operations
                            </h3>
                            <p className="text-slate-300 text-lg font-medium leading-relaxed border-l-2 border-blue-600/50 pl-6">
                                <span className="text-white font-bold tracking-tight italic">Note:</span> The payment supports the platform's operations and is not distributed to the consulting expert.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Structured Policy Cards */}
            <div className="pb-32 px-4">
                <div className="max-w-4xl mx-auto grid gap-12">
                    {/* Section 1: Consultation Fees */}
                    <div className="group bg-slate-50/50 rounded-[40px] p-1 md:p-2 border border-slate-100/50 hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500">
                        <div className="bg-white p-8 md:p-12 rounded-[38px] h-full shadow-sm">
                            <div className="flex flex-col md:flex-row gap-8 md:items-center">
                                <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shrink-0 shadow-2xl shadow-blue-200 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                    <CreditCard className="text-white" size={32} />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Consultation Fees</h2>
                                    <p className="text-slate-500 text-lg font-medium leading-relaxed mb-6">
                                        Specialists set their own fees, which are displayed transparently before booking.
                                    </p>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {[
                                            "Secure Gateway Processing",
                                            "UPI, Cards & Net Banking",
                                            "Auto-generated Invoices",
                                            "Encrypted Transactions"
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-3 text-slate-700 font-bold text-sm">
                                                <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                                    <ChevronRight size={14} strokeWidth={3} />
                                                </div>
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Cancellation */}
                    <div className="group bg-slate-50/50 rounded-[40px] p-1 md:p-2 border border-slate-100/50 hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500">
                        <div className="bg-white p-8 md:p-12 rounded-[38px] h-full shadow-sm">
                            <div className="flex flex-col md:flex-row gap-8 md:items-center">
                                <div className="w-20 h-20 bg-orange-500 rounded-3xl flex items-center justify-center shrink-0 shadow-2xl shadow-orange-200 -rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                    <Clock className="text-white" size={32} />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Cancellation & Timing</h2>
                                    <p className="text-slate-500 text-lg font-medium leading-relaxed mb-6">
                                        We offer flexible rescheduling options to accommodate your busy schedule.
                                    </p>
                                    <div className="bg-orange-50/50 rounded-3xl p-6 border border-orange-100">
                                        <div className="flex items-center gap-3 text-orange-800 font-black text-sm mb-2">
                                            <AlertCircle size={20} className="text-orange-500" /> 2-Hour Window Policy
                                        </div>
                                        <p className="text-orange-900/70 text-sm font-bold leading-relaxed pl-8">
                                            Free rescheduling up to 2 hours before the session. Late cancellations may incur a nominal convenience fee.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Refunds */}
                    <div className="group bg-slate-50/50 rounded-[40px] p-1 md:p-2 border border-slate-100/50 hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500">
                        <div className="bg-white p-8 md:p-12 rounded-[38px] h-full shadow-sm">
                            <div className="flex flex-col md:flex-row gap-8 md:items-center">
                                <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center shrink-0 shadow-2xl shadow-emerald-200 rotate-2 group-hover:rotate-0 transition-transform duration-500">
                                    <RefreshCw className="text-white" size={32} />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Fair Refund Policy</h2>
                                    <p className="text-slate-500 text-lg font-medium leading-relaxed mb-8">
                                        Simplified refund criteria to ensure fairness for everyone on the platform.
                                    </p>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                            <p className="text-slate-900 text-lg font-black mb-1">Full Refund</p>
                                            <p className="text-slate-500 text-sm font-bold line-clamp-2">No-show by expert or session cancellation by platform.</p>
                                        </div>
                                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col justify-between">
                                            <div>
                                                <p className="text-slate-900 text-lg font-black mb-1">Technical Issues</p>
                                                <p className="text-slate-500 text-sm font-bold line-clamp-2">Chronic connectivity issues prevented the consultation.</p>
                                            </div>
                                            <p className="mt-4 text-[10px] text-slate-400 font-bold italic leading-tight">
                                                Note: The payment supports the platform's operations and is not distributed to the consulting expert.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Final Help/CTA Section */}
                <div className="max-w-4xl mx-auto mt-24">
                    <div className="bg-blue-600 rounded-[40px] p-8 md:p-16 text-center shadow-2xl shadow-blue-200 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/50 to-transparent"></div>
                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-4xl font-black text-white mb-6">Need assistance with a payment?</h2>
                            <p className="text-blue-100 text-lg font-bold mb-10 max-w-xl mx-auto">
                                Our support team is here to help you solve any transaction or refund queries you might have.
                            </p>
                            <a 
                                href="mailto:support@vetforumindia.com" 
                                className="inline-flex items-center gap-3 bg-white text-blue-600 font-black px-10 py-5 rounded-2xl shadow-xl hover:bg-slate-50 hover:-translate-y-1 transition-all duration-300"
                            >
                                <Mail size={20} /> Contact Support Team
                            </a>
                        </div>
                    </div>
                    
                    <div className="mt-16 text-center space-y-2">
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                            Last Updated: March 2026 • Vet Forum India Platform
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
