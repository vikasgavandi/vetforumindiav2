import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import {
  Menu, X, Home, Calendar, Video, FileText,
  Users, Settings, LogOut, Briefcase, PlusCircle,
  MessageSquare, Search, HelpCircle, Trophy, Bell,
  Newspaper, Megaphone, Activity, ShieldCheck, Clock, Monitor
} from 'lucide-react';
import { AIChatWidget } from './AIChatWidget';
import vetLogo from '../images/Vet forum india logo final.svg';
import { getUserAvatarUrl } from '../services/imageUtils';
import { API_BASE_URL } from '../src/config';
import { Announcement } from '../types';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Notification States
  const [notifications, setNotifications] = useState<Announcement[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Fetch Announcements and Calculate Unread Count
  React.useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/announcements`);
        if (response.ok) {
          const data = await response.json();
          // Handle both array and paginated response structure
          const fetchedAnnouncements: Announcement[] = Array.isArray(data) ? data : (data.data || []);

          setNotifications(fetchedAnnouncements.slice(0, 5)); // Keep top 5 for dropdown

          // Check last read time
          const lastReadTime = localStorage.getItem('lastAnnouncementReadTime');
          if (lastReadTime) {
            const unread = fetchedAnnouncements.filter(a => new Date(a.createdAt) > new Date(lastReadTime));
            setUnreadCount(unread.length);
          } else {
            setUnreadCount(fetchedAnnouncements.length);
          }
        }
      } catch (error) {
        console.error('Failed to fetch announcements for notifications', error);
      }
    };

    if (user) {
      fetchAnnouncements();
    }
  }, [user]);

  const handleNotificationClick = () => {
    setIsNotificationOpen(!isNotificationOpen);
    if (!isNotificationOpen && unreadCount > 0) {
      // Mark as read when opening
      setUnreadCount(0);
      localStorage.setItem('lastAnnouncementReadTime', new Date().toISOString());
    }
  };

  const handleNotificationsBlur = () => {
    // Small delay to allow clicking inside the dropdown
    setTimeout(() => {
      setIsNotificationOpen(false);
    }, 200);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all mb-1 ${isActive
          ? 'bg-green-50 text-green-700 font-semibold'
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
          }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <Icon size={20} className={isActive ? "text-green-600" : "text-slate-400"} />
        <span>{label}</span>
      </Link>
    );
  };

  if (!user) {
    return <div className="min-h-screen bg-slate-50">{children}</div>;
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-100 h-full flex-shrink-0">
        <div className="p-6 flex items-center space-x-2">
          {/* <div className="p-2 rounded-lg">
                <img src={vetLogo} alt="Vet Forum India Logo" className="w-16 h-16" />
                </div>
                <div>
                <h1 className="text-xl font-bold text-slate-800 leading-tight">VET FORUM<br/><span className="text-blue-600">INDIA</span></h1>
                </div> */}
          <img src={vetLogo} alt="Vet Forum India Logo" />
        </div>

        <nav className="flex-1 px-4 py-2 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-xs font-bold text-slate-400 uppercase mb-4 tracking-wider">Main Menu</p>
          {(user.isVeterinarian || user.isAdmin) && <NavItem to="/dashboard" icon={Home} label="Dashboard" />}
          {user.isAdmin && <NavItem to="/admin/approvals" icon={ShieldCheck} label="Vet Approvals" />}
          {user.isAdmin && <NavItem to="/admin/doctors" icon={Users} label="Manage Doctors" />}
          {user.role === 'veterinarian' && <NavItem to="/doctor/availability" icon={Clock} label="My Slots" />}
          {(user.isVeterinarian || user.isAdmin) && <NavItem to="/feed" icon={Activity} label="Social Feed" />}
          {(user.isVeterinarian || user.isAdmin) && <NavItem to="/contests" icon={Trophy} label="Contests" />}
          <NavItem to="/consultations" icon={Calendar} label="Consultations" />
          <NavItem to="/doctors" icon={Users} label="Find Experts" />

          <p className="px-4 text-xs font-bold text-slate-400 uppercase mb-4 mt-8 tracking-wider">Elevate</p>
          <NavItem to="/blogs" icon={Newspaper} label="Blogs & Articles" />
          {(user.isVeterinarian || user.isAdmin) && <NavItem to="/announcements" icon={Megaphone} label="Announcements" />}
          {(user.isVeterinarian || user.isAdmin) && <NavItem to="/jobs" icon={Briefcase} label="Jobs" />}
          <NavItem to="/webinar" icon={Monitor} label="Webinar" />

          <p className="px-4 text-xs font-bold text-slate-400 uppercase mb-4 mt-8 tracking-wider">Account</p>
          <NavItem to="/profile" icon={FileText} label="Profile" />
          <NavItem to="/payment-policy" icon={ShieldCheck} label="Payment Policy" />
        </nav>

        {/* Promo Box */}
        <div className="p-4 mt-auto">
          <div className="bg-gradient-to-tr from-sky-50 via-sky-50 to-sky-200 rounded-2xl p-5 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-slate-800">22K</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Users are already started using comment feature with personal AI coach...
              </p>
            </div>
            <FileText className="absolute top-[20px] right-[20px] text-slate-300" size={32} />
          </div>
        </div>

        <div className="p-4">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full px-4 py-3 bg-orange-50 text-orange-700 hover:bg-orange-100 rounded-xl transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white relative">
        {/* Top Header — Desktop only */}
        <header className="h-20 bg-white border-b border-slate-100 hidden md:flex items-center justify-between px-8 flex-shrink-0 z-10">
          {/* Search */}
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search for vets, articles, or jobs..."
                className="w-full pl-12 pr-4 py-3 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white transition-shadow focus:shadow-sm"
              />
            </div>
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-6">
            <button className="relative text-slate-500 hover:text-slate-800 transition-colors" onClick={() => navigate('/')}>
              <Home size={22} />
            </button>
            <div className="relative">
              <button
                className="relative text-slate-500 hover:text-slate-800 transition-colors"
                onClick={handleNotificationClick}
              >
                <Bell size={22} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {isNotificationOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-50 origin-top-right transform transition-all">
                  <div className="p-3 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-slate-700 text-sm">Announcements</h3>
                    <Link to="/announcements" onClick={() => setIsNotificationOpen(false)} className="text-xs text-[#0065bd] font-semibold hover:underline">
                      View All
                    </Link>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <Link
                          key={notification.id}
                          to="/announcements"
                          onClick={() => setIsNotificationOpen(false)}
                          className="block p-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-1 min-w-[32px] w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                              {notification.title.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-800 line-clamp-1">{notification.title}</p>
                              <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{notification.description}</p>
                              <p className="text-[10px] text-slate-400 mt-1">{new Date(notification.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="p-8 text-center text-slate-400 text-sm">
                        No new announcements
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <button className="text-slate-500 hover:text-slate-800 relative transition-colors">
              <Settings size={22} />
            </button>
            <button className="text-slate-500 hover:text-slate-800 transition-colors">
              <HelpCircle size={22} />
            </button>
            <div className="h-8 w-[1px] bg-slate-200"></div>
            <Link to="/profile" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-700">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-slate-500 capitalize">{user.role}</p>
              </div>
              {getUserAvatarUrl(user) ? (
                <img src={getUserAvatarUrl(user)!} alt="Profile" className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border-2 border-white shadow-sm">
                  {user.firstName?.charAt(0)}
                </div>
              )}
            </Link>
          </div>
        </header>

        {/* Mobile Header — visible on small screens only */}
        <div className="md:hidden flex-shrink-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-20">
          <img src={vetLogo} alt="VetForumIndia" className="h-8 w-auto" />
          <div className="flex items-center gap-3">
            {/* Notification bell on mobile */}
            <button
              className="relative text-slate-500"
              onClick={handleNotificationClick}
            >
              <Bell size={22} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1 py-0.5 text-[10px] font-bold text-white bg-red-600 rounded-full">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            {/* Profile avatar */}
            <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}>
              {getUserAvatarUrl(user) ? (
                <img src={getUserAvatarUrl(user)!} alt="Profile" className="w-9 h-9 rounded-full border-2 border-green-100 object-cover" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm">
                  {user.firstName?.charAt(0)}
                </div>
              )}
            </Link>
            {/* Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1 text-slate-600"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full h-[calc(100vh-64px)] bg-white z-50 flex flex-col overflow-y-auto shadow-xl">
            <div className="p-4 space-y-1 flex-1">
              <p className="px-4 text-xs font-bold text-slate-400 uppercase mb-3 tracking-wider">Menu</p>
              {(user.isVeterinarian || user.isAdmin) && <NavItem to="/dashboard" icon={Home} label="Dashboard" />}
              {user.isAdmin && <NavItem to="/admin/approvals" icon={ShieldCheck} label="Vet Approvals" />}
              {user.isAdmin && <NavItem to="/admin/doctors" icon={Users} label="Manage Doctors" />}
              {user.role === 'veterinarian' && <NavItem to="/doctor/availability" icon={Clock} label="My Slots" />}
              {(user.isVeterinarian || user.isAdmin) && <NavItem to="/feed" icon={Activity} label="Social Feed" />}
              {(user.isVeterinarian || user.isAdmin) && <NavItem to="/contests" icon={Trophy} label="Contests" />}
              <NavItem to="/consultations" icon={Calendar} label="Consultations" />
              <NavItem to="/doctors" icon={Users} label="Find Experts" />

              <p className="px-4 text-xs font-bold text-slate-400 uppercase mb-3 mt-6 tracking-wider">Elevate</p>
              <NavItem to="/blogs" icon={Newspaper} label="Blogs & Articles" />
              {(user.isVeterinarian || user.isAdmin) && <NavItem to="/announcements" icon={Megaphone} label="Announcements" />}
              {(user.isVeterinarian || user.isAdmin) && <NavItem to="/jobs" icon={Briefcase} label="Jobs" />}
              <NavItem to="/webinar" icon={Monitor} label="Webinar" />

              <p className="px-4 text-xs font-bold text-slate-400 uppercase mb-3 mt-6 tracking-wider">Account</p>
              <NavItem to="/profile" icon={FileText} label="Profile" />
              <NavItem to="/payment-policy" icon={ShieldCheck} label="Payment Policy" />
            </div>
            <div className="p-4 border-t border-slate-100">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 w-full px-4 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors"
              >
                <LogOut size={20} />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        )}

        {/* Mobile notification dropdown (rendered outside the header so it doesn't get clipped) */}
        {isNotificationOpen && (
          <div className="md:hidden absolute top-16 right-0 w-full bg-white z-40 shadow-xl border-b border-slate-100 max-h-80 overflow-y-auto">
            <div className="p-3 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-700 text-sm">Announcements</h3>
              <Link to="/announcements" onClick={() => setIsNotificationOpen(false)} className="text-xs text-blue-600 font-semibold">View All</Link>
            </div>
            {notifications.length > 0 ? notifications.map(n => (
              <Link key={n.id} to="/announcements" onClick={() => setIsNotificationOpen(false)}
                className="block p-3 hover:bg-slate-50 border-b border-slate-50 last:border-0">
                <p className="text-sm font-semibold text-slate-800 line-clamp-1">{n.title}</p>
                <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{n.description}</p>
              </Link>
            )) : (
              <div className="p-6 text-center text-slate-400 text-sm">No new announcements</div>
            )}
          </div>
        )}

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth pb-4">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        <AIChatWidget />
      </div>
    </div>
  );
};