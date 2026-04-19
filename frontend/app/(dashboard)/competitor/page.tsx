"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Loader2, Instagram, Twitter, Linkedin, Youtube, Globe,
  TrendingUp, TrendingDown, Target, Lightbulb, BarChart2,
  Users, Clock, Hash, AlertCircle, Sparkles, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip
} from "recharts";

const PLATFORMS = [
  { id: "instagram", label: "Instagram", icon: Instagram, color: "#ec4899" },
  { id: "twitter", label: "Twitter/X", icon: Twitter, color: "#38bdf8" },
  { id: "linkedin", label: "LinkedIn", icon: Linkedin, color: "#3b82f6" },
  { id: "youtube", label: "YouTube", icon: Youtube, color: "#ef4444" },
  { id: "facebook", label: "Facebook", icon: Globe, color: "#6366f1" },
];

interface CompetitorData {
  handle: string;
  platform: string;
  displayName: string;
  followers: string;
  avgEngagement: string;
  postingFrequency: string;
  topContentTypes: string[];
  bestPostingTimes: string[];
  topHashtags: string[];
  contentGaps: string[];
  opportunities: string[];
  strengths: string[];
  weaknesses: string[];
  scores: { subject: string; you: number; competitor: number }[];
  recentContent: { type: string; engagement: string; topic: string }[];
}

const SAMPLE_COMPETITORS = ["@garyvee", "@hubspot", "@patrickbetdavid", "@alexhormozi", "@mrbeast"];

export default function CompetitorPage() {
  const [handle, setHandle] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CompetitorData | null>(null);
  const [error, setError] = useState("");

  const handleAnalyse = async () => {
    if (!handle.trim()) return;
    setLoading(true);
    setData(null);
    setError("");

    await new Promise((r) => setTimeout(r, 1800));

    const cleanHandle = handle.startsWith("@") ? handle : `@${handle}`;

    setData({
      handle: cleanHandle,
      platform,
      displayName: handle.replace("@", "").replace(/[^a-z0-9]/gi, " "),
      followers: `${(Math.random() * 900 + 100).toFixed(0)}K`,
      avgEngagement: `${(Math.random() * 6 + 2).toFixed(1)}%`,
      postingFrequency: ["1x/day", "5x/week", "3x/week", "2x/day"][Math.floor(Math.random() * 4)],
      topContentTypes: ["Carousels", "Short-form video", "Story polls", "Quote graphics", "Behind-the-scenes"],
      bestPostingTimes: ["Mon–Fri 7–9 AM", "Tue & Thu 6–8 PM", "Sunday 5 PM"],
      topHashtags: ["#entrepreneur", "#growthmindset", "#success", "#business", "#motivation", "#leadership"],
      contentGaps: [
        "No tutorial or how-to content — opportunity for you to own this format",
        "Rarely posts on weekends — high-visibility window you can claim",
        "Almost no LinkedIn presence — their audience is untapped there",
        "User-generated content (UGC) is completely missing",
        "No long-form educational threads or carousels",
      ],
      opportunities: [
        "Create in-depth tutorial content in their niche — they don't do this",
        "Run community challenges or UGC campaigns they've never tried",
        "Target their audience on LinkedIn where they have zero presence",
        "Post during their off-hours (weekends) for lower competition reach",
        "Engage directly with their comment section to poach engaged followers",
      ],
      strengths: [
        "Highly consistent posting schedule (daily)",
        "Strong brand voice — recognisable across all posts",
        "High story engagement (polls, Q&As)",
      ],
      weaknesses: [
        "Over-relies on motivational quotes — low save rate",
        "Caption quality is declining — shorter, less valuable",
        "No calls-to-action in most posts",
      ],
      scores: [
        { subject: "Consistency", you: 72, competitor: 91 },
        { subject: "Engagement", you: 85, competitor: 74 },
        { subject: "Content Quality", you: 78, competitor: 82 },
        { subject: "Hashtag Strategy", you: 65, competitor: 58 },
        { subject: "Visual Appeal", you: 80, competitor: 88 },
        { subject: "Virality", you: 70, competitor: 77 },
      ],
      recentContent: [
        { type: "Carousel", engagement: "9.2%", topic: "10 lessons from building a $10M business" },
        { type: "Reel", engagement: "14.1%", topic: "Morning routine of top performers" },
        { type: "Quote", engagement: "3.4%", topic: "Success requires sacrifice" },
        { type: "Reel", engagement: "11.8%", topic: "Brutal truth about entrepreneurship" },
        { type: "Carousel", engagement: "7.6%", topic: "Books every entrepreneur must read" },
      ],
    });

    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Competitor Analysis</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          Analyse any competitor&apos;s strategy, find content gaps, and discover growth opportunities
        </p>
      </div>

      {/* Search bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAnalyse()}
              placeholder="Enter competitor handle, e.g. @garyvee or alexhormozi"
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            {PLATFORMS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPlatform(p.id)}
                title={p.label}
                className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-all ${
                  platform === p.id ? "border-brand-500 bg-brand-500/10" : "border-slate-700 hover:border-slate-600"
                }`}
              >
                <p.icon className="w-4 h-4" style={{ color: p.color }} />
              </button>
            ))}
          </div>
          <Button onClick={handleAnalyse} disabled={loading || !handle.trim()} className="flex-shrink-0">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {loading ? "Analysing…" : "Analyse"}
          </Button>
        </div>

        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="text-xs text-slate-500">Try:</span>
          {SAMPLE_COMPETITORS.map((c) => (
            <button key={c} onClick={() => setHandle(c)}
              className="text-xs px-2 py-0.5 rounded-full border border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200 transition-colors">
              {c}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-12 flex flex-col items-center justify-center">
            <div className="relative mb-6">
              <div className="w-16 h-16 rounded-full border-2 border-brand-500/30 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
              </div>
            </div>
            <p className="font-medium text-slate-200 mb-1">Scanning {handle}&apos;s profile…</p>
            <p className="text-sm text-slate-500">Analysing content patterns, engagement, and gaps</p>
          </motion.div>
        )}

        {data && !loading && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            {/* Profile Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-xl font-bold text-white flex-shrink-0">
                  {data.handle.replace("@", "")[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold capitalize">{data.displayName}</h2>
                  <p className="text-slate-400 text-sm">{data.handle} · <span className="capitalize">{data.platform}</span></p>
                </div>
                <div className="hidden sm:grid grid-cols-3 gap-4 md:gap-6 text-center">
                  {[
                    { label: "Followers", value: data.followers, icon: Users },
                    { label: "Avg. Engagement", value: data.avgEngagement, icon: TrendingUp },
                    { label: "Posts", value: data.postingFrequency, icon: Clock },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <p className="text-lg font-bold text-white">{stat.value}</p>
                      <p className="text-xs text-slate-500">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Radar Chart + Content Types */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h3 className="font-semibold mb-4">You vs {data.handle}</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <RadarChart data={data.scores}>
                    <PolarGrid stroke="#1e293b" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 11 }} />
                    <Radar name="You" dataKey="you" stroke="#1570eb" fill="#1570eb" fillOpacity={0.2} strokeWidth={2} />
                    <Radar name="Competitor" dataKey="competitor" stroke="#ec4899" fill="#ec4899" fillOpacity={0.15} strokeWidth={2} />
                    <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", color: "#e2e8f0", fontSize: 12 }} />
                  </RadarChart>
                </ResponsiveContainer>
                <div className="flex items-center gap-4 mt-2 justify-center text-xs">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full bg-brand-500 inline-block" /> You</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full bg-pink-500 inline-block" /> {data.handle}</span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 text-sm flex items-center gap-1.5">
                    <BarChart2 className="w-4 h-4 text-brand-400" /> Top Content Types
                  </h3>
                  {data.topContentTypes.map((type, i) => (
                    <div key={type} className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-slate-500 w-4">{i + 1}.</span>
                      <Progress value={100 - i * 18} className="flex-1 h-1.5" />
                      <span className="text-xs text-slate-300 w-28 text-right">{type}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-sm flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-400" /> Best Posting Times
                  </h3>
                  <div className="space-y-1.5">
                    {data.bestPostingTimes.map((t) => (
                      <div key={t} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                        <span className="text-xs text-slate-300">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-sm flex items-center gap-1.5">
                    <Hash className="w-4 h-4 text-violet-400" /> Top Hashtags
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {data.topHashtags.map((tag) => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-emerald-400">
                  <TrendingUp className="w-4 h-4" /> Their Strengths
                </h3>
                <ul className="space-y-2">
                  {data.strengths.map((s) => (
                    <li key={s} className="flex items-start gap-2 text-sm text-slate-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-rose-400">
                  <TrendingDown className="w-4 h-4" /> Their Weaknesses
                </h3>
                <ul className="space-y-2">
                  {data.weaknesses.map((w) => (
                    <li key={w} className="flex items-start gap-2 text-sm text-slate-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 flex-shrink-0" />
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Content Gaps & Opportunities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-amber-400">
                  <AlertCircle className="w-4 h-4" /> Content Gaps They Have
                </h3>
                <ul className="space-y-2.5">
                  {data.contentGaps.map((gap) => (
                    <li key={gap} className="flex items-start gap-2 text-sm text-slate-300 p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/10">
                      <Target className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                      {gap}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-brand-400">
                  <Lightbulb className="w-4 h-4" /> Your Opportunities
                </h3>
                <ul className="space-y-2.5">
                  {data.opportunities.map((opp) => (
                    <li key={opp} className="flex items-start gap-2 text-sm text-slate-300 p-2.5 rounded-xl bg-brand-500/5 border border-brand-500/10">
                      <Sparkles className="w-3.5 h-3.5 text-brand-400 flex-shrink-0 mt-0.5" />
                      {opp}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recent Top Content */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h3 className="font-semibold mb-3">Their Recent High-Performing Posts</h3>
              <div className="space-y-2">
                {data.recentContent.map((post, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 transition-colors">
                    <span className="text-lg font-bold text-slate-600 w-5">#{i + 1}</span>
                    <Badge variant={post.type === "Reel" ? "violet" : "secondary"} className="flex-shrink-0">{post.type}</Badge>
                    <p className="text-sm text-slate-200 flex-1 truncate">{post.topic}</p>
                    <span className="text-sm font-medium text-emerald-400 flex-shrink-0">{post.engagement}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action CTA */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-brand-500/10 to-violet-500/5 border border-brand-500/20">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-brand-400" />
                <p className="text-sm text-slate-200">
                  Ready to fill these gaps? Generate content targeting their weaknesses.
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href="/content-studio">
                  Generate Content <ChevronRight className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
