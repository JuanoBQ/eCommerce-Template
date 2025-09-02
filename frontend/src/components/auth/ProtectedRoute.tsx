"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-hot-toast'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
  redirectTo?: string
}

export default function ProtectedRoute({ 
  children, 
  requireAdmin = false, 
  redirectTo = '/auth/login' 
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      console.log('❌ Usuario no autenticado, redirigiendo al login')
      toast.error('Debes iniciar sesión para acceder a esta página')
      router.push(`${redirectTo}?redirect=${encodeURIComponent(window.location.pathname)}`)
      return
    }

    if (requireAdmin && user && !user.is_admin && !user.is_staff && !user.is_superuser) {
      console.log('❌ Usuario sin permisos de admin:', user)
      toast.error('No tienes permisos para acceder al panel administrativo')
      router.push('/')
      return
    }

    console.log('✅ Usuario autorizado:', user)
    setIsChecking(false)
  }, [isAuthenticated, user, isLoading, requireAdmin, redirectTo, router])

  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-neon-green mx-auto mb-4"></div>
          <p className="text-white">Verificando permisos...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || (requireAdmin && user && !user.is_admin && !user.is_staff && !user.is_superuser)) {
    return null
  }

  return <>{children}</>
}