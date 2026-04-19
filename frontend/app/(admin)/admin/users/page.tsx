'use client'

import { useEffect, useState, useCallback } from 'react'
import { adminApi } from '@/lib/adminApi'
import { Search, Ban, CheckCircle, ChevronLeft, ChevronRight, Trash2, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

const ROLES = ['user', 'moderator', 'admin', 'superadmin']
const ROLE_COLORS: Record<string, string> = {
  user: 'bg-slate-700 text-slate-300',
  moderator: 'bg-blue-900/50 text-blue-300',
  admin: 'bg-violet-900/50 text-violet-300',
  superadmin: 'bg-amber-900/50 text-amber-300',
}

export default function AdminUsers() {
  const [data, setData] = useState<any>({ users: [], total: 0, page: 1, pages: 1 })
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [blockedFilter, setBlockedFilter] = useState<boolean | undefined>()
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [actionUserId, setActionUserId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminApi.getUsers({
        page, limit: 20, search: search || undefined,
        role: roleFilter || undefined,
        blocked: blockedFilter,
      })
      setData(res)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [page, search, roleFilter, blockedFilter])

  useEffect(() => { load() }, [load])

  async function handleBlock(id: string, blocked: boolean) {
    setActionUserId(id)
    try {
      if (blocked) await adminApi.unblockUser(id)
      else await adminApi.blockUser(id)
      await load()
    } finally { setActionUserId(null) }
  }

  async function handleRoleChange(id: string, role: string) {
    setActionUserId(id)
    try {
      await adminApi.changeRole(id, role)
      await load()
    } finally { setActionUserId(null) }
  }

  async function handleDelete(id: string) {
    if (!confirm('Permanently delete this user? This cannot be undone.')) return
    setActionUserId(id)
    try {
      await adminApi.deleteUser(id)
      await load()
    } finally { setActionUserId(null) }
  }

  async function handleExport() {
    const url = await adminApi.exportUsers()
    const a = document.createElement('a'); a.href = url; a.download = 'users.xlsx'; a.click()
  }

  return (
    <div className="p-6 space-y-5 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-slate-400 text-sm">{data.total} total users</p>
        </div>
        <button onClick={handleExport} className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm rounded-lg transition-colors">
          Export Excel
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by email or ID…"
            className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => { setRoleFilter(e.target.value); setPage(1) }}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500"
        >
          <option value="">All Roles</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select
          value={blockedFilter === undefined ? '' : String(blockedFilter)}
          onChange={e => { setBlockedFilter(e.target.value === '' ? undefined : e.target.value === 'true'); setPage(1) }}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500"
        >
          <option value="">All Status</option>
          <option value="false">Active</option>
          <option value="true">Blocked</option>
        </select>
        <button onClick={load} className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
        </button>
      </div>

      {/* Table */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50 text-left">
                <th className="px-4 py-3 text-slate-400 font-medium">User</th>
                <th className="px-4 py-3 text-slate-400 font-medium">Role</th>
                <th className="px-4 py-3 text-slate-400 font-medium">Plan</th>
                <th className="px-4 py-3 text-slate-400 font-medium">Status</th>
                <th className="px-4 py-3 text-slate-400 font-medium">Joined</th>
                <th className="px-4 py-3 text-slate-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {loading && (
                <tr><td colSpan={6} className="py-8 text-center text-slate-500">Loading…</td></tr>
              )}
              {!loading && data.users.map((u: any) => (
                <tr key={u.id} className="hover:bg-slate-700/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-white truncate max-w-[180px]">{u.email}</div>
                    <div className="text-slate-500 text-xs truncate">{u.id}</div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role || 'user'}
                      onChange={e => handleRoleChange(u.id, e.target.value)}
                      disabled={actionUserId === u.id}
                      className={cn('text-xs px-2 py-1 rounded font-medium border-0 cursor-pointer', ROLE_COLORS[u.role || 'user'])}
                    >
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-slate-300">{u.plan || 'free'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('text-xs px-2 py-0.5 rounded-full', u.blocked ? 'bg-red-900/40 text-red-400' : 'bg-green-900/40 text-green-400')}>
                      {u.blocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleBlock(u.id, u.blocked)}
                        disabled={actionUserId === u.id}
                        title={u.blocked ? 'Unblock' : 'Block'}
                        className="p-1.5 rounded hover:bg-slate-700 transition-colors text-slate-400 hover:text-white"
                      >
                        {u.blocked ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Ban className="w-4 h-4 text-red-400" />}
                      </button>
                      <button
                        onClick={() => handleDelete(u.id)}
                        disabled={actionUserId === u.id}
                        title="Delete user"
                        className="p-1.5 rounded hover:bg-slate-700 transition-colors text-slate-400 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && data.users.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-slate-500">No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data.pages > 1 && (
          <div className="px-4 py-3 border-t border-slate-700/50 flex items-center justify-between">
            <span className="text-xs text-slate-500">Page {data.page} of {data.pages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-40 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage(p => Math.min(data.pages, p + 1))} disabled={page === data.pages} className="p-1.5 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-40 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
