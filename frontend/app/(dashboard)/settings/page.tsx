"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Instagram, Twitter, Linkedin, Youtube, Globe, Check, Plus,
  CreditCard, User, Bell, Shield, Sparkles, ExternalLink,
  ChevronRight, Zap
} from "lucide-react";

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

const CONNECTED_ACCOUNTS = [
  { platform: "instagram", name: "Instagram", handle: "@myaccount", connected: true, icon: Instagram, color: "text-pink-400", followers: "12.4K" },
  { platform: "twitter", name: "Twitter/X", handle: "@myhandle", connected: true, icon: Twitter, color: "text-sky-400", followers: "8.2K" },
  { platform: "linkedin", name: "LinkedIn", handle: "My Name", connected: false, icon: Linkedin, color: "text-blue-400", followers: null },
  { platform: "youtube", name: "YouTube", handle: "My Channel", connected: false, icon: Youtube, color: "text-red-400", followers: null },
  { platform: "facebook", name: "Facebook", handle: "My Page", connected: false, icon: Globe, color: "text-blue-500", followers: null },
];

const PLANS = [
  { id: "free", name: "Free", price: "₹0", features: ["5 AI posts/month", "1 social account", "Basic analytics"] },
  { id: "pro", name: "Pro", price: "₹999/mo", features: ["Unlimited posts", "5 accounts", "Advanced analytics", "Auto-scheduling"], highlight: true },
  { id: "agency", name: "Agency", price: "₹2,999/mo", features: ["Everything in Pro", "Unlimited accounts", "Team collaboration", "White-label"] },
];

export default function SettingsPage() {
  const [currentPlan] = useState("pro");
  const [accounts, setAccounts] = useState(CONNECTED_ACCOUNTS);
  const [notifications, setNotifications] = useState({ email: true, push: true, weekly: true, tips: false });
  const [activeTab, setActiveTab] = useState<"accounts" | "plan" | "profile" | "notifications">("accounts");

  const toggleConnect = (platform: string) => {
    setAccounts((prev) =>
      prev.map((a) => a.platform === platform ? { ...a, connected: !a.connected } : a)
    );
  };

  const tabs = [
    { id: "accounts", label: "Social Accounts", icon: Sparkles },
    { id: "plan", label: "Plan & Billing", icon: CreditCard },
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-slate-400 text-sm mt-0.5">Manage your accounts, plan, and preferences</p>
      </motion.div>

      {/* Mobile: horizontal tab strip */}
      <div className="flex gap-1 overflow-x-auto pb-1 md:hidden">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
              activeTab === tab.id
                ? "bg-brand-500/10 text-brand-300 border border-brand-500/20"
                : "text-slate-400 border border-slate-700 hover:text-white"
            }`}>
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        {/* Sidebar Nav — desktop only */}
        <motion.div variants={fadeUp} className="hidden md:block w-56 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-brand-500/10 text-brand-300 border border-brand-500/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}>
                <tab.icon className="w-4 h-4" />
                {tab.label}
                <ChevronRight className={`w-3.5 h-3.5 ml-auto transition-transform ${activeTab === tab.id ? "rotate-90" : ""}`} />
              </button>
            ))}
          </nav>
        </motion.div>

        {/* Content */}
        <motion.div variants={fadeUp} className="flex-1">
          {/* Social Accounts */}
          {activeTab === "accounts" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="font-semibold mb-1">Connected Accounts</h3>
              <p className="text-sm text-slate-400 mb-6">Connect your social media accounts to enable auto-posting and analytics.</p>
              <div className="space-y-3">
                {accounts.map((acc) => (
                  <div key={acc.platform} className="flex items-center gap-4 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
                    <div className={`w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center ${acc.color}`}>
                      <acc.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{acc.name}</p>
                      <p className="text-xs text-slate-500">
                        {acc.connected ? (
                          <>{acc.handle} · {acc.followers} followers</>
                        ) : "Not connected"}
                      </p>
                    </div>
                    {acc.connected ? (
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-xs text-emerald-400">
                          <Check className="w-3.5 h-3.5" /> Connected
                        </span>
                        <button onClick={() => toggleConnect(acc.platform)}
                          className="text-xs text-slate-500 hover:text-rose-400 transition-colors">
                          Disconnect
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => toggleConnect(acc.platform)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-brand-500/30 hover:border-brand-500/60 text-brand-400 text-xs font-medium transition-all">
                        <Plus className="w-3.5 h-3.5" /> Connect
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-4 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" />
                Your credentials are encrypted and never stored in plain text.
              </p>
            </div>
          )}

          {/* Plan & Billing */}
          {activeTab === "plan" && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="font-semibold mb-4">Choose Your Plan</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {PLANS.map((plan) => (
                    <div key={plan.id} className={`p-5 rounded-xl border transition-all ${
                      currentPlan === plan.id
                        ? "border-brand-500 bg-brand-500/5"
                        : plan.highlight
                        ? "border-slate-600 bg-slate-800/30"
                        : "border-slate-800"
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">{plan.name}</h4>
                        {currentPlan === plan.id && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400">Current</span>
                        )}
                      </div>
                      <p className="text-2xl font-bold mb-4">{plan.price}</p>
                      <ul className="space-y-2 mb-4">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-center gap-1.5 text-xs text-slate-400">
                            <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />{f}
                          </li>
                        ))}
                      </ul>
                      {currentPlan !== plan.id && (
                        <button className="w-full py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-sm font-medium transition-colors">
                          Upgrade
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="font-semibold mb-4">Payment Method</h3>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-800 border border-slate-700">
                  <CreditCard className="w-5 h-5 text-slate-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Visa •••• 4242</p>
                    <p className="text-xs text-slate-500">Expires 12/2027</p>
                  </div>
                  <button className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
                    Update <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Profile */}
          {activeTab === "profile" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="font-semibold mb-6">Profile Settings</h3>
              <div className="space-y-4">
                {[
                  { label: "Full Name", value: "Your Name", type: "text" },
                  { label: "Email", value: "you@example.com", type: "email" },
                  { label: "Username", value: "@yourhandle", type: "text" },
                  { label: "Bio", value: "Creator & Entrepreneur", type: "text" },
                ].map((field) => (
                  <div key={field.label}>
                    <label className="block text-sm text-slate-400 mb-1.5">{field.label}</label>
                    <input type={field.type} defaultValue={field.value}
                      className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 focus:border-brand-500 focus:outline-none text-sm text-slate-200 transition-all" />
                  </div>
                ))}
                <div className="flex justify-end">
                  <button className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-sm font-semibold transition-colors">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === "notifications" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="font-semibold mb-6">Notification Preferences</h3>
              <div className="space-y-4">
                {[
                  { key: "email", label: "Email Notifications", desc: "Receive post reports and alerts via email" },
                  { key: "push", label: "Push Notifications", desc: "Browser push alerts for scheduled posts" },
                  { key: "weekly", label: "Weekly Report", desc: "Weekly performance summary every Monday" },
                  { key: "tips", label: "AI Tips & Insights", desc: "Daily AI-powered growth recommendations" },
                ].map((n) => (
                  <div key={n.key} className="flex items-center justify-between p-4 rounded-xl bg-slate-800/40">
                    <div>
                      <p className="text-sm font-medium">{n.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{n.desc}</p>
                    </div>
                    <button
                      onClick={() => setNotifications((prev) => ({ ...prev, [n.key]: !prev[n.key as keyof typeof prev] }))}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        notifications[n.key as keyof typeof notifications] ? "bg-brand-500" : "bg-slate-700"
                      }`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                        notifications[n.key as keyof typeof notifications] ? "translate-x-5" : "translate-x-0.5"
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
