"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingCart, User, Search, Menu, X, Heart } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useCartGlobal as useCart } from '@/hooks/useCartGlobal'
import CartSidebar from '@/components/cart/CartSidebar'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { user, isAuthenticated, logout } = useAuth()
  const { totalItems } = useCart()
  const router = useRouter()

  // Debug: Log totalItems in header (commented out for production)
  // console.log('Header totalItems:', totalItems)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/tienda?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const navigation = [
    { name: 'Tienda', href: '/tienda' },
    { name: 'Hombres', href: '/shop/men' },
    { name: 'Mujeres', href: '/shop/women' },
    { name: 'Accesorios', href: '/shop/accessories' },
  ]

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-dark-900/95 backdrop-blur-md border-b border-dark-700/50' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-neon-green to-neon-blue rounded-lg flex items-center justify-center">
                <span className="text-dark-900 font-bold text-lg">G</span>
              </div>
              <span className="text-xl font-display font-bold text-gradient">
                FitStore
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-white hover:text-neon-green transition-colors duration-200 font-medium"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar productos..."
                  className="w-full pl-10 pr-4 py-2 bg-dark-800/50 border border-dark-700/50 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-neon-green/50 focus:border-neon-green/50 backdrop-blur-sm"
                />
              </div>
            </form>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">

            {/* User Account */}
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 p-2 text-white hover:text-neon-green transition-colors duration-200">
                  <User className="w-5 h-5" />
                  <span className="text-sm font-medium hidden sm:block">
                    {user?.first_name || 'Cuenta'}
                  </span>
                </button>
                <div className="absolute right-0 mt-2 w-56 bg-dark-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-dark-700">
                  <div className="py-2">
                    <div className="px-4 py-3 text-sm text-white border-b border-dark-700">
                      <div className="font-medium">{user?.first_name} {user?.last_name}</div>
                      <div className="text-white/70 text-xs">{user?.email}</div>
                    </div>
                    <Link
                      href="/account/profile"
                      className="block px-4 py-3 text-sm text-white hover:bg-dark-700 transition-colors duration-200"
                    >
                      Mi Perfil
                    </Link>
                    <Link
                      href="/account/orders"
                      className="block px-4 py-3 text-sm text-white hover:bg-dark-700 transition-colors duration-200"
                    >
                      Mis Pedidos
                    </Link>
                    <Link
                      href="/wishlist"
                      className="block px-4 py-3 text-sm text-white hover:bg-dark-700 transition-colors duration-200"
                    >
                      Lista de Deseos
                    </Link>
                    <div className="border-t border-dark-700 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-3 text-sm text-white hover:bg-dark-700 transition-colors duration-200"
                      >
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/auth/login"
                  className="text-white hover:text-neon-green transition-colors duration-200 font-medium"
                >
                  Iniciar Sesión
                </Link>
                <span className="text-white/50">|</span>
                <Link
                  href="/auth/register"
                  className="text-neon-green hover:text-neon-blue transition-colors duration-200 font-medium"
                >
                  Registrarse
                </Link>
              </div>
            )}

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="p-2 text-white hover:text-neon-green transition-colors duration-200 relative"
            >
              <Heart className="w-5 h-5" />
            </Link>

            {/* Shopping Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2 text-white hover:text-neon-green transition-colors duration-200 relative"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-neon-green text-dark-900 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-white hover:text-neon-green transition-colors duration-200"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-dark-800/95 backdrop-blur-md rounded-lg mt-2 border border-dark-700/50">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-white hover:text-neon-green transition-colors duration-200 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {!isAuthenticated && (
                <div className="border-t border-dark-700 pt-2 mt-2">
                  <Link
                    href="/auth/login"
                    className="block px-3 py-2 text-white hover:text-neon-green transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    href="/auth/register"
                    className="block px-3 py-2 text-white hover:text-neon-green transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Registrarse
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Cart Sidebar */}
      <CartSidebar 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />
    </header>
  )
}

export default Header
