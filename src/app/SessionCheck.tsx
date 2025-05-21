'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function SessionCheck() {
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Get the current session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      
    })
  }, [supabase.auth])

  return (
    <div>
      {user ? (
        <p>Logged in as {user.email}</p>
      ) : (
        <p>Not logged in</p>
      )}
    </div>
  )
}
