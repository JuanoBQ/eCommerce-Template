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
  Search
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
    { name: 'Reportes', href: '/admin/reports', icon: BarChart3, current: pathname.startsWith('/admin/reports') },
    { name: 'Configuración', href: '/admin/settings', icon: Settings, current: pathname.startsWith('/admin/settings') },
  ]

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="min-h-screen bg-dark-900">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-dark-900/80" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 bg-dark-800 border-r border-dark-700">
          <div className="flex items-center justify-between h-16 px-6 border-b border-dark-700">
            <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                          <button
                onClick={() => setSidebarOpen(false)}
                className="text-dark-400 hover:text-white"
                title="Cerrar menú"
                aria-label="Cerrar menú lateral"
              >
                <X className="w-6 h-6" />
              </button>
          </div>
          <nav className="mt-6 px-3">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg mb-1 transition-colors ${
                  item.current
                    ? 'bg-neon-green/20 text-neon-green border border-neon-green/30'
                    : 'text-dark-300 hover:text-white hover:bg-dark-700'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-dark-800 border-r border-dark-700">
          <div className="flex items-center h-16 px-6 border-b border-dark-700">
            <h1 className="text-xl font-bold text-white">Admin Panel</h1>
          </div>
          <nav className="mt-6 flex-1 px-3 pb-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg mb-1 transition-colors ${
                  item.current
                    ? 'bg-neon-green/20 text-neon-green border border-neon-green/30'
                    : 'text-dark-300 hover:text-white hover:bg-dark-700'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-dark-800 border-b border-dark-700">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-dark-400 hover:text-white"
                title="Abrir menú"
                aria-label="Abrir menú lateral"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="hidden sm:block ml-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-400" />
                  <input
                    type="text"
                    placeholder="Buscar..."
                    className="pl-10 pr-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button 
                className="text-dark-400 hover:text-white relative"
                title="Notificaciones"
                aria-label="Ver notificaciones"
              >
                <Bell className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-neon-green rounded-full"></span>
              </button>

              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{user?.first_name} {user?.last_name}</p>
                  <p className="text-xs text-dark-400">Administrador</p>
                </div>
                <div className="w-8 h-8 bg-neon-green rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-dark-900" />
                </div>
                <button
                  onClick={handleLogout}
                  className="text-dark-400 hover:text-white"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-5 h-5" />
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
