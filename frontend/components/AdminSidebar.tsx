'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, BarChart2, CreditCard,
  ScrollText, Settings, ChevronLeft, Shield, AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/admin/billing', label: 'Billing', icon: CreditCard },
  { href: '/admin/audit-logs', label: 'Audit Logs', icon: ScrollText },
  { href: '/admin/errors', label: 'Error Logs', icon: AlertTriangle },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  return (
    <aside className="w-60 shrink-0 bg-slate-900 border-r border-slate-700/50 flex flex-col h-full">
      <div className="px-4 py-5 flex items-center gap-2 border-b border-slate-700/50">
        <Shield className="w-5 h-5 text-violet-400" />
        <span className="font-bold text-white text-sm tracking-wide">Admin Panel</span>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
              pathname === href || pathname.startsWith(href + '/')
                ? 'bg-violet-600/20 text-violet-300 font-medium'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="px-4 py-3 border-t border-slate-700/50">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          <ChevronLeft className="w-3 h-3" />
          Back to App
        </Link>
      </div>
    </aside>
  )
}
