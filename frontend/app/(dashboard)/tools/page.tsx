"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  FileText, Hash, Film, Globe, MessageCircle,
  ArrowRight, Sparkles, Zap
} from "lucide-react";

const TOOLS = [
  {
    href: "/tools/blog-converter",
    icon: FileText,
    title: "Blog → Social Converter",
    description: "Repurpose any blog post into platform-native social media content for Instagram, Twitter, LinkedIn, and more.",
    badge: "Popular",
    color: "from-brand-500/20 to-blue-600/10",
    border: "border-brand-500/20",
    iconColor: "text-brand-400",
  },
  {
    href: "/tools/hashtag-generator",
    icon: Hash,
    title: "Hashtag Generator",
    description: "AI-powered hashtag strategy with 4 categories: viral, niche, long-tail, and trending — for every platform.",
    badge: "Free",
    color: "from-emerald-500/20 to-teal-600/10",
    border: "border-emerald-500/20",
    iconColor: "text-emerald-400",
  },
  {
    href: "/tools/reel-script",
    icon: Film,
    title: "Reel Script Generator",
    description: "Full scene-by-scene video scripts with voiceover, visuals, text overlays and audio recommendations.",
    badge: "New",
    color: "from-violet-500/20 to-purple-600/10",
    border: "border-violet-500/20",
    iconColor: "text-violet-400",
  },
  {
    href: "/competitor",
    icon: Globe,
    title: "Competitor Analysis",
    description: "Analyse any competitor's content strategy, find content gaps, and discover opportunities to outrank them.",
    badge: "Pro",
    color: "from-rose-500/20 to-pink-600/10",
    border: "border-rose-500/20",
    iconColor: "text-rose-400",
  },
  {
    href: "/tools/whatsapp-notifier",
    icon: MessageCircle,
    title: "WhatsApp Notifier",
    description: "Get your scheduled post reminders and AI tips delivered directly to WhatsApp — never miss a posting window.",
    badge: "New",
    color: "from-emerald-500/20 to-green-600/10",
    border: "border-emerald-500/20",
    iconColor: "text-emerald-400",
  },
];

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

const BADGE_COLORS: Record<string, string> = {
  Popular: "bg-brand-500/10 text-brand-300 border-brand-500/20",
  Free: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  New: "bg-violet-500/10 text-violet-300 border-violet-500/20",
  Pro: "bg-rose-500/10 text-rose-300 border-rose-500/20",
};

export default function ToolsPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
      <motion.div variants={fadeUp}>
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-5 h-5 text-amber-400" />
          <h1 className="text-2xl font-bold">Bonus Tools</h1>
        </div>
        <p className="text-slate-400 text-sm">
          Powerful utilities to supercharge your social media workflow
        </p>
      </motion.div>

      {/* AI tip banner */}
      <motion.div variants={fadeUp}
        className="flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-r from-brand-500/10 via-violet-500/5 to-transparent border border-brand-500/20">
        <Sparkles className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-slate-200">Pro tip: Combine the tools</p>
          <p className="text-xs text-slate-400 mt-0.5">
            Use Blog Converter → copy the caption → feed it into Reel Script Generator → use Hashtag Generator to finish it off. Your entire content workflow in 3 steps.
          </p>
        </div>
      </motion.div>

      {/* Tool cards */}
      <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
        {TOOLS.map((tool) => {
          const card = (
            <motion.div
              variants={fadeUp}
              className={`relative group p-6 rounded-2xl bg-gradient-to-br ${tool.color} border ${tool.border} transition-all duration-200 ${
                tool.disabled ? "opacity-60 cursor-default" : "hover:scale-[1.01] hover:shadow-xl hover:shadow-black/20"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl bg-slate-900/60 border ${tool.border} flex items-center justify-center`}>
                  <tool.icon className={`w-5 h-5 ${tool.iconColor}`} />
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${BADGE_COLORS[tool.badge] ?? ""}`}>
                  {tool.badge}
                </span>
              </div>

              <h3 className="font-semibold text-lg mb-1.5">{tool.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">{tool.description}</p>

              {!tool.disabled && (
                <div className={`flex items-center gap-1.5 text-sm font-medium ${tool.iconColor} group-hover:gap-2.5 transition-all`}>
                  Open Tool <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </motion.div>
          );

          return tool.disabled ? (
            <div key={tool.href}>{card}</div>
          ) : (
            <Link key={tool.href} href={tool.href}>
              {card}
            </Link>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
