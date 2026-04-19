'use client'

import { useEffect, useState } from 'react'
import { adminApi } from '@/lib/adminApi'
import { Shield, ChevronLeft, ChevronRight, Filter } from 'lucide-react'

const ACTION_COLORS: Record<string, string> = {
  block_user: 'bg-red-900/50 text-red-400',
  unblock_user: 'bg-green-900/50 text-green-400',
  change_role: 'bg-violet-900/50 text-violet-400',
  delete_user: 'bg-red-900/80 text-red-300',
  seed_admin: 'bg-amber-900/50 text-amber-400',
}

export default function AdminAuditLogs() {
  const [data, setData] = useState<any>({ logs: [], total: 0, pages: 1 })
  const [page, setPage] = useState(1)
  const [actionFilter, setActionFilter] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    adminApi.getAuditLogs({ page, limit: 30, action: actionFilter || undefined })
      .then(setData).catch(console.error).finally(() => setLoading(false))
  }, [page, actionFilter])

  return (
    <div className="p-6 space-y-5 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
          <p className="text-slate-400 text-sm">{data.total} total records</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <input
            value={actionFilter}
            onChange={e => { setActionFilter(e.target.value); setPage(1) }}
            placeholder="Filter by action…"
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 w-48"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="relative">
          {/* Timeline */}
          <div className="space-y-3">
            {data.logs.map((log: any, i: number) => (
              <div key={log.id || i} className="flex gap-4 group">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                    <Shield className="w-3.5 h-3.5 text-violet-400" />
                  </div>
                  {i < data.logs.length - 1 && <div className="w-px flex-1 bg-slate-700/50 mt-1" />}
                </div>
                <div className="pb-4 flex-1">
                  <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ACTION_COLORS[log.action] || 'bg-slate-700 text-slate-300'}`}>
                        {log.action}
                      </span>
                      <span className="text-xs text-slate-500">
                        {log.created_at ? new Date(log.created_at).toLocaleString() : '—'}
                      </span>
                    </div>
                    <div className="text-sm text-slate-300">
                      <span className="text-white font-medium">{log.admin_email || log.admin_id?.slice(0, 8) + '…'}</span>
                      {log.target_user && (
                        <> → <span className="text-violet-300">{log.target_email || log.target_user?.slice(0, 8) + '…'}</span></>
                      )}
                    </div>
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <div className="mt-2 text-xs text-slate-500 font-mono bg-slate-900/50 rounded p-2">
                        {JSON.stringify(log.metadata)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {data.logs.length === 0 && (
              <div className="text-center py-12 text-slate-500">No audit logs found</div>
            )}
          </div>

          {/* Pagination */}
          {data.pages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <span className="text-xs text-slate-500">Page {page} of {data.pages}</span>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setPage(p => Math.min(data.pages, p + 1))} disabled={page === data.pages}
                  className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
