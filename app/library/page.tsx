import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LibraryBrowser } from '@/components/library/library-browser'

export default async function LibraryPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-sandstone">
      <LibraryBrowser userId={user.id} />
    </div>
  )
}
