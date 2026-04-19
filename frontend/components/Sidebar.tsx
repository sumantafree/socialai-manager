"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Wand2, Calendar, BarChart3, TrendingUp,
  Settings, Sparkles, ChevronLeft, Menu, Zap, Globe,
  FileText, Hash, Film, MessageCircle, ChevronDown, X,
} from "lucide-react";
import { useState } from "react";
import { useUIStore } from "@/lib/store";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  children?: NavItem[];
}

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/content-studio", label: "AI Content Studio", icon: Wand2 },
  { href: "/calendar", label: "Content Calendar", icon: Calendar },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/trends", label: "Trend Discovery", icon: TrendingUp },
  { href: "/competitor", label: "Competitor Analysis", icon: Globe },
  {
    href: "/tools",
    label: "Bonus Tools",
    icon: Zap,
    badge: "4",
    children: [
      { href: "/tools/blog-converter", label: "Blog Converter", icon: FileText },
      { href: "/tools/hashtag-generator", label: "Hashtag Generator", icon: Hash },
      { href: "/tools/reel-script", label: "Reel Script", icon: Film },
      { href: "/tools/whatsapp-notifier", label: "WhatsApp Alerts", icon: MessageCircle },
    ],
  },
];

const BOTTOM_NAV: NavItem[] = [
  { href: "/settings", label: "Settings", icon: Settings },
];

function NavLink({
  item,
  collapsed,
  onNavigate,
  depth = 0,
}: {
  item: NavItem;
  collapsed: boolean;
  onNavigate?: () => void;
  depth?: number;
}) {
  const pathname = usePathname();
  const isActive =
    pathname === item.href ||
    (item.href !== "/" && pathname.startsWith(item.href + "/")) ||
    item.children?.some((c) => pathname === c.href || pathname.startsWith(c.href));
  const hasChildren = !!item.children?.length;
  const [open, setOpen] = useState(!!isActive);

  if (hasChildren && !collapsed) {
    return (
      <div>
        <button
          onClick={() => setOpen((o) => !o)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
            isActive
              ? "bg-brand-500/10 text-brand-300 border border-brand-500/20"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          <item.icon style={{ width: 18, height: 18 }} className="flex-shrink-0" />
          <span className="flex-1 text-left whitespace-nowrap">{item.label}</span>
          {item.badge && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-semibold">
              {item.badge}
            </span>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-1 ml-3 pl-3 border-l border-slate-800 space-y-0.5">
                {item.children!.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={onNavigate}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                      pathname === child.href
                        ? "text-brand-300 bg-brand-500/10"
                        : "text-slate-500 hover:text-slate-200 hover:bg-slate-800"
                    }`}
                  >
                    <child.icon style={{ width: 14, height: 14 }} className="flex-shrink-0" />
                    <span className="whitespace-nowrap">{child.label}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
        depth > 0 ? "py-2 text-sm" : ""
      } ${
        isActive
          ? "bg-brand-500/10 text-brand-300 border border-brand-500/20"
          : "text-slate-400 hover:text-white hover:bg-slate-800"
      }`}
    >
      <item.icon style={{ width: 18, height: 18 }} className="flex-shrink-0" />
      {!collapsed && (
        <>
          <span className="flex-1 whitespace-nowrap">{item.label}</span>
          {item.badge && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-semibold">
              {item.badge}
            </span>
          )}
          {isActive && <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />}
        </>
      )}
    </Link>
  );
}

function SidebarContent({
  collapsed,
  onNavigate,
  onToggleCollapse,
  showCloseButton = false,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
  onToggleCollapse: () => void;
  showCloseButton?: boolean;
}) {
  return (
    <>
      {/* Logo */}
      <div
        className={`flex items-center gap-3 px-4 h-16 border-b border-slate-800 flex-shrink-0 ${
          collapsed ? "justify-center" : ""
        }`}
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand-500/20">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <span className="font-bold text-sm whitespace-nowrap leading-tight">
            SocialAI<br />
            <span className="text-slate-400 font-normal text-xs">Manager</span>
          </span>
        )}
        {showCloseButton ? (
          <button
            onClick={onNavigate}
            className="ml-auto p-1.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={onToggleCollapse}
            className={`${
              collapsed ? "absolute right-2 top-[18px]" : "ml-auto"
            } p-1.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white flex-shrink-0`}
          >
            {collapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {!collapsed && (
          <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 pt-2 pb-1">
            Navigation
          </p>
        )}
        {NAV.map((item) => (
          <NavLink key={item.href} item={item} collapsed={collapsed} onNavigate={onNavigate} />
        ))}
      </nav>

      {/* Upgrade Banner */}
      {!collapsed && (
        <div className="mx-3 mb-3 p-3.5 rounded-xl bg-gradient-to-br from-brand-500/10 via-violet-500/5 to-transparent border border-brand-500/20 flex-shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-semibold text-slate-200">Free Plan</span>
          </div>
          <p className="text-[11px] text-slate-400 mb-2">3 / 5 AI posts used this month</p>
          <div className="h-1.5 bg-slate-700 rounded-full mb-3">
            <div className="h-full w-3/5 bg-gradient-to-r from-brand-500 to-violet-500 rounded-full transition-all" />
          </div>
          <Link
            href="/settings"
            onClick={onNavigate}
            className="block w-full text-center py-1.5 rounded-lg bg-gradient-to-r from-brand-500 to-violet-600 hover:opacity-90 transition-opacity text-xs font-semibold shadow-md shadow-brand-500/20"
          >
            Upgrade to Pro ✨
          </Link>
        </div>
      )}

      {/* Bottom */}
      <div className="p-3 border-t border-slate-800 space-y-0.5 flex-shrink-0">
        {BOTTOM_NAV.map((item) => (
          <NavLink key={item.href} item={item} collapsed={collapsed} onNavigate={onNavigate} />
        ))}
      </div>
    </>
  );
}

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, mobileSidebarOpen, setMobileSidebarOpen } = useUIStore();

  const closeMobile = () => setMobileSidebarOpen(false);

  return (
    <>
      {/* ── Desktop Sidebar (lg+) ─────────────────────────────── */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? 72 : 248 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="relative hidden lg:flex flex-col bg-slate-900 border-r border-slate-800 overflow-hidden flex-shrink-0 z-30"
      >
        <SidebarContent
          collapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebar}
        />
      </motion.aside>

      {/* ── Mobile Drawer (<lg) ──────────────────────────────── */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeMobile}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            />
            {/* Drawer */}
            <motion.aside
              key="drawer"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed top-0 left-0 bottom-0 w-[260px] flex flex-col bg-slate-900 border-r border-slate-800 z-50 lg:hidden"
            >
              <SidebarContent
                collapsed={false}
                onNavigate={closeMobile}
                onToggleCollapse={closeMobile}
                showCloseButton
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
