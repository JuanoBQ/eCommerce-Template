"use client"

import {
  TrendingUp,
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  Eye,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  RefreshCw
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { useDashboard } from '@/hooks/useDashboard'
import { formatPrice } from '@/utils/currency'
import Link from 'next/link'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function AdminDashboard() {
  const {
    stats,
    recentActivity,
    categoryData,
    revenueData,
    isLoading,
    error,
    lastUpdated,
    refreshData
  } = useDashboard()

  const COLORS = ['#00ff88', '#00d4aa', '#00b4d8', '#7209b7']

  const StatCard = ({
    title,
    value,
    growth,
    icon: Icon,
    color = 'primary-500',
    subtitle
  }: {
    title: string
    value: number
    growth: number
    icon: any
    color?: string
    subtitle?: string
  }) => (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:border-primary-500/30 transition-colors shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {title === 'Ingresos Totales'
              ? formatPrice(value)
              : typeof value === 'number' && value > 1000
                ? `${(value / 1000).toFixed(1)}K`
                : (typeof value === 'number' ? value.toLocaleString() : value)}
          </p>
          {subtitle && (
            <p className="text-gray-500 text-xs mt-1">{subtitle}</p>
          )}
          <div className="flex items-center mt-2">
            {growth > 0 ? (
              <ArrowUpRight className="w-4 h-4 text-primary-600 mr-1" />
            ) : growth < 0 ? (
              <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
            ) : null}
            {growth !== 0 && (
              <>
                <span className={`text-sm font-medium ${growth > 0 ? 'text-primary-600' : 'text-red-500'}`}>
                  {Math.abs(growth)}%
                </span>
                <span className="text-gray-500 text-sm ml-1">vs período anterior</span>
              </>
            )}
            {growth === 0 && (
              <span className="text-gray-500 text-sm">Sin cambios</span>
            )}
          </div>
        </div>
        <div className={`p-3 rounded-lg bg-${color}/10`}>
          <Icon className={`w-6 h-6 text-${color}`} />
        </div>
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 space-y-6 p-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-gray-200 rounded animate-pulse w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-64"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-32"></div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:border-primary-500/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-16"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
                </div>
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart Skeleton */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-6 bg-gray-200 rounded animate-pulse w-32"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
              </div>
              <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Category Chart Skeleton */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-6 bg-gray-200 rounded animate-pulse w-32"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
              </div>
              <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Recent Activity Skeleton */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-40"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
            </div>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 border border-gray-100 rounded-lg">
                  <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Loading Indicator */}
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-3 text-gray-500">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
            <span className="text-sm">Cargando datos del dashboard...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={refreshData}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Bienvenido al panel de administración</p>
          {lastUpdated && (
            <p className="text-sm text-gray-500 mt-1">
              Última actualización: {lastUpdated.toLocaleTimeString('es-ES')}
            </p>
          )}
        </div>
        <button
          onClick={refreshData}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Ingresos Totales"
          value={stats.totalRevenue}
          growth={stats.revenueGrowth}
          icon={DollarSign}
          color="primary-500"
          subtitle="Ingresos acumulados"
        />
        <StatCard
          title="Pedidos"
          value={stats.totalOrders}
          growth={stats.ordersGrowth}
          icon={ShoppingCart}
          color="blue-500"
          subtitle="Total de pedidos"
        />
        <StatCard
          title="Productos"
          value={stats.totalProducts}
          growth={stats.productsGrowth}
          icon={Package}
          color="purple-500"
          subtitle="Productos publicados"
        />
        <StatCard
          title="Usuarios"
          value={stats.totalUsers}
          growth={stats.usersGrowth}
          icon={Users}
          color="pink-500"
          subtitle="Usuarios registrados"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Ingresos Mensuales</h3>
            <div className="flex items-center text-primary-500">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">
                {stats.revenueGrowth > 0 ? '+' : ''}{stats.revenueGrowth}%
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  color: '#1F2937'
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#0ea5e9"
                strokeWidth={3}
                dot={{ fill: '#0ea5e9', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Chart */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Pedidos Mensuales</h3>
            <div className="flex items-center text-blue-500">
              <ShoppingCart className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">
                {stats.ordersGrowth > 0 ? '+' : ''}{stats.ordersGrowth}%
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  color: '#1F2937'
                }}
              />
              <Bar dataKey="orders" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Category Distribution */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Distribución por Categorías</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  color: '#1F2937'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {categoryData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-gray-600 text-sm">{item.name}</span>
                </div>
                <span className="text-gray-900 font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Actividad Reciente</h3>
            <button
              onClick={refreshData}
              className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Actualizar datos"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-3 ${
                      activity.type === 'order' ? 'bg-primary-500' :
                      activity.type === 'product' ? 'bg-blue-500' :
                      activity.type === 'user' ? 'bg-purple-500' : 'bg-pink-500'
                    }`} />
                    <div>
                      <p className="text-gray-900 text-sm font-medium">{activity.action}</p>
                      <p className="text-gray-500 text-xs">{activity.user} • {activity.time}</p>
                    </div>
                  </div>
                  {activity.amount && (
                    <span className="text-primary-500 text-sm font-medium">{activity.amount}</span>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No hay actividad reciente</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Acciones Rápidas</h3>
          <div className="space-y-3">
            {[
              { label: 'Agregar Producto', icon: Package, href: '/admin/products/new' },
              { label: 'Ver Pedidos', icon: ShoppingCart, href: '/admin/orders' },
              { label: 'Gestionar Categorías', icon: BarChart3, href: '/admin/categories' },
              { label: 'Ver Reportes', icon: BarChart3, href: '/admin/reports' },
            ].map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
              >
                <action.icon className="w-5 h-5 text-gray-500 group-hover:text-primary-500 mr-3" />
                <span className="text-gray-900 text-sm font-medium">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}