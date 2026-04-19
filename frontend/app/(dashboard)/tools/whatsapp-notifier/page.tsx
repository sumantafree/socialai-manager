"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  MessageCircle, Bell, BellOff, CheckCircle2, Send,
  Smartphone, Zap, Calendar, BarChart3, Lightbulb,
} from "lucide-react";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const NOTIFICATION_OPTIONS = [
  {
    id: "scheduled_post",
    label: "Post Scheduled",
    description: "Get notified when a post is successfully scheduled",
    icon: Calendar,
    color: "text-brand-400",
    bg: "bg-brand-500/10",
  },
  {
    id: "weekly_report",
    label: "Weekly Analytics Report",
    description: "Receive your performance summary every Monday",
    icon: BarChart3,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    id: "ai_tips",
    label: "AI Growth Tips",
    description: "Daily actionable tips to grow your audience",
    icon: Lightbulb,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
];

export default function WhatsAppNotifierPage() {
  const [phone, setPhone] = useState("");
  const [selected, setSelected] = useState<string[]>(["scheduled_post", "weekly_report"]);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "testing" | "error">("idle");
  const [testSent, setTestSent] = useState(false);

  const toggleOption = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!phone || phone.length < 10) return;
    setStatus("saving");
    try {
      const res = await fetch(`${BACKEND}/tools/whatsapp/setup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: phone, notifications: selected }),
      });
      if (!res.ok) throw new Error();
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  };

  const handleTest = async () => {
    setStatus("testing");
    try {
      const res = await fetch(`${BACKEND}/tools/whatsapp/send-test`, {
        method: "POST",
      });
      if (!res.ok) throw new Error();
      setTestSent(true);
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  };

  const formatPhone = (value: string) => {
    // Allow only digits, +, spaces, dashes, parentheses
    return value.replace(/[^\d\s\+\-\(\)]/g, "");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-2">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-4"
      >
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
          <MessageCircle className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">WhatsApp Notifier</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Receive real-time updates on your phone via WhatsApp — scheduled posts,
            weekly reports, and AI growth tips.
          </p>
        </div>
      </motion.div>

      {/* Phone Input */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 space-y-4"
      >
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-200">Your WhatsApp Number</h2>
        </div>
        <div className="flex gap-3">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            placeholder="+1 (555) 000-0000"
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>
        <p className="text-[11px] text-slate-500">
          Include country code (e.g. +1 for US, +44 for UK). Your number is stored
          securely and never shared.
        </p>
      </motion.div>

      {/* Notification Options */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 space-y-3"
      >
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-4 h-4 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-200">Notification Types</h2>
        </div>

        {NOTIFICATION_OPTIONS.map((opt) => {
          const on = selected.includes(opt.id);
          return (
            <button
              key={opt.id}
              onClick={() => toggleOption(opt.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                on
                  ? "border-brand-500/40 bg-brand-500/5"
                  : "border-slate-700/50 hover:border-slate-600"
              }`}
            >
              <div className={`w-9 h-9 rounded-lg ${opt.bg} flex items-center justify-center flex-shrink-0`}>
                <opt.icon className={`w-4 h-4 ${opt.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200">{opt.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{opt.description}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                on ? "border-brand-500 bg-brand-500" : "border-slate-600"
              }`}>
                {on && <CheckCircle2 className="w-3 h-3 text-white" />}
              </div>
            </button>
          );
        })}
      </motion.div>

      {/* Preview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-800/30 border border-slate-700/30 rounded-2xl p-5 space-y-3"
      >
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
          Message Preview
        </p>
        <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-xl p-4 space-y-1">
          <p className="text-xs text-emerald-300 font-medium">✅ Post Scheduled — SocialAI Manager</p>
          <p className="text-xs text-slate-400">Platform: Instagram</p>
          <p className="text-xs text-slate-400">Scheduled: Tomorrow at 9:00 AM UTC</p>
          <p className="text-xs text-slate-500 italic mt-1">
            Preview: "5 morning routines that transformed my productivity..."
          </p>
          <p className="text-xs text-slate-500 mt-2">Manage at socialai.app/calendar</p>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="flex gap-3"
      >
        <button
          onClick={handleSave}
          disabled={!phone || phone.length < 10 || selected.length === 0 || status === "saving"}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity text-sm font-semibold"
        >
          {status === "saving" ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : status === "saved" ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <Zap className="w-4 h-4" />
          )}
          {status === "saved" ? "Saved!" : status === "saving" ? "Saving…" : "Save Preferences"}
        </button>

        <button
          onClick={handleTest}
          disabled={!phone || status === "testing" || status === "saving"}
          className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-700 hover:border-slate-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium text-slate-300"
        >
          {status === "testing" ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          {testSent ? "Sent!" : "Test"}
        </button>
      </motion.div>

      {status === "error" && (
        <p className="text-sm text-red-400 text-center">
          Something went wrong. Please try again.
        </p>
      )}

      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
        <BellOff className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-slate-500">
          WhatsApp notifications are powered by the Twilio WhatsApp Business API.
          Requires a Twilio account with WhatsApp Sandbox or Business API approval.
          Configure{" "}
          <span className="text-slate-400 font-mono">TWILIO_ACCOUNT_SID</span>,{" "}
          <span className="text-slate-400 font-mono">TWILIO_AUTH_TOKEN</span>, and{" "}
          <span className="text-slate-400 font-mono">TWILIO_WHATSAPP_FROM</span>{" "}
          in your backend environment variables.
        </p>
      </div>
    </div>
  );
}
