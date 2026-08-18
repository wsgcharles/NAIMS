import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  GraduationCap,
  BookOpen,
  Calendar,
  CreditCard,
  Settings,
  FileText,
  Bell,
  Search,
  Moon,
  Sun,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  User,
  CheckSquare,
  Award,
  DollarSign,
  FolderPlus,
  Layers,
  Lock,
  ChevronDown,
  Menu,
  Compass,
  ClipboardList,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { GlobalSearchModal } from '../components/navigation/GlobalSearchModal';
import { NotificationCenter } from '../components/navigation/NotificationCenter';
import { Breadcrumbs } from '../components/navigation/Breadcrumbs';
import { NoahLogo } from '../components/brand/NoahLogo';
import { notificationService } from '../services/notificationService';
import { useAdminApi } from '../hooks/useAdminApi';
import { LogoutConfirmationModal } from '../components/common/LogoutConfirmationModal';
import { ConfirmationDialog } from '../components/common/ConfirmationDialog';
import { useQueryClient } from '@tanstack/react-query';

interface NavItem {
  title: string;
  href: string;
  icon: any;
  badge?: string;
  disabled?: boolean;
}

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const { useActiveSchoolYear } = useAdminApi();
  const { data: activeYear, isLoading: isActiveYearLoading } = useActiveSchoolYear();

  const queryClient = useQueryClient();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState<number>(0);

  const navigate = useNavigate();
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);

  const handleConfirmLogout = async () => {
    setLoggingOut(true);
    try {
      queryClient.clear();
    } catch {}
    logout();
  };

  const handleConfirmLeave = () => {
    setLeaveModalOpen(false);
    navigate('/');
  };

  useEffect(() => {
    notificationService.getUnreadCount()
      .then((count) => setUnreadNotifCount(count))
      .catch(() => {});
  }, [user]);

  // Role-based Navigation Configuration (100% preserved)
  const getNavItems = (): NavItem[] => {
    const role = user?.role || 'SuperAdministrator';

    switch (role) {
      case 'SuperAdministrator':
      case 'Administrator':
      case 'Principal':
        return [
          { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
          { title: 'Students', href: '/admin/students', icon: UserCheck },
          { title: 'Teachers', href: '/admin/teachers', icon: GraduationCap },
          { title: 'Registrar', href: '/registrar/dashboard', icon: FolderPlus },
          { title: 'Accounting', href: '/admin/accounting', icon: DollarSign },
          { title: 'Attendance', href: '/teacher/attendance', icon: CheckSquare },
          { title: 'Grades & Assessment', href: '/admin/grades', icon: Award },
          { title: 'Grade Approvals', href: '/admin/grade-approvals', icon: Award },
          { title: 'Subjects', href: '/admin/subjects', icon: BookOpen },
          { title: 'Section Management', href: '/admin/section-management', icon: Layers },
          { title: 'Section Allocations', href: '/admin/sections', icon: UserCheck },
          { title: 'Reports & Analytics', href: '/admin/reports', icon: FileText },
          { title: 'Announcements', href: '/admin/announcements', icon: Bell },
          { title: 'Audit Logs', href: '/admin/audit-logs', icon: ShieldCheck },
          { title: 'User Management', href: '/admin/roles', icon: Lock },
          { title: 'School Year Management', href: '/admin/school-years', icon: Calendar },
          { title: 'Admissions Settings', href: '/admin/admissions-settings', icon: FolderPlus },
          { title: 'Settings', href: '/admin/settings', icon: Settings },
        ];
      case 'Registrar':
        return [
          { title: 'Registrar Dashboard', href: '/registrar/dashboard', icon: LayoutDashboard },
          { title: 'Enrollment Queue', href: '/registrar/enrollment', icon: FolderPlus, badge: 'Active Queue' },
          { title: 'Applicant Workspace', href: '/registrar/applicants', icon: UserCheck },
          { title: 'Student Directory', href: '/registrar/students', icon: Users },
          { title: 'Section Management', href: '/admin/section-management', icon: Layers },
          { title: 'Section Allocations', href: '/admin/sections', icon: UserCheck },
          { title: 'Registration Reports', href: '/admin/reports', icon: FileText },
        ];

      case 'Teacher':
        return [
          { title: 'Faculty Dashboard', href: '/teacher/dashboard', icon: LayoutDashboard },
          { title: 'My Classes', href: '/teacher/dashboard', icon: BookOpen },
          { title: 'Attendance Tracker', href: '/teacher/attendance', icon: CheckSquare },
          { title: 'Gradebook', href: '/teacher/dashboard', icon: Award },
          { title: 'Teaching Schedule', href: '/teacher/dashboard', icon: Calendar },
        ];
      case 'Accountant':
        return [
          { title: 'Assessment Queue', href: '/accounting/queue', icon: ClipboardList },
          { title: 'Accounting ERP', href: '/admin/accounting', icon: DollarSign },
          { title: 'Student Ledger', href: '/admin/accounting', icon: CreditCard },
          { title: 'Reports & Receipts', href: '/admin/reports', icon: FileText },
        ];
      case 'Student':
        return [
          { title: 'Student Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
          { title: 'My Grades', href: '/student/grades', icon: Award },
          { title: 'Class Schedule', href: '/student/schedule', icon: Calendar },
          { title: 'Financial Ledger', href: '/student/ledger', icon: CreditCard },
        ];
      case 'Parent':
        return [
          { title: 'Guardian Dashboard', href: '/parent/dashboard', icon: LayoutDashboard },
          { title: 'Children Roster', href: '/parent/children', icon: Users },
          { title: 'Academic Progress', href: '/parent/progress', icon: Award },
          { title: 'Student Ledger', href: '/parent/ledger', icon: CreditCard },
        ];
      default:
        return [{ title: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard }];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex text-slate-900 dark:text-slate-100 font-sans">
      {/* ── Rich Institutional Purple Sidebar ────────────────────────────── */}
      <aside
        className={`bg-gradient-to-b from-purple-950 via-purple-900 to-indigo-950 text-white transition-all duration-300 flex flex-col z-30 sticky top-0 h-screen shadow-2xl ${
          sidebarCollapsed ? 'w-20' : 'w-72'
        } ${mobileOpen ? 'fixed inset-y-0 left-0 w-72' : 'hidden md:flex'}`}
      >
        {/* Brand Header with Noah's Academy Circular Emblem */}
        <div className="h-20 px-5 flex items-center justify-between border-b border-purple-800/50 shrink-0">
          <button
            onClick={() => setLeaveModalOpen(true)}
            className="flex items-center overflow-hidden text-left focus:outline-none hover:opacity-90 transition-opacity"
            title="Leave Dashboard & Return to Home"
          >
            <NoahLogo size={sidebarCollapsed ? 'sm' : 'md'} showText={!sidebarCollapsed} lightText={true} />
          </button>

          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 text-purple-200 hover:text-white rounded-xl hover:bg-white/10 transition-colors hidden md:block"
            aria-label="Toggle sidebar width"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Sidebar Nav Links with Mockup Styling */}
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;

            if (item.disabled) {
              return (
                <div
                  key={item.title}
                  aria-disabled="true"
                  title="Coming soon"
                  className="flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-medium text-purple-400/60 cursor-not-allowed select-none"
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    {!sidebarCollapsed && <span>{item.title}</span>}
                  </div>
                  {!sidebarCollapsed && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-900/60 text-purple-300 rounded-full">
                      Soon
                    </span>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.title}
                to={item.href}
                className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-white/20 text-white font-bold shadow-md shadow-purple-950/40 backdrop-blur-sm border border-white/20'
                    : 'text-purple-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-300' : 'text-purple-200'}`} />
                  {!sidebarCollapsed && <span>{item.title}</span>}
                </div>

                {!sidebarCollapsed && (
                  <div className="flex items-center space-x-1">
                    {item.badge && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-400 text-purple-950 rounded-full">
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'opacity-100 text-amber-300' : 'opacity-40'}`} />
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {/* School Year Widget (Live Database-Driven) */}
        {!sidebarCollapsed && (
          <div className="p-3.5 mx-3 mb-3 bg-purple-900/50 rounded-2xl border border-purple-700/40 backdrop-blur-sm">
            <div className="flex items-center space-x-2 text-[11px] text-purple-200 mb-2">
              <GraduationCap className="w-4 h-4 text-amber-300" />
              <span className="font-semibold">School Year</span>
            </div>
            {isActiveYearLoading ? (
              <div className="h-5 w-28 bg-purple-800/80 rounded animate-pulse mb-2" />
            ) : (
              <div className="text-sm font-bold text-white mb-2 font-mono">
                {activeYear?.schoolYear || 'SY 2026–2027'}
              </div>
            )}
            <div className="flex items-center justify-between bg-purple-950/80 px-3 py-1.5 rounded-xl border border-purple-700/50 text-xs font-semibold text-purple-200">
              <span>{isActiveYearLoading ? '...' : activeYear?.currentSemester || '1st Semester'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-purple-300" />
            </div>
          </div>
        )}


        {/* Sidebar User Footer */}
        <div className="p-3 border-t border-purple-800/50 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-amber-400 text-purple-950 flex items-center justify-center font-black text-sm shrink-0 border-2 border-purple-300">
                {user?.firstName?.[0] || 'U'}
              </div>
              {!sidebarCollapsed && (
                <div className="flex flex-col overflow-hidden">
                  <span className="text-xs font-bold text-white truncate">
                    {user?.firstName || 'User'} {user?.lastName || ''}
                  </span>
                  <span className="text-[10px] text-purple-200 font-medium truncate">
                    {user?.role}
                  </span>
                </div>
              )}
            </div>

            {!sidebarCollapsed && (
              <button
                onClick={() => setLogoutModalOpen(true)}
                className="p-1.5 text-purple-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main Canvas Content Area ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Top Header */}
        <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800 px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
          {/* Left Brand Title & Subtitle */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              onClick={() => setLeaveModalOpen(true)}
              className="flex flex-col text-left focus:outline-none hover:opacity-85 transition-opacity"
              title="Leave Dashboard & Return to Home"
            >
              <div className="flex items-center space-x-2">
                <span className="font-black text-xl tracking-tight text-purple-900 dark:text-purple-400">
                  NAISIS
                </span>
              </div>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">
                Noah's Academy Student Information System
              </span>
            </button>
          </div>

          {/* Center Search Bar (Ctrl + K) */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center justify-between px-4 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 w-64 md:w-80 border border-slate-200/60 dark:border-slate-700/60 transition-all hover:border-purple-300"
          >
            <div className="flex items-center space-x-2.5">
              <Search className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-xs font-medium">Search anything...</span>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-white dark:bg-slate-900 text-slate-500 rounded-md border border-slate-200 dark:border-slate-700 shadow-2xs">
              Ctrl + K
            </span>
          </button>

          {/* Right Header Action Icons */}
          <div className="flex items-center space-x-2.5">
            {/* Notification Bell (Live Unread Count) */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="p-2.5 text-slate-600 hover:text-purple-700 dark:text-slate-300 dark:hover:text-purple-400 rounded-xl hover:bg-purple-50 dark:hover:bg-slate-800 transition-colors relative"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-4 h-4 px-1 bg-purple-600 text-white font-bold text-[10px] rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                    {unreadNotifCount > 99 ? '99+' : unreadNotifCount}
                  </span>
                )}
              </button>
              <NotificationCenter
                isOpen={notifOpen}
                onClose={() => setNotifOpen(false)}
                onUnreadCountChange={(count) => setUnreadNotifCount(count)}
              />
            </div>

            {/* Theme Switcher */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2.5 text-slate-600 hover:text-purple-700 dark:text-slate-300 dark:hover:text-purple-400 rounded-xl hover:bg-purple-50 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* User Profile Pill Menu */}
            <div className="relative pl-2 border-l border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center space-x-3 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <div className="w-9 h-9 rounded-full bg-purple-700 text-white flex items-center justify-center font-bold text-xs ring-2 ring-purple-300 dark:ring-purple-900">
                  {user?.fullName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex flex-col text-left hidden lg:block">
                  <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    {user?.fullName || user?.email || 'User Account'}
                  </span>
                  <span className="text-[10px] font-semibold text-purple-700 dark:text-purple-400">
                    {user?.role || 'User'}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 hidden lg:block" />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in duration-100">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {user?.fullName || user?.email}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                    <span className="mt-1.5 inline-block px-2 py-0.5 text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 rounded-full">
                      {user?.role}
                    </span>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center space-x-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-slate-800"
                  >
                    <User className="w-4 h-4 text-purple-600" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to="/change-password"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center space-x-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-slate-800"
                  >
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    <span>Security & Password</span>
                  </Link>
                  <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      setLogoutModalOpen(true);
                    }}
                    className="flex items-center space-x-2.5 w-full px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Workspace Canvas Outlet */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto space-y-4">
          <Breadcrumbs />
          <Outlet />
        </main>
      </div>

      {/* Global Search Command Palette */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Logout Confirmation Modal */}
      <LogoutConfirmationModal
        isOpen={logoutModalOpen}
        onConfirm={handleConfirmLogout}
        onCancel={() => setLogoutModalOpen(false)}
        loading={loggingOut}
      />

      {/* Leave Dashboard Confirmation Modal */}
      <ConfirmationDialog
        isOpen={leaveModalOpen}
        title="Leave Dashboard?"
        message="You are about to leave the authenticated portal and return to the NAISIS home page."
        description="Your session will remain active, but any unsaved changes on this page may be lost."
        confirmText="Go to Home"
        cancelText="Stay Here"
        confirmVariant="primary"
        icon={Compass}
        onConfirm={handleConfirmLeave}
        onCancel={() => setLeaveModalOpen(false)}
      />
    </div>
  );
};
