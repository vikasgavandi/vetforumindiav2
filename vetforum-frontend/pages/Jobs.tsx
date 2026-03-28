
import React, { useState, useEffect } from 'react';
import { MOCK_JOBS } from '../services/mockDatabase';
import { useAuth } from '../context/AuthContext';
import { UserRole, Job } from '../types';
import { API_BASE_URL } from '../src/config';
import { Briefcase, MapPin, Building, Clock, Plus, CheckCircle, ArrowUpRight, X, IndianRupee, Loader2, Calendar, GraduationCap, User, Share2, Copy, Facebook, Mail, Bookmark } from 'lucide-react';

const API_URL = `${API_BASE_URL}/jobs`;

export const Jobs: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Check if user is admin
  const isAdmin = user?.role === UserRole.ADMIN || user?.isAdmin;

  // Auth helper
  const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  // Fetch jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(API_URL);

        if (response.status === 500) {
          console.warn('Jobs API server error, using mock data');
          setJobs(MOCK_JOBS);
          setError(null);
          return;
        }

        if (!response.ok) {
          throw new Error(`Failed to fetch jobs: ${response.status}`);
        }

        const data = await response.json();
        if (data.success && data.data) {
          setJobs(data.data);
        } else {
          setJobs([]);
        }
        setError(null);
      } catch (err) {
        console.error('Jobs fetch error:', err);
        setError('API not available, showing sample jobs');
        setJobs(MOCK_JOBS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleApplyNow = async (job: Job) => {
    if (!user) {
      alert('Please login to apply for jobs');
      return;
    }

    if (job.contactEmail) {
      const subject = encodeURIComponent(`Application for ${job.title} - Vet Forum India`);
      const body = encodeURIComponent(`Hi ${job.organization} HR,\n\nI am interested in applying for the ${job.title} position at ${job.organization}.\n\nPlease find my application attached.\n\nSent via Vet Forum India`);
      window.location.href = `mailto:${job.contactEmail}?subject=${subject}&body=${body}`;
      return;
    }

    setIsApplying(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(`Application submitted successfully for ${job.title}!`);
    } catch (error) {
      alert('Failed to submit application. Please try again.');
    } finally {
      setIsApplying(false);
    }
  };

  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
  };

  const [newJob, setNewJob] = useState<Partial<Job>>({
    title: '',
    organization: '',
    location: 'Hybrid',
    qualification: '',
    description: '',
    salary: '',
    experience: '0-2 years',
    type: 'Full-time',
    contactEmail: ''
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isAdmin) {
      alert('Only admins can create job posts');
      return;
    }

    setIsPosting(true);
    const jobData = {
      title: newJob.title || 'Untitled Position',
      designation: newJob.title || 'Not Specified',
      organization: newJob.organization || 'Vet Forum India',
      location: newJob.location || 'Remote',
      jobDescription: newJob.description || 'No description provided.',
      salary: newJob.salary || 'Not Disclosed',
      experience: newJob.experience || 'Freshers',
      qualification: newJob.qualification || 'Not Specified',
      type: newJob.type || 'Full-time',
      contactEmail: newJob.contactEmail || ''
    };

    try {
      const response = await fetch(`${API_BASE_URL}/admin/jobs`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(jobData),
      });

      if (response.status === 401) {
        alert('Session expired. Please login again.');
        localStorage.removeItem('auth_token');
        return;
      }

      if (response.ok) {
        const result = await response.json();
        const newJobPost = result.data || result;
        setJobs([newJobPost, ...jobs]);
      } else {
        // Fallback to mock behavior if API fails
        const job: Job = {
          id: `j-${Date.now()}`,
          title: jobData.title,
          organization: jobData.organization,
          location: jobData.location,
          qualification: jobData.qualification,
          description: jobData.jobDescription, // Match Job interface using the data we just prepared
          salary: jobData.salary,
          experience: jobData.experience,
          type: jobData.type as 'Full-time' | 'Part-time' | 'Contract',
          contactEmail: jobData.contactEmail,
          postedAt: new Date().toISOString()
        };
        setJobs([job, ...jobs]);
      }

      setIsCreating(false);
      // Reset form
      setNewJob({
        title: '',
        organization: '',
        location: 'Hybrid',
        qualification: '',
        description: '',
        salary: '',
        experience: '0-2 years',
        type: 'Full-time',
        contactEmail: ''
      });
    } catch (err) {
      console.error('Job creation error:', err);
      alert('Failed to create job. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  if (isCreating) {
    return (
      <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              Post a Vacancy <span className="text-blue-500"><CheckCircle size={20} className="inline" /></span>
            </h1>
            <p className="text-slate-500 mt-1">Find the best talent for your clinic or organization.</p>
          </div>
          <button onClick={() => setIsCreating(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <form onSubmit={handleCreateSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Job Title / Designation</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Veterinary Surgeon"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-green-500"
                  value={newJob.title}
                  onChange={e => setNewJob({ ...newJob, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Organization Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apollo Vet Clinic"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-green-500"
                  value={newJob.organization}
                  onChange={e => setNewJob({ ...newJob, organization: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Experience Required</label>
                <input
                  type="text"
                  placeholder="e.g. 3-5 years"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-green-500"
                  value={newJob.experience}
                  onChange={e => setNewJob({ ...newJob, experience: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Salary Range</label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder="e.g. ₹12L - ₹15L PA"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 pl-10 outline-none focus:ring-2 focus:ring-green-500"
                    value={newJob.salary}
                    onChange={e => setNewJob({ ...newJob, salary: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Job Type</label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-green-500"
                  value={newJob.type}
                  onChange={e => setNewJob({ ...newJob, type: e.target.value as any })}
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Qualification</label>
              <input
                type="text"
                placeholder="e.g. MVSc or BVSc"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-green-500"
                value={newJob.qualification}
                onChange={e => setNewJob({ ...newJob, qualification: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Mumbai (Hybrid)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-green-500"
                  value={newJob.location}
                  onChange={e => setNewJob({ ...newJob, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">HR Email Address (For Applications)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="email"
                    placeholder="e.g. hr@clinic.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 pl-10 outline-none focus:ring-2 focus:ring-green-500"
                    value={newJob.contactEmail || ''}
                    onChange={e => setNewJob({ ...newJob, contactEmail: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Job Description</label>
              <textarea
                rows={5}
                placeholder="Describe the role, responsibilities, and requirements..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-green-500 resize-none"
                value={newJob.description}
                onChange={e => setNewJob({ ...newJob, description: e.target.value })}
              />
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button type="button" onClick={() => setIsCreating(false)} className="px-6 py-3 text-slate-500 hover:bg-slate-50 rounded-lg font-medium transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={isPosting} className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20 disabled:opacity-50 flex items-center gap-2">
                {isPosting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Posting...
                  </>
                ) : (
                  'Post Job'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Job Details View
  if (selectedJob) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                    {selectedJob.organization?.charAt(0) || 'J'}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900">{selectedJob.title}</h1>
                    <p className="text-slate-600">at {selectedJob.organization}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">FULL-TIME</span>
                      <span className="text-orange-600 text-sm">Featured</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <Bookmark size={20} className="text-slate-400" />
                  </button>
                  <button
                    onClick={() => handleApplyNow(selectedJob)}
                    disabled={isApplying}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {isApplying ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Applying...
                      </>
                    ) : (
                      <>
                        Apply Now
                        <ArrowUpRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Job Description */}
              <div className="mb-8">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Job Description</h2>
                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-600 leading-relaxed mb-4">
                    {selectedJob.description || selectedJob.jobDescription || 'No description available.'}
                  </p>

                  <h3 className="font-semibold text-slate-900 mt-6 mb-3">Requirements</h3>
                  <ul className="list-disc list-inside space-y-2 text-slate-600">
                    <li>Experience: {selectedJob.experience || 'Not specified'}</li>
                    <li>Qualification: {selectedJob.qualification || 'Not specified'}</li>
                    <li>Location: {selectedJob.location}</li>
                  </ul>
                </div>
              </div>

              {/* Share Section */}
              <div className="border-t border-slate-100 pt-6">
                <h3 className="font-semibold text-slate-900 mb-4">Share this job:</h3>
                <div className="flex items-center gap-3">
                  <button 
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-sm"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    }}
                  >
                    {copiedLink ? <CheckCircle size={16} className="text-green-600" /> : <Copy size={16} />}
                    {copiedLink ? 'Copied!' : 'Copy Link'}
                  </button>
                  <button 
                    className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    title="Share on Facebook"
                    onClick={() => {
                      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
                    }}
                  >
                    <Facebook size={16} />
                  </button>
                  <button 
                    className="p-2 bg-[#25D366] hover:bg-[#20bd5c] text-white rounded-lg transition-colors flex items-center justify-center" 
                    title="Share on WhatsApp"
                    onClick={() => {
                      const url = window.location.href;
                      const text = `Check out this job: ${selectedJob.title} at ${selectedJob.organization}`;
                      window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
                    }}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-4.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </button>
                  <button 
                    className="p-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
                    title="Share via Email"
                    onClick={() => {
                      const subject = encodeURIComponent(`Job Opportunity: ${selectedJob.title}`);
                      const body = encodeURIComponent(`Check out this job opportunity at ${selectedJob.organization}:\n\n${window.location.href}`);
                      window.location.href = `mailto:?subject=${subject}&body=${body}`;
                    }}
                  >
                    <Mail size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Salary Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Building size={20} className="text-blue-600" />
                Salary (INR)
              </h3>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {selectedJob.salary || '₹100,000 - ₹120,000'}
                </div>
                <div className="text-sm text-slate-500">Yearly salary</div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="text-sm text-slate-600">
                  <strong>Job Location</strong>
                </div>
                <div className="text-slate-900 font-medium">{selectedJob.location}</div>
              </div>
            </div>

            {/* Job Overview */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-4">Job Overview</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar size={16} className="text-blue-600" />
                    <div>
                      <div className="text-xs text-slate-500 uppercase tracking-wide">JOB POSTED:</div>
                      <div className="font-medium text-slate-900">
                        {new Date(selectedJob.postedAt || selectedJob.createdAt || Date.now()).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock size={16} className="text-blue-600" />
                    <div>
                      <div className="text-xs text-slate-500 uppercase tracking-wide">JOB EXPIRE IN</div>
                      <div className="font-medium text-slate-900">
                        {selectedJob.expiryDate ? new Date(selectedJob.expiryDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '14 Aug, 2021'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <User size={16} className="text-blue-600" />
                    <div>
                      <div className="text-xs text-slate-500 uppercase tracking-wide">JOB LEVEL:</div>
                      <div className="font-medium text-slate-900">Entry Level</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Briefcase size={16} className="text-blue-600" />
                    <div>
                      <div className="text-xs text-slate-500 uppercase tracking-wide">EXPERIENCE</div>
                      <div className="font-medium text-slate-900">{selectedJob.experience || '₹50k-80k/month'}</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <GraduationCap size={16} className="text-blue-600" />
                    <div>
                      <div className="text-xs text-slate-500 uppercase tracking-wide">EDUCATION</div>
                      <div className="font-medium text-slate-900">{selectedJob.qualification || 'Graduation'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Back Button */}
            <button
              onClick={() => setSelectedJob(null)}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-lg font-medium transition-colors"
            >
              ← Back to Jobs
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Career Opportunities</h1>
          <p className="text-slate-500 mt-1">Connecting Ambition with Opportunity</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setIsCreating(true)}
            className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-all flex items-center gap-2 shadow-lg shadow-green-600/20"
          >
            <Plus size={18} /> Post a Job
          </button>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="animate-spin mb-2" size={32} />
          <p>Loading job opportunities...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center">
          {error}
        </div>
      )}

      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
              <p className="text-slate-400">No job opportunities available.</p>
            </div>
          ) : (
            jobs.map((job: any) => (
              <div key={job.id} onClick={() => handleJobClick(job)} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all group flex flex-col h-full cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-lg leading-tight group-hover:text-teal-600 transition-colors line-clamp-2">{job.title}</h3>
                    <p className="text-sm font-semibold text-slate-600 mt-1">{job.organization}</p>
                  </div>
                  <ArrowUpRight className="text-slate-300 group-hover:text-teal-600 transition-colors flex-shrink-0 ml-2" />
                </div>

                <div className="space-y-3 mb-6 flex-1">
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <Briefcase size={16} className="text-slate-400" />
                    <span>{job.designation || 'Not Specified'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <Building size={16} className="text-slate-400" />
                    <span>{job.salary || 'Not Disclosed'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <MapPin size={16} className="text-slate-400" />
                    <span>{job.location}</span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-3 mt-2 pt-2 border-t border-slate-50">
                    {job.jobDescription}
                  </p>
                  {job.qualification && job.qualification !== 'Not Specified' && (
                    <div className="text-xs text-slate-600">
                      <strong>Qualification:</strong> {job.qualification}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 text-[10px] text-slate-500 uppercase tracking-wide mb-4">
                  <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100">
                    {job.isActive ? 'Active' : 'Inactive'}
                  </span>
                  {job.expiryDate && (
                    <span className="bg-orange-50 text-orange-700 px-2 py-1 rounded border border-orange-100">
                      Expires: {new Date(job.expiryDate).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <div className="mt-auto pt-4 border-t border-slate-50 flex justify-between items-center text-xs text-slate-400">
                  <span>Posted {new Date(job.postDate || job.createdAt).toLocaleDateString()}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApplyNow(job);
                    }}
                    className="text-teal-600 font-bold hover:underline transition-color"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
