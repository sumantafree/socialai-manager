'use client'

import { useEffect, useState } from 'react'
import { adminApi } from '@/lib/adminApi'
import { DollarSign, TrendingUp, Users, Zap } from 'lucide-react'

export default function AdminBilling() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.getBillingOverview()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Billing Overview</h1>
        <p className="text-slate-400 text-sm">Revenue and AI cost tracking</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `₹${data?.total_revenue_inr?.toLocaleString() || 0}`, sub: `$${data?.total_revenue_usd?.toFixed(2) || 0}`, icon: DollarSign, color: 'text-green-400 bg-green-500/20' },
          { label: 'Monthly Revenue', value: `₹${data?.monthly_revenue_inr?.toLocaleString() || 0}`, sub: 'This month', icon: TrendingUp, color: 'text-violet-400 bg-violet-500/20' },
          { label: 'Total AI Cost', value: `₹${data?.total_ai_cost_inr?.toLocaleString() || 0}`, sub: 'All time', icon: Zap, color: 'text-amber-400 bg-amber-500/20' },
          { label: 'Paying Users', value: data?.paying_users || 0, sub: `of ${data?.total_users || 0} total`, icon: Users, color: 'text-blue-400 bg-blue-500/20' },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-400">{label}</span>
              <div className={`p-2 rounded-lg ${color}`}><Icon className="w-4 h-4" /></div>
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-xs text-slate-500 mt-1">{sub}</div>
          </div>
        ))}
      </div>

      {/* Plan breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {['free', 'pro', 'agency'].map(plan => {
          const count = data?.plan_breakdown?.[plan] || 0
          const total = data?.total_users || 1
          const pct = Math.round((count / total) * 100)
          return (
            <div key={plan} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
              <div className="flex justify-between items-center mb-2">
                <span className="capitalize font-semibold text-white">{plan}</span>
                <span className="text-sm text-slate-400">{count} users</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-violet-500 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="text-xs text-slate-500 mt-1">{pct}% of total users</div>
            </div>
          )
        })}
      </div>

      {/* Per-user billing table */}
      {data?.user_billing?.length > 0 && (
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-700/50">
            <h2 className="text-sm font-semibold text-white">Per-User AI Billing (Top 50)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/30">
                  <th className="px-4 py-3 text-slate-400 font-medium text-left">User</th>
                  <th className="px-4 py-3 text-slate-400 font-medium text-left">Plan</th>
                  <th className="px-4 py-3 text-slate-400 font-medium text-right">Tokens</th>
                  <th className="px-4 py-3 text-slate-400 font-medium text-right">Calls</th>
                  <th className="px-4 py-3 text-slate-400 font-medium text-right">AI Cost (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {data.user_billing.map((u: any) => (
                  <tr key={u.user_id} className="hover:bg-slate-700/20">
                    <td className="px-4 py-3 text-white text-xs">{u.email || u.user_id?.slice(0, 14) + '…'}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 capitalize">{u.plan || 'free'}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-300 text-xs">{u.total_tokens?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-slate-300 text-xs">{u.ai_calls}</td>
                    <td className="px-4 py-3 text-right text-amber-400 text-xs">₹{u.total_cost_inr?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
