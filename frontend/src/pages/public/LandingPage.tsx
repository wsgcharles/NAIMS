import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  ArrowRight,
  Sparkles,
  ChevronRight,
  CheckCircle,
  Quote,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { NoahLogo } from '../../components/brand/NoahLogo';

const SectionLabel: React.FC<{ text: string; color?: string }> = ({
  text,
  color = 'text-purple-700',
}) => (
  <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${color}`}>{text}</span>
);

export const LandingPage: React.FC = () => {
  const featuredNews = [
    {
      title: 'Graduation Ceremony',
      category: 'Graduation',
      date: 'MAY 28, 2026',
      image: '/images/news/graduation.jpg',
      desc: 'Honoring Senior High School graduates across ASSH, BE, ICT Support, and Hospitality & Tourism tracks at the Arca South Auditorium.',
    },
    {
      title: 'Buwan ng Wika Celebration',
      category: 'Cultural Festival',
      date: 'AUG 28, 2025',
      image: '/images/news/buwan-ng-wika.jpg',
      desc: 'Students perform Sabayang Bigkas recitals and kundiman songs in traditional Filipiniana and Barong Tagalog.',
    },
    {
      title: 'Foundation Day Celebration',
      category: 'Foundation Day',
      date: 'FEB 18, 2026',
      image: '/images/news/foundation-day.jpg',
      desc: 'Commemorating the founding of Noah\'s Academy Incorporated in Taguig City with drum & lyre parades and sports finals.',
    },
  ];

  const upcomingEvents = [
    { month: 'AUG', day: '20', title: 'Intramurals', time: '08:00 AM — Arca South Covered Athletic Court' },
    { month: 'OCT', day: '05', title: 'Teachers\' Day Celebration', time: '09:00 AM — Main Auditorium' },
    { month: 'DEC', day: '15', title: 'Christmas Program', time: '01:30 PM — Main Auditorium' },
  ];

  const galleryPreviews = [
    { title: 'Main Academic Building', cat: 'Arca South Facilities', image: '/images/campus/building.jpg' },
    { title: 'Computer Laboratory', cat: 'Facilities', image: '/images/campus/computer-lab.jpg' },
    { title: 'Resource Library', cat: 'Facilities', image: '/images/campus/library.jpg' },
    { title: 'Covered Court', cat: 'Facilities', image: '/images/campus/covered-court.jpg' },
  ];

  const verifiedAchievements = [
    {
      title: 'DepEd K-12 Accreditation',
      desc: 'Full recognition for Elementary (Grades 1–6), Junior High (Grades 7–10), and Senior High tracks.',
      badge: 'Official Recognition',
    },
    {
      title: 'ASSH & ICT Innovation Honors',
      desc: 'Student research and technical project commendations in inter-school regional showcases.',
      badge: 'Academic Honor',
    },
    {
      title: 'Arca South Campus Excellence',
      desc: 'Modern educational facilities serving learners across Taguig City and Metro Manila.',
      badge: 'Campus Milestone',
    },
  ];

  return (
    <div className="bg-[#FAF8FF] min-h-screen text-slate-900 font-sans">
      {/* HERO SECTION — High Quality Campus Image Overlay Banner */}
      <section className="relative overflow-hidden bg-purple-950 text-white pt-16 pb-24 lg:pt-20 lg:pb-32">
        {/* Subtle Dark Overlay over Beneficiary Campus Hero Image */}
        <div className="absolute inset-0 z-0 opacity-25 mix-blend-overlay">
          <img src="/images/hero/campus-hero.jpg" alt="Noah's Academy Incorporated Arca South Campus Hero" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/95 via-purple-900/90 to-indigo-950/95 z-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-800/80 border border-purple-700/80 text-amber-300 text-xs font-bold shadow-md">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>K–12 Basic Education · Taguig City</span>
              </div>

              <div className="space-y-2">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                  NOAH'S ACADEMY INCORPORATED
                </h1>
                <p className="text-2xl sm:text-3xl font-extrabold text-amber-300 tracking-wide uppercase">
                  ARCA SOUTH CAMPUS
                </p>
              </div>

              <p className="text-sm sm:text-base text-purple-100 max-w-2xl leading-relaxed font-medium mx-auto lg:mx-0">
                Welcome to Noah's Academy Incorporated – Arca South Campus. Providing quality Grade 1 to 12 basic education, nurturing academic excellence, leadership, and Christian values in Taguig City.
              </p>

              {/* Action CTAs */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  to="/admissions"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-amber-400 hover:bg-amber-300 text-purple-950 font-black rounded-2xl text-xs uppercase tracking-wider shadow-xl shadow-amber-400/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Apply Now</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>

                <Link
                  to="/academics"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-purple-800/80 hover:bg-purple-700 text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider border border-purple-600/80 transition-all hover:scale-[1.02]"
                >
                  <Users className="w-4 h-4 mr-2 text-amber-300" />
                  <span>Explore Programs</span>
                </Link>
              </div>

              {/* Quick Metrics */}
              <div className="pt-6 border-t border-purple-800/80 grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-black text-amber-300">Grade 1 to 12</div>
                  <div className="text-[11px] font-semibold text-purple-200">DepEd Recognized</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-white">Arca South</div>
                  <div className="text-[11px] font-semibold text-purple-200">31 DBP Avenue</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-amber-300">Taguig</div>
                  <div className="text-[11px] font-semibold text-purple-200">Metro Manila</div>
                </div>
              </div>
            </div>

            {/* Right Hero Admissions Feature Card */}
            <div className="lg:col-span-5">
              <div className="bg-white text-slate-900 rounded-3xl p-8 shadow-2xl border-4 border-purple-200/80 relative space-y-6">
                <div className="flex items-center justify-between border-b border-purple-100 pb-4">
                  <div className="flex items-center space-x-3">
                    <NoahLogo size="sm" showText={false} />
                    <div>
                      <h3 className="font-black text-base text-purple-950">Arca South Admissions</h3>
                      <p className="text-[11px] text-slate-500">AY 2026–2027 Open Enrollment</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-[10px] uppercase tracking-wider rounded-full">
                    Accepting
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3.5 bg-purple-50 rounded-2xl border border-purple-100 flex items-start space-x-3">
                    <CheckCircle className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-purple-950">Elementary & Junior High (Grades 1–10)</span>
                      <p className="text-[11px] text-slate-600">Foundation literacy, numeracy, and core character values.</p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-purple-50 rounded-2xl border border-purple-100 flex items-start space-x-3">
                    <CheckCircle className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-purple-950">Senior High Track Offerings</span>
                      <p className="text-[11px] text-slate-600">ASSH, Business Entrepreneurship (BE), ICT Support, Hospitality & Tourism.</p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-purple-50 rounded-2xl border border-purple-100 flex items-start space-x-3">
                    <CheckCircle className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-purple-950">Grade 12 Specializations</span>
                      <p className="text-[11px] text-slate-600">ABM, HUMSS 201, GAS, AD, HE, and ICT tracks.</p>
                    </div>
                  </div>
                </div>

                <Link
                  to="/admissions"
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-purple-700 hover:bg-purple-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-purple-700/25 transition-all"
                >
                  <span>Start Online Application</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRINCIPAL'S / SCHOOL ADMINISTRATION WELCOME */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-purple-100 rounded-3xl p-8 lg:p-12 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-4 flex flex-col items-center text-center space-y-3 border-b lg:border-b-0 lg:border-r border-purple-100 pb-6 lg:pb-0 lg:pr-8">
            <div className="w-24 h-24 rounded-full bg-purple-950 p-1 border-4 border-amber-400 shadow-lg overflow-hidden">
              <img src="/noahs-logo.jpg" alt="Noah's Academy Arca South Directress Seal" className="w-full h-full object-cover rounded-full" />
            </div>
            <div>
              <h3 className="text-base font-black text-purple-950">School Administration</h3>
              <p className="text-[11px] font-bold text-purple-700">Arca South Campus</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Taguig City, Metro Manila</p>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center space-x-2 text-amber-500">
              <Quote className="w-6 h-6" />
              <SectionLabel text="Institutional Welcome" />
            </div>
            <h2 className="text-2xl font-black text-purple-950 leading-tight">
              Welcome to Noah's Academy Incorporated – Arca South Campus
            </h2>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              "Noah's Academy Incorporated – Arca South Campus provides quality basic education in Taguig City while nurturing academic excellence, leadership, and Christian values. On behalf of our dedicated faculty and staff, we welcome learners and parents to our official management platform."
            </p>
            <div className="pt-2 text-[11px] font-bold text-purple-950 italic">
              — Office of the School Administration · Arca South Campus
            </div>
          </div>
        </div>
      </section>

      {/* QUICK CONTACT CARDS */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <SectionLabel text="Quick Contact" />
          <h2 className="text-3xl font-black text-purple-950">Connect with Arca South Campus</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="p-5 bg-white border border-purple-100 rounded-3xl space-y-2 text-center shadow-xs">
            <MapPin className="w-6 h-6 text-purple-700 mx-auto" />
            <h4 className="font-extrabold text-xs text-purple-950 uppercase">Address</h4>
            <p className="text-[11px] text-slate-600 font-medium">31 DBP Avenue, Arca South, Taguig City</p>
          </div>

          <div className="p-5 bg-white border border-purple-100 rounded-3xl space-y-2 text-center shadow-xs">
            <Phone className="w-6 h-6 text-purple-700 mx-auto" />
            <h4 className="font-extrabold text-xs text-purple-950 uppercase">Phone</h4>
            <p className="text-[11px] text-slate-600 font-medium">(02) 8423-9185 / 0917-123-4567</p>
          </div>

          <div className="p-5 bg-white border border-purple-100 rounded-3xl space-y-2 text-center shadow-xs">
            <Mail className="w-6 h-6 text-purple-700 mx-auto" />
            <h4 className="font-extrabold text-xs text-purple-950 uppercase">Email</h4>
            <p className="text-[11px] text-slate-600 font-medium">arca-south@noahsacademy.edu.ph</p>
          </div>

          <div className="p-5 bg-white border border-purple-100 rounded-3xl space-y-2 text-center shadow-xs">
            <Globe className="w-6 h-6 text-purple-700 mx-auto" />
            <h4 className="font-extrabold text-xs text-purple-950 uppercase">Facebook</h4>
            <p className="text-[11px] text-purple-700 font-bold hover:underline">Noah's Academy Arca South</p>
          </div>

          <div className="p-5 bg-white border border-purple-100 rounded-3xl space-y-2 text-center shadow-xs">
            <Clock className="w-6 h-6 text-purple-700 mx-auto" />
            <h4 className="font-extrabold text-xs text-purple-950 uppercase">Office Hours</h4>
            <p className="text-[11px] text-slate-600 font-medium">Mon–Fri 7:30AM–5PM<br />Sat 8:00AM–12PM</p>
          </div>
        </div>

        <div className="text-center pt-2">
          <a
            href="https://www.google.com/maps/search/?api=1&query=31+DBP+Avenue+Arca+South+Taguig+City"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-700 hover:bg-purple-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all"
          >
            <MapPin className="w-4 h-4 text-amber-300" />
            <span>Visit Campus (Open in Google Maps)</span>
            <ExternalLink className="w-3.5 h-3.5 ml-1" />
          </a>
        </div>
      </section>

      {/* LATEST CAMPUS NEWS & HIGHLIGHTS */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-purple-100 pb-6">
          <div className="space-y-2">
            <SectionLabel text="Official Bulletin" />
            <h2 className="text-3xl font-black text-purple-950">Latest News & Activity Highlights</h2>
          </div>
          <Link to="/news" className="text-xs font-bold text-purple-700 hover:text-purple-900 inline-flex items-center">
            <span>Explore all news articles</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredNews.map((news, idx) => (
            <div key={idx} className="bg-white border border-purple-100 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="h-48 overflow-hidden bg-purple-950 relative">
                  <img src={news.image} alt={news.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <span className="absolute top-3 left-3 px-2.5 py-0.5 bg-amber-400 text-purple-950 font-black text-[10px] uppercase rounded-full">
                    {news.category}
                  </span>
                </div>
                <div className="p-6 space-y-2">
                  <span className="text-[11px] font-mono font-bold text-slate-400">{news.date}</span>
                  <h3 className="font-extrabold text-base text-purple-950 group-hover:text-purple-700 transition-colors leading-snug">{news.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{news.desc}</p>
                </div>
              </div>

              <div className="p-6 pt-0">
                <Link to="/news" className="text-xs font-bold text-purple-700 hover:underline inline-flex items-center">
                  <span>Read complete post</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* INSTITUTIONAL ACHIEVEMENTS */}
      <section className="py-16 bg-white border-y border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <SectionLabel text="Verified Achievements" />
            <h2 className="text-3xl font-black text-purple-950">Institutional & Academic Recognitions</h2>
            <p className="text-xs text-slate-600">Official recognitions publicly shared by Noah's Academy Incorporated.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {verifiedAchievements.map((ach, idx) => (
              <div key={idx} className="p-7 bg-[#FAF8FF] border border-purple-100 rounded-3xl space-y-3 shadow-xs">
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-[10px] font-black uppercase rounded-full inline-block">
                  {ach.badge}
                </span>
                <h3 className="text-base font-extrabold text-purple-950">{ach.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{ach.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* UPCOMING ACTIVITIES & CAMPUS GALLERY PREVIEW */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6">
            <SectionLabel text="Campus Calendar" />
            <h2 className="text-3xl font-black text-purple-950">Upcoming Activities</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Stay updated with Arca South Campus intramurals, research fairs, parent orientations, and holiday presentations.
            </p>
            <Link to="/events" className="inline-flex items-center px-6 py-3 bg-purple-700 hover:bg-purple-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-md">
              <span>View Full Calendar</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>

          <div className="lg:col-span-7 space-y-4">
            {upcomingEvents.map((ev, idx) => (
              <div key={idx} className="p-5 bg-white border border-purple-100 rounded-3xl flex items-center space-x-4 shadow-xs">
                <div className="w-14 h-14 rounded-2xl bg-purple-700 text-white flex flex-col items-center justify-center shrink-0 shadow-xs">
                  <span className="text-[10px] font-black uppercase text-amber-300">{ev.month}</span>
                  <span className="text-lg font-black">{ev.day}</span>
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-purple-950">{ev.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{ev.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gallery Preview */}
        <div className="space-y-8 pt-8 border-t border-purple-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <SectionLabel text="Photo Gallery" />
              <h3 className="text-2xl font-black text-purple-950">Arca South Campus in Pictures</h3>
            </div>
            <Link to="/gallery" className="text-xs font-bold text-purple-700 hover:underline">
              View complete photo archives →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {galleryPreviews.map((g, idx) => (
              <Link key={idx} to="/gallery" className="group bg-white border border-purple-100 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all">
                <div className="h-44 overflow-hidden bg-purple-950 relative">
                  <img src={g.image} alt={g.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <span className="absolute top-3 left-3 px-2.5 py-0.5 bg-purple-950/80 text-amber-300 text-[10px] font-bold uppercase rounded-full">
                    {g.cat}
                  </span>
                </div>
                <div className="p-4">
                  <h4 className="font-extrabold text-xs text-purple-950 group-hover:text-purple-700 transition-colors">{g.title}</h4>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-16 bg-white border-t border-purple-100">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
          <NoahLogo size="md" showText={false} />
          <h2 className="text-3xl sm:text-4xl font-black text-purple-950 tracking-tight">
            Join Noah's Academy Incorporated – Arca South Campus
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Give your child the gift of quality basic education, moral values, and academic empowerment. Enrollment is ongoing for Grade 1 through Grade 12.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/admissions"
              className="px-8 py-3.5 bg-purple-700 hover:bg-purple-600 text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-purple-700/25 transition-all"
            >
              Start Admission Application
            </Link>
            <Link
              to="/contact"
              className="px-8 py-3.5 bg-purple-50 hover:bg-purple-100 text-purple-950 font-bold rounded-2xl text-xs uppercase tracking-wider border border-purple-200 transition-all shadow-xs"
            >
              Schedule Campus Visit
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
