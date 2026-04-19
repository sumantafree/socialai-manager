'use client'

import { useEffect, useState } from 'react'
import { adminApi } from '@/lib/adminApi'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { Download } from 'lucide-react'

export default function AdminAnalytics() {
  const [daily, setDaily] = useState<any[]>([])
  const [revenue, setRevenue] = useState<any[]>([])
  const [topUsers, setTopUsers] = useState<any[]>([])
  const [days, setDays] = useState(30)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      adminApi.getDailyAnalytics(days),
      adminApi.getRevenueAnalytics(days),
      adminApi.getTopUsers(10),
    ]).then(([d, r, t]) => {
      setDaily(d)
      setRevenue(r)
      setTopUsers(t)
    }).finally(() => setLoading(false))
  }, [days])

  async function handleExportAI() {
    const url = await adminApi.exportAiUsage()
    const a = document.createElement('a'); a.href = url; a.download = 'ai_usage.xlsx'; a.click()
  }

  const CHART_STYLE = {
    contentStyle: { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 },
    labelStyle: { color: '#e2e8f0' },
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-slate-400 text-sm">Platform usage & revenue trends</p>
        </div>
        <div className="flex gap-3">
          <select
            value={days}
            onChange={e => setDays(Number(e.target.value))}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white"
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button onClick={handleExportAI} className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm rounded-lg transition-colors">
            <Download className="w-4 h-4" /> Export AI Usage
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* DAU + New Users */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-white mb-4">Daily Active & New Users</h2>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => v?.slice(5)} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip {...CHART_STYLE} />
                <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
                <Line type="monotone" dataKey="active_users" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Active Users" />
                <Line type="monotone" dataKey="new_users" stroke="#22d3ee" strokeWidth={2} dot={false} name="New Users" />
                <Line type="monotone" dataKey="api_calls" stroke="#f59e0b" strokeWidth={2} dot={false} name="API Calls" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue Chart */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-white mb-4">Daily Revenue & AI Cost (₹)</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => v?.slice(5)} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip {...CHART_STYLE} formatter={(v: any) => `₹${v}`} />
                <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
                <Bar dataKey="revenue_inr" fill="#8b5cf6" name="Revenue (₹)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ai_cost_inr" fill="#f97316" name="AI Cost (₹)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Users by AI Usage */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-700/50">
              <h2 className="text-sm font-semibold text-white">Top Users by AI Token Consumption</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700/30">
                    <th className="px-4 py-3 text-slate-400 font-medium text-left">#</th>
                    <th className="px-4 py-3 text-slate-400 font-medium text-left">User</th>
                    <th className="px-4 py-3 text-slate-400 font-medium text-right">Total Tokens</th>
                    <th className="px-4 py-3 text-slate-400 font-medium text-right">AI Calls</th>
                    <th className="px-4 py-3 text-slate-400 font-medium text-right">Cost (₹)</th>
                    <th className="px-4 py-3 text-slate-400 font-medium text-right">Cost ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {topUsers.map((u, i) => (
                    <tr key={u.user_id} className="hover:bg-slate-700/20">
                      <td className="px-4 py-3 text-slate-500 text-xs">{i + 1}</td>
                      <td className="px-4 py-3 text-white">{u.email || u.user_id?.slice(0, 12) + '…'}</td>
                      <td className="px-4 py-3 text-right text-slate-300">{u.total_tokens?.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-slate-300">{u.ai_calls}</td>
                      <td className="px-4 py-3 text-right text-amber-400">₹{u.total_cost_inr?.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right text-slate-400">${u.total_cost_usd?.toFixed(4)}</td>
                    </tr>
                  ))}
                  {topUsers.length === 0 && (
                    <tr><td colSpan={6} className="py-8 text-center text-slate-500">No data yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
