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

export default function ClaimsManagementPage() {
  const { claims, loading, error, updateClaim, deleteClaim } = useClaims()
  

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<ClaimStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<ClaimType | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all')
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [adminResponse, setAdminResponse] = useState('')
  // const [newMessage, setNewMessage] = useState('')  // Temporalmente comentado
  // const [isAddingMessage, setIsAddingMessage] = useState(false)  // Temporalmente comentado
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
        console.error('Error updating claim status:', error)
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

  const handleDeleteClaim = async (claimId: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar este ticket? Esta acción no se puede deshacer.')) {
      setLoadingActions(prev => new Set(prev).add(claimId))
      try {
        await deleteClaim(claimId)
        toast.success('Ticket eliminado correctamente')
      } catch (error) {
        console.error('Error deleting claim:', error)
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
      console.error('Error updating claim:', error)
      toast.error('Error al actualizar el ticket')
    }
  }

  // const handleAddMessage = async () => {
  //   if (!selectedClaim || !newMessage.trim()) return

  //   try {
  //     setIsAddingMessage(true)
  //     await addMessage(selectedClaim.id, newMessage.trim())
  //     setNewMessage('')
  //     toast.success('Mensaje agregado correctamente')
  //   } catch (error) {
  //     toast.error('Error al agregar mensaje')
  //   } finally {
  //     setIsAddingMessage(false)
  //   }
  // }

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-green"></div>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestión de Tickets</h1>
          <p className="text-dark-400 mt-2">Administra y resuelve tickets de clientes</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{claims.length}</div>
          <div className="text-dark-400 text-sm">Total Tickets</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          </select>

          {/* Filtro por Prioridad */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as Priority | 'all')}
            className="px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
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
      <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-700">
              <tr>
                <th className="px-6 py-4 text-left text-white font-medium">ID</th>
                <th className="px-6 py-4 text-left text-white font-medium">Usuario</th>
                <th className="px-6 py-4 text-left text-white font-medium">Título</th>
                <th className="px-6 py-4 text-left text-white font-medium">Pedido</th>
                <th className="px-6 py-4 text-left text-white font-medium">Producto</th>
                <th className="px-6 py-4 text-left text-white font-medium">Tipo</th>
                <th className="px-6 py-4 text-left text-white font-medium">Prioridad</th>
                <th className="px-6 py-4 text-left text-white font-medium">Estado</th>
                <th className="px-6 py-4 text-left text-white font-medium">Fecha</th>
                <th className="px-6 py-4 text-left text-white font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {filteredClaims.map((claim) => {
                const TypeIcon = claimTypeIcons[claim.claim_type]
                return (
                  <tr key={claim.id} className="hover:bg-dark-700/50 transition-colors">
                    <td className="px-6 py-4 text-white font-mono">#{claim.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-dark-400" />
                        <span className="text-white">{claim.user_name || claim.user_email || 'Usuario'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="text-white font-medium truncate">{claim.title}</p>
                        <p className="text-dark-400 text-sm truncate">{claim.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {claim.order_number ? (
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-dark-400" />
                          <span className="text-white font-mono text-sm">#{claim.order_number}</span>
                        </div>
                      ) : (
                        <span className="text-dark-400 text-sm">Sin pedido</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {claim.product_name ? (
                        <div className="max-w-xs">
                          <p className="text-white text-sm font-medium truncate">{claim.product_name}</p>
                          {claim.product_sku && (
                            <p className="text-dark-400 text-xs truncate">SKU: {claim.product_sku}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-dark-400 text-sm">Sin producto</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <TypeIcon className="w-4 h-4 text-dark-400" />
                        <span className="text-white">{claimTypeLabels[claim.claim_type]}</span>
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
                        <Calendar className="w-4 h-4 text-dark-400" />
                        <span className="text-white text-sm">{formatDate(claim.created_at)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleViewClaim(claim)}
                          className="p-2 text-dark-400 hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-900/20"
                          title="Ver detalles del ticket"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {claim.status !== 'resolved' && (
                          <button
                            onClick={() => handleStatusUpdate(claim.id, 'resolved')}
                            disabled={loadingActions.has(claim.id)}
                            className="p-2 text-dark-400 hover:text-green-400 transition-colors rounded-lg hover:bg-green-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Marcar como resuelto"
                          >
                            {loadingActions.has(claim.id) ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400"></div>
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        
                        {claim.status !== 'rejected' && (
                          <button
                            onClick={() => handleStatusUpdate(claim.id, 'rejected')}
                            disabled={loadingActions.has(claim.id)}
                            className="p-2 text-dark-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Rechazar ticket"
                          >
                            {loadingActions.has(claim.id) ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        
                        {claim.status === 'pending' && (
                          <button
                            onClick={() => handleStatusUpdate(claim.id, 'in_review')}
                            disabled={loadingActions.has(claim.id)}
                            className="p-2 text-dark-400 hover:text-yellow-400 transition-colors rounded-lg hover:bg-yellow-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Marcar como en revisión"
                          >
                            {loadingActions.has(claim.id) ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400"></div>
                            ) : (
                              <Clock className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDeleteClaim(claim.id)}
                          disabled={loadingActions.has(claim.id)}
                          className="p-2 text-dark-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <AlertTriangle className="w-12 h-12 text-dark-400 mx-auto mb-4" />
            <p className="text-dark-400">No se encontraron tickets</p>
            <div className="mt-4 text-sm text-dark-500">
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

      {/* Modal de Detalles */}
      {showModal && selectedClaim && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-dark-800 border border-dark-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Detalles del Ticket #{selectedClaim.id}</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-dark-400 hover:text-white transition-colors"
                  title="Cerrar modal"
                  aria-label="Cerrar modal de detalles del reclamo"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Información del Usuario */}
                <div className="bg-dark-700/50 rounded-lg p-4">
                  <h3 className="text-white font-medium mb-3">Información del Usuario</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-dark-400" />
                      <span className="text-dark-300">Usuario:</span>
                      <span className="text-white">{selectedClaim.user_name || selectedClaim.user_email || 'Usuario'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-dark-400" />
                      <span className="text-dark-300">Fecha:</span>
                      <span className="text-white">{formatDate(selectedClaim.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Detalles del Ticket */}
                <div>
                  <h3 className="text-white font-medium mb-3">Detalles del Ticket</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-dark-300 text-sm mb-1">Título</label>
                      <p className="text-white">{selectedClaim.title}</p>
                    </div>
                    <div>
                      <label className="block text-dark-300 text-sm mb-1">Descripción</label>
                      <p className="text-white leading-relaxed">{selectedClaim.description}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-dark-300 text-sm mb-1">Tipo</label>
                        <div className="flex items-center gap-2">
                          {(() => {
                            const IconComponent = claimTypeIcons[selectedClaim.claim_type]
                            return IconComponent ? <IconComponent className="w-4 h-4 text-dark-400" /> : null
                          })()}
                          <span className="text-white">{claimTypeLabels[selectedClaim.claim_type]}</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-dark-300 text-sm mb-1">Prioridad</label>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[selectedClaim.priority]}`}>
                          {selectedClaim.priority}
                        </span>
                      </div>
                      <div>
                        <label className="block text-dark-300 text-sm mb-1">Estado</label>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[selectedClaim.status]}`}>
                          {selectedClaim.status}
                        </span>
                      </div>
                    </div>
                    
                    {/* Información del Pedido */}
                    {selectedClaim.order_number && (
                      <div>
                        <label className="block text-dark-300 text-sm mb-1">Pedido Relacionado</label>
                        <div className="bg-dark-700/30 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-dark-400" />
                            <span className="text-white font-medium">Pedido #{selectedClaim.order_number}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Información del Producto */}
                    {selectedClaim.product_name && (
                      <div>
                        <label className="block text-dark-300 text-sm mb-1">Producto Relacionado</label>
                        <div className="bg-dark-700/30 rounded-lg p-3">
                          <p className="text-white font-medium">{selectedClaim.product_name}</p>
                          {selectedClaim.product_sku && (
                            <p className="text-white/70 text-sm">SKU: {selectedClaim.product_sku}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mensajes del Reclamo - Temporalmente comentado */}
                {/* <div>
                  <h3 className="text-white font-medium mb-3">Mensajes del Reclamo</h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {selectedClaim.messages && selectedClaim.messages.length > 0 ? (
                      selectedClaim.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`p-3 rounded-lg ${
                            message.message_type === 'admin_response'
                              ? 'bg-neon-green/10 border border-neon-green/20'
                              : 'bg-dark-700/50 border border-dark-600'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-white">
                              {message.author_name}
                            </span>
                            <span className="text-xs text-dark-400">
                              {formatDate(message.created_at)}
                            </span>
                          </div>
                          <p className="text-dark-300 text-sm">{message.content}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-dark-400 text-sm">No hay mensajes aún</p>
                    )}
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-white font-medium mb-2">Agregar Mensaje</label>
                    <div className="flex gap-2">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        rows={3}
                        className="flex-1 px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent resize-none"
                        placeholder="Escribe tu mensaje aquí..."
                      />
                      <button
                        onClick={handleAddMessage}
                        disabled={!newMessage.trim() || isAddingMessage}
                        className="px-4 py-3 bg-neon-green text-dark-900 rounded-lg font-semibold hover:bg-neon-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isAddingMessage ? 'Enviando...' : 'Enviar'}
                      </button>
                    </div>
                  </div>
                </div> */}

                {/* Respuesta del Admin */}
                <div>
                  <label className="block text-white font-medium mb-2">Respuesta del Administrador</label>
                  <textarea
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent resize-none"
                    placeholder="Escribe tu respuesta aquí..."
                  />
                </div>

                {/* Cambiar Estado */}
                <div>
                  <label className="block text-white font-medium mb-2">Cambiar Estado</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as ClaimStatus)}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
                    aria-label="Cambiar estado del reclamo"
                  >
                    <option value="pending">Pendiente</option>
                    <option value="in_review">En Revisión</option>
                    <option value="resolved">Resuelto</option>
                    <option value="rejected">Rechazado</option>
                  </select>
                </div>

                {/* Botones */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleUpdateClaim}
                    className="flex-1 bg-neon-green text-dark-900 py-3 rounded-lg font-semibold hover:bg-neon-green/90 transition-colors"
                  >
                    Actualizar Ticket
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 border border-dark-600 text-white py-3 rounded-lg font-semibold hover:bg-dark-700 transition-colors"
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
  )
}
