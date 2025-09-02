"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowRight, Send } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Aquí iría la lógica para enviar el email de recuperación
      await new Promise(resolve => setTimeout(resolve, 2000))
      setIsEmailSent(true)
      toast.success('Email de recuperación enviado')
    } catch (error) {
      toast.error('Error al enviar el email de recuperación')
    } finally {
      setIsLoading(false)
    }
  }

  if (isEmailSent) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-neon-green to-neon-blue rounded-2xl mb-6">
              <Mail className="w-8 h-8 text-dark-900" />
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-black text-white mb-4">
              EMAIL ENVIADO
            </h2>
            <p className="text-white/70">
              Te hemos enviado instrucciones para recuperar tu contraseña
            </p>
          </div>

          {/* Content */}
          <div className="bg-dark-800/50 backdrop-blur-md rounded-2xl p-8 border border-dark-700/50 text-center">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">
                  Revisa tu email
                </h3>
                <p className="text-white/80">
                  Hemos enviado un enlace de recuperación a <strong className="text-neon-green">{email}</strong>
                </p>
                <p className="text-white/70 text-sm">
                  El enlace expirará en 24 horas. Si no lo encuentras, revisa tu carpeta de spam.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col space-y-4">
            <Link
              href="/auth/login"
              className="btn-primary flex items-center justify-center group"
            >
              Ir a Iniciar Sesión
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>

            <div className="text-center">
              <button
                onClick={() => setIsEmailSent(false)}
                className="text-neon-green hover:text-neon-blue transition-colors duration-200"
              >
                ¿No recibiste el email? Enviar de nuevo
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-neon-green to-neon-blue rounded-2xl mb-6">
            <Mail className="w-8 h-8 text-dark-900" />
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-black text-white mb-4">
            RECUPERAR CONTRASEÑA
          </h2>
          <p className="text-white/70">
            Ingresa tu email y te enviaremos un enlace para recuperar tu contraseña
          </p>
        </div>

        {/* Form */}
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input pl-12"
                  placeholder="tu@email.com"
                />
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
              </div>
              <p className="text-sm text-white/70 mt-2">
                Ingresa el email asociado a tu cuenta
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center group"
            >
              {isLoading ? (
                <div className="loading-spinner w-5 h-5" />
              ) : (
                <>
                  Enviar Email de Recuperación
                  <Send className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Back to Login */}
        <div className="text-center">
          <Link
            href="/auth/login"
            className="text-neon-green hover:text-neon-blue transition-colors duration-200"
          >
            ← Volver a Iniciar Sesión
          </Link>
        </div>

        {/* Help */}
        <div className="text-center text-sm text-white/50">
          <p>
            ¿Necesitas ayuda?{' '}
            <Link
              href="/help"
              className="text-neon-green hover:text-neon-blue transition-colors duration-200"
            >
              Contacta con soporte
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
