"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-hot-toast'

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
    <div className="min-h-screen bg-dark-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-neon-green to-neon-blue rounded-2xl mb-6">
            <Lock className="w-8 h-8 text-dark-900" />
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-black text-white mb-4">
            INICIAR SESIÓN
          </h2>
          <p className="text-white/70">
            Accede a tu cuenta para continuar con tu entrenamiento
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-dark-800/50 backdrop-blur-md rounded-2xl p-8 border border-dark-700/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="form-label">
                Correo electrónico
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`form-input pl-12 ${errors.email ? 'border-accent-500 focus:border-accent-500 focus:ring-accent-500' : ''}`}
                  placeholder="tu@email.com"
                />
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
              </div>
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="form-label">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`form-input pl-12 pr-12 ${errors.password ? 'border-accent-500 focus:border-accent-500 focus:ring-accent-500' : ''}`}
                  placeholder="••••••••"
                />
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-dark-400 hover:text-neon-green transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="form-error">{errors.password}</p>}
            </div>

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 bg-dark-700 border-dark-600 rounded focus:ring-neon-green focus:ring-offset-0"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-white/70">
                  Recordarme
                </label>
              </div>

              <div className="text-sm">
                <Link
                  href="/auth/forgot-password"
                  className="text-neon-green hover:text-neon-blue transition-colors duration-200"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || authLoading}
              className="btn-primary w-full flex items-center justify-center group"
            >
              {(isLoading || authLoading) ? (
                <div className="loading-spinner w-5 h-5" />
              ) : (
                <>
                  Iniciar Sesión
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-dark-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-dark-800 text-white/50">¿No tienes cuenta?</span>
              </div>
            </div>
          </div>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <Link
              href="/auth/register"
              className="btn-outline w-full inline-flex items-center justify-center"
            >
              Crear Nueva Cuenta
            </Link>
          </div>
        </div>

        {/* Social Login */}
        <div className="text-center">
          <p className="text-white/50 text-sm">
            O continúa con redes sociales
          </p>
          <div className="mt-4 flex space-x-3">
            <button className="flex-1 bg-dark-800/50 backdrop-blur-md border border-dark-600 rounded-lg px-4 py-3 text-white hover:bg-dark-700 transition-colors duration-200">
              <span className="text-sm font-medium">Google</span>
            </button>
            <button className="flex-1 bg-dark-800/50 backdrop-blur-md border border-dark-600 rounded-lg px-4 py-3 text-white hover:bg-dark-700 transition-colors duration-200">
              <span className="text-sm font-medium">Facebook</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
