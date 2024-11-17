'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { useToast } from "../../../components/ui/use-toast"
import { Toaster } from "../../../components/ui/toaster"
import { authService } from '@/services/authService'
import { FlightTable } from '@/components/FlightTable'
import { websocketService } from '@/services/websocketService'

export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [canUpdateFlights, setCanUpdateFlights] = useState(false)
  const [username, setUsername] = useState<string>('')

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }

    setUsername(user.username);
    setCanUpdateFlights(authService.hasPermission('update_flights'));
    websocketService.connect();
  }, [router])

  const handleLogout = () => {
    try {
      authService.logout();
      router.push('/login');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Logout Error",
        description: "Failed to logout properly",
        className: "bg-red-500 text-white border-red-500 dark:bg-red-900 dark:border-red-900",
      });
      console.error('Logout error:', error);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-950 p-4">
      <Toaster />
      
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 text-transparent bg-clip-text">
              Flight Dashboard
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Welcome, {username}
            </p>
          </div>
          <Button 
            variant="outline"
            className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
        <Card className="border-none shadow-xl bg-slate-50 dark:bg-slate-800 p-6">
          <FlightTable canUpdateFlights={canUpdateFlights} />
        </Card>
      </div>
    </main>
  )
}