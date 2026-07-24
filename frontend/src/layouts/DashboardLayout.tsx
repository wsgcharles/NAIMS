import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  UserCheck,
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
  Sparkles,
  Lock,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { GlobalSearchModal } from '../components/navigation/GlobalSearchModal';
import { NotificationCenter } from '../components/navigation/NotificationCenter';
import type { UserRoleString } from '../types';

interface NavItem {
  title: string;
  href: string;
  icon: any;
  badge?: string;
  disabled?: boolean;
}

export const DashboardLayout: React.FC = () => {
  const { user, logout, setMockRole } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Role-based Navigation Configuration
  const getNavItems = (): NavItem[] => {
    const role = user?.role || 'SuperAdministrator';

    switch (role) {
      case 'SuperAdministrator':
      case 'Administrator':
      case 'Principal':
        return [
          { title: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
          { title: 'Employees', href: '/admin/employees', icon: Users },
          { title: 'Students', href: '/admin/students', icon: UserCheck },
          { title: 'Teachers', href: '/admin/teachers', icon: GraduationCap },
          { title: 'Academic Setup', href: '/admin/academic-years', icon: Layers, disabled: true },
          { title: 'Subjects & Sections', href: '/admin/subjects', icon: BookOpen },
          { title: 'Section Allocations', href: '/admin/sections', icon: Layers },
          { title: 'Grade Management', href: '/admin/grades', icon: Award },
          { title: 'Accounting ERP', href: '/admin/accounting', icon: DollarSign },
          { title: 'Reports & Analytics', href: '/admin/reports', icon: FileText },
          { title: 'Announcements', href: '/admin/announcements', icon: Bell },
          { title: 'Audit Logs', href: '/admin/audit-logs', icon: ShieldCheck },
          { title: 'Roles & Permissions', href: '/admin/roles', icon: Lock },
          { title: 'Admissions Settings', href: '/admin/admissions-settings', icon: FolderPlus },
          { title: 'System Settings', href: '/admin/settings', icon: Settings },
        ];
      case 'Registrar':
        return [
          { title: 'Registrar Dashboard', href: '/registrar/dashboard', icon: LayoutDashboard },
          { title: 'Enrollment Queue', href: '/registrar/enrollment', icon: FolderPlus, badge: '5 Pending' },
          { title: 'Applicant Workspace', href: '/registrar/applicants', icon: UserCheck },
          { title: 'Student Directory', href: '/registrar/students', icon: Users },
          { title: 'Section Allocations', href: '/admin/sections', icon: Layers },
          { title: 'Registration Reports', href: '/registrar/reports', icon: FileText, disabled: true },
        ];
      case 'Teacher':
        return [
          { title: 'Faculty Dashboard', href: '/teacher/dashboard', icon: LayoutDashboard },
          { title: 'My Classes', href: '/teacher/dashboard', icon: BookOpen },
          { title: 'Attendance Tracker', href: '/teacher/attendance', icon: CheckSquare },
          { title: 'Gradebook', href: '/teacher/dashboard', icon: Award },
          { title: 'Teaching Schedule', href: '/teacher/schedule', icon: Calendar, disabled: true },
        ];
      case 'Accountant':
        return [{ title: 'Accounting ERP', href: '/admin/accounting', icon: DollarSign }];
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
      {/* Dynamic Collapsible Sidebar */}
      <aside
        className={`bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-200 flex flex-col z-30 sticky top-0 h-screen ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <Link to="/" className="flex items-center space-x-3 overflow-hidden">
            <div className="p-2 bg-blue-600 rounded-xl text-white shadow-md shadow-blue-500/20 shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-base leading-tight tracking-tight text-slate-900 dark:text-white">
                  EduCore
                </span>
                <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 tracking-wide uppercase">
                  Noah's Academy
                </span>
              </div>
            )}
          </Link>

          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Sidebar Nav Links */}
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;

            if (item.disabled) {
              return (
                <div
                  key={item.title}
                  aria-disabled="true"
                  title="Coming soon"
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 dark:text-slate-600 cursor-not-allowed select-none"
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5 shrink-0" />
                    {!sidebarCollapsed && <span>{item.title}</span>}
                  </div>
                  {!sidebarCollapsed && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-full">
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
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                  {!sidebarCollapsed && <span>{item.title}</span>}
                </div>

                {!sidebarCollapsed && item.badge && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* User Role Quick Switcher Demo Toolbar */}
        {!sidebarCollapsed && (
          <div className="p-3 mx-3 mb-3 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>Role Preview Switcher</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              {(['SuperAdministrator', 'Registrar', 'Teacher', 'Student', 'Parent'] as UserRoleString[]).map(
                (role) => (
                  <button
                    key={role}
                    onClick={() => {
                      setMockRole(role);
                      navigate(
                        role === 'SuperAdministrator'
                          ? '/admin/dashboard'
                          : role === 'Registrar'
                          ? '/registrar/dashboard'
                          : role === 'Teacher'
                          ? '/teacher/dashboard'
                          : role === 'Student'
                          ? '/student/dashboard'
                          : '/parent/dashboard'
                      );
                    }}
                    className={`px-2 py-1 rounded-md text-left font-medium truncate transition-colors ${
                      user?.role === role
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {role === 'SuperAdministrator' ? 'Admin' : role}
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {/* Sidebar Footer User Card */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                {user?.firstName?.[0] || 'U'}
              </div>
              {!sidebarCollapsed && (
                <div className="flex flex-col overflow-hidden">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {user?.firstName || 'User'} {user?.lastName || ''}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
                    {user?.role}
                  </span>
                </div>
              )}
            </div>

            {!sidebarCollapsed && (
              <button
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between sticky top-0 z-20">
          {/* Search Trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center space-x-3 px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 w-64 transition-colors"
          >
            <Search className="w-4 h-4" />
            <span className="text-xs font-medium">Search EduCore (Cmd+K)</span>
          </button>

          {/* Right Controls */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white dark:ring-slate-900" />
              </button>
              <NotificationCenter isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
            </div>

            {/* Profile Avatar Button */}
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center space-x-2 p-1 rounded-full hover:ring-2 hover:ring-blue-500 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white dark:bg-blue-600 flex items-center justify-center font-bold text-xs">
                  {user?.firstName?.[0] || 'U'}
                </div>
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-2 z-50 animate-in fade-in duration-100">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center space-x-2 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <User className="w-4 h-4" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to="/change-password"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center space-x-2 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Security & Password</span>
                  </Link>
                  <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      logout();
                    }}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
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
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
};
