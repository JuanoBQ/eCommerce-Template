"use client"

import { useState, useEffect } from 'react'
import { 
  Download, 
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  BarChart3,
  PieChart,
  LineChart,
  Star,
  MessageSquare,
  Clock,
  CheckCircle,
  Eye
} from 'lucide-react'
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from 'recharts'
import { toast } from 'react-hot-toast'
import { useReviewsReport } from '@/hooks/useClaims'
import { useReports } from '@/hooks/useReports'

interface ReportData {
  period: string
  revenue: number
  orders: number
  customers: number
  products: number
}

interface TopProduct {
  id: number
  name: string
  sales: number
  revenue: number
}

interface TopCustomer {
  id: number
  name: string
  email: string
  orders: number
  totalSpent: number
}

type ReportTab = 'overview' | 'reviews'

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('30')
  const [activeTab, setActiveTab] = useState<ReportTab>('overview')

  // Hooks para reportes dinámicos
  const { report: dashboardReport, loading: dashboardLoading, error: dashboardError } = useReports(dateRange)
  const { report: reviewsReport, loading: reviewsLoading, error: reviewsError } = useReviewsReport()

  const handleExportReport = (format: 'pdf' | 'excel' | 'csv') => {
    toast.success(`Reporte exportado en formato ${format.toUpperCase()}`)
  }

  const getGrowthPercentage = (current: number, previous: number) => {
    if (previous === 0) return 0
    return ((current - previous) / previous) * 100
  }

  // Usar datos dinámicos o valores por defecto
  const currentPeriod = dashboardReport?.summary || {
    total_revenue: 0,
    total_orders: 0,
    total_customers: 0,
    total_products: 0
  }

  const reportData = dashboardReport?.monthly_data || []
  const topProducts = dashboardReport?.top_products || []
  const topCustomers = dashboardReport?.top_customers || []

  if (dashboardLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-green"></div>
      </div>
    )
  }

  if (dashboardError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 max-w-md">
          <p className="text-red-400 text-center">Error al cargar reportes: {dashboardError}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Reportes</h1>
          <p className="text-dark-400 mt-2">Análisis y estadísticas de tu negocio</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
            title="Seleccionar rango de fechas"
            aria-label="Seleccionar rango de fechas para el reporte"
          >
            <option value="7">Últimos 7 días</option>
            <option value="30">Últimos 30 días</option>
            <option value="90">Últimos 90 días</option>
            <option value="365">Último año</option>
          </select>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleExportReport('pdf')}
              className="flex items-center px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              PDF
            </button>
            <button
              onClick={() => handleExportReport('excel')}
              className="flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Excel
            </button>
            <button
              onClick={() => handleExportReport('csv')}
              className="flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              CSV
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-dark-800 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'overview'
              ? 'bg-neon-green text-black'
              : 'text-dark-400 hover:text-white hover:bg-dark-700'
          }`}
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Resumen General
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex items-center px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'reviews'
              ? 'bg-neon-green text-black'
              : 'text-dark-400 hover:text-white hover:bg-dark-700'
          }`}
        >
          <Star className="w-4 h-4 mr-2" />
          Reviews
        </button>

      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-400 text-sm font-medium">Ingresos Totales</p>
              <p className="text-2xl font-bold text-white mt-2">
                ${currentPeriod.total_revenue.toLocaleString()}
              </p>
              <div className="flex items-center mt-2">
                {currentPeriod.revenue_growth >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  currentPeriod.revenue_growth >= 0 
                    ? 'text-green-500' 
                    : 'text-red-500'
                }`}>
                  {Math.abs(currentPeriod.revenue_growth).toFixed(1)}%
                </span>
              </div>
            </div>
            <DollarSign className="w-8 h-8 text-neon-green" />
          </div>
        </div>
        
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-400 text-sm font-medium">Total Pedidos</p>
              <p className="text-2xl font-bold text-white mt-2">
                {currentPeriod.total_orders}
              </p>
              <div className="flex items-center mt-2">
                {currentPeriod.orders_growth >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  currentPeriod.orders_growth >= 0 
                    ? 'text-green-500' 
                    : 'text-red-500'
                }`}>
                  {Math.abs(currentPeriod.orders_growth).toFixed(1)}%
                </span>
              </div>
            </div>
            <ShoppingCart className="w-8 h-8 text-neon-blue" />
          </div>
        </div>
        
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-400 text-sm font-medium">Nuevos Clientes</p>
              <p className="text-2xl font-bold text-white mt-2">
                {currentPeriod.total_customers}
              </p>
              <div className="flex items-center mt-2">
                {currentPeriod.customers_growth >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  currentPeriod.customers_growth >= 0 
                    ? 'text-green-500' 
                    : 'text-red-500'
                }`}>
                  {Math.abs(currentPeriod.customers_growth).toFixed(1)}%
                </span>
              </div>
            </div>
            <Users className="w-8 h-8 text-neon-purple" />
          </div>
        </div>
        
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-400 text-sm font-medium">Productos Vendidos</p>
              <p className="text-2xl font-bold text-white mt-2">
                {currentPeriod.total_products}
              </p>
              <div className="flex items-center mt-2">
                {currentPeriod.products_growth >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  currentPeriod.products_growth >= 0 
                    ? 'text-green-500' 
                    : 'text-red-500'
                }`}>
                  {Math.abs(currentPeriod.products_growth).toFixed(1)}%
                </span>
              </div>
            </div>
            <Package className="w-8 h-8 text-neon-pink" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Ingresos Mensuales</h3>
            <LineChart className="w-5 h-5 text-neon-green" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsLineChart data={reportData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="period" stroke="#9CA3AF" />
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
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Chart */}
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Pedidos Mensuales</h3>
            <BarChart3 className="w-5 h-5 text-neon-blue" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="period" stroke="#9CA3AF" />
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

      {/* Top Products and Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Products */}
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Productos Más Vendidos</h3>
            <a
              href="/admin/products"
              className="flex items-center px-4 py-2 bg-neon-green text-dark-900 rounded-lg font-medium hover:bg-neon-green/90 transition-colors"
            >
              <Eye className="w-4 h-4 mr-2" />
              Ver Productos
            </a>
          </div>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <a
                key={product.id}
                href={`/admin/products?product=${product.id}`}
                className="block p-4 bg-dark-700 rounded-lg hover:bg-dark-600 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-neon-green/20 text-neon-green rounded-full flex items-center justify-center mr-4 font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-white font-medium">{product.name}</p>
                      <p className="text-dark-400 text-sm">{product.sales} ventas</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="text-right mr-4">
                      <p className="text-neon-green font-semibold">${product.revenue.toFixed(2)}</p>
                    </div>
                    <Eye className="w-4 h-4 text-dark-400" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Mejores Clientes</h3>
          <div className="space-y-4">
            {topCustomers.map((customer, index) => (
              <div key={customer.id} className="flex items-center justify-between p-4 bg-dark-700 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-neon-blue/20 text-neon-blue rounded-full flex items-center justify-center mr-4 font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-white font-medium">{customer.name}</p>
                    <p className="text-dark-400 text-sm">{customer.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-neon-blue font-semibold">${customer.totalSpent.toFixed(2)}</p>
                  <p className="text-dark-400 text-sm">{customer.orders} pedidos</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
        </>
      )}

      {/* Reviews Tab */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          {reviewsLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-green"></div>
            </div>
          ) : reviewsError ? (
            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
              <p className="text-red-400">Error al cargar reporte de reviews: {reviewsError}</p>
            </div>
          ) : reviewsReport ? (
            <>
              {/* Reviews Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-dark-400 text-sm font-medium">Total Reviews</p>
                      <p className="text-2xl font-bold text-white mt-2">
                        {reviewsReport.summary.total_reviews}
                      </p>
                    </div>
                    <MessageSquare className="w-8 h-8 text-neon-blue" />
                  </div>
                </div>
                
                <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-dark-400 text-sm font-medium">Reviews Aprobadas</p>
                      <p className="text-2xl font-bold text-white mt-2">
                        {reviewsReport.summary.approved_reviews}
                      </p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </div>
                
                <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-dark-400 text-sm font-medium">Reviews Pendientes</p>
                      <p className="text-2xl font-bold text-white mt-2">
                        {reviewsReport.summary.pending_reviews}
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-500" />
                  </div>
                </div>
                
                <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-dark-400 text-sm font-medium">Rating Promedio</p>
                      <p className="text-2xl font-bold text-white mt-2">
                        {reviewsReport.summary.average_rating.toFixed(1)}
                      </p>
                    </div>
                    <Star className="w-8 h-8 text-neon-green" />
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Rating Distribution */}
                <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-6">Distribución de Ratings</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={reviewsReport.rating_distribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ rating, count }) => `${rating}★ (${count})`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {reviewsReport.rating_distribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#ff4444', '#ff8800', '#ffbb00', '#88ff00', '#00ff88'][index]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>

                {/* Monthly Reviews */}
                <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-6">Reviews por Mes</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsLineChart data={reviewsReport.monthly_reviews}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="month" stroke="#9CA3AF" />
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
                        dataKey="count" 
                        stroke="#00ff88" 
                        strokeWidth={3}
                        dot={{ fill: '#00ff88', strokeWidth: 2, r: 4 }}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Reviewed Products */}
              <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Productos Más Revisados</h3>
                  <a
                    href="/admin/products"
                    className="flex items-center px-4 py-2 bg-neon-green text-dark-900 rounded-lg font-medium hover:bg-neon-green/90 transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Productos
                  </a>
                </div>
                <div className="space-y-4">
                  {reviewsReport.top_reviewed_products.map((product, index) => (
                    <a
                      key={product.id}
                      href={`/admin/products?product=${product.id}`}
                      className="block p-4 bg-dark-700 rounded-lg hover:bg-dark-600 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-neon-green/20 text-neon-green rounded-full flex items-center justify-center mr-4 font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-white font-medium">{product.name}</p>
                            <p className="text-dark-400 text-sm">{product.review_count} reviews</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="flex items-center mr-4">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.floor(product.average_rating)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-400'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-neon-green font-semibold mr-4">{product.average_rating.toFixed(1)}</p>
                          <Eye className="w-4 h-4 text-dark-400" />
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}


    </div>
  )
}
