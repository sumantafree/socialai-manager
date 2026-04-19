'use client'

import { useEffect, useState } from 'react'
import { adminApi } from '@/lib/adminApi'
import { Users, DollarSign, Zap, AlertTriangle, TrendingUp, Activity } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'

function KpiCard({ title, value, sub, icon: Icon, color }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-slate-400">{title}</span>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="text-2xl font-bold text-white">{value ?? '—'}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </motion.div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [daily, setDaily] = useState<any[]>([])
  const [activity, setActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      adminApi.getStats(),
      adminApi.getDailyAnalytics(14),
      adminApi.getLiveActivity(15),
    ]).then(([s, d, a]) => {
      setStats(s)
      setDaily(d)
      setActivity(a)
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Real-time platform overview</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Users" value={stats?.total_users?.toLocaleString()} icon={Users} color="bg-blue-500/20 text-blue-400" />
        <KpiCard title="Active Today" value={stats?.active_today} sub="DAU" icon={Activity} color="bg-green-500/20 text-green-400" />
        <KpiCard
          title="Revenue (Month)"
          value={stats?.monthly_revenue_inr ? `₹${stats.monthly_revenue_inr.toLocaleString()}` : '₹0'}
          sub={`$${stats?.monthly_revenue_usd?.toFixed(2) || '0'} USD`}
          icon={DollarSign}
          color="bg-violet-500/20 text-violet-400"
        />
        <KpiCard title="AI Calls Today" value={stats?.ai_calls_today?.toLocaleString()} icon={Zap} color="bg-amber-500/20 text-amber-400" />
        <KpiCard title="New Users (7d)" value={stats?.new_users_7d} icon={TrendingUp} color="bg-cyan-500/20 text-cyan-400" />
        <KpiCard title="Pro Subscribers" value={stats?.pro_subscribers} icon={Users} color="bg-pink-500/20 text-pink-400" />
        <KpiCard title="Errors (24h)" value={stats?.errors_24h} icon={AlertTriangle} color="bg-red-500/20 text-red-400" />
        <KpiCard
          title="Total AI Cost"
          value={stats?.total_ai_cost_inr ? `₹${stats.total_ai_cost_inr.toLocaleString()}` : '₹0'}
          sub="All time"
          icon={Zap}
          color="bg-orange-500/20 text-orange-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* DAU Chart */}
        <div className="lg:col-span-2 bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Daily Active Users (14 days)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => v?.slice(5)} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Line type="monotone" dataKey="active_users" stroke="#8b5cf6" strokeWidth={2} dot={false} name="DAU" />
              <Line type="monotone" dataKey="new_users" stroke="#22d3ee" strokeWidth={2} dot={false} name="New" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Live Activity Feed */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Live Activity
          </h2>
          <div className="space-y-2 overflow-y-auto max-h-56">
            {activity.length === 0 && <p className="text-slate-500 text-xs">No recent activity</p>}
            {activity.map((a, i) => (
              <div key={i} className="text-xs border-b border-slate-700/40 pb-2">
                <span className="text-violet-300 font-medium">{a.action}</span>
                <div className="text-slate-500">{a.user_id?.slice(0, 8)}… · {new Date(a.created_at).toLocaleTimeString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
