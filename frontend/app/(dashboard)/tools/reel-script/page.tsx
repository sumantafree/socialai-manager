"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Film, Wand2, Copy, Check, Loader2, Play, Clock,
  Sparkles, RefreshCw, Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface ReelScript {
  title: string;
  duration: string;
  hook: string;
  scenes: Array<{
    timestamp: string;
    visual: string;
    voiceover: string;
    text_overlay: string;
  }>;
  cta: string;
  audio_suggestion: string;
  thumbnail_idea: string;
  estimated_views: string;
}

const DURATIONS = ["15s", "30s", "60s", "90s"];
const STYLES = ["Educational", "Motivational", "Entertaining", "Story-driven", "Tutorial", "Controversial Opinion"];
const PLATFORMS = ["Instagram Reels", "YouTube Shorts", "TikTok"];

export default function ReelScriptPage() {
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState("30s");
  const [style, setStyle] = useState("Educational");
  const [platform, setPlatform] = useState("Instagram Reels");
  const [hook, setHook] = useState("");
  const [loading, setLoading] = useState(false);
  const [script, setScript] = useState<ReelScript | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setScript(null);

    await new Promise((r) => setTimeout(r, 1200));

    const durationMap: Record<string, number> = { "15s": 2, "30s": 4, "60s": 6, "90s": 8 };
    const sceneCount = durationMap[duration] || 4;

    const scenes = Array.from({ length: sceneCount }, (_, i) => {
      const timestamps = ["0-3s", "3-8s", "8-15s", "15-22s", "22-28s", "28-40s", "40-52s", "52-60s"];
      const descriptions = [
        { visual: "Close-up face, direct to camera, confident", voiceover: `Hook: "Stop scrolling — this ${topic} secret will blow your mind"`, overlay: "❓" },
        { visual: "Show the problem — relatable moment", voiceover: `"Most people struggle with ${topic} because they do this wrong…"`, overlay: "The Problem 👆" },
        { visual: "Text list with checkmarks appearing", voiceover: `"Here's what you actually need: Number 1…"`, overlay: "✅ Step 1" },
        { visual: "Screen recording or demo visual", voiceover: `"This is how it works in real life. Watch this…"`, overlay: "Watch 👀" },
        { visual: "Transformation / result", voiceover: `"After applying this, here's what changed…"`, overlay: "The Result 🚀" },
        { visual: "Point directly to camera", voiceover: `"And the best part? You can start today. Here's how…"`, overlay: "Start Now ⚡" },
        { visual: "Quick montage of value points", voiceover: `"Remember: ${topic} is about consistency, not perfection"`, overlay: "Key Takeaway 💡" },
        { visual: "CTA — smile, point to text", voiceover: `"Follow for more ${topic} tips every week!"`, overlay: "Follow for More 🔔" },
      ];
      const d = descriptions[i % descriptions.length];
      return {
        timestamp: timestamps[i],
        visual: d.visual,
        voiceover: d.voiceover,
        text_overlay: d.overlay,
      };
    });

    setScript({
      title: `${topic} — ${style} Reel (${duration})`,
      duration,
      hook: hook || `This ${topic} hack took me from zero to results in 30 days 🔥`,
      scenes,
      cta: `Follow for daily ${topic} tips! Drop a 🙌 if this helped`,
      audio_suggestion: style === "Motivational"
        ? "Trending motivational track (BPM 120–140) or viral audio with high saves"
        : style === "Tutorial"
        ? "Upbeat background music (low volume), clear voiceover essential"
        : "Use currently trending audio from Reels explore page for maximum reach",
      thumbnail_idea: `Bold text overlay on bright background: "${topic.toUpperCase()} HACK" — use contrasting colours, show your face in corner`,
      estimated_views: ["100K–500K", "50K–200K", "500K–2M"][Math.floor(Math.random() * 3)],
    });

    setLoading(false);
  };

  const copySection = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const copyFullScript = () => {
    if (!script) return;
    const text = [
      `REEL SCRIPT: ${script.title}`,
      `Duration: ${script.duration} | Platform: ${platform}`,
      "",
      `HOOK: ${script.hook}`,
      "",
      "SCENES:",
      ...script.scenes.map((s) =>
        `[${s.timestamp}]\nVisual: ${s.visual}\nVO: ${s.voiceover}\nOverlay: ${s.text_overlay}`
      ),
      "",
      `CTA: ${script.cta}`,
      `Audio: ${script.audio_suggestion}`,
      `Thumbnail: ${script.thumbnail_idea}`,
    ].join("\n");
    copySection(text, "full");
  };

  const downloadScript = () => {
    if (!script) return;
    const text = [
      `REEL SCRIPT: ${script.title}`,
      `Platform: ${platform} | Duration: ${script.duration} | Style: ${style}`,
      `Estimated Views: ${script.estimated_views}`,
      "=".repeat(50),
      "",
      `HOOK (say this in the first 3 seconds):`,
      script.hook,
      "",
      "SCENE BREAKDOWN:",
      ...script.scenes.map((s, i) =>
        `\nScene ${i + 1} [${s.timestamp}]\n📸 Visual: ${s.visual}\n🎙️ Voiceover: ${s.voiceover}\n📝 Text Overlay: ${s.text_overlay}`
      ),
      "",
      `📣 CTA: ${script.cta}`,
      `🎵 Audio: ${script.audio_suggestion}`,
      `🖼️ Thumbnail: ${script.thumbnail_idea}`,
    ].join("\n");

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reel-script-${topic.slice(0, 20).replace(/\s+/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reel Script Generator</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          Generate scene-by-scene video scripts optimised for maximum watch time and virality
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Config Panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Topic *</label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. morning productivity, AI tools, fitness"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Opening Hook (optional)</label>
              <Input
                value={hook}
                onChange={(e) => setHook(e.target.value)}
                placeholder="Leave blank for AI to write it…"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Duration</label>
              <div className="flex gap-2">
                {DURATIONS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={`flex-1 py-2 rounded-xl border text-sm font-medium transition-all ${
                      duration === d
                        ? "border-brand-500 bg-brand-500/10 text-brand-300"
                        : "border-slate-700 text-slate-400 hover:border-slate-600"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Platform</label>
              <div className="flex flex-col gap-2">
                {PLATFORMS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPlatform(p)}
                    className={`py-2 px-3 rounded-xl border text-sm text-left transition-all ${
                      platform === p
                        ? "border-brand-500 bg-brand-500/10 text-brand-300"
                        : "border-slate-700 text-slate-400 hover:border-slate-600"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Style</label>
              <div className="flex flex-wrap gap-2">
                {STYLES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStyle(s)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                      style === s
                        ? "border-violet-500 bg-violet-500/10 text-violet-300"
                        : "border-slate-700 text-slate-400 hover:border-slate-600"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button onClick={handleGenerate} disabled={loading || !topic.trim()} className="w-full h-12 text-base" variant="gradient">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Writing script…</> : <><Film className="w-5 h-5" /> Generate Script</>}
          </Button>
        </div>

        {/* Script Output */}
        <div className="lg:col-span-3">
          {!script && !loading && (
            <div className="h-full min-h-[500px] bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center p-12">
              <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
                <Film className="w-7 h-7 text-violet-400" />
              </div>
              <h3 className="font-semibold mb-2">Ready to Script</h3>
              <p className="text-slate-500 text-sm max-w-xs">
                Set your topic, duration and style — get a full scene-by-scene script with voiceover, visuals and overlays.
              </p>
            </div>
          )}

          {loading && (
            <div className="h-full min-h-[500px] bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center p-12">
              <Film className="w-10 h-10 text-violet-400 animate-pulse mb-4" />
              <p className="text-slate-300 font-medium">Writing your viral script…</p>
              <p className="text-slate-500 text-sm mt-1">Optimising for {platform} · {duration} · {style}</p>
            </div>
          )}

          <AnimatePresence>
            {script && !loading && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="p-5 border-b border-slate-800">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-200">{script.title}</h3>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <Badge variant="violet"><Clock className="w-3 h-3 mr-1" />{script.duration}</Badge>
                        <Badge variant="secondary">{platform}</Badge>
                        <Badge variant="success"><Sparkles className="w-3 h-3 mr-1" />{script.estimated_views} views est.</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button variant="outline" size="sm" onClick={handleGenerate} className="h-8 text-xs">
                        <RefreshCw className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={downloadScript} className="h-8 text-xs">
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" onClick={copyFullScript} className="h-8 text-xs">
                        {copied === "full" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied === "full" ? "Copied!" : "Copy All"}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Hook */}
                <div className="p-5 border-b border-slate-800 bg-amber-500/5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Play className="w-3.5 h-3.5" /> Opening Hook (0–3s)
                    </p>
                    <Button variant="ghost" size="sm" className="h-6 text-xs"
                      onClick={() => copySection(script.hook, "hook")}>
                      {copied === "hook" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </Button>
                  </div>
                  <p className="text-sm text-slate-200 font-medium italic">&quot;{script.hook}&quot;</p>
                </div>

                {/* Scenes */}
                <div className="p-5 space-y-3 border-b border-slate-800 max-h-[380px] overflow-y-auto">
                  {script.scenes.map((scene, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex-shrink-0 w-14 text-center">
                        <span className="text-xs font-mono text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
                          {scene.timestamp}
                        </span>
                      </div>
                      <div className="flex-1 p-3 bg-slate-800/40 rounded-xl border border-slate-700/40 space-y-1.5">
                        <p className="text-xs text-brand-400 font-medium">📸 {scene.visual}</p>
                        <p className="text-xs text-slate-200">🎙️ {scene.voiceover}</p>
                        <p className="text-xs text-amber-400">📝 {scene.text_overlay}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer info */}
                <div className="p-5 space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="text-base">📣</span>
                    <div>
                      <p className="text-xs font-semibold text-rose-400 mb-0.5">Call to Action</p>
                      <p className="text-sm text-slate-200">{script.cta}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-base">🎵</span>
                    <div>
                      <p className="text-xs font-semibold text-emerald-400 mb-0.5">Audio Recommendation</p>
                      <p className="text-sm text-slate-300">{script.audio_suggestion}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-base">🖼️</span>
                    <div>
                      <p className="text-xs font-semibold text-violet-400 mb-0.5">Thumbnail Idea</p>
                      <p className="text-sm text-slate-300">{script.thumbnail_idea}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
