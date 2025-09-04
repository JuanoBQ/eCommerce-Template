"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingCart, User, Search, Menu, X, Heart } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useCartGlobal as useCart } from '@/hooks/useCartGlobal'
import { useWishlist } from '@/hooks/useWishlist'
import CartSidebar from '@/components/cart/CartSidebar'
import WishlistDropdown from '@/components/layout/WishlistDropdown'
import NavigationDropdown from '@/components/layout/NavigationDropdown'
import { Button } from '@/components/ui/button'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isWishlistOpen, setIsWishlistOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const { totalItems } = useCart()
  const { count: wishlistCount } = useWishlist()
  const router = useRouter()

  // Debug: Log auth state in header
  console.log('🔍 Header - Auth state:', { isAuthenticated, user: user?.first_name, isLoading })

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
    { name: 'Accesorios', href: '/tienda?category=accesorios' },
  ]

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm' 
        : 'bg-white'
    }`}>
      {/* Main Navigation Bar */}
      <div className="w-full px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-black rounded-sm flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <span className="text-lg font-display font-bold text-black">
                FitStore
              </span>
            </Link>
          </div>

          {/* Desktop Navigation - Centered */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm text-gray-700 hover:text-black transition-colors duration-200 font-medium uppercase tracking-wide"
              >
                {item.name}
              </Link>
            ))}
            
            {/* Dropdown Menus */}
            <NavigationDropdown title="Hombres" gender="men" />
            <NavigationDropdown title="Mujeres" gender="women" />
          </nav>

          {/* Search Bar - More compact */}
          <div className="hidden md:block flex-1 max-w-sm mx-6">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-sm text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </form>
          </div>

          {/* Right side actions - More compact */}
          <div className="flex items-center space-x-2">

            {/* User Account */}
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center space-x-1.5 p-1.5 text-gray-700 hover:text-black transition-colors duration-200">
                  {isLoading ? (
                    <div className="w-4 h-4 border border-gray-700 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                  <span className="text-xs font-medium hidden sm:block">
                    {isLoading ? '...' : (user?.first_name || 'Cuenta')}
                  </span>
                </button>
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-200">
                  <div className="py-1">
                    <div className="px-3 py-2 text-xs text-gray-900 border-b border-gray-200">
                      <div className="font-medium">{user?.first_name} {user?.last_name}</div>
                      <div className="text-gray-500 text-xs truncate">{user?.email}</div>
                    </div>
                    <Link
                      href="/account"
                      className="block px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                      Mi Perfil
                    </Link>
                    <Link
                      href="/account/orders"
                      className="block px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                      Mis Pedidos
                    </Link>
                    <Link
                      href="/account/tickets"
                      className="block px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                      Mis Tickets
                    </Link>
                    <Link
                      href="/wishlist"
                      className="block px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                      Lista de Deseos
                    </Link>
                    <div className="border-t border-gray-200 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors duration-200"
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
                  className="text-xs text-gray-700 hover:text-black transition-colors duration-200 font-medium"
                >
                  Iniciar Sesión
                </Link>
                <Button variant="black" size="sm" className="px-3 py-1 text-xs">
                  <Link href="/auth/register">
                    Registrarse
                  </Link>
                </Button>
              </div>
            )}

            {/* Wishlist */}
            <div className="relative">
              <button
                onClick={() => setIsWishlistOpen(!isWishlistOpen)}
                className="p-1.5 text-gray-700 hover:text-black transition-colors duration-200 relative"
              >
                <Heart className="w-4 h-4" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-primary-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center text-xs">
                    {wishlistCount}
                  </span>
                )}
              </button>
              <WishlistDropdown 
                isOpen={isWishlistOpen} 
                onClose={() => setIsWishlistOpen(false)} 
              />
            </div>

            {/* Shopping Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-1.5 text-gray-700 hover:text-black transition-colors duration-200 relative"
            >
              <ShoppingCart className="w-4 h-4" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center text-xs">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-1.5 text-gray-700 hover:text-black transition-colors duration-200"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-1 pb-2 space-y-0.5 bg-white rounded-md mt-1 border border-gray-200 shadow-lg">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-1.5 text-sm text-gray-700 hover:text-black transition-colors duration-200 font-medium uppercase tracking-wide"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Gender Navigation */}
              <Link
                href="/tienda?gender=men&from_nav=true"
                className="block px-3 py-1.5 text-sm text-gray-700 hover:text-black transition-colors duration-200 font-medium uppercase tracking-wide"
                onClick={() => setIsMenuOpen(false)}
              >
                Hombres
              </Link>
              <Link
                href="/tienda?gender=women&from_nav=true"
                className="block px-3 py-1.5 text-sm text-gray-700 hover:text-black transition-colors duration-200 font-medium uppercase tracking-wide"
                onClick={() => setIsMenuOpen(false)}
              >
                Mujeres
              </Link>
              {!isAuthenticated && (
                <div className="border-t border-gray-200 pt-1 mt-1">
                  <Link
                    href="/auth/login"
                    className="block px-3 py-1.5 text-xs text-gray-700 hover:text-black transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    href="/auth/register"
                    className="block px-3 py-1.5 text-xs text-gray-700 hover:text-black transition-colors duration-200"
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
