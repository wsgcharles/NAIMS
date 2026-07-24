import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import { toast } from 'sonner';

export const ContactPage: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Thank you! Your message has been sent to Noah’s Academy Admissions.');
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Get In Touch</span>
        <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
          Contact Noah's Academy
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed">
          Have questions regarding admissions, academics, or campus tours? We are here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
          <h3 className="text-xl font-bold text-white">Send Us a Direct Message</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Your Full Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Juan Dela Cruz"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-hidden focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="juan@example.com"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-hidden focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Subject</label>
              <input
                type="text"
                required
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="Inquiry regarding Senior High STEM Track"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-hidden focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Message</label>
              <textarea
                rows={4}
                required
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Please share your inquiry details..."
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit Message</span>
            </button>
          </form>
        </div>

        {/* Contact Info & Map */}
        <div className="space-y-8">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
            <h3 className="text-xl font-bold text-white">Campus Information</h3>
            <ul className="space-y-4 text-xs text-slate-300">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Campus Location</span>
                  <span>100 Academy Drive, Education Hill, Campus City</span>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Admissions Hotline</span>
                  <span>+1 (800) 555-NOAH</span>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Official Email</span>
                  <span>admissions@noahsacademy.edu</span>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Registrar Office Hours</span>
                  <span>Monday – Friday: 8:00 AM – 5:00 PM</span>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 h-56 flex flex-col justify-center text-center space-y-2">
            <MapPin className="w-8 h-8 text-blue-500 mx-auto" />
            <h4 className="text-sm font-bold text-white">Interactive Map Location</h4>
            <p className="text-xs text-slate-500">100 Academy Drive, Education Hill</p>
          </div>
        </div>
      </div>
    </div>
  );
};
