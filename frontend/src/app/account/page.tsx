"use client"

import React from 'react'
import Link from 'next/link'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/hooks/useAuth'
import { 
  User, 
  MessageSquare, 
  ShoppingBag, 
  Settings,
  ArrowRight,
  Calendar,
  Mail,
  Phone
} from 'lucide-react'

export default function AccountDashboardPage() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-dark-900 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-green mx-auto"></div>
              <p className="text-white mt-4">Cargando...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-dark-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              ¡Hola, {user?.first_name || 'Usuario'}!
            </h1>
            <p className="text-white/70">
              Bienvenido a tu panel de cuenta
            </p>
          </div>

          {/* User Info Card */}
          <div className="bg-dark-800/50 backdrop-blur-md rounded-2xl p-6 border border-dark-700/50 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-neon-green/20 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-neon-green" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-white">
                  {user?.first_name} {user?.last_name}
                </h2>
                <div className="flex items-center gap-4 text-white/70 text-sm mt-1">
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    <span>{user?.email}</span>
                  </div>
                  {user?.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Mis Pedidos */}
            <Link
              href="/account/orders"
              className="group bg-dark-800/50 backdrop-blur-md rounded-2xl p-6 border border-dark-700/50 hover:border-neon-green/50 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-900/20 rounded-lg flex items-center justify-center group-hover:bg-blue-900/30 transition-colors">
                  <ShoppingBag className="w-6 h-6 text-blue-400" />
                </div>
                <ArrowRight className="w-5 h-5 text-white/50 group-hover:text-neon-green transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Mis Pedidos</h3>
              <p className="text-white/70 text-sm">
                Revisa el estado de tus pedidos y el historial de compras
              </p>
            </Link>

            {/* Mis Tickets */}
            <Link
              href="/account/tickets"
              className="group bg-dark-800/50 backdrop-blur-md rounded-2xl p-6 border border-dark-700/50 hover:border-neon-green/50 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-900/20 rounded-lg flex items-center justify-center group-hover:bg-green-900/30 transition-colors">
                  <MessageSquare className="w-6 h-6 text-green-400" />
                </div>
                <ArrowRight className="w-5 h-5 text-white/50 group-hover:text-neon-green transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Mis Tickets</h3>
              <p className="text-white/70 text-sm">
                Gestiona tus tickets de soporte y da seguimiento a las respuestas
              </p>
            </Link>

            {/* Ver Pedidos */}
            <Link
              href="/account/orders"
              className="group bg-dark-800/50 backdrop-blur-md rounded-2xl p-6 border border-dark-700/50 hover:border-neon-green/50 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-yellow-900/20 rounded-lg flex items-center justify-center group-hover:bg-yellow-900/30 transition-colors">
                  <MessageSquare className="w-6 h-6 text-yellow-400" />
                </div>
                <ArrowRight className="w-5 h-5 text-white/50 group-hover:text-neon-green transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Mis Pedidos</h3>
              <p className="text-white/70 text-sm">
                Revisa tus pedidos y crea tickets de soporte desde ahí
              </p>
            </Link>

            {/* Configuración */}
            <Link
              href="/account/profile"
              className="group bg-dark-800/50 backdrop-blur-md rounded-2xl p-6 border border-dark-700/50 hover:border-neon-green/50 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-900/20 rounded-lg flex items-center justify-center group-hover:bg-purple-900/30 transition-colors">
                  <Settings className="w-6 h-6 text-purple-400" />
                </div>
                <ArrowRight className="w-5 h-5 text-white/50 group-hover:text-neon-green transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Configuración</h3>
              <p className="text-white/70 text-sm">
                Actualiza tu perfil y configuración de cuenta
              </p>
            </Link>
          </div>

          {/* Recent Activity */}
          <div className="bg-dark-800/50 backdrop-blur-md rounded-2xl p-6 border border-dark-700/50">
            <h2 className="text-xl font-semibold text-white mb-4">Actividad Reciente</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-dark-700/30 rounded-lg">
                <div className="w-8 h-8 bg-blue-900/20 rounded-full flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm">
                    Última actualización de perfil
                  </p>
                  <p className="text-white/50 text-xs">
                    {user?.updated_at ? new Date(user.updated_at).toLocaleDateString('es-ES') : 'Nunca'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-dark-700/30 rounded-lg">
                <div className="w-8 h-8 bg-green-900/20 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm">
                    Cuenta creada
                  </p>
                  <p className="text-white/50 text-xs">
                    {user?.date_joined ? new Date(user.date_joined).toLocaleDateString('es-ES') : 'Nunca'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
