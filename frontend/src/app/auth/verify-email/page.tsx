"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowRight, RefreshCw } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function VerifyEmailPage() {
  const [isResending, setIsResending] = useState(false)

  const handleResendEmail = async () => {
    setIsResending(true)

    try {
      // Aquí iría la lógica para reenviar el email de verificación
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success('Email de verificación reenviado')
    } catch (error) {
      toast.error('Error al reenviar el email')
    } finally {
      setIsResending(false)
    }
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
            VERIFICA TU CORREO
          </h2>
          <p className="text-white/70">
            Te hemos enviado un email de verificación para activar tu cuenta
          </p>
        </div>

        {/* Content */}
        <div className="bg-dark-800/50 backdrop-blur-md rounded-2xl p-8 border border-dark-700/50 text-center">
          <div className="space-y-6">
            {/* Instructions */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">
                ¿Qué hacer ahora?
              </h3>
              <div className="text-left space-y-3 text-white/80">
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-neon-green text-dark-900 rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </span>
                  <p>Revisa tu bandeja de entrada y carpeta de spam</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-neon-green text-dark-900 rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </span>
                  <p>Haz clic en el enlace de verificación del email</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-neon-green text-dark-900 rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </span>
                  <p>Regresa aquí e inicia sesión con tu cuenta</p>
                </div>
              </div>
            </div>

            {/* Resend Email */}
            <div className="border-t border-dark-600 pt-6">
              <p className="text-white/70 mb-4">
                ¿No recibiste el email?
              </p>
              <button
                onClick={handleResendEmail}
                disabled={isResending}
                className="btn-secondary flex items-center justify-center mx-auto group"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Reenviando...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                    Reenviar Email
                  </>
                )}
              </button>
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
            <Link
              href="/auth/register"
              className="text-neon-green hover:text-neon-blue transition-colors duration-200"
            >
              ¿Necesitas crear una cuenta diferente?
            </Link>
          </div>
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
