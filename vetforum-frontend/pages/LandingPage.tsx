import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  User,
  Search,
  Menu,
  X,
  LayoutDashboard,
  ShieldCheck,
  CheckCircle,
  MapPinned,
  Trophy,
  Award,
  Calendar,
  Clock,
  Users,
  Edit,
  Heart,
  MessageCircle,
  Star
} from "lucide-react";
import { MOCK_JOBS, MOCK_POSTS, MOCK_CONTESTS } from "../services/mockDatabase";
import { useAuth } from "../context/AuthContext";
import { Contest, Job } from '../types';
import landingBG from '../images/landingBG.svg';
import vetLogo from '../images/vetLogo.svg';
import vetfulllogo from "../images/Vet forum india logo final.svg";


import { API_BASE_URL } from '../src/config';
import { getUserAvatarUrl, getExpertPhotoUrl, getBlogImageUrl, getImageUrl } from '../services/imageUtils';

// Helper component for images with fallback
const ImageWithFallback = ({ src, alt, className, fallback }: { src: string | null, alt: string, className?: string, fallback: React.ReactNode }) => {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className={`${className} bg-slate-200 flex items-center justify-center font-bold text-slate-500 overflow-hidden`}>
        {fallback}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
};

export const LandingPage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [featuredBlogs, setFeaturedBlogs] = useState<any[]>([]);
  const [featuredFeeds, setFeaturedFeeds] = useState<any[]>([]);
  const [contests, setContests] = useState<Contest[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<any>(null);
  const [selectedFeed, setSelectedFeed] = useState<any>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showAbout, setShowAbout] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [expandedFeeds, setExpandedFeeds] = useState<Set<string>>(new Set());
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [experts, setExperts] = useState<any[]>([]);
  const [loadingExperts, setLoadingExperts] = useState(true);
  const [loadingContests, setLoadingContests] = useState(true);
  const [liveWebinar, setLiveWebinar] = useState<any>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };
  // const filteredContests = contests.filter(c => c.status === activeTab);
  const isAdmin = user?.role === 'admin';
  const isSpecialUser = user?.isVeterinarian || user?.isAdmin || user?.role === 'admin' || user?.role === 'veterinarian';

  const getImageUrl = (imagePath: string | null, type: string = 'blogs') => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_BASE_URL.replace('/api/vetforumindia/v1', '')}/uploads/${type}/${imagePath}`;
  };

  /** Strip markdown symbols for plain-text preview */
  const stripMarkdown = (text: string | null | undefined): string => {
    if (!text) return '';
    return text
      .replace(/#{1,6}\s?/g, '')   // headings
      .replace(/\*\*(.+?)\*\*/g, '$1') // bold
      .replace(/\*(.+?)\*/g, '$1')     // italic
      .replace(/__(.+?)__/g, '$1')    // bold alt
      .replace(/_(.+?)_/g, '$1')      // italic alt
      .replace(/`{1,3}[^`]*`{1,3}/g, '') // code
      .replace(/^[-*+]\s/gm, '')     // list bullets
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
      .replace(/\n+/g, ' ')          // newlines → space
      .trim();
  };

  const toggleExpandFeed = (feedId: string) => {
    setExpandedFeeds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(feedId)) {
        newSet.delete(feedId);
      } else {
        newSet.add(feedId);
      }
      return newSet;
    });
  };

  useEffect(() => {
    const fetchLandingData = async () => {
      // 1. Fetch Contests (with Authorization & Fallback)
      try {
        setLoadingContests(true);
        const token = localStorage.getItem('auth_token');
        const isAdminUser = user?.role === 'admin' || user?.isAdmin === true || user?.isAdmin === 1;

        const primaryQuizAPI = isAdminUser
          ? `${API_BASE_URL}/admin/quiz-cards`
          : `${API_BASE_URL}/quiz/available`;

        let quizResponse = await fetch(primaryQuizAPI, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });

        // Fallback if admin fetch fails (401/403)
        if (!quizResponse.ok && isAdminUser) {
          quizResponse = await fetch(`${API_BASE_URL}/quiz/available`);
        }

        if (quizResponse.ok) {
          const data = await quizResponse.json();
          const contestData = Array.isArray(data) ? data : data.data || [];

          if (contestData.length > 0) {
            setContests(contestData.map((item: any) => ({
              id: String(item.id),
              title: item.title || 'Untitled Contest',
              category: item.category || 'Veterinary Science',
              status: item.status || 'upcoming',
              date: item.startDate ? new Date(item.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              duration: item.duration ? `${item.duration} mins` : '60 mins',
              prize: item.prize || '₹10000',
              participants: item.participants || 0,
              price: parseFloat(item.price) || 0,
              credits: item.credits || `${Math.ceil((item.duration || 60) / 30)} CEU Credits`,
              description: item.description || 'Comprehensive assessment covering surgical procedures, anesthesia protocols, and post-operative care.'
            })));
          } else {
            setContests(MOCK_CONTESTS.slice(0, 3));
          }
        }
      } catch (err) {
        console.error('Contest fetch error:', err);
      } finally {
        setLoadingContests(false);
      }

      // 2. Fetch Experts
      try {
        setLoadingExperts(true);
        const expertsResponse = await fetch(`${API_BASE_URL}/experts`);
        if (expertsResponse.ok) {
          const data = await expertsResponse.json();
          setExperts(data.data ? data.data.slice(0, 3) : []);
        }
      } catch (err) {
        console.error('Experts fetch error:', err);
      } finally {
        setLoadingExperts(false);
      }

      // 3. Fetch Blogs
      try {
        const blogsResponse = await fetch(`${API_BASE_URL}/blogs?limit=6&status=published`);
        if (blogsResponse.ok) {
          const blogsData = await blogsResponse.json();
          const blogsList = Array.isArray(blogsData) ? blogsData : (blogsData.data || []);
          setFeaturedBlogs(blogsList);
        }
      } catch (err) {
        console.error('Blogs fetch error:', err);
      }

      // 4. Fetch Feeds
      try {
        const feedsResponse = await fetch(`${API_BASE_URL}/posts`, {
          headers: getAuthHeaders()
        });
        if (feedsResponse.ok) {
          const feedsData = await feedsResponse.json();
          const feedsList = Array.isArray(feedsData) ? feedsData : (feedsData.data || []);
          setFeaturedFeeds(feedsList.slice(0, 3));
        }
      } catch (err) {
        console.error('Feeds fetch error:', err);
      }

      // 5. Fetch Jobs
      try {
        const jobsResponse = await fetch(`${API_BASE_URL}/jobs`);
        if (jobsResponse.ok) {
          const jobsData = await jobsResponse.json();
          const jobsList = Array.isArray(jobsData) ? jobsData : (jobsData.data || []);
          setFeaturedJobs(jobsList.slice(0, 3));
        }
      } catch (err) {
        console.error('Jobs fetch error:', err);
      }

      // 6. Fetch Announcements
      try {
        const annResponse = await fetch(`${API_BASE_URL}/announcements`);
        if (annResponse.ok) {
          const annData = await annResponse.json();
          setAnnouncements(Array.isArray(annData) ? annData : (annData.data || []));
        }
      } catch (err) {
        console.error('Announcements fetch error:', err);
      }

      // 7. Fetch Live Webinar
      try {
        const webResponse = await fetch(`${API_BASE_URL}/webinars/active`);
        if (webResponse.ok) {
          const webData = await webResponse.json();
          setLiveWebinar(webData.data || null);
        }
      } catch (err) {
        console.error('Webinar fetch error:', err);
      }
    };

    fetchLandingData();
  }, [user]);

  // Prevent flashing "Login" if actually logged in but loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0065bd] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="font-sans text-slate-900 bg-white">
      {/* Hero Section */}
      <div className="relative bg-cover bg-center bg-no-repeat h-64 w-full text-white min-h-[320px] sm:min-h-[500px] md:min-h-[700px] md:bg-center bg-top" style={{ backgroundImage: `url(${landingBG})` }}>
        {/* Decorative Background Elements */}
        {/* <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#7ab84f]/20 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div> */}

        {/* Glassmorphism Navbar */}
        <nav className="relative z-20 flex flex-col md:flex-row items-center justify-between px-4 md:px-8 py-6 md:py-8 max-w-7xl mx-auto gap-4 w-full">

          {/* Logo Area */}
          {/* <div className="flex items-center gap-2">
             <div className="bg-white p-1.5 rounded-lg">
                <img src={vetLogo} alt="VET FORUM INDIA Logo" className="w-8 h-8" />
             </div>
             <span className="font-bold text-xl tracking-tight leading-none">VET FORUM<br/><span className="text-[#7ab84f]">INDIA</span></span>
          </div> */}

          {/* Menu Pill */}
          <div className="hidden md:flex items-center space-x-1 backdrop-blur-md border border-white/20 rounded-xl px-6 py-2 shadow-xl bg-yellow-50/10">
            <Link
              to="/"
              className="px-5 py-2 rounded-xl bg-white/10 text-white text-sm transition-all"
            >
              Home
            </Link>
            {isSpecialUser && (
              <Link
                to="/feed"
                className="px-5 py-2 rounded-xl hover:bg-white/10 text-white/90 hover:text-white text-sm font-medium transition-all"
              >
                Feed
              </Link>
            )}
            {isSpecialUser && (
              <Link
                to="/announcements"
                className="px-5 py-2 rounded-xl hover:bg-white/10 text-white/90 hover:text-white text-sm font-medium transition-all"
              >
                Announcement
              </Link>
            )}
            {isSpecialUser && (
              <Link
                to="/jobs"
                className="px-5 py-2 rounded-xl hover:bg-white/10 text-white/90 hover:text-white text-sm font-medium transition-all"
              >
                Job Alert
              </Link>
            )}
            <button
              onClick={() => setShowAbout(true)}
              className="px-5 py-2 rounded-xl hover:bg-white/10 text-white/90 hover:text-white text-sm font-medium transition-all"
            >
              About US
            </button>
          </div>

          {/* Mobile Menu Icon */}
          <div className="md:hidden absolute top-6 right-4 z-30">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>

          {/* Auth Pill */}
          <div className="hidden md:flex items-center space-x-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-6 py-2 shadow-xl">
            {user ? (
              <>
                {(user.isVeterinarian || user.isAdmin) && (
                  <>
                    <Link
                      to="/dashboard"
                      className="flex items-center space-x-2 text-sm font-bold text-white hover:text-[#7ab84f] transition-colors"
                    >
                      <LayoutDashboard size={18} />
                      <span>Dashboard</span>
                    </Link>
                    <div className="w-px h-6 bg-white/20"></div>
                  </>
                )}
                <Link to="/profile">
                  <img
                    src={getUserAvatarUrl(user)}
                    alt="Profile"
                    className="w-8 h-8 rounded-full border-2 border-white/50 object-cover"
                  />
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/register"
                  className="text-sm font-bold text-white hover:text-[#7ab84f] transition-colors"
                >
                  Register
                </Link>
                <div className="w-px h-4 bg-white/20"></div>
                <Link
                  to="/login"
                  className="flex items-center gap-2 text-sm font-bold text-white hover:text-[#7ab84f] transition-colors"
                >
                  Login <User size={18} />
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 z-20 shadow-xl rounded-2xl max-[550px]:bg-[#4f4848]/40">
            <div className="flex flex-col px-4 py-4 space-y-2">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-2 rounded-lg text-white font-medium hover:bg-white/10 transition-colors"
              >
                Home
              </Link>
              {isSpecialUser && (
                <Link
                  to="/feed"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-2 rounded-lg text-white/90 font-medium hover:bg-white/10 hover:text-white transition-colors"
                >
                  Feed
                </Link>
              )}
              {isSpecialUser && (
                <Link
                  to="/announcements"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-2 rounded-lg text-white/90 font-medium hover:bg-white/10 hover:text-white transition-colors"
                >
                  Announcements
                </Link>
              )}
              {isSpecialUser && (
                <Link
                  to="/jobs"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-2 rounded-lg text-white/90 font-medium hover:bg-white/10 hover:text-white transition-colors"
                >
                  Job Alert
                </Link>
              )}
              <button
                onClick={() => { setShowAbout(true); setIsMobileMenuOpen(false); }}
                className="px-4 py-2 rounded-lg text-white/90 font-medium hover:bg-white/10 hover:text-white transition-colors"
              >
                About US
              </button>
              <div className="border-t border-white/20 pt-2 mt-2">
                {user ? (
                  <>
                    {(user.isVeterinarian || user.isAdmin) && (
                      <Link
                        to="/dashboard"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:bg-white/10 transition-colors"
                      >
                        <LayoutDashboard size={18} />
                        Dashboard
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:bg-white/10 transition-colors"
                    >
                      <img
                        src={getUserAvatarUrl(user)}
                        alt="Profile"
                        className="w-6 h-6 rounded-full object-cover border border-white/50"
                      />
                      Profile
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-2 rounded-lg text-white font-medium hover:bg-white/10 transition-colors"
                    >
                      Register
                    </Link>
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:bg-white/10 transition-colors"
                    >
                      <User size={18} />
                      Login
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Hero Content */}
        {/* <div className="relative z-10 max-w-7xl mx-auto px-8 pt-12 pb-32 flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 bg-white/10 text-white text-xs font-bold uppercase tracking-wider mb-2 backdrop-blur-sm">
                    <span className="w-2 h-2 rounded-full bg-[#7ab84f]"></span> Discover New Updates
                </div>
                <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                    Future of <br/>
                    <span className="text-[#7ab84f]">Veterinary</span> Care
                </h1>
                <p className="text-blue-100 text-lg max-w-lg leading-relaxed">
                    Join India's largest network of veterinary professionals. Connect, share knowledge, find jobs, and grow your practice.
                </p>
                <div className="pt-4 flex flex-wrap gap-4">
                     {user ? (
                        <Link to="/dashboard" className="px-8 py-4 bg-[#7ab84f] text-white rounded-xl font-bold hover:bg-[#6ca545] transition-all shadow-lg shadow-green-900/20 flex items-center gap-2">
                            Go to Dashboard <ArrowUpRight size={20}/>
                        </Link>
                     ) : (
                        <Link to="/register" className="px-8 py-4 bg-[#7ab84f] text-white rounded-xl font-bold hover:bg-[#6ca545] transition-all shadow-lg shadow-green-900/20 flex items-center gap-2">
                            Get Started Now <ArrowUpRight size={20}/>
                        </Link>
                     )}
                     <button className="px-8 py-4 bg-white/10 border border-white/20 text-white rounded-xl font-bold hover:bg-white/20 transition-all backdrop-blur-sm">
                        Learn More
                     </button>
                </div>
                
                <div className="flex items-center gap-4 pt-4 text-sm font-medium text-blue-200">
                    <div className="flex -space-x-2">
                        {[1,2,3,4].map(i => (
                            <img key={i} src={`https://i.pravatar.cc/100?u=${i+20}`} className="w-8 h-8 rounded-full border-2 border-[#0065bd]" alt="User"/>
                        ))}
                    </div>
                    <p>Trusted by 2,000+ Vets</p>
                </div>
            </div>
            
            <div className="md:w-1/2 relative mt-16 md:mt-0 h-[450px] w-full flex items-center justify-center">
                 <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/10 rounded-full blur-[80px]"></div>
                 <div className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl transform rotate-3 hover:rotate-0 transition-all duration-500">
                     <div className="flex items-center gap-4 mb-6">
                         <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                             <img src={vetLogo} alt="VET FORUM INDIA Logo" className="w-8 h-8" />
                         </div>
                         <div>
                             <h3 className="font-bold text-lg text-white">Vet Forum India</h3>
                             <p className="text-blue-200 text-xs">Community Highlights</p>
                         </div>
                     </div>
                     <div className="space-y-4">
                         <div className="bg-white/10 rounded-xl p-4 border border-white/10 flex items-center gap-4">
                             <div className="bg-[#7ab84f] p-3 rounded-lg text-white"><CheckCircle size={20}/></div>
                             <div>
                                 <p className="font-bold text-white text-sm">New Job Openings</p>
                                 <p className="text-blue-200 text-xs">3 new positions added today</p>
                             </div>
                         </div>
                         <div className="bg-white/10 rounded-xl p-4 border border-white/10 flex items-center gap-4">
                             <div className="bg-orange-500 p-3 rounded-lg text-white"><User size={20}/></div>
                             <div>
                                 <p className="font-bold text-white text-sm">New Member Joined</p>
                                 <p className="text-blue-200 text-xs">Dr. Sarah Connor joined the forum</p>
                             </div>
                         </div>
                     </div>
                 </div>
            </div>
        </div> */}
      </div>

      {/* ── Live Webinar Banner ── */}
      {liveWebinar && (
        <div className="relative overflow-hidden bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-900 text-white">
          {/* decorative blobs */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -mr-20 -mt-20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-10 -mb-10 pointer-events-none" />

          <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-6 md:py-8 flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Left: info */}
            <div className="flex items-center gap-5 flex-1">
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1.5 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                    ● LIVE WEBINAR
                  </span>
                </div>
                <h2 className="text-lg md:text-xl font-bold leading-tight">{liveWebinar.topic}</h2>
                <p className="text-purple-200 text-sm mt-0.5">
                  {liveWebinar.speakerName}
                  {liveWebinar.dateTime && (
                    <span className="ml-3 text-purple-300">
                      · {new Date(liveWebinar.dateTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                  {liveWebinar.registrationFees && (
                    <span className="ml-3 font-semibold text-white">
                      · {liveWebinar.registrationFees}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Right: CTA */}
            <Link
              to="/webinar"
              className="flex-shrink-0 inline-flex items-center gap-2 px-7 py-3 bg-white text-purple-700 font-bold rounded-xl hover:bg-purple-50 transition-all shadow-lg shadow-purple-900/30 text-sm md:text-base whitespace-nowrap"
            >
              Register &amp; Join
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        </div>
      )}

      {/* Book Appointment Section - Visible to all, but restricted action */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-12 md:py-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-slate-900">Book Appointment</h3>
            <p className="text-slate-500 text-sm mt-1">Connect with top veterinary specialists</p>
          </div>
          <button
            onClick={() => user ? navigate('/doctors') : navigate('/login')}
            className="text-[#0065bd] font-bold text-sm flex items-center gap-1 hover:underline"
          >
            View all doctors <ArrowUpRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Dynamic Experts List */}
          {loadingExperts ? (
            [1, 2, 3].map(i => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-slate-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="h-10 bg-slate-200 rounded-lg w-full"></div>
              </div>
            ))
          ) : experts.length === 0 ? (
            <div className="col-span-full text-center text-slate-500 py-8">No experts available at the moment.</div>
          ) : (
            experts.map((doctor) => (
              <div key={doctor.id} className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 hover:shadow-lg transition-all flex flex-col h-full">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4 mb-4">
                  <ImageWithFallback
                    src={getExpertPhotoUrl(doctor)}
                    alt={doctor.name}
                    className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover border-2 border-slate-100"
                    fallback={doctor.name?.charAt(0) || 'D'}
                  />
                  <div className="flex-1 w-full overflow-hidden">
                    <h4 className="font-bold text-slate-900 text-sm md:text-base truncate" title={doctor.name}>{doctor.name}</h4>
                    <p className="text-xs md:text-sm text-slate-500 truncate" title={doctor.specialization}>{doctor.specialization}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-0.5">
                        <Star size={12} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-xs font-bold text-slate-700">4.9</span>
                      </div>
                      <span className="text-xs text-slate-400">• {doctor.yearsOfExperience}+ Years</span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto border-t border-slate-50 pt-4 flex flex-col md:flex-row items-center justify-between gap-3">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Next Available Today
                  </div>
                  <button
                    onClick={() => user ? navigate(`/book-doctor/${doctor.id}`) : navigate('/login')}
                    className="bg-[#0065bd] text-white px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold hover:bg-blue-700 transition-colors w-full md:w-auto text-center shadow-lg shadow-blue-100"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Vet Contests Section - Only for special users */}
      {isSpecialUser && (
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-12 md:py-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-slate-900">Vet Contests</h3>
              <p className="text-slate-500 text-sm mt-1">Sharpen your skills and win exciting prizes</p>
            </div>
            <button
              onClick={() => user ? navigate('/contests') : navigate('/login')}
              className="text-[#0065bd] font-bold text-sm flex items-center gap-1 hover:underline"
            >
              View all contests <ArrowUpRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {loadingContests ? (
              [1, 2, 3].map(i => (
                <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2 mb-6"></div>
                  <div className="h-10 bg-slate-200 rounded-lg w-full"></div>
                </div>
              ))
            ) : contests.length === 0 ? (
              <div className="col-span-full text-center text-slate-500 py-8">No active contests at the moment.</div>
            ) : (
              contests.slice(0, 3).map((contest) => (
                <div key={contest.id} className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 hover:shadow-lg transition-all flex flex-col h-full group">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${contest.status === 'live' || contest.status === 'ongoing'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-blue-100 text-blue-600'
                      }`}>
                      {contest.status === 'live' || contest.status === 'ongoing' ? 'Live Now' : contest.status}
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 text-xs">
                      <Users size={14} />
                      <span>{contest.participants} enrolled</span>
                    </div>
                  </div>

                  <h4 className="font-bold text-slate-900 text-base md:text-lg mb-2 group-hover:text-[#0065bd] transition-colors">{contest.title}</h4>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <Calendar size={14} />
                      <span>{new Date(contest.date).toString() !== 'Invalid Date' ? new Date(contest.date).toLocaleDateString() : 'Upcoming'}</span>
                    </div>
                    {contest.prize && (
                      <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <Trophy size={14} className="text-yellow-500" />
                        <span className="font-semibold text-slate-700">{contest.prize}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => user ? navigate('/contests') : navigate('/login')}
                    className="mt-auto bg-white border-2 border-[#0065bd] text-[#0065bd] px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold hover:bg-[#0065bd] hover:text-white transition-all w-full text-center"
                  >
                    Register Now
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}


      {/* Announcements Section - Only for special users */}
      {isSpecialUser && user && (
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-12 md:py-16">
          <div className="flex justify-between items-end mb-6 md:mb-8">
            <h3 className="text-xl md:text-2xl font-bold text-slate-900">Announcements</h3>
            <Link
              to="/announcements"
              className="text-[#0065bd] font-bold text-sm flex items-center gap-1 hover:underline"
            >
              View all <ArrowUpRight size={16} />
            </Link>
          </div>

          <div className="space-y-4">
            {announcements.length > 0 ? (
              announcements.slice(0, 3).map((announcement: any) => (
                <div key={announcement.id} className="bg-white border border-slate-200 rounded-2xl p-4 md:p-8 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-base md:text-lg">
                        {announcement.title.charAt(0)}
                      </div>
                    </div>
                    <div className="flex-1 w-full">
                      <h4 className="text-lg md:text-xl font-bold text-slate-900 mb-2 md:mb-3">{announcement.title}</h4>
                      <p className="text-sm md:text-base text-slate-600 leading-relaxed mb-3 md:mb-4 line-clamp-3 md:line-clamp-none">
                        {announcement.description}
                      </p>
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 text-xs md:text-sm text-slate-500">
                        <span>Posted {new Date(announcement.createdAt).toLocaleDateString()}</span>
                        <span className="hidden md:inline">•</span>
                        <span>By Admin</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-2xl border border-slate-100">
                No announcements available at the moment.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Featured Articles Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-24">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
          <div>
            {/* <h2 className="text-sm font-bold text-[#0065bd] uppercase mb-2 tracking-wider">Knowledge Base</h2> */}
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900">Blogs </h3>
          </div>
          <Link
            to="/blogs"
            className="text-slate-500 hover:text-[#0065bd] font-bold flex items-center gap-2 transition-colors text-sm md:text-base"
          >
            View all blogs <ArrowUpRight size={18} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {featuredBlogs.map((blog, i) => (
            // ... (keep existing blog card mapping)
            <div
              key={blog.id}
              onClick={() => setSelectedBlog(blog)}
              className="group cursor-pointer p-4 bg-white border border-slate-200 rounded-2xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="overflow-hidden rounded-2xl mb-4 aspect-[4/3] shadow-md relative">
                <ImageWithFallback
                  src={getBlogImageUrl(blog)}
                  alt="Article"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  fallback={<span className="text-xs">IMG</span>}
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
              </div>
              <div className="text-xs font-bold text-[#7ab84f] mb-2 uppercase tracking-wide">
                Veterinary Medicine
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-[#0065bd] transition-colors leading-snug">
                {blog.title || "Advances in Veterinary Surgery"}
              </h4>
              <p className="text-slate-500 text-sm line-clamp-2 mb-4 leading-relaxed">
                {stripMarkdown(blog.content)}
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 text-xs overflow-hidden border border-slate-300">
                  {blog.author ? (
                    <ImageWithFallback
                      src={getUserAvatarUrl(blog.author)}
                      alt={blog.authorName || 'Author'}
                      className="w-full h-full object-cover"
                      fallback={blog.author.firstName?.charAt(0) || blog.authorName?.charAt(0) || 'A'}
                    />
                  ) : (
                    (blog.authorName || 'A').charAt(0)
                  )}
                </div>
                <div className="text-xs">
                  <p className="font-bold text-slate-900">
                    {blog.author ? `${blog.author.firstName} ${blog.author.lastName}` : (blog.authorName || 'Anonymous')}
                  </p>
                  <p className="text-slate-400">
                    {new Date(blog.createdAt || Date.now()).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {featuredBlogs.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
              No articles published yet. Check back soon!
            </div>
          )}
        </div>
      </div>

      {/* Featured feed Section - Only for special users */}
      {isSpecialUser && (
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-24">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
            <div>
              {/* <h2 className="text-sm font-bold text-[#0065bd] uppercase mb-2 tracking-wider">Knowledge Base</h2> */}
              <h3 className="text-3xl md:text-4xl font-bold text-slate-900">Feeds </h3>
            </div>
            <Link
              to="/feed"
              className="text-slate-500 hover:text-[#0065bd] font-bold flex items-center gap-2 transition-colors text-sm md:text-base"
            >
              View all feeds <ArrowUpRight size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {featuredFeeds.map((feed, i) => {
              const isExpanded = expandedFeeds.has(feed.id);
              const shouldTruncate = feed.content && feed.content.length > 100;
              const displayContent = shouldTruncate && !isExpanded
                ? feed.content.substring(0, 100) + '...'
                : feed.content;

              return (
                <div
                  key={feed.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 border border-slate-200 overflow-hidden flex-shrink-0">
                      {feed.author ? (
                        <ImageWithFallback
                          src={getUserAvatarUrl(feed.author)}
                          className="w-full h-full object-cover"
                          alt="Author"
                          fallback={feed.author.firstName?.charAt(0) || 'U'}
                        />
                      ) : (
                        (feed.author?.firstName?.charAt(0) || feed.authorName?.charAt(0) || 'U')
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-slate-900 text-sm">
                          {feed.author ? `${feed.author.firstName} ${feed.author.lastName}` : (feed.authorName || 'Anonymous')}
                        </h4>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${(feed.author?.isVeterinarian || feed.authorRole === 'veterinarian')
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-100 text-slate-600'
                          }`}>
                          {feed.author?.isVeterinarian ? 'Vet' : 'User'}
                        </span>
                      </div>
                      <p className="text-slate-500 text-xs">
                        {new Date(feed.createdAt || Date.now()).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {feed.content && (
                    <div className="mb-3">
                      <p className="text-slate-800 leading-relaxed text-sm">
                        {displayContent}
                      </p>
                      {shouldTruncate && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpandFeed(feed.id);
                          }}
                          className="text-blue-600 text-xs font-medium hover:underline mt-1"
                        >
                          {isExpanded ? 'Show less' : 'Show more'}
                        </button>
                      )}
                    </div>
                  )}

                  {(feed.imageUrl || feed.image) && (
                    <div className="rounded-xl overflow-hidden mb-3 bg-slate-100">
                      <img
                        src={getImageUrl(feed.imageUrl || feed.image, 'posts')}
                        alt="Feed content"
                        className="w-full h-32 object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between text-slate-500 text-xs pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Heart size={14} />
                        <span>{feed.likesCount || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle size={14} />
                        <span>{feed.commentsCount || 0}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFeed(feed);
                      }}
                      className="text-blue-600 font-medium hover:underline"
                    >
                      View
                    </button>
                  </div>
                </div>
              );
            })}
            {featuredFeeds.length === 0 && (
              <div className="col-span-full py-8 text-center text-slate-500 bg-white/50 rounded-2xl border border-dashed border-slate-200">
                No recent updates. Join the conversation!
              </div>
            )}
          </div>
        </div>
      )}




      {/* Quiz/Contests Section */}
      {contests.length > 0 && user && isSpecialUser && (
        <div className="px-4 md:px-8 lg:px-16 py-24 bg-[#6EB04F30]">
          <h3 className="text-2xl md:text-3xl font-bold text-slate-900 max-w-7xl mx-auto mb-12">
            Quizz
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 max-w-7xl mx-auto px-0 md:px-8 ">
            {
              (contests.map((contest) => (
                <div key={contest.id} className="bg-slate-50 p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-full hover:shadow-md transition-shadow relative group">

                  {/* Admin Edit Button */}
                  {isAdmin && (
                    <button
                      // onClick={() => handleOpenEdit(contest)}
                      className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-full transition-colors opacity-0 group-hover:opacity-100 z-10"
                      title="Edit Contest"
                    >
                      <Edit size={16} />
                    </button>
                  )}

                  <div>
                    <div className="flex justify-between items-start mb-4 pr-10">
                      <h3 className="text-lg font-bold text-slate-800 w-full leading-tight">{contest.title}</h3>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase flex items-center gap-1 absolute top-6 right-6 group-hover:opacity-0 transition-opacity
                                  ${contest.status === 'live' ? 'bg-red-100 text-red-600 animate-pulse' :
                          contest.status === 'upcoming' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                        {contest.status === 'live' && <span className="w-2 h-2 rounded-full bg-red-600"></span>}
                        {contest.status}
                      </span>
                    </div>

                    <p className="text-sm text-slate-500 mb-6 font-medium">{contest.category}</p>
                    <p className="text-sm text-slate-600 mb-6 line-clamp-2">
                      {contest.description || 'Join this exciting contest to test your knowledge against top professionals.'}
                    </p>

                    <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-6 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <span className="bg-orange-100 text-orange-600 p-1 rounded"><Award size={14} /></span>
                        Intermediate
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-yellow-100 text-yellow-600 p-1 rounded"><Award size={14} /></span>
                        {contest.credits}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-green-600" />
                        {contest.date}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-green-600" />
                        {contest.duration}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-blue-500" />
                        {contest.participants} vets
                      </div>
                      <div className="flex items-center gap-2">
                        <Trophy size={16} className="text-yellow-500" />
                        {contest.prize}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-4 flex justify-between items-center mt-auto border border-slate-100">
                    <span className="text-xl font-bold text-slate-700">₹{contest.price}</span>
                    <button
                      onClick={() => navigate('/contests')}
                      className={`px-6 py-2 rounded-lg font-semibold text-sm transition-colors
                              ${contest.status === 'completed'
                          ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                          : 'bg-green-600 text-white hover:bg-green-700 shadow-md'}`}>
                      {contest.status === 'completed' ? 'Closed' : contest.status === 'live' ? 'Join Live' : 'Register'}
                    </button>
                  </div>
                </div>
              ))
              )}
          </div>
        </div>
      )}


      {/* Featured Job Openings (Public View) - Only for special users */}
      {isSpecialUser && (
        <div className="bg-[#006CB51A] py-24 px-4 md:px-8 lg:px-16">
          <div className="max-w-7xl mx-auto px-0 md:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900">
                  Featured Job Openings
                </h3>
                <p className="text-slate-500 mt-2 text-sm md:text-base">
                  Find your next career opportunity in veterinary medicine.
                </p>
              </div>
              <Link
                to="/jobs"
                className="px-6 py-3 bg-white border border-slate-200 text-[#0065bd] font-bold rounded-xl hover:bg-slate-50 hover:border-[#0065bd] flex items-center gap-2 transition-all shadow-sm text-sm md:text-base"
              >
                View all Jobs <ArrowUpRight size={18} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {featuredJobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className="bg-white border border-slate-200 p-8 rounded-2xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0065bd] flex items-center justify-center font-bold text-xl group-hover:bg-[#0065bd] group-hover:text-white transition-colors">
                      {job.organization.charAt(0)}
                    </div>
                    <span className="bg-green-50 text-green-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                      {job.type}
                    </span>
                  </div>

                  <h4 className="font-bold text-lg text-slate-900 mb-1 group-hover:text-[#0065bd] transition-colors">
                    {job.title}
                  </h4>
                  <p className="font-medium text-slate-500 text-sm mb-6">
                    {job.organization}
                  </p>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-bold text-slate-400">EXP:</span>{" "}
                      {job.experience}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-bold text-slate-400">LOC:</span>{" "}
                      {job.location}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
                    <span className="text-xs text-slate-400 font-medium">
                      2 days ago
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedJob(job); }}
                      className="text-[#0065bd] text-sm font-bold hover:underline"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
              {featuredJobs.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-500 bg-white/50 rounded-2xl border border-dashed border-slate-200">
                  No active job openings at the moment.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Blue Bottom CTA Section */}
      {/* <div className="bg-[#0065bd] py-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
          <svg
            viewBox="0 0 1440 320"
            className="absolute bottom-0 w-full text-white fill-current"
          >
            <path
              fillOpacity="1"
              d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
        </div>

        <div className="max-w-4xl mx-auto px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Get our stories delivered From <br /> us to your inbox weekly.
          </h2>
          <p className="text-blue-100 text-sm md:text-base max-w-xl mx-auto mb-10 leading-relaxed opacity-80">
            Get a response tomorrow if you submit by 9pm today. If we received
            after 9pm will get a reponse the following day.
          </p>
        </div>
      </div> */}

      {/* Contact Us Modal */}
      {showContact && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-slate-900">Contact Us</h2>
                <button
                  onClick={() => setShowContact(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={24} className="text-slate-400" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="text-center mb-8">
                  <img src={vetfulllogo} alt="VET FORUM INDIA Logo" className="mx-auto mb-4" />
                  <p className="text-lg text-slate-600">We're here to help and answer any questions you might have.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-blue-50 p-6 rounded-xl">
                    <h3 className="text-xl font-bold text-blue-900 mb-4">General Inquiries</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-blue-900">Email</p>
                          <a href="mailto:elevate@vetforumindia.com" className="text-blue-700 hover:underline">
                            elevate@vetforumindia.com
                          </a>
                        </div>
                      </div>
                      <p className="text-sm text-blue-700">For partnerships, collaborations, feedback, and general inquiries.</p>
                    </div>
                  </div>

                  <div className="bg-green-50 p-6 rounded-xl">
                    <h3 className="text-xl font-bold text-green-900 mb-4">Technical Support</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-green-900">Email</p>
                          <a href="mailto:support@vetforumindia.com" className="text-green-700 hover:underline">
                            support@vetforumindia.com
                          </a>
                        </div>
                      </div>
                      <p className="text-sm text-green-700">For technical issues, account problems, and platform support.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-xl">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Office Hours</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-600">
                    <div>
                      <p className="font-semibold">Monday - Friday</p>
                      <p>9:00 AM - 6:00 PM (IST)</p>
                    </div>
                    <div>
                      <p className="font-semibold">Response Time</p>
                      <p>Within 24-48 hours</p>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-slate-600">Follow us on social media for updates and community discussions</p>
                  <div className="flex justify-center gap-4 mt-4">
                    <a href="https://www.facebook.com/vetforumindia" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                    </a>
                    <a href="https://www.instagram.com/vetforumindia?igsh=aGpxZTRhaHF5Zms5" target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-700">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.117.626c-.798.310-1.473.823-2.003 1.353-.53.53-1.042 1.205-1.352 2.003-.297.784-.500 1.657-.556 2.935C.017 8.333 0 8.74 0 12s.015 3.667.072 4.947c.056 1.277.259 2.148.556 2.932.31.802.822 1.469 1.353 2.002.53.53 1.205 1.039 2.002 1.353.784.296 1.655.499 2.932.556C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.057 2.148-.26 2.932-.556.802-.309 1.469-.822 2.003-1.352.53-.53 1.039-1.205 1.353-2.002.297-.784.499-1.655.556-2.932.057-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.057-1.277-.259-2.148-.556-2.933-.309-.802-.822-1.469-1.352-2.002-.53-.53-1.205-1.042-2.002-1.353-.784-.296-1.655-.499-2.932-.556C15.667.017 15.26 0 12 0zm0 2.16c3.203 0 3.585.009 4.849.070 1.171.054 1.805.244 2.227.408.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.355 1.056.41 2.223.061 1.265.07 1.645.07 4.849 0 3.203-.009 3.583-.07 4.849-.054 1.171-.244 1.805-.408 2.227-.217.562-.477.96-.896 1.382-.42.419-.819.679-1.381.896-.422.164-1.056.355-2.223.41-1.265.061-1.645.07-4.849.07-3.203 0-3.583-.009-4.849-.07-1.171-.054-1.805-.244-2.227-.408-.562-.217-.96-.477-1.382-.896-.419-.42-.679-.819-.896-1.381-.164-.422-.355-1.056-.41-2.223-.061-1.265-.07-1.645-.07-4.849 0-3.203.009-3.583.07-4.849.054-1.171.244-1.805.408-2.227.217-.562.477-.96.896-1.382.42-.419.819-.679 1.381-.896.422-.164 1.056-.355 2.223-.41 1.266-.061 1.646-.07 4.849-.07zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm4.915-10.87c-.796 0-1.44.645-1.44 1.44s.645 1.44 1.44 1.44c.795 0 1.44-.645 1.44-1.44s-.645-1.44-1.44-1.44z" /></svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Terms & Conditions Modal */}
      {showTerms && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-slate-900">Terms & Conditions</h2>
                <button
                  onClick={() => setShowTerms(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={24} className="text-slate-400" />
                </button>
              </div>

              <div className="prose max-w-none space-y-6 text-sm">
                <p className="text-slate-500">Last updated: January 2026</p>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">1. Acceptance of Terms</h3>
                  <p className="text-slate-600 leading-relaxed">By accessing and using Vet Forum India, you accept and agree to be bound by the terms and provision of this agreement.</p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">2. User Accounts</h3>
                  <p className="text-slate-600 leading-relaxed mb-2">When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for:</p>
                  <ul className="list-disc pl-6 text-slate-600 space-y-1">
                    <li>Safeguarding your password and account information</li>
                    <li>All activities that occur under your account</li>
                    <li>Notifying us immediately of any unauthorized use</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">3. Professional Verification</h3>
                  <p className="text-slate-600 leading-relaxed">Veterinary professionals must provide valid credentials for verification. Misrepresentation of professional status may result in account suspension or termination.</p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">4. Content Guidelines</h3>
                  <p className="text-slate-600 leading-relaxed mb-2">Users agree not to post content that is:</p>
                  <ul className="list-disc pl-6 text-slate-600 space-y-1">
                    <li>Illegal, harmful, or offensive</li>
                    <li>Infringing on intellectual property rights</li>
                    <li>Spam or promotional without permission</li>
                    <li>Misleading medical advice without proper credentials</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">5. Intellectual Property</h3>
                  <p className="text-slate-600 leading-relaxed">The platform and its original content remain the property of Vet Forum India. Users retain rights to their original content but grant us license to use, display, and distribute it on our platform.</p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">6. Limitation of Liability</h3>
                  <p className="text-slate-600 leading-relaxed">Vet Forum India shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the platform.</p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">7. Termination</h3>
                  <p className="text-slate-600 leading-relaxed">We may terminate or suspend your account immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users.</p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">8. Changes to Terms</h3>
                  <p className="text-slate-600 leading-relaxed">We reserve the right to modify these terms at any time. Users will be notified of significant changes via email or platform notification.</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-slate-600">For questions about these Terms & Conditions, please contact us at <a href="mailto:elevate@vetforumindia.com" className="text-blue-600 hover:underline">elevate@vetforumindia.com</a></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-slate-900">Privacy Policy</h2>
                <button
                  onClick={() => setShowPrivacy(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={24} className="text-slate-400" />
                </button>
              </div>

              <div className="prose max-w-none space-y-6 text-sm">
                <p className="text-slate-500">Last updated: January 2026</p>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">1. Information We Collect</h3>
                  <p className="text-slate-600 leading-relaxed mb-2">We collect information you provide directly to us, such as:</p>
                  <ul className="list-disc pl-6 text-slate-600 space-y-1">
                    <li>Account registration information (name, email, professional credentials)</li>
                    <li>Profile information and content you post</li>
                    <li>Communications with us and other users</li>
                    <li>Usage data and analytics</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">2. How We Use Your Information</h3>
                  <p className="text-slate-600 leading-relaxed mb-2">We use the information we collect to:</p>
                  <ul className="list-disc pl-6 text-slate-600 space-y-1">
                    <li>Provide, maintain, and improve our services</li>
                    <li>Verify professional credentials</li>
                    <li>Send you technical notices and support messages</li>
                    <li>Facilitate communication between users</li>
                    <li>Analyze usage patterns to improve user experience</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">3. Information Sharing</h3>
                  <p className="text-slate-600 leading-relaxed mb-2">We do not sell, trade, or rent your personal information. We may share information in these limited circumstances:</p>
                  <ul className="list-disc pl-6 text-slate-600 space-y-1">
                    <li>With your consent</li>
                    <li>To comply with legal obligations</li>
                    <li>To protect our rights and safety</li>
                    <li>With service providers who assist our operations</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">4. Data Security</h3>
                  <p className="text-slate-600 leading-relaxed">We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">5. Your Rights</h3>
                  <p className="text-slate-600 leading-relaxed mb-2">You have the right to:</p>
                  <ul className="list-disc pl-6 text-slate-600 space-y-1">
                    <li>Access and update your personal information</li>
                    <li>Delete your account and associated data</li>
                    <li>Opt-out of non-essential communications</li>
                    <li>Request a copy of your data</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">6. Cookies and Tracking</h3>
                  <p className="text-slate-600 leading-relaxed">We use cookies and similar technologies to enhance your experience, analyze usage, and provide personalized content. You can control cookie settings through your browser.</p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">7. Third-Party Services</h3>
                  <p className="text-slate-600 leading-relaxed">Our platform may contain links to third-party websites or services. We are not responsible for their privacy practices and encourage you to review their policies.</p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">8. Changes to Privacy Policy</h3>
                  <p className="text-slate-600 leading-relaxed">We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-slate-600">For questions about this Privacy Policy, please contact us at <a href="mailto:elevate@vetforumindia.com" className="text-blue-600 hover:underline">elevate@vetforumindia.com</a></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* About Us Modal */}
      {showAbout && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-slate-900">About Vet Forum India</h2>
                <button
                  onClick={() => setShowAbout(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={24} className="text-slate-400" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-8">
                  <img src={vetfulllogo} alt="VET FORUM INDIA Logo" />
                  {/* <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-green-600 rounded-2xl flex items-center justify-center">
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">VET FORUM INDIA</h3>
                    <p className="text-green-600 font-semibold">Connecting Veterinary Professionals</p>
                  </div> */}
                </div>

                <div className="prose max-w-none">
                  <p className="text-lg text-slate-600 leading-relaxed mb-6">
                    Vet Forum India is the first ever dedicated social platform exclusively for veterinarians across the country. Vet Forum India is not just a platform it is a movement to strengthen the veterinary ecosystem, promote continuous learning and grow together as a unified professional community.
                    Join us in shaping the future of veterinary science in India together, we learn, connect, innovate and lead.
                  </p>

                  <div className="grid md:grid-cols-2 gap-8 my-8">
                    <div className="bg-blue-50 p-6 rounded-xl">
                      <h4 className="text-xl font-bold text-blue-900 mb-3">Our Mission</h4>
                      <p className="text-blue-700">
                        Is to unite veterinary professionals on a single digital platform where they can collaborate, share knowledge, exchange clinical experiences and support each other’s professional growth.
                      </p>
                    </div>

                    <div className="bg-green-50 p-6 rounded-xl">
                      <h4 className="text-xl font-bold text-green-900 mb-3">Our Vision</h4>
                      <p className="text-green-700">
                        We aim to create a thriving community that empowers veterinarians to excel in their careers through meaningful discussions, mentorship, case based learning, innovation and peer-to-peer networking.
                      </p>
                    </div>
                  </div>

                  <h4 className="text-xl font-bold text-slate-900 mb-4">What We Offer</h4>
                  <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <Users className="text-blue-600" size={24} />
                      </div>
                      <h5 className="font-bold text-slate-900 mb-2">Professional Network</h5>
                      <p className="text-sm text-slate-600">Connect with veterinarians, students, and industry experts</p>
                    </div>

                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <Edit className="text-green-600" size={24} />
                      </div>
                      <h5 className="font-bold text-slate-900 mb-2">Knowledge Sharing</h5>
                      <p className="text-sm text-slate-600">Publish articles, share experiences, and learn from peers</p>
                    </div>

                    <div className="text-center">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <Trophy className="text-orange-600" size={24} />
                      </div>
                      <h5 className="font-bold text-slate-900 mb-2">Career Growth</h5>
                      <p className="text-sm text-slate-600">Find job opportunities and advance your veterinary career</p>
                    </div>
                  </div>

                  <p className="text-slate-600 leading-relaxed">
                    Join thousands of veterinary professionals who trust Vet Forum India for their professional development, networking needs and staying updated with the latest in the veterinary profession. Together we're building a stronger, more connected veterinary community across India.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Blog Detail Modal */}
      {selectedBlog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <div className="text-xs font-bold text-[#7ab84f] mb-2 uppercase tracking-wide">
                    Veterinary Medicine
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">{selectedBlog.title}</h2>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">
                      {(selectedBlog.authorName || 'A').charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{selectedBlog.authorName || 'Anonymous'}</p>
                      <p className="text-slate-400 text-sm">
                        {new Date(selectedBlog.createdAt || Date.now()).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedBlog(null)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors ml-4"
                >
                  <X size={24} className="text-slate-400" />
                </button>
              </div>

              {selectedBlog.imageUrl && (
                <div className="mb-6">
                  <img
                    src={selectedBlog.imageUrl}
                    alt={selectedBlog.title}
                    className="w-full h-64 object-cover rounded-xl"
                  />
                </div>
              )}

              <div className="prose max-w-none relative">
                {!user ? (
                  <>
                    <div className="relative">
                      <p className="text-lg text-slate-600 leading-relaxed whitespace-pre-wrap">
                        {selectedBlog.content.substring(0, 300)}...
                      </p>
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white pointer-events-none"></div>
                    </div>
                    <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-xl text-center">
                      <h3 className="text-lg font-bold text-blue-900 mb-2">Continue Reading</h3>
                      <p className="text-blue-700 mb-4">Sign in to read the full article and access exclusive veterinary content</p>
                      <div className="flex gap-3 justify-center">
                        <Link
                          to="/login"
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                          Sign In
                        </Link>
                        <Link
                          to="/register"
                          className="px-6 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                        >
                          Sign Up
                        </Link>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-lg text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {selectedBlog.content}
                  </p>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Suggested Blogs</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {featuredBlogs.filter(blog => blog.id !== selectedBlog.id).slice(0, 2).map((blog, i) => (
                    <div
                      key={blog.id}
                      onClick={() => user ? setSelectedBlog(blog) : null}
                      className={`flex gap-4 p-4 bg-slate-50 rounded-xl transition-colors ${user ? 'hover:bg-slate-100 cursor-pointer' : 'opacity-60 cursor-not-allowed'
                        }`}
                    >
                      <img
                        src={getBlogImageUrl(blog)}
                        alt={blog.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 text-sm mb-1 line-clamp-2">{blog.title}</h4>
                        <p className="text-xs text-slate-500">
                          {blog.author ? `${blog.author.firstName} ${blog.author.lastName}` : (blog.authorName || 'Anonymous')}
                        </p>
                        {!user && <p className="text-xs text-blue-600 mt-1">Login to read</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feed Detail Modal */}
      {selectedFeed && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 border border-slate-200 overflow-hidden">
                    {selectedFeed.author ? (
                      <img src={getUserAvatarUrl(selectedFeed.author)} className="w-full h-full object-cover" alt="Author" />
                    ) : (
                      (selectedFeed.author?.firstName?.charAt(0) || selectedFeed.authorName?.charAt(0) || 'U')
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">
                      {selectedFeed.author ? `${selectedFeed.author.firstName} ${selectedFeed.author.lastName}` : (selectedFeed.authorName || 'Anonymous')}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${(selectedFeed.author?.isVeterinarian || selectedFeed.authorRole === 'veterinarian')
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-100 text-slate-600'
                        }`}>
                        {selectedFeed.author?.isVeterinarian ? 'Veterinarian' : (selectedFeed.authorRole || 'User')}
                      </span>
                      <span className="text-slate-400 text-xs">
                        {new Date(selectedFeed.createdAt || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFeed(null)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors ml-4"
                >
                  <X size={24} className="text-slate-400" />
                </button>
              </div>

              <div className="space-y-6">
                {!user ? (
                  <>
                    <div className="relative">
                      <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">
                        {selectedFeed.content ? selectedFeed.content.substring(0, 200) + '...' : 'This is an interesting post from our veterinary community...'}
                      </p>
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white pointer-events-none"></div>
                    </div>
                    <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-xl text-center">
                      <h3 className="text-lg font-bold text-blue-900 mb-2">Join the Conversation</h3>
                      <p className="text-blue-700 mb-4">Sign in to read the full post and engage with the community</p>
                      <div className="flex gap-3 justify-center">
                        <Link
                          to="/login"
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                          Sign In
                        </Link>
                        <Link
                          to="/register"
                          className="px-6 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                        >
                          Sign Up
                        </Link>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {selectedFeed.content && (
                      <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">
                        {selectedFeed.content}
                      </p>
                    )}

                    {(selectedFeed.imageUrl || selectedFeed.image) && (
                      <div className="rounded-xl overflow-hidden bg-slate-100">
                        <img
                          src={selectedFeed.imageUrl || selectedFeed.image}
                          alt="Feed content"
                          className="w-full h-auto object-cover max-h-[400px]"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-6 text-slate-500 pt-4 border-t border-slate-200">
                      <div className="flex items-center gap-2">
                        <Heart size={20} />
                        <span>{selectedFeed.likesCount || 0} likes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageCircle size={20} />
                        <span>{selectedFeed.commentsCount || 0} comments</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Recent Feeds</h3>
                <div className="space-y-3">
                  {featuredFeeds.filter(feed => feed.id !== selectedFeed.id).slice(0, 2).map((feed) => (
                    <div
                      key={feed.id}
                      onClick={() => user ? setSelectedFeed(feed) : null}
                      className={`flex gap-4 p-4 bg-slate-50 rounded-xl transition-colors ${user ? 'hover:bg-slate-100 cursor-pointer' : 'opacity-60 cursor-not-allowed'
                        }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 border border-slate-200 overflow-hidden flex-shrink-0">
                        {feed.author?.profilePhoto ? (
                          <img src={feed.author.profilePhoto} className="w-full h-full object-cover" alt="Author" />
                        ) : (
                          (feed.author?.firstName?.charAt(0) || feed.authorName?.charAt(0) || 'U')
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 text-sm mb-1">
                          {feed.author ? `${feed.author.firstName} ${feed.author.lastName}` : (feed.authorName || 'Anonymous')}
                        </h4>
                        <p className="text-xs text-slate-600 line-clamp-2">{feed.content || 'Shared a post'}</p>
                        {!user && <p className="text-xs text-blue-600 mt-1">Login to read</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Job Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-xl bg-blue-50 text-[#0065bd] flex items-center justify-center font-bold text-2xl">
                      {selectedJob.organization.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">{selectedJob.title}</h2>
                      <p className="text-lg text-slate-600">{selectedJob.organization}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="bg-green-50 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                      {selectedJob.type}
                    </span>
                    <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
                      {selectedJob.location}
                    </span>
                    <span className="bg-orange-50 text-orange-700 text-xs font-bold px-3 py-1 rounded-full">
                      {selectedJob.experience}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors ml-4"
                >
                  <X size={24} className="text-slate-400" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">Job Description</h3>
                  {!user ? (
                    <>
                      <div className="relative">
                        <p className="text-slate-600 leading-relaxed">
                          We are looking for a dedicated veterinary professional to join our team. The ideal candidate will have strong clinical skills...
                        </p>
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white pointer-events-none"></div>
                      </div>
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl text-center">
                        <h4 className="text-md font-bold text-blue-900 mb-2">View Full Job Details</h4>
                        <p className="text-blue-700 text-sm mb-3">Sign in to see complete job requirements and apply</p>
                        <div className="flex gap-2 justify-center">
                          <Link
                            to="/login"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                          >
                            Sign In
                          </Link>
                          <Link
                            to="/register"
                            className="px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
                          >
                            Sign Up
                          </Link>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-slate-600 leading-relaxed">
                      {selectedJob.description || 'We are looking for a dedicated veterinary professional to join our team. The ideal candidate will have strong clinical skills, excellent communication abilities, and a passion for animal care.'}
                    </p>
                  )}
                </div>

                {user && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-bold text-slate-900 mb-2">Requirements</h4>
                      <ul className="text-sm text-slate-600 space-y-1">
                        <li>• {selectedJob.qualification || 'BVSc & AH or equivalent degree'}</li>
                        <li>• {selectedJob.experience} of experience</li>
                        <li>• Valid veterinary license</li>
                        <li>• Strong communication skills</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 mb-2">Benefits</h4>
                      <ul className="text-sm text-slate-600 space-y-1">
                        <li>• Competitive salary: {selectedJob.salary || 'As per industry standards'}</li>
                        <li>• Health insurance</li>
                        <li>• Professional development</li>
                        <li>• Flexible working hours</li>
                      </ul>
                    </div>
                  </div>
                )}

                {user && (
                  <div className="pt-6 border-t border-slate-200">
                    <button className="w-full bg-[#0065bd] text-white py-3 px-6 rounded-xl font-bold hover:bg-blue-700 transition-colors">
                      Apply Now
                    </button>
                  </div>
                )}

                <div className="pt-6 border-t border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Similar Jobs</h3>
                  <div className="space-y-3">
                    {featuredJobs.filter(job => job.id !== selectedJob.id).slice(0, 2).map((job) => (
                      <div
                        key={job.id}
                        onClick={() => user ? setSelectedJob(job) : null}
                        className={`flex items-center gap-4 p-4 bg-slate-50 rounded-xl transition-colors ${user ? 'hover:bg-slate-100 cursor-pointer' : 'opacity-60 cursor-not-allowed'
                          }`}
                      >
                        <div className="w-12 h-12 rounded-lg bg-blue-50 text-[#0065bd] flex items-center justify-center font-bold">
                          {job.organization.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-900 text-sm">{job.title}</h4>
                          <p className="text-xs text-slate-500">{job.organization} • {job.location}</p>
                          {!user && <p className="text-xs text-blue-600 mt-1">Login to view details</p>}
                        </div>
                        <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full font-medium">
                          {job.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gradient-to-r from-blue-50 via-white to-green-50 border-t border-slate-200 pt-16 md:pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-12">
            {/* Brand Section */}
            <div className="flex flex-col lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div>
                  <img src={vetLogo} alt="VET FORUM INDIA" className="h-16 w-auto" />
                </div>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Vet Forum India is the first ever dedicated social platform exclusively for veterinarians across the country. Vet Forum India is not just a platform it is a movement to strengthen the veterinary ecosystem, promote continuous learning and grow together as a unified professional community.
                <br />
                Join us in shaping the future of veterinary science in India together, we learn, connect, innovate and lead.
              </p>
              {/* Social Media Icons */}
              <div className="flex gap-3">
                {/* Facebook */}
                <a href="https://www.facebook.com/vetforumindia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-blue-100 hover:bg-blue-600 text-blue-600 hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110" title="Facebook">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                </a>
                {/* WhatsApp */}
                <a href="https://wa.me/91XXXXXXXXXX"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-[#25D366] hover:bg-[#20bd5c] text-white flex items-center justify-center transition-all duration-300 hover:scale-110" title="WhatsApp">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-4.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </a>
                {/* Instagram */}
                <a href="https://www.instagram.com/vetforumindia?igsh=aGpxZTRhaHF5Zms5"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-gradient-to-r from-pink-100 to-purple-100 hover:from-pink-600 hover:to-purple-600 text-pink-600 hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110" title="Instagram">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.117.626c-.798.310-1.473.823-2.003 1.353-.53.53-1.042 1.205-1.352 2.003-.297.784-.500 1.657-.556 2.935C.017 8.333 0 8.74 0 12s.015 3.667.072 4.947c.056 1.277.259 2.148.556 2.932.31.802.822 1.469 1.353 2.002.53.53 1.205 1.039 2.002 1.353.784.296 1.655.499 2.932.556C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.057 2.148-.26 2.932-.556.802-.309 1.469-.822 2.003-1.352.53-.53 1.039-1.205 1.353-2.002.297-.784.499-1.655.556-2.932.057-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.057-1.277-.259-2.148-.556-2.933-.309-.802-.822-1.469-1.352-2.002-.53-.53-1.205-1.042-2.002-1.353-.784-.296-1.655-.499-2.932-.556C15.667.017 15.26 0 12 0zm0 2.16c3.203 0 3.585.009 4.849.070 1.171.054 1.805.244 2.227.408.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.355 1.056.41 2.223.061 1.265.07 1.645.07 4.849 0 3.203-.009 3.583-.07 4.849-.054 1.171-.244 1.805-.408 2.227-.217.562-.477.96-.896 1.382-.42.419-.819.679-1.381.896-.422.164-1.056.355-2.223.41-1.265.061-1.645.07-4.849.07-3.203 0-3.583-.009-4.849-.07-1.171-.054-1.805-.244-2.227-.408-.562-.217-.96-.477-1.382-.896-.419-.42-.679-.819-.896-1.381-.164-.422-.355-1.056-.41-2.223-.061-1.265-.07-1.645-.07-4.849 0-3.203.009-3.583.07-4.849.054-1.171.244-1.805.408-2.227.217-.562.477-.96.896-1.382.42-.419.819-.679 1.381-.896.422-.164 1.056-.355 2.223-.41 1.266-.061 1.646-.07 4.849-.07zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm4.915-10.87c-.796 0-1.44.645-1.44 1.44s.645 1.44 1.44 1.44c.795 0 1.44-.645 1.44-1.44s-.645-1.44-1.44-1.44z" /></svg>
                </a>
              </div>
            </div>

            {/* For Veterinary Doctors */}
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
                <div className="w-1 h-4 bg-gradient-to-b from-blue-600 to-green-600 rounded"></div>
                For Vets
              </h4>
              <ul className="space-y-3">
                {isSpecialUser && <li><Link to="/contests" className="text-sm text-slate-600 hover:text-blue-600 transition-colors font-medium">Evolve</Link></li>}
                <li><Link to="/doctors" className="text-sm text-slate-600 hover:text-blue-600 transition-colors font-medium">Experts Consultations</Link></li>
                <li><Link to="/blogs" className="text-sm text-slate-600 hover:text-blue-600 transition-colors font-medium">Elevate</Link></li>
                {isSpecialUser && <li><Link to="/jobs" className="text-sm text-slate-600 hover:text-blue-600 transition-colors font-medium">Job Opportunities</Link></li>}
                {isSpecialUser && <li><Link to="/feed" className="text-sm text-slate-600 hover:text-blue-600 transition-colors font-medium">Interact with Peers</Link></li>}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
                <div className="w-1 h-4 bg-gradient-to-b from-blue-600 to-green-600 rounded"></div>
                Company
              </h4>
              <ul className="space-y-3">
                <li><button onClick={() => setShowAbout(true)} className="text-sm text-slate-600 hover:text-blue-600 transition-colors font-medium text-left">About Us</button></li>
                <li><button onClick={() => setShowContact(true)} className="text-sm text-slate-600 hover:text-blue-600 transition-colors font-medium text-left">Contact Us</button></li>
                <li><button onClick={() => setShowPrivacy(true)} className="text-sm text-slate-600 hover:text-blue-600 transition-colors font-medium text-left">Privacy Policy</button></li>
                <li><button onClick={() => setShowTerms(true)} className="text-sm text-slate-600 hover:text-blue-600 transition-colors font-medium text-left">Terms & Conditions</button></li>
              </ul>
              <div className="mt-6 space-y-2 text-sm text-slate-600">
                <p>To connect: <a href="mailto:elevate@vetforumindia.com" className="text-blue-600 hover:text-blue-800 transition-colors font-medium">elevate@vetforumindia.com</a></p>
                <p>Technical issue: <a href="mailto:support@vetforumindia.com" className="text-blue-600 hover:text-blue-800 transition-colors font-medium">support@vetforumindia.com</a></p>
              </div>
            </div>
          </div>

          {/* Divider & Bottom Section */}
          <div className="border-t border-slate-200 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-xs text-slate-500">
                @2026 Vet Forum India. All Rights Reserved. Empowering & Connecting Veterinary Professionals Across India.
              </p>
              <div className="flex gap-6 text-xs text-slate-500">
                <Link to="/" className="hover:text-blue-600 transition-colors font-medium">Privacy</Link>
                <Link to="/" className="hover:text-blue-600 transition-colors font-medium">Terms</Link>
                <Link to="/" className="hover:text-blue-600 transition-colors font-medium">Sitemap</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
