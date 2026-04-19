'use client'

import { useEffect, useState } from 'react'
import { adminApi } from '@/lib/adminApi'
import { AlertTriangle, AlertCircle, Info, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

const SEVERITY_CONFIG: Record<string, { icon: any; color: string; bg: string }> = {
  critical: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-900/30' },
  error: { icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-900/30' },
  warning: { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-900/30' },
  info: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-900/30' },
}

export default function AdminErrors() {
  const [logs, setLogs] = useState<any[]>([])
  const [severity, setSeverity] = useState('')
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<number | null>(null)

  const load = () => {
    setLoading(true)
    adminApi.getErrorLogs({ severity: severity || undefined, limit: 100 })
      .then(setLogs).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [severity])

  return (
    <div className="p-6 space-y-5 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Error Logs</h1>
          <p className="text-slate-400 text-sm">{logs.length} entries</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={severity}
            onChange={e => setSeverity(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white"
          >
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="error">Error</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>
          <button onClick={load} className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log, i) => {
            const cfg = SEVERITY_CONFIG[log.severity] || SEVERITY_CONFIG.error
            const Icon = cfg.icon
            return (
              <div key={i} className={cn('rounded-xl border border-slate-700/50 overflow-hidden', cfg.bg)}>
                <button
                  onClick={() => setExpanded(expanded === i ? null : i)}
                  className="w-full flex items-start gap-3 p-4 text-left"
                >
                  <Icon className={cn('w-4 h-4 mt-0.5 shrink-0', cfg.color)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={cn('text-xs font-medium uppercase', cfg.color)}>{log.severity}</span>
                      <span className="text-xs text-slate-500">{log.created_at ? new Date(log.created_at).toLocaleString() : '—'}</span>
                      {log.endpoint && <span className="text-xs text-slate-500 font-mono">{log.endpoint}</span>}
                    </div>
                    <p className="text-sm text-slate-200 truncate">{log.message}</p>
                  </div>
                </button>
                {expanded === i && (
                  <div className="px-4 pb-4 border-t border-slate-700/30 pt-3">
                    {log.user_id && <p className="text-xs text-slate-500 mb-2">User: {log.user_id}</p>}
                    {log.stack && (
                      <pre className="text-xs text-slate-400 bg-slate-900/50 rounded p-3 overflow-x-auto whitespace-pre-wrap">{log.stack}</pre>
                    )}
                  </div>
                )}
              </div>
            )
          })}
          {logs.length === 0 && (
            <div className="text-center py-12 text-slate-500">No error logs found 🎉</div>
          )}
        </div>
      )}
    </div>
  )
}
