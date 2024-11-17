'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/authService'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const user = authService.getCurrentUser()
    if (user) {
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-slate-600 dark:text-slate-400">
        Redirecting...
      </div>
    </div>
  )
}