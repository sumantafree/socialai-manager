"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Calendar, dateFnsLocalizer, Event, Views } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  Plus, Instagram, Twitter, Linkedin, Youtube, Globe,
  Clock, X, Sparkles, Check, Loader2
} from "lucide-react";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales: { "en-US": enUS },
});

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "#ec4899",
  twitter: "#38bdf8",
  linkedin: "#3b82f6",
  youtube: "#ef4444",
  facebook: "#6366f1",
};

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  instagram: <Instagram className="w-4 h-4" />,
  twitter: <Twitter className="w-4 h-4" />,
  linkedin: <Linkedin className="w-4 h-4" />,
  youtube: <Youtube className="w-4 h-4" />,
  facebook: <Globe className="w-4 h-4" />,
};

interface ScheduledPost extends Event {
  id: string;
  platform: string;
  content: string;
  status: "draft" | "scheduled" | "published";
}

const SAMPLE_POSTS: ScheduledPost[] = [
  { id: "1", title: "5 Productivity Hacks 🚀", start: new Date(2026, 3, 3, 10, 0), end: new Date(2026, 3, 3, 10, 0), platform: "instagram", content: "5 habits that will change your life...", status: "scheduled" },
  { id: "2", title: "AI Tools Thread 🧵", start: new Date(2026, 3, 5, 14, 0), end: new Date(2026, 3, 5, 14, 0), platform: "twitter", content: "The AI tools I use every day...", status: "scheduled" },
  { id: "3", title: "Leadership Insights", start: new Date(2026, 3, 7, 9, 0), end: new Date(2026, 3, 7, 9, 0), platform: "linkedin", content: "What nobody tells you about leadership...", status: "published" },
  { id: "4", title: "My Morning Routine [VLOG]", start: new Date(2026, 3, 9, 16, 0), end: new Date(2026, 3, 9, 16, 0), platform: "youtube", content: "Come with me...", status: "scheduled" },
  { id: "5", title: "Business Tips Reel", start: new Date(2026, 3, 11, 11, 0), end: new Date(2026, 3, 11, 11, 0), platform: "instagram", content: "3 things I wish I knew before starting...", status: "draft" },
];

export default function CalendarPage() {
  const [posts, setPosts] = useState<ScheduledPost[]>(SAMPLE_POSTS);
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newPost, setNewPost] = useState({ platform: "instagram", content: "", scheduledAt: "" });
  const [saving, setSaving] = useState(false);

  const eventStyleGetter = (event: ScheduledPost) => ({
    style: {
      backgroundColor: PLATFORM_COLORS[event.platform] + "22",
      borderLeft: `3px solid ${PLATFORM_COLORS[event.platform]}`,
      color: "#e2e8f0",
      borderRadius: "6px",
      fontSize: "12px",
      padding: "2px 6px",
    },
  });

  const handleSelectSlot = useCallback(({ start }: { start: Date }) => {
    setNewPost({ platform: "instagram", content: "", scheduledAt: format(start, "yyyy-MM-dd'T'HH:mm") });
    setShowModal(true);
  }, []);

  const handleSelectEvent = useCallback((event: ScheduledPost) => {
    setSelectedPost(event);
  }, []);

  const handleSchedule = async () => {
    if (!newPost.content || !newPost.scheduledAt) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    const post: ScheduledPost = {
      id: Date.now().toString(),
      title: newPost.content.substring(0, 40) + (newPost.content.length > 40 ? "…" : ""),
      start: new Date(newPost.scheduledAt),
      end: new Date(newPost.scheduledAt),
      platform: newPost.platform,
      content: newPost.content,
      status: "scheduled",
    };
    setPosts((prev) => [...prev, post]);
    setShowModal(false);
    setSaving(false);
    setNewPost({ platform: "instagram", content: "", scheduledAt: "" });
  };

  const upcoming = posts
    .filter((p) => p.start > new Date() && p.status !== "published")
    .sort((a, b) => (a.start as Date).getTime() - (b.start as Date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Content Calendar</h1>
          <p className="text-slate-400 text-sm mt-0.5">Schedule and manage posts across all platforms</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 transition-colors text-sm font-medium">
          <Plus className="w-4 h-4" /> Schedule Post
        </button>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Upcoming */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-300">Upcoming Posts</h3>
          {upcoming.map((p) => (
            <motion.div key={p.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              onClick={() => setSelectedPost(p)}
              className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all">
              <div className="flex items-center gap-2 mb-1">
                <span style={{ color: PLATFORM_COLORS[p.platform] }}>{PLATFORM_ICONS[p.platform]}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  p.status === "scheduled" ? "bg-brand-500/10 text-brand-400" : "bg-slate-700 text-slate-400"
                }`}>{p.status}</span>
              </div>
              <p className="text-xs text-slate-200 line-clamp-2 mb-1">{p.title}</p>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {format(p.start as Date, "MMM d, h:mm a")}
              </p>
            </motion.div>
          ))}
          {upcoming.length === 0 && (
            <p className="text-slate-500 text-sm">No upcoming posts. Schedule one!</p>
          )}
        </div>

        {/* Calendar */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 calendar-dark">
          <style>{`
            .calendar-dark .rbc-calendar { color: #e2e8f0; font-family: inherit; }
            .calendar-dark .rbc-header { color: #94a3b8; font-weight: 600; font-size: 13px; border-bottom: 1px solid #1e293b; padding: 8px; }
            .calendar-dark .rbc-month-view, .calendar-dark .rbc-time-view { border-color: #1e293b; }
            .calendar-dark .rbc-day-bg { border-color: #1e293b; }
            .calendar-dark .rbc-off-range-bg { background: #0f172a; }
            .calendar-dark .rbc-today { background: #1e293b40; }
            .calendar-dark .rbc-toolbar { margin-bottom: 16px; }
            .calendar-dark .rbc-toolbar button { color: #94a3b8; border: 1px solid #1e293b; border-radius: 8px; padding: 4px 12px; font-size: 13px; }
            .calendar-dark .rbc-toolbar button:hover { background: #1e293b; color: #e2e8f0; }
            .calendar-dark .rbc-toolbar button.rbc-active { background: #1570eb; color: white; border-color: #1570eb; }
            .calendar-dark .rbc-toolbar-label { color: #e2e8f0; font-weight: 600; }
            .calendar-dark .rbc-date-cell { padding: 4px; color: #64748b; font-size: 13px; }
            .calendar-dark .rbc-date-cell.rbc-now { color: #1570eb; font-weight: 700; }
          `}</style>
          <Calendar
            localizer={localizer}
            events={posts}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 540 }}
            eventPropGetter={eventStyleGetter as any}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent as any}
            selectable
            defaultView={Views.MONTH}
          />
        </div>
      </div>

      {/* Selected Post Detail */}
      {selectedPost && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span style={{ color: PLATFORM_COLORS[selectedPost.platform] }}>
                {PLATFORM_ICONS[selectedPost.platform]}
              </span>
              <h3 className="font-semibold">{selectedPost.title}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                selectedPost.status === "published" ? "bg-emerald-500/10 text-emerald-400"
                : selectedPost.status === "scheduled" ? "bg-brand-500/10 text-brand-400"
                : "bg-slate-700 text-slate-400"
              }`}>{selectedPost.status}</span>
            </div>
            <button onClick={() => setSelectedPost(null)}><X className="w-4 h-4 text-slate-400" /></button>
          </div>
          <p className="text-sm text-slate-300 mb-3">{selectedPost.content}</p>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Scheduled for: {format(selectedPost.start as Date, "MMMM d, yyyy 'at' h:mm a")}
          </p>
          <div className="flex gap-3 mt-4">
            <button className="px-4 py-2 rounded-xl border border-slate-700 hover:border-slate-600 text-slate-300 text-sm">Edit</button>
            <button className="px-4 py-2 rounded-xl border border-rose-500/30 hover:border-rose-500/50 text-rose-400 text-sm">Delete</button>
          </div>
        </motion.div>
      )}

      {/* Schedule Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg">Schedule New Post</h3>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Platform</label>
                <div className="flex gap-2 flex-wrap">
                  {Object.keys(PLATFORM_COLORS).map((p) => (
                    <button key={p} onClick={() => setNewPost((prev) => ({ ...prev, platform: p }))}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                        newPost.platform === p ? "border-brand-500 bg-brand-500/10 text-white" : "border-slate-700 text-slate-400"
                      }`}
                      style={newPost.platform === p ? {} : {}}>
                      <span style={{ color: PLATFORM_COLORS[p] }}>{PLATFORM_ICONS[p]}</span>
                      <span className="capitalize">{p}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Content</label>
                <textarea value={newPost.content} onChange={(e) => setNewPost((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="Write your post content…" rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 focus:border-brand-500 focus:outline-none text-sm text-slate-200 placeholder:text-slate-500 resize-none transition-all" />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Schedule Date & Time</label>
                <input type="datetime-local" value={newPost.scheduledAt}
                  onChange={(e) => setNewPost((prev) => ({ ...prev, scheduledAt: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 focus:border-brand-500 focus:outline-none text-sm text-slate-200 transition-all" />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300 text-sm font-medium">Cancel</button>
              <button onClick={handleSchedule} disabled={saving || !newPost.content || !newPost.scheduledAt}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 transition-colors text-sm font-semibold disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {saving ? "Scheduling…" : "Schedule Post"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
