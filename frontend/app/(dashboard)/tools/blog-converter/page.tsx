"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Wand2, Instagram, Twitter, Linkedin, Youtube,
  Globe, Copy, Check, Loader2, ChevronDown, ChevronUp, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const PLATFORMS = [
  { id: "instagram", label: "Instagram", icon: Instagram, color: "#ec4899" },
  { id: "twitter", label: "Twitter/X", icon: Twitter, color: "#38bdf8" },
  { id: "linkedin", label: "LinkedIn", icon: Linkedin, color: "#3b82f6" },
  { id: "youtube", label: "YouTube", icon: Youtube, color: "#ef4444" },
  { id: "facebook", label: "Facebook", icon: Globe, color: "#6366f1" },
];

interface PlatformPost {
  hook: string;
  caption: string;
  cta: string;
  hashtags: string[];
}

export default function BlogConverterPage() {
  const [blogContent, setBlogContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["instagram", "twitter", "linkedin"]);
  const [tone, setTone] = useState("Inspirational");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Record<string, PlatformPost> | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>("instagram");

  const wordCount = blogContent.trim().split(/\s+/).filter(Boolean).length;

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleConvert = async () => {
    if (!blogContent.trim() || selectedPlatforms.length === 0) return;
    setLoading(true);
    setResults(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/convert-blog`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: blogContent, platforms: selectedPlatforms, tone }),
      });
      if (res.ok) {
        const data = await res.json();
        setResults(data.posts);
      } else throw new Error();
    } catch {
      // Demo fallback
      const demo: Record<string, PlatformPost> = {};
      const snippet = blogContent.slice(0, 120).trim();
      selectedPlatforms.forEach((p) => {
        demo[p] = {
          hook: `🔥 This insight from our latest blog will change how you think about your strategy…`,
          caption: `We just published a deep-dive on this topic and here are the 3 biggest takeaways:\n\n1️⃣ ${snippet.slice(0, 60)}…\n\n2️⃣ The frameworks that actually work in 2025\n\n3️⃣ How to apply this starting today\n\nFull article linked in bio 👆`,
          cta: p === "linkedin"
            ? "What's your take? Drop your thoughts in the comments!"
            : p === "twitter"
            ? "Thread incoming 🧵 — follow to catch it"
            : "Save this + check the full article (link in bio) 💾",
          hashtags: ["#content", "#strategy", "#growth", "#digitalmarketing", "#socialmedia"],
        };
      });
      setResults(demo);
    }

    setLoading(false);
    if (selectedPlatforms.length > 0) setExpanded(selectedPlatforms[0]);
  };

  const copyPost = (platform: string) => {
    const post = results?.[platform];
    if (!post) return;
    const text = `${post.hook}\n\n${post.caption}\n\n${post.cta}\n\n${post.hashtags.join(" ")}`;
    navigator.clipboard.writeText(text);
    setCopied(platform);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Blog → Social Converter</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          Paste your blog post and get platform-optimised social content instantly
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Input Panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-slate-300">Blog Content</label>
              <span className="text-xs text-slate-500">{wordCount} words</span>
            </div>
            <Textarea
              value={blogContent}
              onChange={(e) => setBlogContent(e.target.value)}
              placeholder="Paste your full blog post here…"
              className="min-h-[220px] text-sm"
            />
            {wordCount < 50 && blogContent.length > 0 && (
              <p className="text-xs text-amber-400 mt-1.5">Add more content for better results (50+ words recommended)</p>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <p className="text-sm font-semibold text-slate-300 mb-3">Target Platforms</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {PLATFORMS.map((p) => {
                const selected = selectedPlatforms.includes(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => togglePlatform(p.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-sm transition-all ${
                      selected
                        ? "border-brand-500 bg-brand-500/10 text-white"
                        : "border-slate-700 text-slate-400 hover:border-slate-600"
                    }`}
                  >
                    <p.icon className="w-4 h-4" style={{ color: p.color }} />
                    {p.label}
                  </button>
                );
              })}
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 focus:border-brand-500 focus:outline-none text-sm text-slate-200"
              >
                {["Inspirational", "Educational", "Professional", "Casual", "Bold & Direct"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <Button
            onClick={handleConvert}
            disabled={loading || !blogContent.trim() || selectedPlatforms.length === 0}
            className="w-full h-12 text-base"
            variant="gradient"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Converting…</>
            ) : (
              <><Wand2 className="w-5 h-5" /> Convert to Social Posts</>
            )}
          </Button>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-3 space-y-3">
          {!results && !loading && (
            <div className="h-full min-h-[400px] bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center p-12">
              <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-4">
                <FileText className="w-7 h-7 text-brand-400" />
              </div>
              <h3 className="font-semibold mb-2">Ready to Convert</h3>
              <p className="text-slate-500 text-sm max-w-xs">
                Paste your blog content, select platforms, and let AI repurpose it into platform-native posts.
              </p>
            </div>
          )}

          {loading && (
            <div className="h-full min-h-[400px] bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center p-12">
              <Loader2 className="w-10 h-10 text-brand-400 animate-spin mb-4" />
              <p className="text-slate-300 font-medium">Converting your blog…</p>
              <p className="text-slate-500 text-sm mt-1">Generating {selectedPlatforms.length} platform-specific posts</p>
            </div>
          )}

          <AnimatePresence>
            {results && !loading &&
              PLATFORMS.filter((p) => selectedPlatforms.includes(p.id)).map((p) => {
                const post = results[p.id];
                if (!post) return null;
                const isExpanded = expanded === p.id;
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden"
                  >
                    <button
                      onClick={() => setExpanded(isExpanded ? null : p.id)}
                      className="w-full flex items-center gap-3 p-4 hover:bg-slate-800/40 transition-colors"
                    >
                      <p.icon className="w-5 h-5" style={{ color: p.color }} />
                      <span className="font-semibold text-sm flex-1 text-left">{p.label}</span>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); copyPost(p.id); }}
                          className="h-7 text-xs"
                        >
                          {copied === p.id ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                        </Button>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0 }} animate={{ height: "auto" }}
                        className="border-t border-slate-800"
                      >
                        <div className="p-4 space-y-3">
                          <div>
                            <p className="text-xs font-semibold text-amber-400 mb-1 uppercase tracking-wider">Hook</p>
                            <p className="text-sm text-slate-200">{post.hook}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-brand-400 mb-1 uppercase tracking-wider">Caption</p>
                            <pre className="text-sm text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">{post.caption}</pre>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-rose-400 mb-1 uppercase tracking-wider">CTA</p>
                            <p className="text-sm text-slate-200">{post.cta}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Hashtags</p>
                            <div className="flex flex-wrap gap-1.5">
                              {post.hashtags.map((tag) => (
                                <span key={tag} className="px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-300 text-xs border border-brand-500/20">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
          </AnimatePresence>

          {results && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <p className="text-xs text-emerald-300">
                {selectedPlatforms.length} posts generated! Review each one and schedule directly from the Content Calendar.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
