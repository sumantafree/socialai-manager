"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Hash, Wand2, Copy, Check, Loader2, TrendingUp,
  Target, Zap, BarChart2, RefreshCw, Plus, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface HashtagGroup {
  label: string;
  description: string;
  tags: string[];
  color: string;
  icon: React.ReactNode;
}

const NICHE_PRESETS = [
  "Fitness & Health", "Business & Finance", "Tech & AI", "Travel",
  "Food & Lifestyle", "Fashion & Beauty", "Personal Development", "Education",
  "Real Estate", "Photography", "Music", "Gaming",
];

export default function HashtagGeneratorPage() {
  const [topic, setTopic] = useState("");
  const [niche, setNiche] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<HashtagGroup[] | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [customTag, setCustomTag] = useState("");

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setGroups(null);
    setSelected([]);

    await new Promise((r) => setTimeout(r, 900));

    const t = topic.toLowerCase();
    const n = niche.toLowerCase().replace(/\s+/g, "");

    setGroups([
      {
        label: "Viral & High Volume",
        description: "50M+ posts — maximum reach, high competition",
        color: "text-rose-400",
        icon: <TrendingUp className="w-3.5 h-3.5" />,
        tags: [
          `#${n || t}`, `#${t}tips`, "#motivation", "#success", "#entrepreneur",
          "#growthmindset", "#inspiration", "#mindset", "#hustle", "#goals",
        ],
      },
      {
        label: "Niche & Targeted",
        description: "1M–10M posts — balanced reach + relevance",
        color: "text-brand-400",
        icon: <Target className="w-3.5 h-3.5" />,
        tags: [
          `#${t}strategy`, `#${t}growth`, `#${t}tips2025`, `#${n}life`,
          `#${n}community`, `#${n}mindset`, `#daily${t}`, `#${t}hack`,
          `#${t}coach`, `#${n}goals`,
        ],
      },
      {
        label: "Long-tail & Specific",
        description: "Under 500K posts — high conversion, lower competition",
        color: "text-emerald-400",
        icon: <Zap className="w-3.5 h-3.5" />,
        tags: [
          `#${t}for${n || "beginners"}`, `#${t}secrets`, `#${n}transformation`,
          `#${t}lifestyle`, `#${n}journey2025`, `#${t}results`, `#learn${t}`,
          `#${n}blueprint`, `#${t}system`, `#${n}wins`,
        ],
      },
      {
        label: "Trending Now",
        description: "Currently gaining momentum this week",
        color: "text-amber-400",
        icon: <BarChart2 className="w-3.5 h-3.5" />,
        tags: [
          "#viral2025", "#trending", `#${t}2025`, "#contentcreator",
          "#digitalmarketing", "#aitools", "#creatorsofinstagram",
          "#personalbranding", "#onlinebusiness", "#sidehustle",
        ],
      },
    ]);

    // Auto-select best mix
    setSelected([
      `#${n || t}`, `#${t}tips`, "#motivation", "#entrepreneur",
      `#${t}strategy`, `#${t}growth`, `#${n}life`,
      `#${t}for${n || "beginners"}`, "#trending", `#${t}2025`,
    ]);

    setLoading(false);
  };

  const toggleTag = (tag: string) => {
    setSelected((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const addCustom = () => {
    const tag = customTag.startsWith("#") ? customTag : `#${customTag}`;
    if (tag.length > 1) {
      setSelected((prev) => prev.includes(tag) ? prev : [...prev, tag]);
      setCustomTag("");
    }
  };

  const copySelected = () => {
    navigator.clipboard.writeText(selected.join(" "));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectAll = () => {
    if (!groups) return;
    setSelected(groups.flatMap((g) => g.tags));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Hashtag Generator</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          AI-powered hashtag strategy — categorised by reach and competition
        </p>
      </div>

      {/* Input */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Topic / Keyword</label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              placeholder="e.g. productivity, fitness, AI"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Niche</label>
            <select
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 focus:border-brand-500 focus:outline-none text-sm text-slate-200 h-9"
            >
              <option value="">Select niche…</option>
              {NICHE_PRESETS.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 focus:border-brand-500 focus:outline-none text-sm text-slate-200 h-9"
            >
              <option value="instagram">Instagram (10–15 tags)</option>
              <option value="twitter">Twitter/X (1–3 tags)</option>
              <option value="linkedin">LinkedIn (3–5 tags)</option>
              <option value="youtube">YouTube (5–8 tags)</option>
            </select>
          </div>
        </div>
        <Button onClick={handleGenerate} disabled={loading || !topic.trim()} className="w-full sm:w-auto h-10" variant="gradient">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</> : <><Hash className="w-4 h-4" /> Generate Hashtags</>}
        </Button>
      </div>

      {/* Results */}
      <AnimatePresence>
        {groups && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            {/* Hashtag groups */}
            <div className="grid md:grid-cols-2 gap-4">
              {groups.map((group) => (
                <div key={group.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={group.color}>{group.icon}</span>
                    <h3 className={`text-sm font-semibold ${group.color}`}>{group.label}</h3>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">{group.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {group.tags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={cn(
                          "px-2.5 py-1 rounded-full text-xs font-medium border transition-all",
                          selected.has(tag)
                            ? "bg-brand-500/20 border-brand-500/50 text-brand-300"
                            : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200"
                        )}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Selected + Copy panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm">Selected Hashtags</h3>
                  <Badge variant="secondary">{selected.size}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={selectAll} className="text-xs h-7">
                    Select All
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())} className="text-xs h-7">
                    Clear
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleGenerate} className="text-xs h-7">
                    <RefreshCw className="w-3 h-3" />
                  </Button>
                  <Button size="sm" onClick={copySelected} disabled={selected.size === 0} className="h-7 text-xs">
                    {copied ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy All</>}
                  </Button>
                </div>
              </div>

              {/* Selected tags display */}
              <div className="min-h-[60px] bg-slate-800/50 rounded-xl p-3 flex flex-wrap gap-2 mb-3">
                {[...selected].map((tag) => (
                  <span key={tag} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-300 text-xs">
                    {tag}
                    <button onClick={() => toggleTag(tag)} className="text-brand-400/60 hover:text-rose-400 transition-colors ml-0.5">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
                {selected.size === 0 && (
                  <span className="text-slate-500 text-sm self-center">Click hashtags above to select them</span>
                )}
              </div>

              {/* Add custom */}
              <div className="flex gap-2">
                <Input
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCustom()}
                  placeholder="Add custom hashtag…"
                  className="h-8 text-xs"
                />
                <Button onClick={addCustom} size="sm" variant="outline" className="h-8 px-3 flex-shrink-0">
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
