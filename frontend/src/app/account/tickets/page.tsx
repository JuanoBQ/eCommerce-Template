"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { useClaims } from '@/hooks/useClaims'
import { Claim } from '@/hooks/useClaims'
import { 
  MessageSquare, 
  Search, 
  Eye, 
  Calendar,
  Package,
  CreditCard,
  Truck,
  Wrench,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Plus
} from 'lucide-react'

type ClaimStatus = 'pending' | 'in_review' | 'resolved' | 'rejected'
type ClaimType = 'product_issue' | 'shipping_issue' | 'payment_issue' | 'service_issue' | 'other'
type Priority = 'low' | 'medium' | 'high' | 'urgent'

const statusColors = {
  pending: 'bg-yellow-900/50 text-yellow-400',
  in_review: 'bg-blue-900/50 text-blue-400',
  resolved: 'bg-green-900/50 text-green-400',
  rejected: 'bg-red-900/50 text-red-400'
}

const priorityColors = {
  low: 'bg-gray-900/50 text-gray-400',
  medium: 'bg-yellow-900/50 text-yellow-400',
  high: 'bg-orange-900/50 text-orange-400',
  urgent: 'bg-red-900/50 text-red-400'
}

const claimTypeIcons = {
  product_issue: Package,
  shipping_issue: Truck,
  payment_issue: CreditCard,
  service_issue: Wrench,
  other: AlertTriangle
}

const claimTypeLabels = {
  product_issue: 'Producto',
  shipping_issue: 'Envío',
  payment_issue: 'Pago',
  service_issue: 'Servicio',
  other: 'Otro'
}

export default function UserTicketsPage() {
  const { claims, loading, error } = useClaims()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<ClaimStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<ClaimType | 'all'>('all')
  const [selectedTicket, setSelectedTicket] = useState<Claim | null>(null)
  const [showModal, setShowModal] = useState(false)

  // Filtrar tickets (solo los del usuario actual)
  const userTickets = claims.filter(claim => {
    const matchesSearch = claim.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || claim.status === statusFilter
    const matchesType = typeFilter === 'all' || claim.claim_type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const handleViewTicket = (ticket: Claim) => {
    setSelectedTicket(ticket)
    setShowModal(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusIcon = (status: ClaimStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'in_review':
        return <Eye className="w-4 h-4" />
      case 'resolved':
        return <CheckCircle className="w-4 h-4" />
      case 'rejected':
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-dark-900 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-green mx-auto"></div>
              <p className="text-white mt-4">Cargando tus tickets...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-dark-900 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Error al cargar tickets</h2>
              <p className="text-white/70 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="btn-primary"
              >
                Reintentar
              </button>
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
            <div className="flex items-center gap-4 mb-6">
              <Link
                href="/account"
                className="p-2 text-white/70 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-white">Mis Tickets</h1>
                <p className="text-white/70">
                  Gestiona y da seguimiento a tus tickets de soporte
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{userTickets.length}</div>
                <div className="text-white/70 text-sm">Total Tickets</div>
              </div>
              <Link
                href="/account/orders"
                className="flex items-center gap-2 px-4 py-2 bg-neon-green text-dark-900 rounded-lg font-semibold hover:bg-neon-green/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Ver Mis Pedidos
              </Link>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-dark-800/50 backdrop-blur-md rounded-2xl p-6 border border-dark-700/50 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Búsqueda */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
                />
              </div>

              {/* Filtro por Estado */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ClaimStatus | 'all')}
                className="px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
                aria-label="Filtrar por estado"
              >
                <option value="all">Todos los Estados</option>
                <option value="pending">Pendientes</option>
                <option value="in_review">En Revisión</option>
                <option value="resolved">Resueltos</option>
                <option value="rejected">Rechazados</option>
              </select>

              {/* Filtro por Tipo */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as ClaimType | 'all')}
                className="px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
                aria-label="Filtrar por tipo"
              >
                <option value="all">Todos los Tipos</option>
                <option value="product_issue">Producto</option>
                <option value="shipping_issue">Envío</option>
                <option value="payment_issue">Pago</option>
                <option value="service_issue">Servicio</option>
                <option value="other">Otro</option>
              </select>
            </div>
          </div>

          {/* Lista de Tickets */}
          <div className="bg-dark-800/50 backdrop-blur-md rounded-2xl border border-dark-700/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-white font-medium">ID</th>
                    <th className="px-6 py-4 text-left text-white font-medium">Título</th>
                    <th className="px-6 py-4 text-left text-white font-medium">Tipo</th>
                    <th className="px-6 py-4 text-left text-white font-medium">Prioridad</th>
                    <th className="px-6 py-4 text-left text-white font-medium">Estado</th>
                    <th className="px-6 py-4 text-left text-white font-medium">Fecha</th>
                    <th className="px-6 py-4 text-left text-white font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-700/50">
                  {userTickets.map((ticket) => {
                    const TypeIcon = claimTypeIcons[ticket.claim_type]
                    return (
                      <tr key={ticket.id} className="hover:bg-dark-700/30 transition-colors">
                        <td className="px-6 py-4 text-white font-mono">#{ticket.id}</td>
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            <p className="text-white font-medium truncate">{ticket.title}</p>
                            <p className="text-white/70 text-sm truncate">{ticket.description}</p>
                            {ticket.product_name && (
                              <p className="text-white/50 text-xs truncate">
                                Producto: {ticket.product_name} {ticket.product_sku && `(${ticket.product_sku})`}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <TypeIcon className="w-4 h-4 text-dark-400" />
                            <span className="text-white">{claimTypeLabels[ticket.claim_type]}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${priorityColors[ticket.priority]}`}>
                            {ticket.priority === 'low' && '🟢 Baja'}
                            {ticket.priority === 'medium' && '🟡 Media'}
                            {ticket.priority === 'high' && '🟠 Alta'}
                            {ticket.priority === 'urgent' && '🔴 Urgente'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(ticket.status)}
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[ticket.status]}`}>
                              {ticket.status === 'pending' && '⏳ Pendiente'}
                              {ticket.status === 'in_review' && '🔍 En Revisión'}
                              {ticket.status === 'resolved' && '✅ Resuelto'}
                              {ticket.status === 'rejected' && '❌ Rechazado'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-dark-400" />
                            <span className="text-white text-sm">{formatDate(ticket.created_at)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleViewTicket(ticket)}
                            className="p-2 text-dark-400 hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-900/20"
                            title="Ver detalles del ticket"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {userTickets.length === 0 && (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-dark-400 mx-auto mb-4" />
                <p className="text-white/70 mb-4">No tienes tickets aún</p>
                <p className="text-white/50 text-sm mb-6">
                  Crea tu primer ticket para obtener soporte
                </p>
                <Link
                  href="/account/orders"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-neon-green text-dark-900 rounded-lg font-semibold hover:bg-neon-green/90 transition-colors"
                >
                                  <Plus className="w-4 h-4" />
                Ver Mis Pedidos
                </Link>
              </div>
            )}
          </div>

          {/* Modal de Detalles */}
          {showModal && selectedTicket && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-dark-800 border border-dark-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white">Ticket #{selectedTicket.id}</h2>
                    <button
                      onClick={() => setShowModal(false)}
                      className="text-dark-400 hover:text-white transition-colors"
                      title="Cerrar modal"
                    >
                      <XCircle className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Información del Ticket */}
                    <div className="bg-dark-700/50 rounded-lg p-4">
                      <h3 className="text-white font-medium mb-3">Información del Ticket</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-dark-400" />
                          <span className="text-dark-300">Fecha:</span>
                          <span className="text-white">{formatDate(selectedTicket.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(selectedTicket.status)}
                          <span className="text-dark-300">Estado:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[selectedTicket.status]}`}>
                            {selectedTicket.status === 'pending' && '⏳ Pendiente'}
                            {selectedTicket.status === 'in_review' && '🔍 En Revisión'}
                            {selectedTicket.status === 'resolved' && '✅ Resuelto'}
                            {selectedTicket.status === 'rejected' && '❌ Rechazado'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Detalles del Ticket */}
                    <div>
                      <h3 className="text-white font-medium mb-3">Detalles del Ticket</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-dark-300 text-sm mb-1">Título</label>
                          <p className="text-white">{selectedTicket.title}</p>
                        </div>
                        <div>
                          <label className="block text-dark-300 text-sm mb-1">Descripción</label>
                          <p className="text-white leading-relaxed">{selectedTicket.description}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-dark-300 text-sm mb-1">Tipo</label>
                            <div className="flex items-center gap-2">
                              {(() => {
                                const IconComponent = claimTypeIcons[selectedTicket.claim_type]
                                return IconComponent ? <IconComponent className="w-4 h-4 text-dark-400" /> : null
                              })()}
                              <span className="text-white">{claimTypeLabels[selectedTicket.claim_type]}</span>
                            </div>
                          </div>
                          <div>
                            <label className="block text-dark-300 text-sm mb-1">Prioridad</label>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[selectedTicket.priority]}`}>
                              {selectedTicket.priority === 'low' && '🟢 Baja'}
                              {selectedTicket.priority === 'medium' && '🟡 Media'}
                              {selectedTicket.priority === 'high' && '🟠 Alta'}
                              {selectedTicket.priority === 'urgent' && '🔴 Urgente'}
                            </span>
                          </div>
                        </div>
                        
                        {/* Información del Producto */}
                        {selectedTicket.product_name && (
                          <div>
                            <label className="block text-dark-300 text-sm mb-1">Producto Relacionado</label>
                            <div className="bg-dark-700/30 rounded-lg p-3">
                              <p className="text-white font-medium">{selectedTicket.product_name}</p>
                              {selectedTicket.product_sku && (
                                <p className="text-white/70 text-sm">SKU: {selectedTicket.product_sku}</p>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Información del Pedido */}
                        {selectedTicket.order_number && (
                          <div>
                            <label className="block text-dark-300 text-sm mb-1">Pedido Relacionado</label>
                            <div className="bg-dark-700/30 rounded-lg p-3">
                              <p className="text-white font-medium">Pedido #{selectedTicket.order_number}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Respuesta del Admin */}
                    {selectedTicket.admin_response && (
                      <div>
                        <h3 className="text-white font-medium mb-3">Respuesta del Administrador</h3>
                        <div className="bg-neon-green/10 border border-neon-green/20 rounded-lg p-4">
                          <p className="text-white leading-relaxed">{selectedTicket.admin_response}</p>
                          {selectedTicket.resolved_by_name && (
                            <p className="text-neon-green text-sm mt-2">
                              Respondido por: {selectedTicket.resolved_by_name}
                            </p>
                          )}
                          {selectedTicket.resolved_at && (
                            <p className="text-neon-green text-sm">
                              Fecha: {formatDate(selectedTicket.resolved_at)}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Sin respuesta aún */}
                    {!selectedTicket.admin_response && selectedTicket.status !== 'resolved' && (
                      <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-yellow-400" />
                          <p className="text-yellow-400 font-medium">En proceso</p>
                        </div>
                        <p className="text-yellow-300 text-sm mt-1">
                          Tu ticket está siendo revisado por nuestro equipo de soporte.
                        </p>
                      </div>
                    )}

                    {/* Botón Cerrar */}
                    <div className="pt-4">
                      <button
                        onClick={() => setShowModal(false)}
                        className="w-full border border-dark-600 text-white py-3 rounded-lg font-semibold hover:bg-dark-700 transition-colors"
                      >
                        Cerrar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
