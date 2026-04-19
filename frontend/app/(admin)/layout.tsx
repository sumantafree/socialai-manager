import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {},
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirectTo=/admin/dashboard')

  // Check role in users table
  const { data: profile } = await supabase
    .from('users')
    .select('role, blocked')
    .eq('id', user.id)
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
