"use client";

import { motion } from "framer-motion";
import {
  TrendingUp, Users, Eye, MessageSquare, Heart, Share2,
  Calendar, Clock, Sparkles, ArrowUpRight, MoreHorizontal,
  Instagram, Twitter, Linkedin, Youtube
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

const STATS = [
  { label: "Total Reach", value: "2.4M", change: "+18.2%", icon: Eye, color: "from-brand-500 to-blue-600", bg: "bg-brand-500/10" },
  { label: "Engagement", value: "94.6K", change: "+24.1%", icon: Heart, color: "from-rose-500 to-pink-600", bg: "bg-rose-500/10" },
  { label: "Followers", value: "48.3K", change: "+8.7%", icon: Users, color: "from-violet-500 to-purple-600", bg: "bg-violet-500/10" },
  { label: "Posts This Month", value: "127", change: "+32.5%", icon: Calendar, color: "from-emerald-500 to-teal-600", bg: "bg-emerald-500/10" },
];

const engagementData = [
  { name: "Mon", instagram: 4200, twitter: 2100, linkedin: 1800, youtube: 3200 },
  { name: "Tue", instagram: 5100, twitter: 2400, linkedin: 2100, youtube: 2800 },
  { name: "Wed", instagram: 4800, twitter: 3100, linkedin: 2400, youtube: 4100 },
  { name: "Thu", instagram: 6200, twitter: 2800, linkedin: 1900, youtube: 3600 },
  { name: "Fri", instagram: 7100, twitter: 3400, linkedin: 2800, youtube: 5200 },
  { name: "Sat", instagram: 8400, twitter: 4100, linkedin: 1200, youtube: 6800 },
  { name: "Sun", instagram: 7800, twitter: 3700, linkedin: 900, youtube: 5900 },
];

const platformData = [
  { name: "Instagram", value: 42, color: "#ec4899" },
  { name: "Twitter/X", value: 24, color: "#38bdf8" },
  { name: "YouTube", value: 20, color: "#ef4444" },
  { name: "LinkedIn", value: 14, color: "#3b82f6" },
];

const recentPosts = [
  { platform: "instagram", content: "5 habits that will 10x your productivity 🚀", status: "published", reach: "12.4K", engagement: "8.2%", time: "2h ago" },
  { platform: "twitter", content: "Thread: How I built a $10K/month business with just one skill 🧵", status: "published", reach: "8.1K", engagement: "6.1%", time: "5h ago" },
  { platform: "linkedin", content: "The future of remote work isn't what you think — here's the data", status: "scheduled", reach: "—", engagement: "—", time: "Tomorrow 9:00 AM" },
  { platform: "youtube", content: "Day in My Life as a Solo Founder [VLOG]", status: "published", reach: "31.2K", engagement: "11.4%", time: "1d ago" },
];

const platformIcons: Record<string, React.ReactNode> = {
  instagram: <Instagram className="w-4 h-4 text-pink-400" />,
  twitter: <Twitter className="w-4 h-4 text-sky-400" />,
  linkedin: <Linkedin className="w-4 h-4 text-blue-400" />,
  youtube: <Youtube className="w-4 h-4 text-red-400" />,
};

const aiSuggestions = [
  { text: "Post on Instagram between 6-8 PM for 40% higher engagement", type: "timing" },
  { text: "Your Thursday threads get 3x more saves — double down on that", type: "pattern" },
  { text: "Try a carousel post on LinkedIn — avg 3x more impressions", type: "format" },
];

export default function DashboardPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
      {/* Page title */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-0.5">Welcome back! Here&apos;s what&apos;s happening.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 transition-colors text-sm font-medium">
          <Sparkles className="w-4 h-4" /> Generate Content
        </button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {STATS.map((s) => (
          <motion.div key={s.label} variants={fadeUp}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-5 hover:border-slate-700 transition-colors">
            <div className="flex items-start justify-between mb-3 md:mb-4">
              <div className={`w-9 h-9 md:w-10 md:h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-4 h-4 md:w-5 md:h-5 bg-gradient-to-br ${s.color} bg-clip-text`} style={{ color: 'transparent', WebkitBackgroundClip: 'text', background: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }} />
              </div>
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-400">
                <ArrowUpRight className="w-3 h-3" />{s.change}
              </span>
            </div>
            <p className="text-xl md:text-2xl font-bold mb-0.5">{s.value}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Engagement chart */}
        <motion.div variants={fadeUp} className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold">Engagement Over Time</h3>
              <p className="text-xs text-slate-500 mt-0.5">Last 7 days across all platforms</p>
            </div>
            <button className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors">
              <MoreHorizontal className="w-4 h-4 text-slate-400" />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={engagementData}>
              <defs>
                {[
                  { id: "instagram", color: "#ec4899" },
                  { id: "twitter", color: "#38bdf8" },
                  { id: "linkedin", color: "#3b82f6" },
                  { id: "youtube", color: "#ef4444" },
                ].map((g) => (
                  <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={g.color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={g.color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#475569" tick={{ fontSize: 12 }} />
              <YAxis stroke="#475569" tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px" }} />
              <Area type="monotone" dataKey="instagram" stroke="#ec4899" fill="url(#instagram)" strokeWidth={2} />
              <Area type="monotone" dataKey="twitter" stroke="#38bdf8" fill="url(#twitter)" strokeWidth={2} />
              <Area type="monotone" dataKey="linkedin" stroke="#3b82f6" fill="url(#linkedin)" strokeWidth={2} />
              <Area type="monotone" dataKey="youtube" stroke="#ef4444" fill="url(#youtube)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Platform distribution */}
        <motion.div variants={fadeUp} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="font-semibold mb-1">Platform Distribution</h3>
          <p className="text-xs text-slate-500 mb-4">Engagement by platform</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={platformData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={3}>
                {platformData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {platformData.map((p) => (
              <div key={p.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
                  <span className="text-slate-400">{p.name}</span>
                </div>
                <span className="font-medium">{p.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Posts & AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Recent Posts */}
        <motion.div variants={fadeUp} className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent Posts</h3>
            <a href="/calendar" className="text-xs text-brand-400 hover:text-brand-300">View all →</a>
          </div>
          <div className="space-y-3">
            {recentPosts.map((post, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-800/50 transition-colors">
                <div className="mt-0.5">{platformIcons[post.platform]}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 truncate">{post.content}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />{post.time}
                    </span>
                    {post.reach !== "—" && (
                      <>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Eye className="w-3 h-3" />{post.reach}
                        </span>
                        <span className="text-xs text-emerald-400">{post.engagement}</span>
                      </>
                    )}
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                  post.status === "published"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-amber-500/10 text-amber-400"
                }`}>
                  {post.status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* AI Advisor */}
        <motion.div variants={fadeUp} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-violet-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-violet-400" />
            </div>
            <h3 className="font-semibold">AI Growth Advisor</h3>
          </div>
          <div className="space-y-3">
            {aiSuggestions.map((s, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <p className="text-sm text-slate-300 leading-relaxed">{s.text}</p>
                <span className={`mt-2 inline-block text-xs px-2 py-0.5 rounded-full ${
                  s.type === "timing" ? "bg-brand-500/10 text-brand-400"
                  : s.type === "pattern" ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-violet-500/10 text-violet-400"
                }`}>
                  {s.type}
                </span>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2.5 rounded-xl border border-violet-500/30 hover:border-violet-500/50 text-violet-400 text-sm font-medium transition-colors">
            Get Full Analysis
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
