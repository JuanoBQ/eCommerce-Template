"use client"

import Link from 'next/link'
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  const [email, setEmail] = useState('')
  const [isSubscribing, setIsSubscribing] = useState(false)

  const handleNewsletterSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('Por favor ingresa tu email')
      return
    }

    if (!email.includes('@')) {
      toast.error('Por favor ingresa un email válido')
      return
    }

    setIsSubscribing(true)
    
    try {
      // Simular suscripción (aquí podrías hacer una llamada a la API)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success('¡Te has suscrito exitosamente!')
      setEmail('')
    } catch (error) {
      toast.error('Error al suscribirse. Inténtalo de nuevo.')
    } finally {
      setIsSubscribing(false)
    }
  }

  const footerLinks = {
    shop: [
      { name: 'Hombres', href: '/tienda?gender=men&from_nav=true' },
      { name: 'Mujeres', href: '/tienda?gender=women&from_nav=true' },
      { name: 'Accesorios', href: '/tienda?category=accesorios&from_nav=true' },
      { name: 'Nuevos', href: '/tienda?featured=true&from_nav=true' },
      { name: 'Ofertas', href: '/tienda?sale=true&from_nav=true' },
    ],
    support: [
      { name: 'Centro de Ayuda', href: '/ayuda' },
      { name: 'Guía de Tallas', href: '/guia-tallas' },
      { name: 'Envíos y Devoluciones', href: '/envios' },
      { name: 'Política de Privacidad', href: '/privacidad' },
      { name: 'Términos y Condiciones', href: '/terminos' },
    ],
    company: [
      { name: 'Sobre Nosotros', href: '/nosotros' },
      { name: 'Carreras', href: '/carreras' },
      { name: 'Prensa', href: '/prensa' },
      { name: 'Sostenibilidad', href: '/sostenibilidad' },
      { name: 'Contacto', href: '/contacto' },
    ],
  }

  const socialLinks = [
    { name: 'Instagram', href: 'https://instagram.com/fitstore', icon: Instagram },
    { name: 'Facebook', href: 'https://facebook.com/fitstore', icon: Facebook },
    { name: 'Twitter', href: 'https://twitter.com/fitstore', icon: Twitter },
    { name: 'YouTube', href: 'https://youtube.com/fitstore', icon: Youtube },
  ]

  return (
    <footer className="bg-dark-900 border-t border-dark-800">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-neon-green to-neon-blue rounded-lg flex items-center justify-center">
                <span className="text-dark-900 font-bold text-lg">G</span>
              </div>
              <span className="text-xl font-display font-bold text-gradient">
                FitStore
              </span>
            </div>
            
            <p className="text-white/70 mb-6 max-w-md leading-relaxed">
              Somos más que una marca de ropa deportiva. Somos una comunidad de atletas, 
              fitness enthusiasts y personas que buscan superar sus límites cada día.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-white/70">
                <Mail className="w-4 h-4 text-neon-green" />
                <span>hola@fitstore.com</span>
              </div>
              <div className="flex items-center space-x-3 text-white/70">
                <Phone className="w-4 h-4 text-neon-green" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3 text-white/70">
                <MapPin className="w-4 h-4 text-neon-green" />
                <span>Madrid, España</span>
              </div>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-white font-semibold mb-6">Tienda</h3>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-neon-green transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-white font-semibold mb-6">Soporte</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-neon-green transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-white font-semibold mb-6">Empresa</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-neon-green transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-16 pt-8 border-t border-dark-800">
          <div className="max-w-md">
            <h3 className="text-white font-semibold mb-4">Mantente al día</h3>
            <p className="text-white/70 mb-4">
              Recibe las últimas noticias y ofertas exclusivas
            </p>
            <form onSubmit={handleNewsletterSubscribe} className="flex space-x-3">
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white placeholder:text-dark-400 focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green"
                disabled={isSubscribing}
              />
              <button 
                type="submit"
                disabled={isSubscribing}
                className="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubscribing ? 'Suscribiendo...' : 'Suscribirse'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-white/50 text-sm">
              © {currentYear} FitStore. Todos los derechos reservados.
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => {
                const IconComponent = social.icon
                return (
                  <Link
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-white/50 hover:text-neon-green transition-colors duration-200"
                    aria-label={social.name}
                  >
                    <IconComponent className="w-5 h-5" />
                  </Link>
                )
              })}
            </div>

            {/* Payment Methods */}
            <div className="flex items-center space-x-2 text-white/50 text-sm">
              <span>Métodos de pago:</span>
              <div className="flex items-center space-x-1">
                <div className="w-8 h-5 bg-white/10 rounded text-xs flex items-center justify-center">VISA</div>
                <div className="w-8 h-5 bg-white/10 rounded text-xs flex items-center justify-center">MC</div>
                <div className="w-8 h-5 bg-white/10 rounded text-xs flex items-center justify-center">PP</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
