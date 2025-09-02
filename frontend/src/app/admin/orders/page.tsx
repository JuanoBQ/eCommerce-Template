"use client"

import { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  Eye,
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  DollarSign,
  Package,
  User
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Order {
  id: number
  orderNumber: string
  customer: {
    id: number
    name: string
    email: string
  }
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total: number
  items: number
  createdAt: string
  updatedAt: string
  shippingAddress: string
  paymentMethod: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setIsLoading(true)
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockOrders: Order[] = [
        {
          id: 1,
          orderNumber: 'ORD-2024-001',
          customer: {
            id: 2,
            name: 'Juan Pérez',
            email: 'juan@example.com'
          },
          status: 'delivered',
          total: 89.99,
          items: 2,
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-16T14:20:00Z',
          shippingAddress: 'Calle 123, Ciudad, País',
          paymentMethod: 'Tarjeta de Crédito'
        },
        {
          id: 2,
          orderNumber: 'ORD-2024-002',
          customer: {
            id: 3,
            name: 'María García',
            email: 'maria@example.com'
          },
          status: 'shipped',
          total: 156.50,
          items: 3,
          createdAt: '2024-01-14T15:45:00Z',
          updatedAt: '2024-01-15T09:15:00Z',
          shippingAddress: 'Avenida 456, Ciudad, País',
          paymentMethod: 'PayPal'
        },
        {
          id: 3,
          orderNumber: 'ORD-2024-003',
          customer: {
            id: 4,
            name: 'Carlos López',
            email: 'carlos@example.com'
          },
          status: 'processing',
          total: 45.99,
          items: 1,
          createdAt: '2024-01-13T12:20:00Z',
          updatedAt: '2024-01-13T12:20:00Z',
          shippingAddress: 'Plaza 789, Ciudad, País',
          paymentMethod: 'Transferencia Bancaria'
        },
        {
          id: 4,
          orderNumber: 'ORD-2024-004',
          customer: {
            id: 5,
            name: 'Ana Martínez',
            email: 'ana@example.com'
          },
          status: 'pending',
          total: 234.75,
          items: 4,
          createdAt: '2024-01-12T08:10:00Z',
          updatedAt: '2024-01-12T08:10:00Z',
          shippingAddress: 'Carrera 321, Ciudad, País',
          paymentMethod: 'Tarjeta de Débito'
        },
        {
          id: 5,
          orderNumber: 'ORD-2024-005',
          customer: {
            id: 6,
            name: 'Luis Rodríguez',
            email: 'luis@example.com'
          },
          status: 'cancelled',
          total: 78.50,
          items: 2,
          createdAt: '2024-01-11T16:30:00Z',
          updatedAt: '2024-01-11T18:45:00Z',
          shippingAddress: 'Calle 654, Ciudad, País',
          paymentMethod: 'Tarjeta de Crédito'
        }
      ]
      
      setOrders(mockOrders)
    } catch (error) {
      toast.error('Error al cargar pedidos')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus as any, updatedAt: new Date().toISOString() } : order
      ))
      toast.success('Estado del pedido actualizado')
    } catch (error) {
      toast.error('Error al actualizar pedido')
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    
    const matchesDate = dateFilter === 'all' || 
      (dateFilter === 'today' && new Date(order.createdAt).toDateString() === new Date().toDateString()) ||
      (dateFilter === 'week' && new Date(order.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
      (dateFilter === 'month' && new Date(order.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
    
    return matchesSearch && matchesStatus && matchesDate
  })

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      processing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      shipped: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      delivered: 'bg-green-500/20 text-green-400 border-green-500/30',
      cancelled: 'bg-red-500/20 text-red-400 border-red-500/30'
    }
    
    const labels = {
      pending: 'Pendiente',
      processing: 'Procesando',
      shipped: 'Enviado',
      delivered: 'Entregado',
      cancelled: 'Cancelado'
    }
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: Clock,
      processing: Package,
      shipped: Truck,
      delivered: CheckCircle,
      cancelled: XCircle
    }
    
    const Icon = icons[status as keyof typeof icons]
    return <Icon className="w-4 h-4" />
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-green"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Pedidos</h1>
          <p className="text-dark-400 mt-2">Gestiona todos los pedidos de tu tienda</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-400 text-sm font-medium">Total Pedidos</p>
              <p className="text-2xl font-bold text-white mt-2">{orders.length}</p>
            </div>
            <ShoppingCart className="w-8 h-8 text-neon-green" />
          </div>
        </div>
        
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-400 text-sm font-medium">Pendientes</p>
              <p className="text-2xl font-bold text-white mt-2">
                {orders.filter(o => o.status === 'pending').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
        
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-400 text-sm font-medium">Procesando</p>
              <p className="text-2xl font-bold text-white mt-2">
                {orders.filter(o => o.status === 'processing').length}
              </p>
            </div>
            <Package className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-400 text-sm font-medium">Enviados</p>
              <p className="text-2xl font-bold text-white mt-2">
                {orders.filter(o => o.status === 'shipped').length}
              </p>
            </div>
            <Truck className="w-8 h-8 text-purple-400" />
          </div>
        </div>
        
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-400 text-sm font-medium">Entregados</p>
              <p className="text-2xl font-bold text-white mt-2">
                {orders.filter(o => o.status === 'delivered').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-400" />
              <input
                type="text"
                placeholder="Buscar pedidos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
            title="Filtrar por estado"
            aria-label="Filtrar pedidos por estado"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="processing">Procesando</option>
            <option value="shipped">Enviado</option>
            <option value="delivered">Entregado</option>
            <option value="cancelled">Cancelado</option>
          </select>
          
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
            title="Filtrar por fecha"
            aria-label="Filtrar pedidos por fecha"
          >
            <option value="all">Todas las fechas</option>
            <option value="today">Hoy</option>
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                  Pedido
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-dark-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-dark-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-white">
                        {order.orderNumber}
                      </div>
                      <div className="text-sm text-dark-400">
                        {order.items} {order.items === 1 ? 'artículo' : 'artículos'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-dark-600 rounded-full flex items-center justify-center mr-3">
                        <User className="w-4 h-4 text-dark-400" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">
                          {order.customer.name}
                        </div>
                        <div className="text-sm text-dark-400">
                          {order.customer.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {getStatusIcon(order.status)}
                      <span className="ml-2">
                        {getStatusBadge(order.status)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-white">
                      ${order.total.toFixed(2)}
                    </div>
                    <div className="text-sm text-dark-400">
                      {order.paymentMethod}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-dark-400">
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => window.open(`/admin/orders/${order.id}`, '_blank')}
                        className="p-2 text-dark-400 hover:text-white transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {order.status === 'pending' && (
                        <select
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="px-2 py-1 bg-dark-700 border border-dark-600 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-neon-green"
                          title="Cambiar estado del pedido"
                          aria-label={`Cambiar estado del pedido ${order.orderNumber}`}
                        >
                          <option value="">Cambiar estado</option>
                          <option value="processing">Procesar</option>
                          <option value="cancelled">Cancelar</option>
                        </select>
                      )}
                      
                      {order.status === 'processing' && (
                        <select
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="px-2 py-1 bg-dark-700 border border-dark-600 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-neon-green"
                          title="Cambiar estado del pedido"
                          aria-label={`Cambiar estado del pedido ${order.orderNumber}`}
                        >
                          <option value="">Cambiar estado</option>
                          <option value="shipped">Enviar</option>
                          <option value="cancelled">Cancelar</option>
                        </select>
                      )}
                      
                      {order.status === 'shipped' && (
                        <select
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="px-2 py-1 bg-dark-700 border border-dark-600 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-neon-green"
                          title="Cambiar estado del pedido"
                          aria-label={`Cambiar estado del pedido ${order.orderNumber}`}
                        >
                          <option value="">Cambiar estado</option>
                          <option value="delivered">Marcar como entregado</option>
                        </select>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <ShoppingCart className="w-12 h-12 text-dark-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No se encontraron pedidos</h3>
            <p className="text-dark-400">Intenta ajustar los filtros de búsqueda</p>
          </div>
        )}
      </div>
    </div>
  )
}
