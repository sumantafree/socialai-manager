"use client";

import { motion } from "framer-motion";
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line, RadarChart,
  PolarGrid, PolarAngleAxis, Radar
} from "recharts";
import { TrendingUp, TrendingDown, Eye, Heart, Share2, MessageSquare, ArrowUpRight, Sparkles } from "lucide-react";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

const weeklyData = [
  { day: "Mon", reach: 8200, engagement: 620, impressions: 12400, clicks: 340 },
  { day: "Tue", reach: 9100, engagement: 810, impressions: 14100, clicks: 420 },
  { day: "Wed", reach: 11400, engagement: 1100, impressions: 16800, clicks: 580 },
  { day: "Thu", reach: 10200, engagement: 940, impressions: 15300, clicks: 510 },
  { day: "Fri", reach: 13800, engagement: 1340, impressions: 20100, clicks: 720 },
  { day: "Sat", reach: 16200, engagement: 1820, impressions: 24400, clicks: 940 },
  { day: "Sun", reach: 14900, engagement: 1610, impressions: 22100, clicks: 860 },
];

const monthlyGrowth = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  followers: 44000 + Math.floor(Math.random() * 400 * i + i * 120),
  posts: Math.floor(Math.random() * 8) + 2,
}));

const topPosts = [
  { content: "5 morning habits that changed my life 🌅", platform: "instagram", reach: "48.2K", eng: "9.8%", likes: 4120, comments: 382, shares: 891 },
  { content: "Why 99% of people fail at building habits [Thread]", platform: "twitter", reach: "31.6K", eng: "7.2%", likes: 2840, comments: 214, shares: 1240 },
  { content: "The AI tools replacing entire departments", platform: "linkedin", reach: "24.1K", eng: "11.4%", likes: 1980, comments: 643, shares: 724 },
  { content: "My $0 → $10K journey as a creator [Full Video]", platform: "youtube", reach: "89.4K", eng: "14.2%", likes: 8940, comments: 1241, shares: 2180 },
];

const radarData = [
  { subject: "Reach", instagram: 85, twitter: 60, linkedin: 70, youtube: 90 },
  { subject: "Engagement", instagram: 78, twitter: 65, linkedin: 82, youtube: 88 },
  { subject: "Growth", instagram: 72, twitter: 58, linkedin: 75, youtube: 82 },
  { subject: "Consistency", instagram: 90, twitter: 80, linkedin: 65, youtube: 70 },
  { subject: "Virality", instagram: 65, twitter: 72, linkedin: 60, youtube: 85 },
];

const aiInsights = [
  { title: "Best Posting Time", insight: "Your audience is most active on Fridays at 7 PM. Posts published then see 42% higher engagement.", impact: "high", icon: TrendingUp },
  { title: "Content Pattern", insight: "Personal story posts get 3.2x more saves than educational posts. Consider mixing them more.", impact: "high", icon: Sparkles },
  { title: "Engagement Drop", insight: "LinkedIn engagement dropped 18% this week. Try posting on Tuesday mornings instead.", impact: "medium", icon: TrendingDown },
  { title: "Hashtag Performance", insight: "#entrepreneur and #growthmindset drive 64% of your discoverability. Use them consistently.", impact: "medium", icon: TrendingUp },
];

export default function AnalyticsPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-slate-400 text-sm mt-0.5">Track your performance and discover growth opportunities</p>
        </div>
        <select className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-300 focus:outline-none">
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>Last 90 days</option>
        </select>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: "Total Reach", value: "83.8K", change: "+18.4%", icon: Eye, up: true },
          { label: "Engagements", value: "8.24K", change: "+24.1%", icon: Heart, up: true },
          { label: "Avg Eng. Rate", value: "9.83%", change: "+2.1%", icon: TrendingUp, up: true },
          { label: "Total Shares", value: "5.04K", change: "-3.2%", icon: Share2, up: false },
        ].map((s) => (
          <motion.div key={s.label} variants={fadeUp}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-start justify-between mb-3">
              <s.icon className="w-5 h-5 text-slate-400" />
              <span className={`flex items-center gap-0.5 text-xs font-medium ${s.up ? "text-emerald-400" : "text-rose-400"}`}>
                {s.up ? <ArrowUpRight className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {s.change}
              </span>
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Reach & Engagement Chart */}
      <motion.div variants={fadeUp} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="font-semibold mb-1">Reach & Engagement</h3>
        <p className="text-xs text-slate-500 mb-6">Daily performance across all platforms</p>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={weeklyData}>
            <defs>
              <linearGradient id="reach" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1570eb" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#1570eb" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="eng" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="day" stroke="#475569" tick={{ fontSize: 12 }} />
            <YAxis stroke="#475569" tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", color: "#e2e8f0" }} />
            <Area type="monotone" dataKey="reach" stroke="#1570eb" fill="url(#reach)" strokeWidth={2} name="Reach" />
            <Area type="monotone" dataKey="engagement" stroke="#ec4899" fill="url(#eng)" strokeWidth={2} name="Engagement" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Follower Growth */}
        <motion.div variants={fadeUp} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="font-semibold mb-1">Follower Growth</h3>
          <p className="text-xs text-slate-500 mb-6">Last 30 days</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" stroke="#475569" tick={{ fontSize: 11 }} />
              <YAxis stroke="#475569" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", color: "#e2e8f0" }} />
              <Line type="monotone" dataKey="followers" stroke="#8b5cf6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Platform Radar */}
        <motion.div variants={fadeUp} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="font-semibold mb-1">Platform Performance Radar</h3>
          <p className="text-xs text-slate-500 mb-4">Score across key metrics</p>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#1e293b" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 12 }} />
              <Radar name="Instagram" dataKey="instagram" stroke="#ec4899" fill="#ec4899" fillOpacity={0.15} />
              <Radar name="YouTube" dataKey="youtube" stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} />
              <Radar name="LinkedIn" dataKey="linkedin" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Top Posts */}
      <motion.div variants={fadeUp} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="font-semibold mb-4">Top Performing Posts</h3>
        <div className="space-y-3">
          {topPosts.map((p, i) => (
            <div key={i} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 transition-colors">
              <span className="text-xl md:text-2xl font-bold text-slate-600 w-7 md:w-8 flex-shrink-0">#{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-200 truncate">{p.content}</p>
                <span className="text-xs text-slate-500 capitalize">{p.platform}</span>
              </div>
              <div className="hidden sm:grid grid-cols-3 gap-4 text-center flex-shrink-0">
                <div>
                  <p className="text-sm font-semibold">{p.reach}</p>
                  <p className="text-xs text-slate-500">Reach</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-400">{p.eng}</p>
                  <p className="text-xs text-slate-500">Eng. Rate</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-rose-400">{p.likes.toLocaleString()}</p>
                  <p className="text-xs text-slate-500">Likes</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* AI Insights */}
      <motion.div variants={fadeUp} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-violet-400" />
          <h3 className="font-semibold">AI-Powered Insights</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {aiInsights.map((ins, i) => (
            <div key={i} className={`p-4 rounded-xl border ${
              ins.impact === "high" ? "border-violet-500/20 bg-violet-500/5" : "border-slate-700/50 bg-slate-800/30"
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <ins.icon className={`w-4 h-4 ${ins.impact === "high" ? "text-violet-400" : "text-slate-400"}`} />
                <span className="text-sm font-semibold">{ins.title}</span>
                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                  ins.impact === "high" ? "bg-violet-500/10 text-violet-400" : "bg-slate-700 text-slate-400"
                }`}>{ins.impact}</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">{ins.insight}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
