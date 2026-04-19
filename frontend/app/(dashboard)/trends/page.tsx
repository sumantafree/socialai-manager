"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Hash, Flame, Sparkles, ExternalLink, RefreshCw, Loader2, Copy, Check } from "lucide-react";

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.07 } } };

const TRENDING_TOPICS = [
  { topic: "AI Side Hustles 2025", category: "Business", volume: "2.4M", growth: "+340%", platforms: ["twitter", "linkedin", "instagram"] },
  { topic: "Morning Routine Optimization", category: "Lifestyle", volume: "1.8M", growth: "+220%", platforms: ["instagram", "youtube"] },
  { topic: "Passive Income Streams", category: "Finance", volume: "3.1M", growth: "+180%", platforms: ["youtube", "twitter", "linkedin"] },
  { topic: "ChatGPT Prompts for Business", category: "Tech", volume: "4.2M", growth: "+520%", platforms: ["twitter", "linkedin"] },
  { topic: "Micro SaaS Ideas", category: "Tech", volume: "890K", growth: "+410%", platforms: ["twitter", "linkedin"] },
  { topic: "Creator Economy Tips", category: "Business", volume: "1.2M", growth: "+190%", platforms: ["instagram", "youtube", "linkedin"] },
  { topic: "Stoicism Daily Practice", category: "Personal Dev", volume: "760K", growth: "+150%", platforms: ["instagram", "twitter"] },
  { topic: "Remote Work Productivity", category: "Lifestyle", volume: "2.1M", growth: "+230%", platforms: ["linkedin", "twitter"] },
];

const TRENDING_HASHTAGS = [
  { tag: "#entrepreneur", posts: "48M", weekly: "+12%", niche: "Business" },
  { tag: "#growthmindset", posts: "32M", weekly: "+8%", niche: "Personal Dev" },
  { tag: "#aitools", posts: "21M", weekly: "+67%", niche: "Tech" },
  { tag: "#sidehustle", posts: "18M", weekly: "+34%", niche: "Finance" },
  { tag: "#contentcreator", posts: "55M", weekly: "+15%", niche: "Creator" },
  { tag: "#digitalmarketing", posts: "41M", weekly: "+9%", niche: "Marketing" },
  { tag: "#passiveincome", posts: "29M", weekly: "+28%", niche: "Finance" },
  { tag: "#motivation", posts: "120M", weekly: "+5%", niche: "Lifestyle" },
  { tag: "#productivity", posts: "38M", weekly: "+22%", niche: "Lifestyle" },
  { tag: "#startup", posts: "26M", weekly: "+18%", niche: "Business" },
  { tag: "#remotework", posts: "22M", weekly: "+31%", niche: "Lifestyle" },
  { tag: "#personalbranding", posts: "14M", weekly: "+41%", niche: "Marketing" },
];

const VIRAL_IDEAS = [
  {
    title: "The 5-2-1 Rule for Social Media Growth",
    hook: "Nobody talks about the 5-2-1 rule… and that's why you're not growing.",
    type: "Educational",
    potential: "High",
  },
  {
    title: "Day in My Life Building a $10K/Month Business",
    hook: "I made $10K last month. Here's every tool, system, and strategy I used.",
    type: "Personal Story",
    potential: "Very High",
  },
  {
    title: "Hot Take: [Controversial Opinion] in Your Niche",
    hook: "Unpopular opinion: most [common advice] is actually hurting your growth.",
    type: "Opinion",
    potential: "High",
  },
  {
    title: "Before vs After: Transformation Post",
    hook: "12 months ago I had [problem]. Today [result]. Here's what changed.",
    type: "Transformation",
    potential: "Very High",
  },
  {
    title: "I Tested 10 [Niche] Tools So You Don't Have To",
    hook: "I spent 30 days testing every popular [tool]. Here's my honest verdict.",
    type: "Review",
    potential: "High",
  },
  {
    title: "The Mistake 90% of Creators Make",
    hook: "This one mistake is costing you thousands of followers every month.",
    type: "Problem/Solution",
    potential: "Very High",
  },
];

export default function TrendsPage() {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Business", "Tech", "Finance", "Lifestyle", "Personal Dev", "Creator"];

  const filtered = selectedCategory === "All"
    ? TRENDING_TOPICS
    : TRENDING_TOPICS.filter((t) => t.category === selectedCategory);

  const copyHook = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const refresh = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Trend Discovery</h1>
          <p className="text-slate-400 text-sm mt-0.5">Stay ahead with real-time trending topics and viral content ideas</p>
        </div>
        <button onClick={refresh} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700 hover:border-slate-600 text-slate-300 text-sm font-medium transition-all disabled:opacity-50">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Refresh Trends
        </button>
      </motion.div>

      {/* Trending Topics */}
      <motion.div variants={fadeUp} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="w-5 h-5 text-orange-400" />
            <h3 className="font-semibold">Trending Topics</h3>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((c) => (
              <button key={c} onClick={() => setSelectedCategory(c)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all border whitespace-nowrap flex-shrink-0 ${
                  selectedCategory === c
                    ? "border-brand-500 bg-brand-500/10 text-brand-300"
                    : "border-slate-700 text-slate-400 hover:border-slate-600"
                }`}>{c}</button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          {filtered.map((topic, i) => (
            <motion.div key={topic.topic} variants={fadeUp}
              className="flex items-start gap-3 p-4 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 transition-all group cursor-pointer border border-transparent hover:border-slate-700">
              <span className="text-lg font-bold text-slate-600 w-6 flex-shrink-0">#{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-slate-200">{topic.topic}</p>
                  <span className="text-xs text-emerald-400 font-medium flex-shrink-0">{topic.growth}</span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-slate-500">{topic.volume} searches/wk</span>
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-slate-700 text-slate-400">{topic.category}</span>
                </div>
              </div>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-slate-700">
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Trending Hashtags */}
        <motion.div variants={fadeUp} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Hash className="w-5 h-5 text-brand-400" />
            <h3 className="font-semibold">Trending Hashtags</h3>
          </div>
          <div className="space-y-2">
            {TRENDING_HASHTAGS.map((h) => (
              <div key={h.tag} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-800/50 transition-colors group">
                <span className="text-brand-400 font-medium text-sm w-36 flex-shrink-0">{h.tag}</span>
                <span className="text-xs text-slate-500 flex-1">{h.posts} posts</span>
                <span className="text-xs text-emerald-400 font-medium w-12 text-right">{h.weekly}</span>
                <button onClick={() => copyHook(h.tag, h.tag)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-700 transition-all">
                  {copied === h.tag ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Viral Content Ideas */}
        <motion.div variants={fadeUp} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-violet-400" />
            <h3 className="font-semibold">Viral Content Formulas</h3>
          </div>
          <div className="space-y-3">
            {VIRAL_IDEAS.map((idea, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/30 hover:border-slate-700 transition-all group">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-medium text-slate-200">{idea.title}</p>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                    idea.potential === "Very High"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-brand-500/10 text-brand-400"
                  }`}>{idea.potential}</span>
                </div>
                <p className="text-xs text-slate-400 italic mb-2">&quot;{idea.hook}&quot;</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-400">{idea.type}</span>
                  <button onClick={() => copyHook(idea.hook, idea.title)}
                    className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-all">
                    {copied === idea.title ? <><Check className="w-3 h-3 text-emerald-400" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy Hook</>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
