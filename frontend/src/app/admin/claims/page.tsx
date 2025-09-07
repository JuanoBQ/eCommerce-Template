"use client"

import React, { useState, useEffect } from 'react'
import {
  AlertTriangle,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  User,
  Calendar,
  Package,
  CreditCard,
  Truck,
  Wrench
} from 'lucide-react'
import { useClaims } from '@/hooks/useClaims'
import { Claim } from '@/hooks/useClaims'
import toast from 'react-hot-toast'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import TableSkeleton from '@/components/ui/TableSkeleton'

type ClaimStatus = 'pending' | 'in_review' | 'resolved' | 'rejected'
type ClaimType = 'product_issue' | 'shipping_issue' | 'payment_issue' | 'service_issue' | 'other'
type Priority = 'low' | 'medium' | 'high' | 'urgent'

const statusColors = {
  pending: 'bg-yellow-900/50 text-yellow-400',
  in_review: 'bg-blue-900/50 text-blue-400',
  resolved: 'bg-primary-900/50 text-primary-400',
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

export default function ClaimsManagementPage() {
  const { claims, loading, error, updateClaim, deleteClaim } = useClaims()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<ClaimStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<ClaimType | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all')
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [adminResponse, setAdminResponse] = useState('')
  const [newStatus, setNewStatus] = useState<ClaimStatus>('pending')
  const [loadingActions, setLoadingActions] = useState<Set<number>>(new Set())

  // Filtrar reclamos
  const filteredClaims = claims.filter(claim => {
    const matchesSearch = claim.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.user_email?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || claim.status === statusFilter
    const matchesType = typeFilter === 'all' || claim.claim_type === typeFilter
    const matchesPriority = priorityFilter === 'all' || claim.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesType && matchesPriority
  })

  const handleStatusUpdate = async (claimId: number, status: ClaimStatus) => {
    const statusMessages = {
      resolved: '¿Estás seguro de que deseas marcar este ticket como resuelto?',
      rejected: '¿Estás seguro de que deseas rechazar este ticket?',
      in_review: '¿Estás seguro de que deseas marcar este ticket como en revisión?',
      pending: '¿Estás seguro de que deseas marcar este ticket como pendiente?'
    }

    const successMessages = {
      resolved: 'Ticket marcado como resuelto correctamente',
      rejected: 'Ticket rechazado correctamente',
      in_review: 'Ticket marcado como en revisión correctamente',
      pending: 'Ticket marcado como pendiente correctamente'
    }

    if (confirm(statusMessages[status])) {
      setLoadingActions(prev => new Set(prev).add(claimId))
      try {
        await updateClaim(claimId, { status })
        toast.success(successMessages[status])
      } catch (error) {
        // Error updating claim status
        toast.error('Error al actualizar el estado del ticket')
      } finally {
        setLoadingActions(prev => {
          const newSet = new Set(prev)
          newSet.delete(claimId)
          return newSet
        })
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-gray-200 rounded animate-pulse w-32 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-48"></div>
          </div>
        </div>

        {/* Search and Filters Skeleton */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Claims Table Skeleton */}
        <TableSkeleton rows={10} columns={6} showHeader={true} />
      </div>
    )
  }

  const handleDeleteClaim = async (claimId: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar este ticket? Esta acción no se puede deshacer.')) {
      setLoadingActions(prev => new Set(prev).add(claimId))
      try {
        await deleteClaim(claimId)
        toast.success('Ticket eliminado correctamente')
      } catch (error) {
        // Error deleting claim
        toast.error('Error al eliminar el ticket')
      } finally {
        setLoadingActions(prev => {
          const newSet = new Set(prev)
          newSet.delete(claimId)
          return newSet
        })
      }
    }
  }

  const handleViewClaim = (claim: Claim) => {
    setSelectedClaim(claim)
    setAdminResponse(claim.admin_response || '')
    setNewStatus(claim.status)
    setShowModal(true)
  }

  const handleUpdateClaim = async () => {
    if (!selectedClaim) return

    try {
      await updateClaim(selectedClaim.id, {
        status: newStatus,
        admin_response: adminResponse
      })
      toast.success('Ticket actualizado correctamente')
      setShowModal(false)
    } catch (error) {
      // Error updating claim
      toast.error('Error al actualizar el ticket')
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
        <p className="text-red-400">Error al cargar reclamos: {error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Tickets</h1>
          <p className="text-gray-600 mt-2">Administra y resuelve tickets de clientes</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{claims.length}</div>
          <div className="text-gray-600 text-sm">Total Tickets</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Filtro por Estado */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ClaimStatus | 'all')}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            aria-label="Filtrar por tipo"
          >
            <option value="all">Todos los Tipos</option>
            <option value="product_issue">Producto</option>
            <option value="shipping_issue">Envío</option>
            <option value="payment_issue">Pago</option>
            <option value="service_issue">Servicio</option>
          </select>

          {/* Filtro por Prioridad */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as Priority | 'all')}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            aria-label="Filtrar por prioridad"
          >
            <option value="all">Todas las Prioridades</option>
            <option value="low">Baja</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
            <option value="urgent">Urgente</option>
          </select>
        </div>
      </div>

      {/* Lista de Reclamos */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-gray-900 font-medium">ID</th>
                <th className="px-6 py-4 text-left text-gray-900 font-medium">Usuario</th>
                <th className="px-6 py-4 text-left text-gray-900 font-medium">Título</th>
                <th className="px-6 py-4 text-left text-gray-900 font-medium">Pedido</th>
                <th className="px-6 py-4 text-left text-gray-900 font-medium">Producto</th>
                <th className="px-6 py-4 text-left text-gray-900 font-medium">Tipo</th>
                <th className="px-6 py-4 text-left text-gray-900 font-medium">Prioridad</th>
                <th className="px-6 py-4 text-left text-gray-900 font-medium">Estado</th>
                <th className="px-6 py-4 text-left text-gray-900 font-medium">Fecha</th>
                <th className="px-6 py-4 text-left text-gray-900 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredClaims.map((claim) => {
                const TypeIcon = claimTypeIcons[claim.claim_type]
                return (
                  <tr key={claim.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-900 font-mono">#{claim.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-900">{claim.user_name || claim.user_email || 'Usuario'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="text-gray-900 font-medium truncate">{claim.title}</p>
                        <p className="text-gray-500 text-sm truncate">{claim.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {claim.order_number ? (
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-900 font-mono text-sm">#{claim.order_number}</span>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">Sin pedido</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {claim.product_name ? (
                        <div className="max-w-xs">
                          <p className="text-gray-900 text-sm font-medium truncate">{claim.product_name}</p>
                          {claim.product_sku && (
                            <p className="text-gray-500 text-xs truncate">SKU: {claim.product_sku}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">Sin producto</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <TypeIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-900">{claimTypeLabels[claim.claim_type]}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${priorityColors[claim.priority]}`}>
                        {claim.priority === 'low' && '🟢 Baja'}
                        {claim.priority === 'medium' && '🟡 Media'}
                        {claim.priority === 'high' && '🟠 Alta'}
                        {claim.priority === 'urgent' && '🔴 Urgente'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[claim.status]}`}>
                        {claim.status === 'pending' && '⏳ Pendiente'}
                        {claim.status === 'in_review' && '🔍 En Revisión'}
                        {claim.status === 'resolved' && '✅ Resuelto'}
                        {claim.status === 'rejected' && '❌ Rechazado'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-900 text-sm">{formatDate(claim.created_at)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleViewClaim(claim)}
                          className="p-2 text-gray-500 hover:text-blue-500 transition-colors rounded-lg hover:bg-blue-50"
                          title="Ver detalles del ticket"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {claim.status !== 'resolved' && (
                          <button
                            onClick={() => handleStatusUpdate(claim.id, 'resolved')}
                            disabled={loadingActions.has(claim.id)}
                            className="p-2 text-gray-500 hover:text-primary-600 transition-colors rounded-lg hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Marcar como resuelto"
                          >
                            {loadingActions.has(claim.id) ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </button>
                        )}

                        {claim.status !== 'rejected' && (
                          <button
                            onClick={() => handleStatusUpdate(claim.id, 'rejected')}
                            disabled={loadingActions.has(claim.id)}
                            className="p-2 text-gray-500 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Rechazar ticket"
                          >
                            {loadingActions.has(claim.id) ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                          </button>
                        )}

                        {claim.status === 'pending' && (
                          <button
                            onClick={() => handleStatusUpdate(claim.id, 'in_review')}
                            disabled={loadingActions.has(claim.id)}
                            className="p-2 text-gray-500 hover:text-yellow-500 transition-colors rounded-lg hover:bg-yellow-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Marcar como en revisión"
                          >
                            {loadingActions.has(claim.id) ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500"></div>
                            ) : (
                              <Clock className="w-4 h-4" />
                            )}
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteClaim(claim.id)}
                          disabled={loadingActions.has(claim.id)}
                          className="p-2 text-gray-500 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Eliminar ticket permanentemente"
                        >
                          {loadingActions.has(claim.id) ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredClaims.length === 0 && (
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No se encontraron tickets</p>
            <div className="mt-4 text-sm text-gray-400">
              <p>Debug info:</p>
              <p>Total claims: {claims?.length || 0}</p>
              <p>Filtered claims: {filteredClaims.length}</p>
              <p>Loading: {loading ? 'Yes' : 'No'}</p>
              <p>Error: {error || 'None'}</p>
              <p>Search term: "{searchTerm}"</p>
              <p>Status filter: {statusFilter}</p>
              <p>Type filter: {typeFilter}</p>
              <p>Priority filter: {priorityFilter}</p>
              {claims && claims.length > 0 && (
                <div className="mt-2">
                  <p>Sample claims:</p>
                  {claims.slice(0, 3).map(claim => (
                    <p key={claim.id} className="text-xs">- {claim.title} ({claim.status})</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Detalles del Ticket */}
      {showModal && selectedClaim && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Detalles del Ticket #{selectedClaim.id}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Cerrar modal"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Información del Ticket */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Información del Ticket</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">ID:</span>
                        <span className="text-gray-900 font-mono">#{selectedClaim.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Estado:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[selectedClaim.status]}`}>
                          {selectedClaim.status === 'pending' && '⏳ Pendiente'}
                          {selectedClaim.status === 'in_review' && '🔍 En Revisión'}
                          {selectedClaim.status === 'resolved' && '✅ Resuelto'}
                          {selectedClaim.status === 'rejected' && '❌ Rechazado'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Prioridad:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[selectedClaim.priority]}`}>
                          {selectedClaim.priority === 'low' && '🟢 Baja'}
                          {selectedClaim.priority === 'medium' && '🟡 Media'}
                          {selectedClaim.priority === 'high' && '🟠 Alta'}
                          {selectedClaim.priority === 'urgent' && '🔴 Urgente'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tipo:</span>
                        <div className="flex items-center gap-2">
                          {React.createElement(claimTypeIcons[selectedClaim.claim_type], { className: "w-4 h-4 text-gray-500" })}
                          <span className="text-gray-900">{claimTypeLabels[selectedClaim.claim_type]}</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fecha de creación:</span>
                        <span className="text-gray-900">{formatDate(selectedClaim.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Información del Usuario */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Información del Usuario</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nombre:</span>
                        <span className="text-gray-900">{selectedClaim.user_name || 'No especificado'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="text-gray-900">{selectedClaim.user_email || 'No especificado'}</span>
                      </div>
                      {selectedClaim.user_phone && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Teléfono:</span>
                          <span className="text-gray-900">{selectedClaim.user_phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Información del Pedido y Producto */}
                  {(selectedClaim.order_number || selectedClaim.product_name) && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Información Relacionada</h3>
                      <div className="space-y-2">
                        {selectedClaim.order_number && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Pedido:</span>
                            <span className="text-gray-900 font-mono">#{selectedClaim.order_number}</span>
                          </div>
                        )}
                        {selectedClaim.product_name && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Producto:</span>
                            <span className="text-gray-900">{selectedClaim.product_name}</span>
                          </div>
                        )}
                        {selectedClaim.product_sku && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">SKU:</span>
                            <span className="text-gray-900 font-mono">{selectedClaim.product_sku}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Formulario de Respuesta del Admin */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Respuesta del Administrador</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Estado del Ticket
                        </label>
                        <select
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value as ClaimStatus)}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          aria-label="Seleccionar estado del ticket"
                        >
                          <option value="pending">⏳ Pendiente</option>
                          <option value="in_review">🔍 En Revisión</option>
                          <option value="resolved">✅ Resuelto</option>
                          <option value="rejected">❌ Rechazado</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Respuesta del Administrador
                        </label>
                        <textarea
                          value={adminResponse}
                          onChange={(e) => setAdminResponse(e.target.value)}
                          placeholder="Escribe tu respuesta al cliente..."
                          rows={4}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Descripción del Ticket */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Descripción del Ticket</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">{selectedClaim.title}</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedClaim.description}</p>
                </div>
              </div>

              {/* Respuesta Anterior del Admin (si existe) */}
              {selectedClaim.admin_response && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Respuesta Anterior del Administrador</h3>
                  <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedClaim.admin_response}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Botones de Acción */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdateClaim}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Actualizar Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}