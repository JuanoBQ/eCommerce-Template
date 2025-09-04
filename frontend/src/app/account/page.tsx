"use client"

import React from 'react'
import Link from 'next/link'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
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
        <div className="min-h-screen bg-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
              <p className="text-gray-900 mt-4">Cargando...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-2 uppercase tracking-wide">
              MI CUENTA
            </h1>
            <p className="text-gray-600 text-lg">
              ¡Hola, {user?.first_name || 'Usuario'}! Bienvenido a tu panel de cuenta
            </p>
          </div>

          {/* User Info Card */}
          <div className="bg-white border border-gray-200 rounded-md p-8 shadow-sm mb-12">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {user?.first_name} {user?.last_name}
                </h2>
                <div className="flex items-center gap-6 text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    <span className="font-medium">{user?.email}</span>
                  </div>
                  {user?.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-5 h-5" />
                      <span className="font-medium">{user.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {/* Mis Pedidos */}
            <Link
              href="/account/orders"
              className="group bg-white border border-gray-200 rounded-md p-8 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-16 h-16 bg-blue-50 rounded-md flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <ShoppingBag className="w-8 h-8 text-blue-600" />
                </div>
                <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-primary-500 transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 uppercase tracking-wide">Mis Pedidos</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Revisa el estado de tus pedidos y el historial de compras
              </p>
            </Link>

            {/* Mis Tickets */}
            <Link
              href="/account/tickets"
              className="group bg-white border border-gray-200 rounded-md p-8 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-16 h-16 bg-green-50 rounded-md flex items-center justify-center group-hover:bg-green-100 transition-colors">
                  <MessageSquare className="w-8 h-8 text-green-600" />
                </div>
                <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-primary-500 transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 uppercase tracking-wide">Mis Tickets</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Gestiona tus tickets de soporte y da seguimiento a las respuestas
              </p>
            </Link>

            {/* Configuración */}
            <Link
              href="/account/profile"
              className="group bg-white border border-gray-200 rounded-md p-8 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-16 h-16 bg-gray-50 rounded-md flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                  <Settings className="w-8 h-8 text-gray-600" />
                </div>
                <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-primary-500 transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 uppercase tracking-wide">Configuración</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Actualiza tu perfil y configuración de cuenta
              </p>
            </Link>
          </div>

          {/* Recent Activity */}
          <div className="bg-white border border-gray-200 rounded-md p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 uppercase tracking-wide">Actividad Reciente</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-md">
                <div className="w-12 h-12 bg-blue-50 rounded-md flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 font-medium">
                    Última actualización de perfil
                  </p>
                  <p className="text-gray-500 text-sm">
                    {user?.updated_at ? new Date(user.updated_at).toLocaleDateString('es-ES') : 'Nunca'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-md">
                <div className="w-12 h-12 bg-green-50 rounded-md flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 font-medium">
                    Cuenta creada
                  </p>
                  <p className="text-gray-500 text-sm">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString('es-ES') : 'Nunca'}
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
