'use client'

import { createClient } from '@/utils/supabase/client'

const LogoutButton = () => {
  const supabase = createClient()
  
  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/' // Or redirect to login page
  }

  return <button onClick={handleLogout}>Logout</button>
}

export default LogoutButton