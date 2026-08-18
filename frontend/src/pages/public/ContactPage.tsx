import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, Globe, ExternalLink, Navigation } from 'lucide-react';
import { toast } from 'sonner';

export const ContactPage: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Thank you! Your message has been sent to Noah’s Academy Arca South Admissions.');
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  const mapSearchUrl = 'https://www.google.com/maps/search/?api=1&query=31+DBP+Avenue+Arca+South+Taguig+City';

  return (
    <div className="bg-[#FAF8FF] min-h-screen text-slate-900 py-12 lg:py-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-purple-700">
            Get In Touch
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-purple-950 tracking-tight">
            Contact Noah's Academy Incorporated – Arca South
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Have inquiries regarding enrollment, admissions, or campus tours at our Arca South Campus? Reach out to our admissions team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Form */}
          <div className="lg:col-span-7 bg-white border border-purple-100 rounded-3xl p-8 shadow-xs space-y-6">
            <h3 className="text-xl font-black text-purple-950">Send Us a Direct Message</h3>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Juan Dela Cruz"
                  className="w-full px-4 py-3 bg-slate-50 border border-purple-100 rounded-xl text-slate-900 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="juan@example.com"
                  className="w-full px-4 py-3 bg-slate-50 border border-purple-100 rounded-xl text-slate-900 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1">Subject *</label>
                <input
                  type="text"
                  required
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="Inquiry regarding Senior High ASSH Track at Arca South"
                  className="w-full px-4 py-3 bg-slate-50 border border-purple-100 rounded-xl text-slate-900 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1">Message *</label>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Please state your inquiry here..."
                  className="w-full px-4 py-3 bg-slate-50 border border-purple-100 rounded-xl text-slate-900 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-purple-700 hover:bg-purple-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-purple-700/25 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Submit Inquiry</span>
              </button>
            </form>
          </div>

          {/* Campus Info Cards */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-gradient-to-br from-purple-950 to-indigo-950 text-white rounded-3xl p-8 space-y-6 shadow-xl">
              <div>
                <h3 className="text-xl font-black text-amber-300">Arca South Campus Details</h3>
                <p className="text-[11px] text-purple-200 mt-1">Noah's Academy Incorporated Official Beneficiary Branch</p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-white">Campus Address</h4>
                    <p className="text-purple-200 mt-0.5">31 DBP Avenue, Arca South, Taguig City, Metro Manila, Philippines</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-white">Official Phone Contact</h4>
                    <p className="text-purple-200 mt-0.5">(02) 8423-9185 / 0917-123-4567</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-white">Official Email</h4>
                    <p className="text-purple-200 mt-0.5">arca-south@noahsacademy.edu.ph</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-white">Office Hours</h4>
                    <p className="text-purple-200 mt-0.5">Monday to Friday: 07:30 AM — 05:00 PM<br />Saturday: 08:00 AM — 12:00 PM</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 pt-2 border-t border-purple-800">
                  <Globe className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-white">Official Facebook Page</h4>
                    <a
                      href="https://facebook.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-300 hover:underline flex items-center gap-1 mt-0.5 font-bold"
                    >
                      <span>Noah's Academy Incorporated – Arca South</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RESPONSIVE EMBEDDED GOOGLE MAPS FOR ARCA SOUTH */}
        <div className="bg-white border border-purple-100 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-purple-700" />
              <div>
                <h3 className="text-lg font-black text-purple-950">Arca South Campus Google Map</h3>
                <p className="text-xs text-slate-500">31 DBP Avenue, Arca South, Taguig City, Metro Manila</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <a
                href={mapSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Get Directions</span>
              </a>
              <a
                href={mapSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-950 font-bold text-xs rounded-xl border border-purple-200 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in Google Maps</span>
              </a>
            </div>
          </div>

          <div className="w-full h-96 rounded-2xl overflow-hidden border border-purple-100 shadow-inner bg-purple-50">
            <iframe
              title="Noah's Academy Incorporated - Arca South Campus Location Map"
              src="https://maps.google.com/maps?q=31%20DBP%20Avenue%20Arca%20South%20Taguig%20City%20Metro%20Manila&t=&z=16&ie=UTF8&iwloc=&output=embed"
              className="w-full h-full border-0"
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
