'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Shield, Key, CheckCircle, AlertCircle } from 'lucide-react'

export default function AdminSettings() {
  const [email, setEmail] = useState('')
  const [secretKey, setSecretKey] = useState('')
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSeedAdmin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      const supabase = createClientComponentClient()
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || ''

      const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      const res = await fetch(`${BASE}/api/admin/seed-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, secret_key: secretKey }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Failed')
      setResult({ ok: true, msg: data.message || 'Admin promoted successfully' })
      setEmail(''); setSecretKey('')
    } catch (err: any) {
      setResult({ ok: false, msg: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Settings</h1>
        <p className="text-slate-400 text-sm">Manage admin accounts and system configuration</p>
      </div>

      {/* Promote Admin */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-violet-400" />
          <h2 className="text-base font-semibold text-white">Promote User to Superadmin</h2>
        </div>
        <p className="text-sm text-slate-400 mb-5">
          Enter the user's email and your admin secret key to grant superadmin access.
          The secret key is set via the <code className="text-violet-300">ADMIN_SECRET_KEY</code> environment variable.
        </p>

        <form onSubmit={handleSeedAdmin} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">User Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="user@example.com"
              className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-violet-500"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">
              <Key className="inline w-3.5 h-3.5 mr-1" />
              Admin Secret Key
            </label>
            <input
              type="password"
              value={secretKey}
              onChange={e => setSecretKey(e.target.value)}
              required
              placeholder="Your ADMIN_SECRET_KEY value"
              className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-violet-500"
            />
          </div>

          {result && (
            <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${result.ok ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
              {result.ok ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              {result.msg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors text-sm"
          >
            {loading ? 'Processing…' : 'Promote to Superadmin'}
          </button>
        </form>
      </div>

      {/* Environment Info */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-base font-semibold text-white mb-4">System Information</h2>
        <div className="space-y-3 text-sm">
          {[
            ['API Backend', process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'],
            ['AI Provider', 'Google Gemini (gemini-1.5-flash)'],
            ['Auth Provider', 'Supabase'],
            ['Billing', 'Stripe'],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between py-2 border-b border-slate-700/30 last:border-0">
              <span className="text-slate-400">{k}</span>
              <span className="text-white font-mono text-xs">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
