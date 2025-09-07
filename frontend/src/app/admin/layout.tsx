"use client"

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  BarChart3, 
  Settings,
  Menu,
  X,
  LogOut,
  User,
  Bell,
  AlertTriangle
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Sesión cerrada exitosamente')
      router.push('/auth/login')
    } catch (error) {
      toast.error('Error al cerrar sesión')
    }
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, current: pathname === '/admin' },
    { name: 'Productos', href: '/admin/products', icon: Package, current: pathname.startsWith('/admin/products') },
    { name: 'Categorías', href: '/admin/categories', icon: BarChart3, current: pathname.startsWith('/admin/categories') },
    { name: 'Usuarios', href: '/admin/users', icon: Users, current: pathname.startsWith('/admin/users') },
    { name: 'Pedidos', href: '/admin/orders', icon: ShoppingCart, current: pathname.startsWith('/admin/orders') },
    { name: 'Reclamos', href: '/admin/claims', icon: AlertTriangle, current: pathname.startsWith('/admin/claims') },
    { name: 'Reportes', href: '/admin/reports', icon: BarChart3, current: pathname.startsWith('/admin/reports') },
    { name: 'Configuración', href: '/admin/settings', icon: Settings, current: pathname.startsWith('/admin/settings') },
  ]

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="min-h-screen bg-black">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 bg-gray-900/95 backdrop-blur-sm border-r border-gray-700">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-gray-700 via-gray-600 to-primary-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Admin Panel</h1>
                <p className="text-xs text-gray-400">FitStore</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              title="Cerrar menú"
              aria-label="Cerrar menú lateral"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="mt-6 px-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  item.current
                    ? 'bg-gray-700/50 text-white border border-gray-600 shadow-lg focus:ring-gray-500'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800 focus:ring-gray-500'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className={`w-5 h-5 mr-3 transition-colors ${
                  item.current ? 'text-white' : 'text-gray-400 group-hover:text-white'
                }`} />
                {item.name}
                {item.current && (
                  <div className="ml-auto w-2 h-2 bg-primary-500 rounded-full"></div>
                )}
              </Link>
            ))}
          </nav>
          
          {/* Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
            <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-r from-gray-700 via-gray-600 to-primary-800 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-gray-400">Administrador</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-gray-900/95 backdrop-blur-sm border-r border-gray-700">
          {/* Logo section */}
          <div className="flex items-center h-16 px-6 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-gray-700 via-gray-600 to-primary-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Admin Panel</h1>
                <p className="text-xs text-gray-400">FitStore</p>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="mt-6 flex-1 px-3 pb-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  item.current
                    ? 'bg-gray-700/50 text-white border border-gray-600 shadow-lg focus:ring-gray-500'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800 focus:ring-gray-500'
                }`}
              >
                <item.icon className={`w-5 h-5 mr-3 transition-colors ${
                  item.current ? 'text-white' : 'text-gray-400 group-hover:text-white'
                }`} />
                {item.name}
                {item.current && (
                  <div className="ml-auto w-2 h-2 bg-primary-500 rounded-full"></div>
                )}
              </Link>
            ))}
          </nav>
          
          {/* Footer section */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-r from-gray-700 via-gray-600 to-primary-800 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-gray-400">Administrador</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 bg-gray-50">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-primary-700/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                title="Abrir menú"
                aria-label="Abrir menú lateral"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              {/* Breadcrumb */}
              <div className="hidden sm:flex items-center space-x-2 text-sm">
                <span className="text-gray-400">Admin</span>
                <span className="text-gray-500">/</span>
                <span className="text-white font-medium">
                  {navigation.find(item => item.current)?.name || 'Dashboard'}
                </span>
              </div>
              

            </div>

            <div className="flex items-center space-x-3">
              {/* Quick actions */}
              <div className="hidden lg:flex items-center space-x-2">
                <Link
                  href="/admin/products/new"
                  className="px-3 py-1.5 bg-gray-700 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  + Producto
                </Link>
                <Link
                  href="/"
                  className="px-3 py-1.5 border border-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Ver Tienda
                </Link>
              </div>

              {/* Notifications */}
              <button
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-primary-700/20 relative transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                title="Notificaciones"
                aria-label="Ver notificaciones"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white font-bold">
                  3
                </span>
              </button>

              {/* User menu */}
              <div className="flex items-center space-x-3 pl-3 border-l border-gray-700">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-white">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-xs text-gray-400">Administrador</p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-r from-gray-700 via-gray-600 to-primary-800 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-primary-700/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  title="Cerrar sesión"
                  aria-label="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
    </ProtectedRoute>
  )
}
