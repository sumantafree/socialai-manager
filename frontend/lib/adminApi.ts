import { createBrowserClient } from '@supabase/ssr'

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || ''

async function getToken(): Promise<string> {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token || ''
}

async function adminFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken()
  const res = await fetch(`${BASE}/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || 'Request failed')
  }
  return res.json()
}

export const adminApi = {
  // Dashboard
  getStats: () => adminFetch<any>('/admin/stats'),
  getLiveActivity: (limit = 20) => adminFetch<any[]>(`/admin/live-activity?limit=${limit}`),

  // Analytics
  getDailyAnalytics: (days = 30) => adminFetch<any[]>(`/admin/analytics/daily?days=${days}`),
  getRevenueAnalytics: (days = 30) => adminFetch<any[]>(`/admin/analytics/revenue?days=${days}`),
  getTopUsers: (limit = 10) => adminFetch<any[]>(`/admin/analytics/top-users?limit=${limit}`),

  // Users
  getUsers: (params: { page?: number; limit?: number; search?: string; role?: string; blocked?: boolean }) => {
    const q = new URLSearchParams()
    if (params.page) q.set('page', String(params.page))
    if (params.limit) q.set('limit', String(params.limit))
    if (params.search) q.set('search', params.search)
    if (params.role) q.set('role', params.role)
    if (params.blocked !== undefined) q.set('blocked', String(params.blocked))
    return adminFetch<any>(`/admin/users?${q}`)
  },
  getUser: (id: string) => adminFetch<any>(`/admin/users/${id}`),
  blockUser: (id: string) => adminFetch<any>(`/admin/users/${id}/block`, { method: 'POST' }),
  unblockUser: (id: string) => adminFetch<any>(`/admin/users/${id}/unblock`, { method: 'POST' }),
  changeRole: (id: string, role: string) =>
    adminFetch<any>(`/admin/users/${id}/role`, { method: 'POST', body: JSON.stringify({ role }) }),
  deleteUser: (id: string) => adminFetch<any>(`/admin/users/${id}`, { method: 'DELETE' }),

  // Audit & Errors
  getAuditLogs: (params: { page?: number; limit?: number; action?: string }) => {
    const q = new URLSearchParams()
    if (params.page) q.set('page', String(params.page))
    if (params.limit) q.set('limit', String(params.limit))
    if (params.action) q.set('action', params.action)
    return adminFetch<any>(`/admin/audit-logs?${q}`)
  },
  getErrorLogs: (params: { severity?: string; limit?: number }) => {
    const q = new URLSearchParams()
    if (params.severity) q.set('severity', params.severity)
    if (params.limit) q.set('limit', String(params.limit))
    return adminFetch<any[]>(`/admin/error-logs?${q}`)
  },

  // Billing
  getBillingOverview: () => adminFetch<any>('/admin/billing/overview'),

  // Export (returns blob URL)
  exportUsers: async () => {
    const token = await getToken()
    const res = await fetch(`${BASE}/api/admin/export/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const blob = await res.blob()
    return URL.createObjectURL(blob)
  },
  exportAiUsage: async () => {
    const token = await getToken()
    const res = await fetch(`${BASE}/api/admin/export/ai-usage`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const blob = await res.blob()
    return URL.createObjectURL(blob)
  },
}
