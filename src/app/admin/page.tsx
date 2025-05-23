import { createClient } from '@/utils/supabase/server'
import SessionCheck from '../components/SessionCheck'
import LogoutButton from '../components/LogoutButton'

export default async function HomePage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <main className="p-4">
      {user ? (
        <p>Welcome, {user.email}!</p>
      ) : (
        <p>You are not logged in. Please log in to continue.</p>
      )}
      <SessionCheck/>
      <LogoutButton/>
    </main>
  )
}
