'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../../../components/ui/card'
import { Label } from '../../../components/ui/label'
import { useToast } from "../../../components/ui/use-toast"
import { Toaster } from "../../../components/ui/toaster"
import { authService } from '@/services/authService'
import axios from 'axios'

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await authService.login(credentials)
      // Store token or user data if needed
      localStorage.setItem('token', response.token)
      localStorage.setItem('userRole', response.user.role)
      router.push('/dashboard')
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'Login failed. Please try again.'
        toast({
          variant: "destructive",
          title: "Login Error",
          description: errorMessage,
          className: "bg-red-500 text-white border-red-500 dark:bg-red-900 dark:border-red-900",
        })
        console.error('Login failed:', error.response?.data || error.message)
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "An unexpected error occurred",
          className: "bg-red-500 text-white border-red-500 dark:bg-red-900 dark:border-red-900",
        })
        console.error('Login failed:', error)
      }
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-100 dark:bg-slate-950">
      <Toaster />
      <div className="w-full max-w-[380px]">
        <Card className="border-none shadow-xl bg-white dark:bg-slate-900 p-6">
          <CardHeader className="pb-6 space-y-2">
            <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 text-transparent bg-clip-text">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-center text-sm font-medium text-slate-600 dark:text-slate-400">
              Sign in to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  className="h-10 px-4 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="h-10 px-4 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-10 mt-4 text-sm font-semibold text-white bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 dark:from-slate-700 dark:to-slate-600 dark:hover:from-slate-600 dark:hover:to-slate-500"
              >
                Sign In
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col text-xs pt-4 border-t border-slate-200 dark:border-slate-700 mt-6">
            <p className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Demo Credentials</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-center text-slate-600 dark:text-slate-400">
              <p className="font-medium">Admin:</p>
              <p>admin / admin123</p>
              <p className="font-medium">User:</p>
              <p>user / user123</p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
} 