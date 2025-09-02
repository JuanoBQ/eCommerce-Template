"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { ShoppingBag, Eye, Package, Truck, CheckCircle, XCircle, Clock } from 'lucide-react'

// Mock data - En producción esto vendría de la API
const mockOrders = [
  {
    id: 1,
    order_number: 'ORD-2024-001',
    status: 'delivered',
    total_amount: 89.99,
    created_at: '2024-01-15T10:30:00Z',
    items_count: 3,
    items: [
      { id: 1, name: 'Tank Top Essential', quantity: 1, price: 29.99 },
      { id: 2, name: 'Leggings Power', quantity: 1, price: 39.99 },
      { id: 3, name: 'Hoodie Training', quantity: 1, price: 20.01 }
    ]
  },
  {
    id: 2,
    order_number: 'ORD-2024-002',
    status: 'shipped',
    total_amount: 59.99,
    created_at: '2024-01-10T14:20:00Z',
    items_count: 2,
    items: [
      { id: 4, name: 'Sports Bra Elite', quantity: 1, price: 39.99 },
      { id: 5, name: 'Leggings Power', quantity: 1, price: 20.00 }
    ]
  },
  {
    id: 3,
    order_number: 'ORD-2024-003',
    status: 'processing',
    total_amount: 149.99,
    created_at: '2024-01-05T09:15:00Z',
    items_count: 4,
    items: [
      { id: 6, name: 'Tank Top Essential', quantity: 2, price: 59.98 },
      { id: 7, name: 'Sports Bra Elite', quantity: 1, price: 39.99 },
      { id: 8, name: 'Hoodie Training', quantity: 1, price: 50.02 }
    ]
  }
]

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Clock className="w-5 h-5 text-yellow-400" />
    case 'processing':
      return <Package className="w-5 h-5 text-blue-400" />
    case 'shipped':
      return <Truck className="w-5 h-5 text-purple-400" />
    case 'delivered':
      return <CheckCircle className="w-5 h-5 text-green-400" />
    case 'cancelled':
      return <XCircle className="w-5 h-5 text-red-400" />
    default:
      return <Clock className="w-5 h-5 text-gray-400" />
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Pendiente'
    case 'processing':
      return 'Procesando'
    case 'shipped':
      return 'Enviado'
    case 'delivered':
      return 'Entregado'
    case 'cancelled':
      return 'Cancelado'
    default:
      return 'Desconocido'
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'text-yellow-400'
    case 'processing':
      return 'text-blue-400'
    case 'shipped':
      return 'text-purple-400'
    case 'delivered':
      return 'text-green-400'
    case 'cancelled':
      return 'text-red-400'
    default:
      return 'text-gray-400'
  }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState(mockOrders)
  const [activeTab, setActiveTab] = useState('all')

  const filteredOrders = activeTab === 'all'
    ? orders
    : orders.filter(order => order.status === activeTab)

  const tabs = [
    { id: 'all', label: 'Todos', count: orders.length },
    { id: 'pending', label: 'Pendientes', count: orders.filter(o => o.status === 'pending').length },
    { id: 'processing', label: 'Procesando', count: orders.filter(o => o.status === 'processing').length },
    { id: 'shipped', label: 'Enviados', count: orders.filter(o => o.status === 'shipped').length },
    { id: 'delivered', label: 'Entregados', count: orders.filter(o => o.status === 'delivered').length }
  ]

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-dark-900 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-display font-black mb-4">
              <span className="text-white">MIS</span>
              <span className="block text-gradient">PEDIDOS</span>
            </h1>
            <p className="text-xl text-white/70">
              Historial de tus compras y seguimiento de pedidos
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-dark-800/50 backdrop-blur-md rounded-2xl p-6 border border-dark-700/50 text-center">
              <div className="text-3xl font-bold text-neon-green mb-2">
                {orders.length}
              </div>
              <div className="text-white/70">Total Pedidos</div>
            </div>
            <div className="bg-dark-800/50 backdrop-blur-md rounded-2xl p-6 border border-dark-700/50 text-center">
              <div className="text-3xl font-bold text-neon-blue mb-2">
                {orders.filter(o => o.status === 'delivered').length}
              </div>
              <div className="text-white/70">Entregados</div>
            </div>
            <div className="bg-dark-800/50 backdrop-blur-md rounded-2xl p-6 border border-dark-700/50 text-center">
              <div className="text-3xl font-bold text-neon-purple mb-2">
                {orders.filter(o => ['pending', 'processing', 'shipped'].includes(o.status)).length}
              </div>
              <div className="text-white/70">En Progreso</div>
            </div>
            <div className="bg-dark-800/50 backdrop-blur-md rounded-2xl p-6 border border-dark-700/50 text-center">
              <div className="text-3xl font-bold text-white mb-2">
                ${orders.reduce((total, order) => total + order.total_amount, 0).toFixed(2)}
              </div>
              <div className="text-white/70">Total Gastado</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-neon-green text-dark-900'
                      : 'bg-dark-800/50 text-white hover:bg-dark-700/50'
                  }`}
                >
                  {tab.label}
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    activeTab === tab.id
                      ? 'bg-dark-900/20 text-dark-900'
                      : 'bg-dark-700/50 text-white/70'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Orders List */}
          <div className="space-y-6">
            {filteredOrders.length === 0 ? (
              <div className="bg-dark-800/50 backdrop-blur-md rounded-2xl p-12 border border-dark-700/50 text-center">
                <ShoppingBag className="w-16 h-16 text-white/30 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  No tienes pedidos {activeTab !== 'all' ? `en ${getStatusText(activeTab).toLowerCase()}` : 'aún'}
                </h3>
                <p className="text-white/70 mb-6">
                  {activeTab === 'all'
                    ? 'Tu historial de pedidos aparecerá aquí'
                    : `No tienes pedidos ${getStatusText(activeTab).toLowerCase()}`
                  }
                </p>
                <Link
                  href="/shop"
                  className="btn-primary inline-flex items-center"
                >
                  Empezar a Comprar
                </Link>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-dark-800/50 backdrop-blur-md rounded-2xl p-6 border border-dark-700/50 hover:border-neon-green/30 transition-all duration-200"
                >
                  {/* Order Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(order.status)}
                        <span className={`font-medium ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      <span className="text-white/50">•</span>
                      <span className="text-white/70">
                        {new Date(order.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-white">
                        ${order.total_amount.toFixed(2)}
                      </div>
                      <div className="text-sm text-white/50">
                        {order.items_count} producto{order.items_count !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-3 mb-6">
                    {order.items.slice(0, 2).map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-2 border-b border-dark-700/30 last:border-b-0">
                        <div className="flex-1">
                          <span className="text-white font-medium">{item.name}</span>
                          <span className="text-white/50 ml-2">x{item.quantity}</span>
                        </div>
                        <span className="text-white/70">${item.price.toFixed(2)}</span>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <div className="text-sm text-white/50 text-center py-2">
                        +{order.items.length - 2} producto{order.items.length - 2 !== 1 ? 's' : ''} más
                      </div>
                    )}
                  </div>

                  {/* Order Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-dark-700/30">
                    <div className="text-sm text-white/50">
                      Pedido #{order.order_number}
                    </div>
                    <div className="flex space-x-3">
                      <Link
                        href={`/account/orders/${order.id}`}
                        className="btn-secondary flex items-center text-sm"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Detalles
                      </Link>
                      {order.status === 'delivered' && (
                        <button className="btn-outline text-sm">
                          Reordenar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
