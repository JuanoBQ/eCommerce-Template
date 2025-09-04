"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { login, refreshAuthState, waitForAuthUpdate, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Validación de email
    if (!formData.email) {
      newErrors.email = 'El correo electrónico es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El correo electrónico no es válido'
    }

    // Validación de contraseña
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      console.log('🔐 Iniciando login...')
      const result = await login({ email: formData.email, password: formData.password })

      if (result.success) {
        console.log('✅ Login exitoso, esperando actualización del estado...')

        // Refrescar estado inmediatamente para asegurar que se propague
        await refreshAuthState()

        // Esperar a que el estado se actualice completamente
        await waitForAuthUpdate()

        toast.success('¡Inicio de sesión exitoso!')

        // Forzar re-renderizado de la página para actualizar el Header
        console.log('🔄 Forzando re-renderizado de la página...')
        window.location.href = new URLSearchParams(window.location.search).get('redirect') || '/'
      }
    } catch (error: any) {
      console.error('❌ Error de login:', error)
      const errorMessage = error.response?.data?.detail ||
                          error.response?.data?.email ||
                          error.response?.data?.password ||
                          'Error al iniciar sesión. Verifica tus credenciales.'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Redirigir si ya está autenticado
  React.useEffect(() => {
    if (isAuthenticated && !authLoading) {
      const redirectTo = new URLSearchParams(window.location.search).get('redirect') || '/'
      console.log('🔄 Usuario ya autenticado, redirigiendo a:', redirectTo)
      router.push(redirectTo)
    }
  }, [isAuthenticated, authLoading, router])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 auth-page">
      <div className="max-w-md w-full space-y-8">
        {/* Header - Estilo Adidas */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-full mb-6">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            INICIAR SESIÓN
          </h1>
          <p className="text-gray-600">
            Accede a tu cuenta para continuar
          </p>
        </div>

        {/* Login Form - Estilo Adidas */}
        <div className="bg-white border border-gray-200 rounded-md p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`pl-10 ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="tu@email.com"
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`pl-10 pr-10 ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="••••••••"
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
            </div>

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Recordarme
                </label>
              </div>

              <div className="text-sm">
                <Link
                  href="/auth/forgot-password"
                  className="text-primary-500 hover:text-primary-600 transition-colors duration-200"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="black"
              size="lg"
              disabled={isLoading || authLoading}
              className="w-full"
            >
              {(isLoading || authLoading) ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Iniciar Sesión
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">¿No tienes cuenta?</span>
              </div>
            </div>
          </div>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <Link href="/auth/register">
              <Button
                variant="outline"
                size="lg"
                className="w-full"
              >
                Crear Nueva Cuenta
              </Button>
            </Link>
          </div>
        </div>


      </div>
    </div>
  )
}
