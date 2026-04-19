"use client";

import { User } from "@supabase/supabase-js";
import { Bell, Search, ChevronDown, LogOut, Settings, Sparkles, Menu, X } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUIStore } from "@/lib/store";

interface HeaderProps {
  user: User;
}

export default function Header({ user }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { toggleMobileSidebar } = useUIStore();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const initials = (user.user_metadata?.full_name as string)
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? user.email?.[0]?.toUpperCase() ?? "U";

  return (
    <header className="h-14 md:h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm flex items-center px-3 md:px-6 gap-2 md:gap-4 flex-shrink-0 relative">
      {/* Mobile: Hamburger */}
      <button
        onClick={toggleMobileSidebar}
        className="lg:hidden p-2 rounded-xl hover:bg-slate-800 transition-colors text-slate-400 hover:text-white flex-shrink-0"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile: Search toggle — desktop: always visible */}
      {searchOpen ? (
        <div className="flex-1 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              autoFocus
              placeholder="Search posts, topics…"
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 focus:border-brand-500 focus:outline-none text-sm text-slate-300 placeholder:text-slate-500 transition-all"
            />
          </div>
          <button
            onClick={() => setSearchOpen(false)}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 flex-shrink-0 md:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <>
          {/* Desktop search */}
          <div className="relative hidden md:block flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              placeholder="Search posts, topics…"
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 focus:border-brand-500 focus:outline-none text-sm text-slate-300 placeholder:text-slate-500 transition-all"
            />
          </div>

          {/* Mobile: search icon */}
          <button
            onClick={() => setSearchOpen(true)}
            className="md:hidden p-2 rounded-xl hover:bg-slate-800 transition-colors text-slate-400"
          >
            <Search className="w-5 h-5" />
          </button>
        </>
      )}

      <div className={`flex items-center gap-2 md:gap-3 ${searchOpen ? "hidden" : "ml-auto"} md:ml-auto`}>
        {/* Quick Generate — hidden on mobile */}
        <Link
          href="/content-studio"
          className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-medium hover:bg-brand-500/20 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" /> Generate
        </Link>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl hover:bg-slate-800 transition-colors text-slate-400 hover:text-white">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-1.5 md:gap-2 p-1 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium leading-none">{user.user_metadata?.full_name ?? "User"}</p>
              <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[120px]">{user.email}</p>
            </div>
            <ChevronDown className={`hidden md:block w-4 h-4 text-slate-400 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-52 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-800">
                  <p className="text-sm font-medium truncate">{user.user_metadata?.full_name ?? "User"}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
                <div className="p-1">
                  <Link
                    href="/settings"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 text-sm text-slate-300 hover:text-white transition-colors"
                  >
                    <Settings className="w-4 h-4" /> Settings
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-rose-500/10 text-sm text-rose-400 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
