"use client"

import { useState } from 'react'
import { Mail, Send, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

const Newsletter = () => {
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simular llamada a la API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsSubscribed(true)
    setIsLoading(false)
    setEmail('')
    
    // Reset after 3 seconds
    setTimeout(() => setIsSubscribed(false), 3000)
  }

  return (
    <section className="py-20 bg-black relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl animate-pulse-slow delay-1000" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-2xl mb-8">
            <Mail className="w-8 h-8 text-white" />
          </div>

          {/* Title */}
          <h2 className="text-4xl md:text-6xl font-display font-black mb-6">
            <span className="text-white">MANTENTE</span>
            <span className="block text-primary-500">CONECTADO</span>
          </h2>

          {/* Description */}
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            Únete a nuestra comunidad y recibe las últimas noticias, ofertas exclusivas y consejos de entrenamiento directamente en tu bandeja de entrada.
          </p>

          {/* Newsletter Form */}
          <div className="max-w-md mx-auto">
            {!isSubscribed ? (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                    className="w-full px-6 py-4 bg-gray-900 border border-gray-700 rounded-md text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  variant="primary"
                  size="lg"
                  className="min-w-[160px]"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Suscribirse
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <div className="flex items-center justify-center space-x-3 bg-green-500/20 border border-green-500/50 rounded-md px-6 py-4">
                <Check className="w-6 h-6 text-green-500" />
                <span className="text-green-500 font-semibold">
                  ¡Te has suscrito exitosamente!
                </span>
              </div>
            )}
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-500 font-bold text-lg">10%</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Descuento Exclusivo</h3>
              <p className="text-gray-300 text-sm">
                Recibe un 10% de descuento en tu primera compra
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-gray-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-gray-400 font-bold text-lg">24/7</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Acceso Prioritario</h3>
              <p className="text-gray-300 text-sm">
                Sé el primero en conocer nuevos productos y ofertas
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-500 font-bold text-lg">VIP</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Contenido Exclusivo</h3>
              <p className="text-gray-300 text-sm">
                Consejos de entrenamiento y rutinas personalizadas
              </p>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 pt-8 border-t border-gray-800">
            <p className="text-sm text-gray-400 mb-4">
              Únete a más de 50,000 atletas que ya forman parte de nuestra comunidad
            </p>
            <div className="flex items-center justify-center space-x-8 opacity-70">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-500">50K+</div>
                <div className="text-xs text-gray-400">Suscriptores</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-400">4.9★</div>
                <div className="text-xs text-gray-400">Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-500">24/7</div>
                <div className="text-xs text-gray-400">Soporte</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Newsletter
