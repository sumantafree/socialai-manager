"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Copy, Download, RefreshCw, Wand2, Hash,
  Instagram, Twitter, Linkedin, Youtube, Globe, Film,
  ChevronDown, Check, Loader2, BookOpen, Megaphone, Zap
} from "lucide-react";

const PLATFORMS = [
  { id: "instagram", label: "Instagram", icon: Instagram, color: "text-pink-400" },
  { id: "twitter", label: "Twitter/X", icon: Twitter, color: "text-sky-400" },
  { id: "linkedin", label: "LinkedIn", icon: Linkedin, color: "text-blue-400" },
  { id: "youtube", label: "YouTube Shorts", icon: Youtube, color: "text-red-400" },
  { id: "facebook", label: "Facebook", icon: Globe, color: "text-blue-500" },
];

const NICHES = [
  "Personal Brand", "Business & Finance", "Health & Fitness", "Tech & AI",
  "Travel", "Food & Lifestyle", "Education", "Entertainment", "E-commerce",
  "Real Estate", "Crypto & Web3", "Fashion & Beauty"
];

const TONES = ["Inspirational", "Educational", "Entertaining", "Professional", "Casual", "Bold & Direct"];

interface GeneratedContent {
  hook: string;
  caption: string;
  cta: string;
  hashtags: string[];
  script?: string;
  creative_idea?: string;
  seo_title?: string;
}

export default function ContentStudioPage() {
  const [platform, setPlatform] = useState("instagram");
  const [niche, setNiche] = useState("");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("Inspirational");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"caption" | "script" | "hashtags">("caption");

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/generate-content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, niche, topic, tone }),
      });
      const data = await res.json();
      setContent(data);
      setActiveTab("caption");
    } catch {
      // Fallback demo content
      setContent({
        hook: `🔥 This ONE ${topic} hack changed everything for me…`,
        caption: `Most people struggle with ${topic} because they're doing it backwards.\n\nHere's the framework that changed everything:\n\n1️⃣ Start with the end in mind\n2️⃣ Build systems, not goals\n3️⃣ Measure what matters\n\nThe secret? Consistency beats intensity every single time.\n\nI went from zero to results in just 30 days by focusing on these 3 things.\n\nSave this post for when you need a reminder. 💾`,
        cta: `Drop a "YES" in the comments if this resonated with you! And follow for daily ${niche || topic} tips.`,
        hashtags: ["#growth", "#success", "#mindset", "#productivity", "#motivation", "#entrepreneur", "#inspiration", "#goals", "#hustle", "#winning"],
        script: `[HOOK - 0-3s]\n"Stop scrolling! Here's the ${topic} secret nobody talks about..."\n\n[VALUE - 3-25s]\n"Most people think ${topic} is complicated. But I discovered 3 things:\nFirst, ${topic} requires consistency over perfection.\nSecond, small wins compound into massive results.\nThird, your environment determines your outcome."\n\n[CTA - 25-30s]\n"Follow for more ${niche || topic} tips. Which one hit different? Comment below!"`,
        creative_idea: `Show a before/after transformation related to ${topic}. Use trending audio, split screen format with text overlay. Start with a surprising statistic that challenges a common belief.`,
        seo_title: `How to Master ${topic} in 2025 | ${niche || "Growth"} Tips`,
      });
    }
    setLoading(false);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const CopyBtn = ({ text, id }: { text: string; id: string }) => (
    <button onClick={() => copyToClipboard(text, id)}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-all text-xs">
      {copied === id ? <><Check className="w-3 h-3 text-emerald-400" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
    </button>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI Content Studio</h1>
        <p className="text-slate-400 text-sm mt-0.5">Generate viral, platform-optimised content in seconds</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">
        {/* Left Panel – Inputs */}
        <div className="lg:col-span-2 space-y-5">
          {/* Platform */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Platform</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2">
              {PLATFORMS.map((p) => (
                <button key={p.id} onClick={() => setPlatform(p.id)}
                  className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                    platform === p.id
                      ? "border-brand-500 bg-brand-500/10 text-white"
                      : "border-slate-700 hover:border-slate-600 text-slate-400"
                  }`}>
                  <p.icon className={`w-4 h-4 ${p.color}`} />
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Inputs */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Topic / Keyword *</label>
              <textarea value={topic} onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. morning routine for entrepreneurs, investing tips for beginners..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 text-sm text-slate-200 placeholder:text-slate-500 resize-none transition-all" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Niche</label>
              <select value={niche} onChange={(e) => setNiche(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 focus:border-brand-500 focus:outline-none text-sm text-slate-200 transition-all">
                <option value="">Select niche…</option>
                {NICHES.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Tone</label>
              <div className="flex flex-wrap gap-2">
                {TONES.map((t) => (
                  <button key={t} onClick={() => setTone(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                      tone === t
                        ? "border-brand-500 bg-brand-500/10 text-brand-300"
                        : "border-slate-700 text-slate-400 hover:border-slate-600"
                    }`}>{t}</button>
                ))}
              </div>
            </div>
          </div>

          <button onClick={handleGenerate} disabled={loading || !topic.trim()}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-brand-500 to-violet-600 hover:from-brand-600 hover:to-violet-700 transition-all font-semibold text-lg shadow-xl shadow-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating…</> : <><Wand2 className="w-5 h-5" /> Generate Content</>}
          </button>
        </div>

        {/* Right Panel – Output */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {!content && !loading && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="h-full min-h-[500px] bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center p-12">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500/20 to-violet-500/20 border border-brand-500/20 flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-brand-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Ready to Create</h3>
                <p className="text-slate-500 text-sm max-w-xs">Fill in your topic and click Generate to create viral, platform-optimised content instantly.</p>
              </motion.div>
            )}

            {loading && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="h-full min-h-[500px] bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center p-12">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500/20 to-violet-500/20 border border-brand-500/20 flex items-center justify-center mb-4 animate-pulse">
                  <Sparkles className="w-8 h-8 text-brand-400" />
                </div>
                <p className="text-slate-300 font-medium mb-2">AI is crafting your content…</p>
                <p className="text-slate-500 text-sm">Analysing trends, optimising hooks, generating hashtags…</p>
              </motion.div>
            )}

            {content && !loading && (
              <motion.div key="content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                {/* Hook */}
                <div className="p-5 border-b border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-amber-400">
                      <Zap className="w-4 h-4" /> Hook
                    </div>
                    <CopyBtn text={content.hook} id="hook" />
                  </div>
                  <p className="text-slate-200 text-sm leading-relaxed font-medium">{content.hook}</p>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-800">
                  {[
                    { id: "caption", label: "Caption", icon: BookOpen },
                    { id: "script", label: "Reel Script", icon: Film },
                    { id: "hashtags", label: "Hashtags", icon: Hash },
                  ].map((tab) => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id as "caption" | "script" | "hashtags")}
                      className={`flex items-center gap-1.5 px-5 py-3 text-sm font-medium border-b-2 transition-all ${
                        activeTab === tab.id
                          ? "border-brand-500 text-brand-400"
                          : "border-transparent text-slate-500 hover:text-slate-300"
                      }`}>
                      <tab.icon className="w-3.5 h-3.5" />{tab.label}
                    </button>
                  ))}
                </div>

                <div className="p-5">
                  {activeTab === "caption" && (
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Caption</span>
                          <CopyBtn text={content.caption} id="caption" />
                        </div>
                        <pre className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">{content.caption}</pre>
                      </div>
                      <div className="border-t border-slate-800 pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400">
                            <Megaphone className="w-3.5 h-3.5" /> Call to Action
                          </div>
                          <CopyBtn text={content.cta} id="cta" />
                        </div>
                        <p className="text-sm text-slate-200">{content.cta}</p>
                      </div>
                      {content.creative_idea && (
                        <div className="border-t border-slate-800 pt-4">
                          <p className="text-xs font-semibold text-violet-400 mb-2 uppercase tracking-wider">Creative Idea</p>
                          <p className="text-sm text-slate-400">{content.creative_idea}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "script" && content.script && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Reel / Short Script</span>
                        <CopyBtn text={content.script} id="script" />
                      </div>
                      <pre className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans bg-slate-800/50 rounded-xl p-4">{content.script}</pre>
                    </div>
                  )}

                  {activeTab === "hashtags" && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hashtags ({content.hashtags.length})</span>
                        <CopyBtn text={content.hashtags.join(" ")} id="hashtags" />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {content.hashtags.map((tag) => (
                          <span key={tag} className="px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-sm">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="px-5 pb-5 flex gap-3">
                  <button onClick={handleGenerate}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 hover:border-slate-600 text-slate-300 text-sm font-medium transition-all">
                    <RefreshCw className="w-4 h-4" /> Regenerate
                  </button>
                  <button onClick={() => copyToClipboard(`${content.hook}\n\n${content.caption}\n\n${content.cta}\n\n${content.hashtags.join(" ")}`, "all")}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition-all">
                    {copied === "all" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    Copy All
                  </button>
                  <button className="ml-auto flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-400 text-sm font-medium transition-all">
                    <Sparkles className="w-4 h-4" /> Schedule Post
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
