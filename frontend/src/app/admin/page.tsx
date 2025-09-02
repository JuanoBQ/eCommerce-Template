"use client"

import { useState, useEffect } from 'react'
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
  BarChart3
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  totalUsers: number
  revenueGrowth: number
  ordersGrowth: number
  productsGrowth: number
  usersGrowth: number
}

interface ChartData {
  name: string
  value: number
  revenue?: number
  orders?: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    revenueGrowth: 0,
    ordersGrowth: 0,
    productsGrowth: 0,
    usersGrowth: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  // Datos de ejemplo para los gráficos
  const revenueData: ChartData[] = [
    { name: 'Ene', value: 4000, revenue: 4000, orders: 24 },
    { name: 'Feb', value: 3000, revenue: 3000, orders: 13 },
    { name: 'Mar', value: 2000, revenue: 2000, orders: 98 },
    { name: 'Abr', value: 2780, revenue: 2780, orders: 39 },
    { name: 'May', value: 1890, revenue: 1890, orders: 48 },
    { name: 'Jun', value: 2390, revenue: 2390, orders: 38 },
    { name: 'Jul', value: 3490, revenue: 3490, orders: 43 },
  ]

  const categoryData: ChartData[] = [
    { name: 'Ropa Deportiva', value: 35 },
    { name: 'Accesorios', value: 25 },
    { name: 'Calzado', value: 20 },
    { name: 'Equipamiento', value: 20 },
  ]

  const COLORS = ['#00ff88', '#00d4aa', '#00b4d8', '#7209b7']

  useEffect(() => {
    // Simular carga de datos
    const loadDashboardData = async () => {
      try {
        // Aquí harías las llamadas a la API real
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        setStats({
          totalRevenue: 125430,
          totalOrders: 1247,
          totalProducts: 89,
          totalUsers: 2341,
          revenueGrowth: 12.5,
          ordersGrowth: 8.2,
          productsGrowth: 15.3,
          usersGrowth: 23.1
        })
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const StatCard = ({ 
    title, 
    value, 
    growth, 
    icon: Icon, 
    color = 'neon-green' 
  }: {
    title: string
    value: number
    growth: number
    icon: any
    color?: string
  }) => (
    <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 hover:border-neon-green/30 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-dark-400 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-white mt-2">
            {typeof value === 'number' && value > 1000 
              ? `$${(value / 1000).toFixed(1)}K` 
              : value.toLocaleString()}
          </p>
          <div className="flex items-center mt-2">
            {growth > 0 ? (
              <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm font-medium ${growth > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {Math.abs(growth)}%
            </span>
            <span className="text-dark-400 text-sm ml-1">vs mes anterior</span>
          </div>
        </div>
        <div className={`p-3 rounded-lg bg-${color}/20`}>
          <Icon className={`w-6 h-6 text-${color}`} />
        </div>
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-green"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-dark-400 mt-2">Bienvenido al panel de administración</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Ingresos Totales"
          value={stats.totalRevenue}
          growth={stats.revenueGrowth}
          icon={DollarSign}
          color="neon-green"
        />
        <StatCard
          title="Pedidos"
          value={stats.totalOrders}
          growth={stats.ordersGrowth}
          icon={ShoppingCart}
          color="neon-blue"
        />
        <StatCard
          title="Productos"
          value={stats.totalProducts}
          growth={stats.productsGrowth}
          icon={Package}
          color="neon-purple"
        />
        <StatCard
          title="Usuarios"
          value={stats.totalUsers}
          growth={stats.usersGrowth}
          icon={Users}
          color="neon-pink"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Ingresos Mensuales</h3>
            <div className="flex items-center text-neon-green">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">+12.5%</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#00ff88" 
                strokeWidth={3}
                dot={{ fill: '#00ff88', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Chart */}
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Pedidos Mensuales</h3>
            <div className="flex items-center text-neon-blue">
              <ShoppingCart className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">+8.2%</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }} 
              />
              <Bar dataKey="orders" fill="#00d4aa" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Category Distribution */}
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Distribución por Categorías</h3>
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
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
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
                  <span className="text-dark-300 text-sm">{item.name}</span>
                </div>
                <span className="text-white font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Actividad Reciente</h3>
          <div className="space-y-4">
            {[
              { action: 'Nuevo pedido', user: 'Juan Pérez', time: '2 min', amount: '$89.99' },
              { action: 'Producto actualizado', user: 'María García', time: '15 min', amount: 'Camiseta Nike' },
              { action: 'Usuario registrado', user: 'Carlos López', time: '1 hora', amount: '' },
              { action: 'Pedido completado', user: 'Ana Martínez', time: '2 horas', amount: '$156.50' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-neon-green rounded-full mr-3" />
                  <div>
                    <p className="text-white text-sm font-medium">{activity.action}</p>
                    <p className="text-dark-400 text-xs">{activity.user} • {activity.time}</p>
                  </div>
                </div>
                {activity.amount && (
                  <span className="text-neon-green text-sm font-medium">{activity.amount}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Acciones Rápidas</h3>
          <div className="space-y-3">
            {[
              { label: 'Agregar Producto', icon: Package, href: '/admin/products/new' },
              { label: 'Ver Pedidos', icon: ShoppingCart, href: '/admin/orders' },
              { label: 'Gestionar Usuarios', icon: Users, href: '/admin/users' },
              { label: 'Ver Reportes', icon: BarChart3, href: '/admin/reports' },
            ].map((action, index) => (
              <a
                key={index}
                href={action.href}
                className="flex items-center p-3 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors group"
              >
                <action.icon className="w-5 h-5 text-dark-400 group-hover:text-neon-green mr-3" />
                <span className="text-white text-sm font-medium">{action.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
