import React, { useState } from 'react';
import { StatCard } from '../../components/data-display/StatCard';
import { Bell, Send, Plus, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAdminApi } from '../../hooks/useAdminApi';
import type { CreateAnnouncementPayload } from '../../types';

export const AnnouncementsPage: React.FC = () => {
  const { useAnnouncements, useCreateAnnouncementMutation } = useAdminApi();
  const { data: announcements, isLoading, isError, refetch } = useAnnouncements();
  const createMutation = useCreateAnnouncementMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<CreateAnnouncementPayload>({
    title: '',
    content: '',
    category: 'General',
    targetRoles: 'All',
  });

  const list = announcements ?? [];
  const activeCount = list.filter((a) => a.isPublished && !a.isArchived).length;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      toast.error('Title and Content are required.');
      return;
    }
    try {
      await createMutation.mutateAsync(form);
      setIsModalOpen(false);
      setForm({ title: '', content: '', category: 'General', targetRoles: 'All' });
    } catch {
      // Error handled by mutation toast
    }
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-purple-950 dark:text-white tracking-tight">
            Institutional Broadcast & Announcements
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Publish official school bulletins to students, faculty, staff, and parents across Arca South Campus.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2.5 text-xs font-bold text-white bg-purple-700 hover:bg-purple-600 rounded-xl shadow-lg shadow-purple-600/25 transition-all hover:scale-[1.01]"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Announcement
        </button>
      </div>

      {isError && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center justify-between">
          <span>Failed to load announcements from EduCore API server.</span>
          <button onClick={() => refetch()} className="underline hover:text-rose-700">
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <StatCard
          title="Active Broadcasts"
          value={isLoading ? '…' : `${activeCount} Published`}
          icon={Bell}
          iconBgColor="bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300"
        />
        <StatCard
          title="Total Announcements"
          value={isLoading ? '…' : `${list.length} Bulletins`}
          icon={Send}
          iconBgColor="bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300"
        />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 dark:bg-slate-950 text-slate-500 uppercase text-[11px] font-semibold tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Announcement Title</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Publish Status</th>
                <th className="px-6 py-3.5">Target Audience</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-xs text-slate-400 font-medium">
                    Loading announcements from backend database…
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-xs text-slate-400 font-medium">
                    No announcements published yet.
                  </td>
                </tr>
              ) : (
                list.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                      <div>{a.title}</div>
                      <div className="text-[11px] font-normal text-slate-500 truncate max-w-md mt-0.5">{a.content}</div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-purple-700 dark:text-purple-400">{a.category}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${
                          a.isPublished
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {a.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-600 dark:text-slate-300">{a.targetRoles}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() =>
                          toast.info(`Announcement Detail:\nTitle: ${a.title}\nCategory: ${a.category}\nTarget: ${a.targetRoles}\nContent: ${a.content}`)
                        }
                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-300 transition-colors"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Announcement Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Publish New Announcement</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. AY 2026–2027 Enrollment Announcement"
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
                >
                  <option value="General">General</option>
                  <option value="Admissions">Admissions</option>
                  <option value="Academic">Academic</option>
                  <option value="System">System</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Target Audience</label>
                <input
                  type="text"
                  required
                  value={form.targetRoles}
                  onChange={(e) => setForm({ ...form, targetRoles: e.target.value })}
                  placeholder="e.g. All, Student, Parent, Teacher"
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Content</label>
                <textarea
                  rows={4}
                  required
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Write the announcement message body here..."
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-purple-700 hover:bg-purple-600 rounded-xl shadow-lg shadow-purple-600/20 flex items-center gap-2"
                >
                  {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Publish Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
