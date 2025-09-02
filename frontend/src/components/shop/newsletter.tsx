"use client"

import { useState } from 'react'
import { Mail, Send, Check } from 'lucide-react'

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
    <section className="py-20 bg-gradient-to-br from-dark-800 to-dark-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-neon-green/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-blue/10 rounded-full blur-3xl animate-pulse-slow delay-1000" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-neon-green to-neon-blue rounded-2xl mb-8">
            <Mail className="w-8 h-8 text-dark-900" />
          </div>

          {/* Title */}
          <h2 className="text-4xl md:text-6xl font-display font-black mb-6">
            <span className="text-white">MANTENTE</span>
            <span className="block text-gradient">CONECTADO</span>
          </h2>

          {/* Description */}
          <p className="text-xl text-white/70 mb-12 max-w-2xl mx-auto leading-relaxed">
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
                    className="w-full px-6 py-4 bg-dark-800/50 backdrop-blur-sm border border-dark-600 rounded-xl text-white placeholder:text-dark-400 focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green transition-all duration-200"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary flex items-center justify-center group min-w-[160px]"
                >
                  {isLoading ? (
                    <div className="loading-spinner w-5 h-5" />
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform duration-200" />
                      Suscribirse
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-center space-x-3 bg-neon-green/20 backdrop-blur-sm border border-neon-green/50 rounded-xl px-6 py-4">
                <Check className="w-6 h-6 text-neon-green" />
                <span className="text-neon-green font-semibold">
                  ¡Te has suscrito exitosamente!
                </span>
              </div>
            )}
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="w-12 h-12 bg-neon-green/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-neon-green font-bold text-lg">10%</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Descuento Exclusivo</h3>
              <p className="text-white/70 text-sm">
                Recibe un 10% de descuento en tu primera compra
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-neon-blue/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-neon-blue font-bold text-lg">24/7</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Acceso Prioritario</h3>
              <p className="text-white/70 text-sm">
                Sé el primero en conocer nuevos productos y ofertas
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-neon-purple/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-neon-purple font-bold text-lg">VIP</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Contenido Exclusivo</h3>
              <p className="text-white/70 text-sm">
                Consejos de entrenamiento y rutinas personalizadas
              </p>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 pt-8 border-t border-dark-700">
            <p className="text-sm text-white/50 mb-4">
              Únete a más de 50,000 atletas que ya forman parte de nuestra comunidad
            </p>
            <div className="flex items-center justify-center space-x-8 opacity-50">
              <div className="text-center">
                <div className="text-2xl font-bold text-neon-green">50K+</div>
                <div className="text-xs text-white/70">Suscriptores</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-neon-blue">4.9★</div>
                <div className="text-xs text-white/70">Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-neon-purple">24/7</div>
                <div className="text-xs text-white/70">Soporte</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Newsletter