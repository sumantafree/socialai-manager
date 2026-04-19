"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles, Calendar, BarChart3, TrendingUp, Zap, Shield,
  ArrowRight, Check, Star, Instagram, Twitter, Linkedin, Youtube,
  Globe, Brain
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

const FEATURES = [
  { icon: Brain, title: "AI Content Generator", desc: "Generate hooks, captions, CTAs, hashtags & reel scripts in seconds.", color: "from-violet-500 to-purple-600" },
  { icon: Calendar, title: "Smart Scheduler", desc: "Drag-and-drop calendar with auto-posting across all platforms.", color: "from-brand-500 to-blue-600" },
  { icon: BarChart3, title: "Analytics Dashboard", desc: "Real-time engagement, reach, and performance insights.", color: "from-emerald-500 to-teal-600" },
  { icon: TrendingUp, title: "Trend Discovery", desc: "Stay ahead with trending topics, sounds, and viral content ideas.", color: "from-rose-500 to-pink-600" },
  { icon: Zap, title: "Automation Engine", desc: "Auto-post, recycle top content, and repurpose blogs to social.", color: "from-amber-500 to-orange-600" },
  { icon: Shield, title: "Competitor Analysis", desc: "Monitor competitors and find untapped growth opportunities.", color: "from-slate-500 to-gray-600" },
];

const PLATFORMS = [
  { icon: Instagram, name: "Instagram", color: "text-pink-500" },
  { icon: Twitter, name: "Twitter / X", color: "text-sky-500" },
  { icon: Linkedin, name: "LinkedIn", color: "text-blue-700" },
  { icon: Youtube, name: "YouTube", color: "text-red-500" },
  { icon: Globe, name: "Facebook", color: "text-blue-600" },
  { icon: Sparkles, name: "Pinterest", color: "text-red-600" },
];

const PLANS = [
  {
    name: "Free",
    price: "₹0",
    period: "/month",
    description: "Get started for free",
    features: ["5 AI posts/month", "1 social account", "Basic analytics", "Manual scheduling"],
    cta: "Get Started",
    href: "/login",
    highlight: false,
  },
  {
    name: "Pro",
    price: "₹999",
    period: "/month",
    description: "For creators & solopreneurs",
    features: ["Unlimited AI posts", "5 social accounts", "Advanced analytics", "Auto-scheduling", "Trend Discovery", "AI Growth Advisor"],
    cta: "Start Pro Trial",
    href: "/login",
    highlight: true,
  },
  {
    name: "Agency",
    price: "₹2,999",
    period: "/month",
    description: "For teams & agencies",
    features: ["Everything in Pro", "Unlimited accounts", "Team collaboration", "Client management", "White-label reports", "Priority support"],
    cta: "Start Agency Trial",
    href: "/login",
    highlight: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#030712] text-white overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#030712]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">SocialAI Manager</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#platforms" className="hover:text-white transition-colors">Platforms</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link
              href="/login"
              className="text-sm px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 transition-colors font-medium"
            >
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-400 text-sm mb-8"
            >
              <Sparkles className="w-4 h-4" />
              AI-Powered Social Media Management
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight mb-6">
              Grow Your Social Media{" "}
              <span className="bg-gradient-to-r from-brand-400 via-violet-400 to-rose-400 bg-clip-text text-transparent">
                10x Faster
              </span>{" "}
              with AI
            </motion.h1>

            <motion.p variants={fadeUp} className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
              Generate viral content, auto-schedule posts, track analytics, and let AI grow your audience — all from one dashboard.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="flex items-center gap-2 px-8 py-4 rounded-xl bg-brand-500 hover:bg-brand-600 transition-all font-semibold text-lg shadow-xl shadow-brand-500/25"
              >
                Start for Free <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#features"
                className="flex items-center gap-2 px-8 py-4 rounded-xl border border-white/10 hover:border-white/20 transition-all font-medium text-slate-300"
              >
                See Features
              </a>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center justify-center gap-3 md:gap-6 text-xs md:text-sm text-slate-500">
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-500" /> Free plan available</span>
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-500" /> No credit card needed</span>
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-500" /> Cancel anytime</span>
            </motion.div>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-16 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#030712] z-10 bottom-0 h-1/3 top-auto" />
            <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-2xl shadow-black/50">
              <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Total Posts", value: "1,284", change: "+12%", color: "text-brand-400" },
                  { label: "Engagement", value: "94.2K", change: "+28%", color: "text-emerald-400" },
                  { label: "Reach", value: "2.1M", change: "+41%", color: "text-violet-400" },
                  { label: "Followers", value: "48.3K", change: "+8%", color: "text-rose-400" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white/5 rounded-xl p-4 text-left">
                    <p className="text-xs text-slate-500 mb-1">{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-emerald-400 mt-1">{stat.change} this month</p>
                  </div>
                ))}
              </div>
              <div className="h-32 bg-white/5 rounded-xl flex items-end gap-1 px-4 pb-4">
                {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 100].map((h, i) => (
                  <div key={i} className="flex-1 rounded-sm bg-gradient-to-t from-brand-500 to-violet-500 opacity-80"
                    style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Platforms */}
      <section id="platforms" className="py-16 px-6 border-y border-white/5">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-slate-500 text-sm mb-8 uppercase tracking-widest">Supported Platforms</p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {PLATFORMS.map((p) => (
              <div key={p.name} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                <p.icon className={`w-6 h-6 ${p.color}`} />
                <span className="font-medium">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} className="text-brand-400 text-sm uppercase tracking-widest mb-4">Features</motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold">
              Everything You Need to{" "}
              <span className="gradient-text">Dominate Social</span>
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {FEATURES.map((f) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                className="group p-6 rounded-2xl border border-white/5 bg-white/2 hover:bg-white/5 hover:border-white/10 transition-all"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4`}>
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-brand-400 text-sm uppercase tracking-widest mb-4">Pricing</p>
            <h2 className="text-4xl md:text-5xl font-bold">Simple, Transparent Pricing</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
            {PLANS.map((plan) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`relative p-8 rounded-2xl border transition-all ${
                  plan.highlight
                    ? "border-brand-500 bg-gradient-to-b from-brand-500/10 to-brand-600/5 shadow-xl shadow-brand-500/20"
                    : "border-white/10 bg-white/2"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="flex items-center gap-1 px-4 py-1 rounded-full bg-brand-500 text-xs font-semibold">
                      <Star className="w-3 h-3" /> Most Popular
                    </span>
                  </div>
                )}
                <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                <p className="text-slate-500 text-sm mb-4">{plan.description}</p>
                <div className="flex items-end gap-1 mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-slate-500 mb-1">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`block w-full text-center py-3 rounded-xl font-semibold transition-all ${
                    plan.highlight
                      ? "bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/30"
                      : "border border-white/10 hover:border-white/20 text-slate-300"
                  }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-12 rounded-3xl bg-gradient-to-br from-brand-500/20 via-violet-500/10 to-rose-500/10 border border-white/10"
          >
            <h2 className="text-4xl font-bold mb-4">Ready to Go Viral?</h2>
            <p className="text-slate-400 mb-8">Join thousands of creators and brands using SocialAI Manager to grow faster.</p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-brand-500 hover:bg-brand-600 transition-all font-semibold text-lg shadow-xl shadow-brand-500/30"
            >
              Start for Free <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span>SocialAI Manager</span>
          </div>
          <p>© {new Date().getFullYear()} SocialAI Manager. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
