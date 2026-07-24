import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { GraduationCap, Menu, X, LogIn, Mail, Phone, MapPin, ChevronRight, ChevronDown, User, HeartHandshake, Briefcase } from 'lucide-react';

export const PublicLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [portalDropdownOpen, setPortalDropdownOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { title: 'Home', href: '/' },
    { title: 'About', href: '/about' },
    { title: 'Academics', href: '/academics' },
    { title: 'Admissions', href: '/admissions' },
    { title: 'News', href: '/news' },
    { title: 'Events', href: '/events' },
    { title: 'Gallery', href: '/gallery' },
    { title: 'Contact', href: '/contact' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Sticky Glassmorphism Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="p-2.5 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-blue-400 transition-colors">
                Noah's Academy
              </span>
              <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">
                EduCore Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 bg-slate-900/60 p-1.5 rounded-full border border-slate-800/80">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  {link.title}
                </Link>
              );
            })}
          </nav>

          {/* Portal Login Dropdown Menu */}
          <div className="hidden lg:relative lg:flex lg:items-center">
            <button
              onClick={() => setPortalDropdownOpen(!portalDropdownOpen)}
              className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-full shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all hover:scale-[1.02]"
            >
              <LogIn className="w-4 h-4 mr-2" />
              <span>Portal Login</span>
              <ChevronDown className="w-3.5 h-3.5 ml-1.5 opacity-80" />
            </button>

            {portalDropdownOpen && (
              <div
                onMouseLeave={() => setPortalDropdownOpen(false)}
                className="absolute right-0 top-12 w-60 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1"
              >
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-800/60">
                  Select User Portal
                </div>
                <Link
                  to="/student/login"
                  onClick={() => setPortalDropdownOpen(false)}
                  className="flex items-center space-x-3 p-2.5 rounded-xl hover:bg-blue-600/20 text-slate-200 hover:text-white transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">Student Portal</div>
                    <div className="text-[10px] text-slate-400">Grades, Schedule & Ledger</div>
                  </div>
                </Link>

                <Link
                  to="/parent/login"
                  onClick={() => setPortalDropdownOpen(false)}
                  className="flex items-center space-x-3 p-2.5 rounded-xl hover:bg-purple-600/20 text-slate-200 hover:text-white transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <HeartHandshake className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">Parent Portal</div>
                    <div className="text-[10px] text-slate-400">Academic & Financial Oversight</div>
                  </div>
                </Link>

                <Link
                  to="/employee/login"
                  onClick={() => setPortalDropdownOpen(false)}
                  className="flex items-center space-x-3 p-2.5 rounded-xl hover:bg-emerald-600/20 text-slate-200 hover:text-white transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">Employee Portal</div>
                    <div className="text-[10px] text-slate-400">Faculty, Staff & Admin SSO</div>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2.5 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-slate-800"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-slate-950/95 backdrop-blur-xl pt-24 px-6 pb-8 flex flex-col justify-between animate-in fade-in duration-200">
          <div className="space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between p-4 rounded-xl text-base font-bold transition-all ${
                  location.pathname === link.href
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <span>{link.title}</span>
                <ChevronRight className="w-5 h-5 opacity-60" />
              </Link>
            ))}
          </div>

          {/* Mobile Portal Choices */}
          <div className="pt-6 border-t border-slate-800 space-y-2">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Portal Access Points</div>
            <Link
              to="/student/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full p-3 bg-slate-900 border border-slate-800 text-slate-200 text-xs font-bold rounded-xl flex items-center space-x-3"
            >
              <User className="w-4 h-4 text-blue-400" />
              <span>Student Portal</span>
            </Link>
            <Link
              to="/parent/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full p-3 bg-slate-900 border border-slate-800 text-slate-200 text-xs font-bold rounded-xl flex items-center space-x-3"
            >
              <HeartHandshake className="w-4 h-4 text-purple-400" />
              <span>Parent Portal</span>
            </Link>
            <Link
              to="/employee/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full p-3 bg-slate-900 border border-slate-800 text-slate-200 text-xs font-bold rounded-xl flex items-center space-x-3"
            >
              <Briefcase className="w-4 h-4 text-emerald-400" />
              <span>Employee Portal (Staff SSO)</span>
            </Link>
          </div>
        </div>
      )}

      {/* Public Page Canvas */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Institutional Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
            {/* Brand Column */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-600 rounded-xl text-white">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <span className="font-extrabold text-xl text-white">Noah's Academy</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                Empowering future leaders through academic excellence, innovation, and values-based education.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Quick Links</h4>
              <ul className="space-y-2.5 text-xs">
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/academics" className="hover:text-white transition-colors">Academic Offerings</Link></li>
                <li><Link to="/admissions" className="hover:text-white transition-colors">Admissions Process</Link></li>
                <li><Link to="/news" className="hover:text-white transition-colors">Latest News</Link></li>
              </ul>
            </div>

            {/* Academic Offerings */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Academic Programs</h4>
              <ul className="space-y-2.5 text-xs">
                <li className="text-slate-400">Preschool & Kindergarten</li>
                <li className="text-slate-400">Elementary School</li>
                <li className="text-slate-400">Junior High School</li>
                <li className="text-slate-400">Senior High (STEM / ABM / HUMSS)</li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Contact Info</h4>
              <ul className="space-y-3 text-xs">
                <li className="flex items-start space-x-2.5">
                  <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <span>100 Academy Drive, Education Hill</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <Phone className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>+1 (800) 555-NOAH</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>admissions@noahsacademy.edu</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© {new Date().getFullYear()} Noah's Academy. All rights reserved. Powered by EduCore.</p>
            <div className="flex space-x-6">
              <Link to="/student/login" className="hover:text-white">Student Portal</Link>
              <Link to="/parent/login" className="hover:text-white">Parent Portal</Link>
              <Link to="/employee/login" className="text-blue-400 font-semibold hover:underline">Employee Portal</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
