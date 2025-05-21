'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function Home() {
  const supabase = createClient()
  const [message, setMessage] = useState('Connecting...')

  useEffect(() => {
    const test = async () => {
      const { data, error } = await supabase.from('test_table').select('*')
      if (error) {
        setMessage(`Error: ${error.message}`)
      } else {
        setMessage(`Success! Got ${data.length} rows.`)
      }
    }

    test()
  }, [supabase])

  return <div className="p-4 text-xl">{message}</div>
}
