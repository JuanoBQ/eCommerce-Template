"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password1: '',
    password2: '',
    first_name: '',
    last_name: '',
    phone: '',
    terms_accepted: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { register } = useAuth()
  const router = useRouter()

  // Función para calcular la fortaleza de la contraseña
  const getPasswordStrength = (password: string) => {
    let score = 0
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }

    Object.values(checks).forEach(check => {
      if (check) score++
    })

    if (score <= 2) return { strength: 'Débil', color: 'text-red-500', bgColor: 'bg-red-500' }
    if (score <= 3) return { strength: 'Media', color: 'text-yellow-500', bgColor: 'bg-yellow-500' }
    if (score <= 4) return { strength: 'Fuerte', color: 'text-blue-500', bgColor: 'bg-blue-500' }
    return { strength: 'Muy Fuerte', color: 'text-green-500', bgColor: 'bg-green-500' }
  }

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
    if (!formData.password1) {
      newErrors.password1 = 'La contraseña es requerida'
    } else if (formData.password1.length < 8) {
      newErrors.password1 = 'La contraseña debe tener al menos 8 caracteres'
    }

    // Validación de confirmación de contraseña
    if (!formData.password2) {
      newErrors.password2 = 'Confirma tu contraseña'
    } else if (formData.password1 !== formData.password2) {
      newErrors.password2 = 'Las contraseñas no coinciden'
    }

    // Validación de nombre
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'El nombre es requerido'
    } else if (formData.first_name.trim().length < 2) {
      newErrors.first_name = 'El nombre debe tener al menos 2 caracteres'
    }

    // Validación de apellido
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Los apellidos son requeridos'
    } else if (formData.last_name.trim().length < 2) {
      newErrors.last_name = 'Los apellidos deben tener al menos 2 caracteres'
    }

    // Validación de teléfono
    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'El número de teléfono no es válido'
    }

    // Validación de términos
    if (!formData.terms_accepted) {
      newErrors.terms_accepted = 'Debes aceptar los términos y condiciones'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      await register(formData)
      toast.success('¡Cuenta creada exitosamente! Revisa tu correo para verificar tu cuenta.')
      router.push('/auth/verify-email')
    } catch (error: any) {
      console.error('Error de registro:', error)

      if (error.response?.data) {
        const apiErrors = error.response.data
        const newErrors: Record<string, string> = {}

        Object.keys(apiErrors).forEach(key => {
          if (Array.isArray(apiErrors[key])) {
            newErrors[key] = apiErrors[key][0]
          } else {
            newErrors[key] = apiErrors[key]
          }
        })

        setErrors(newErrors)
        toast.error('Error al crear la cuenta. Revisa los errores.')
      } else {
        toast.error('Error al crear la cuenta. Inténtalo de nuevo.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 auth-page">
      <div className="max-w-md w-full space-y-8">
        {/* Header - Estilo Adidas */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-full mb-6">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            CREAR CUENTA
          </h1>
          <p className="text-gray-600">
            Únete a nuestra comunidad
          </p>
        </div>

        {/* Register Form - Estilo Adidas */}
        <div className="bg-white border border-gray-200 rounded-md p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                Correo electrónico *
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

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-900 mb-2">
                  Nombre *
                </label>
                <div className="relative">
                  <Input
                    id="first_name"
                    name="first_name"
                    type="text"
                    autoComplete="given-name"
                    required
                    value={formData.first_name}
                    onChange={handleChange}
                    className={`pl-10 ${errors.first_name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Juan"
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                {errors.first_name && <p className="text-sm text-red-500 mt-1">{errors.first_name}</p>}
              </div>

              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-900 mb-2">
                  Apellidos *
                </label>
                <Input
                  id="last_name"
                  name="last_name"
                  type="text"
                  autoComplete="family-name"
                  required
                  value={formData.last_name}
                  onChange={handleChange}
                  className={errors.last_name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                  placeholder="Pérez"
                />
                {errors.last_name && <p className="text-sm text-red-500 mt-1">{errors.last_name}</p>}
              </div>
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-900 mb-2">
                Teléfono
              </label>
              <div className="relative">
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="pl-10"
                  placeholder="+34 600 000 000"
                />
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Password Fields */}
            <div className="space-y-4">
              <div>
                <label htmlFor="password1" className="block text-sm font-medium text-gray-900 mb-2">
                  Contraseña *
                </label>
                <div className="relative">
                  <Input
                    id="password1"
                    name="password1"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.password1}
                    onChange={handleChange}
                    className={`pl-10 pr-10 ${errors.password1 ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
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
                {errors.password1 && <p className="text-sm text-red-500 mt-1">{errors.password1}</p>}
                
                {/* Indicador de fortaleza de contraseña */}
                {formData.password1 && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Fortaleza:</span>
                      <span className={getPasswordStrength(formData.password1).color}>
                        {getPasswordStrength(formData.password1).strength}
                      </span>
                    </div>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrength(formData.password1).bgColor}`}
                        style={{ 
                          width: `${Math.min(100, (formData.password1.length / 12) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="password2" className="block text-sm font-medium text-gray-900 mb-2">
                  Confirmar contraseña *
                </label>
                <div className="relative">
                  <Input
                    id="password2"
                    name="password2"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.password2}
                    onChange={handleChange}
                    className={`pl-10 pr-10 ${errors.password2 ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="••••••••"
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password2 && <p className="text-sm text-red-500 mt-1">{errors.password2}</p>}
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="accept-terms"
                  name="accept-terms"
                  type="checkbox"
                  checked={formData.terms_accepted}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, terms_accepted: e.target.checked }))
                    if (errors.terms_accepted) {
                      setErrors(prev => ({ ...prev, terms_accepted: '' }))
                    }
                  }}
                  className={`h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded ${
                    errors.terms_accepted ? 'border-red-500' : ''
                  }`}
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="accept-terms" className={`text-gray-700 ${errors.terms_accepted ? 'text-red-500' : ''}`}>
                  Acepto los{' '}
                  <Link href="/terms" className="text-primary-500 hover:text-primary-600 transition-colors duration-200">
                    términos y condiciones
                  </Link>{' '}
                  y la{' '}
                  <Link href="/privacy" className="text-primary-500 hover:text-primary-600 transition-colors duration-200">
                    política de privacidad
                  </Link>
                </label>
                {errors.terms_accepted && (
                  <p className="text-red-500 text-xs mt-1">{errors.terms_accepted}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="black"
              size="lg"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Crear Cuenta
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
                <span className="px-2 bg-white text-gray-500">¿Ya tienes cuenta?</span>
              </div>
            </div>
          </div>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <Link href="/auth/login">
              <Button
                variant="outline"
                size="lg"
                className="w-full"
              >
                Iniciar Sesión
              </Button>
            </Link>
          </div>
        </div>


      </div>
    </div>
  )
}
