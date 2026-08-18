import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X, LogIn, Mail, Phone, MapPin } from 'lucide-react';
import { NoahLogo } from '../components/brand/NoahLogo';

export const PublicLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    <div className="min-h-screen bg-[#FAF8FF] text-slate-900 flex flex-col font-sans selection:bg-purple-700 selection:text-white">
      {/* Top Announcement Bar */}
      <div className="bg-purple-950 text-white text-[11px] font-semibold py-2 px-4 border-b border-purple-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-purple-950 px-2 py-0.5 rounded-full font-black text-[10px] uppercase tracking-wider">Official</span>
            <span>Noah's Academy Incorporated – Arca South Campus · AY 2026–2027 Open Enrollment (Grades 1–12)</span>
          </div>
          <div className="flex items-center gap-4 text-purple-200 text-[11px]">
            <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-amber-300" /> (02) 8423-9185</span>
            <span className="hidden md:flex items-center gap-1"><MapPin className="w-3 h-3 text-amber-300" /> 31 DBP Avenue, Arca South, Taguig City</span>
          </div>
        </div>
      </div>

      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-purple-100 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-22 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <NoahLogo size="lg" showText={true} lightText={false} />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 bg-purple-50/70 p-1.5 rounded-full border border-purple-100">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-purple-700 text-white shadow-md shadow-purple-600/25'
                      : 'text-purple-950 hover:text-purple-700 hover:bg-purple-100/60'
                  }`}
                >
                  {link.title}
                </Link>
              );
            })}
          </nav>

          {/* Single Unified Sign In Button */}
          <div className="hidden lg:flex lg:items-center">
            <Link
              to="/login"
              className="inline-flex items-center px-5 py-2.5 bg-purple-700 hover:bg-purple-600 text-white text-xs font-extrabold rounded-full shadow-lg shadow-purple-700/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <LogIn className="w-4 h-4 mr-2" />
              <span>Sign In</span>
            </Link>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex lg:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-purple-950 hover:bg-purple-50 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-purple-100 px-4 pt-2 pb-6 space-y-3 z-40 animate-in slide-in-from-top duration-200">
          <nav className="space-y-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-purple-700 text-white'
                      : 'text-purple-950 hover:bg-purple-50'
                  }`}
                >
                  {link.title}
                </Link>
              );
            })}
          </nav>
          <div className="pt-2 border-t border-purple-100">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-purple-700 text-white text-xs font-extrabold rounded-xl shadow-md"
            >
              <LogIn className="w-4 h-4" />
              Sign In to NAISIS
            </Link>
          </div>
        </div>
      )}

      {/* Main Outlet */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Institutional Footer */}
      <footer className="bg-purple-950 text-slate-200 border-t border-purple-900 pt-16 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4 md:col-span-2">
              <NoahLogo size="md" showText={true} lightText={true} />
              <p className="text-xs text-purple-200 max-w-sm leading-relaxed">
                Noah's Academy Incorporated – Arca South Campus is a premier private K-12 educational institution in Taguig City, Metro Manila, Philippines. Dedicated to academic excellence, character formation, and holistic student development.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider">Quick Navigation</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/about" className="hover:text-white transition-colors">About Arca South Campus</Link></li>
                <li><Link to="/academics" className="hover:text-white transition-colors">Academic Offerings</Link></li>
                <li><Link to="/admissions" className="hover:text-white transition-colors">Enrollment & Admissions</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact Campus</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider">Arca South Campus Contact</h4>
              <ul className="space-y-2 text-xs text-purple-200">
                <li className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                  <span>31 DBP Avenue, Arca South, Taguig City, Metro Manila</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>(02) 8423-9185 / 0917-123-4567</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>arca-south@noahsacademy.edu.ph</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-purple-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-purple-300 gap-4">
            <p>© {new Date().getFullYear()} Noah's Academy Incorporated – Arca South Campus. All rights reserved.</p>
            <p>NAISIS Enterprise Platform · Taguig City, Philippines</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
