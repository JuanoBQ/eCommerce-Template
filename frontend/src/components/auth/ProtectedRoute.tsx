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
    // Si está cargando, mantener isChecking en true
    if (isLoading) {
      setIsChecking(true)
      return
    }

    // Si no está autenticado, redirigir
    if (!isAuthenticated) {
      // Usuario no autenticado, redirigiendo al login
      toast.error('Debes iniciar sesión para acceder a esta página')
      router.push(`${redirectTo}?redirect=${encodeURIComponent(window.location.pathname)}`)
      setIsChecking(false)
      return
    }

    // Verificar permisos de admin si es requerido
    if (requireAdmin && user && !user.is_admin && !user.is_staff && !user.is_superuser) {
      // Usuario sin permisos de admin
      toast.error('No tienes permisos para acceder al panel administrativo')
      router.push('/')
      setIsChecking(false)
      return
    }

    // Usuario autorizado
    // Usuario autorizado
    setIsChecking(false)
  }, [isAuthenticated, user, isLoading, requireAdmin, redirectTo, router])

  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          {/* Logo/Icon Skeleton */}
          <div className="mb-8">
            <div className="w-20 h-20 bg-gray-200 rounded-full animate-pulse mx-auto mb-4"></div>
            <div className="h-6 bg-gray-200 rounded animate-pulse w-32 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-48 mx-auto"></div>
          </div>

          {/* Main Loading Spinner */}
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-primary-500 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 bg-primary-500 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Loading Text */}
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">Verificando permisos</h2>
            <p className="text-gray-600">Validando acceso al panel administrativo...</p>
            
            {/* Progress Steps */}
            <div className="flex justify-center space-x-2 mt-6">
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>

          {/* Loading Animation */}
          <div className="mt-8">
            <div className="flex justify-center space-x-1">
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || (requireAdmin && user && !user.is_admin && !user.is_staff && !user.is_superuser)) {
    return null
  }

  return <>{children}</>
}
