import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/login?redirectTo=/admin/dashboard')

  // Check role in users table
  const { data: profile } = await supabase
    .from('users')
    .select('role, blocked')
    .eq('id', session.user.id)
    .single()

  if (!profile || profile.blocked || !['admin', 'superadmin'].includes(profile.role || '')) {
    redirect('/dashboard?error=unauthorized')
  }

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
