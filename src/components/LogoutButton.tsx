'use client'

import { createClient } from '@/utils/supabase/client'

const LogoutButton = () => {
  const supabase = createClient()
  
  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/' // Or redirect to login page
  }

  return <button className='bg-red-500 text-white px-4 py-2 rounded cursor-pointer' onClick={handleLogout}>Logout</button>
}

export default LogoutButton