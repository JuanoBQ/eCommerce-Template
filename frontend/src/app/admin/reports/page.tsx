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
import LoadingSpinner from '@/components/ui/LoadingSpinner'

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
      <div className="min-h-screen bg-gray-50 space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-gray-200 rounded animate-pulse w-32 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-48"></div>
          </div>
          <div className="flex space-x-4">
            <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-32"></div>
            <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-24"></div>
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
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
              <div className="h-6 bg-gray-200 rounded animate-pulse w-32"></div>
              <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Orders Chart Skeleton */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-32"></div>
              <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Bottom Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products Skeleton */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-40"></div>
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
                      </div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews Chart Skeleton */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-32"></div>
              <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
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
    <div className="min-h-screen bg-gray-50 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes</h1>
          <p className="text-gray-600 mt-2">Análisis y estadísticas de tu negocio</p>
        </div>

        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
              className="flex items-center px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              PDF
            </button>
            <button
              onClick={() => handleExportReport('excel')}
              className="flex items-center px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Excel
            </button>
            <button
              onClick={() => handleExportReport('csv')}
              className="flex items-center px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              CSV
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'overview'
              ? 'bg-primary-500 text-white'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
          }`}
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Resumen General
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex items-center px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'reviews'
              ? 'bg-primary-500 text-white'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
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
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Ingresos Totales</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    ${currentPeriod.total_revenue.toLocaleString()}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-primary-600 mr-1" />
                    <span className="text-sm font-medium text-primary-600">
                      0.0%
                    </span>
                  </div>
                </div>
                <DollarSign className="w-8 h-8 text-primary-500" />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Órdenes</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {currentPeriod.total_orders}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-primary-600 mr-1" />
                    <span className="text-sm font-medium text-primary-600">
                      0.0%
                    </span>
                  </div>
                </div>
                <ShoppingCart className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Nuevos Clientes</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {currentPeriod.total_customers}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-primary-600 mr-1" />
                    <span className="text-sm font-medium text-primary-600">
                      0.0%
                    </span>
                  </div>
                </div>
                <Users className="w-8 h-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Órdenes Pagadas</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {currentPeriod.total_products}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-primary-600 mr-1" />
                    <span className="text-sm font-medium text-primary-600">
                      0.0%
                    </span>
                  </div>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Revenue Chart */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Ingresos Mensuales</h3>
                <LineChart className="w-5 h-5 text-primary-500" />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsLineChart data={reportData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="period" stroke="#9CA3AF" />
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
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>

            {/* Orders Chart */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Pedidos Mensuales</h3>
                <BarChart3 className="w-5 h-5 text-blue-500" />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="period" stroke="#9CA3AF" />
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

          {/* Top Products and Customers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Products */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Productos Más Vendidos</h3>
                <a
                  href="/admin/products"
                  className="flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
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
                    className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-primary-100 text-primary-500 rounded-full flex items-center justify-center mr-4 font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-gray-900 font-medium">{product.name}</p>
                          <p className="text-gray-500 text-sm">{product.sales} ventas</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="text-right mr-4">
                          <p className="text-primary-500 font-semibold">${product.revenue.toFixed(2)}</p>
                        </div>
                        <Eye className="w-4 h-4 text-gray-500" />
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Top Customers */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Mejores Clientes</h3>
              <div className="space-y-4">
                {topCustomers.map((customer, index) => (
                  <div key={customer.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mr-4 font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-gray-900 font-medium">{customer.name}</p>
                        <p className="text-gray-500 text-sm">{customer.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-blue-500 font-semibold">${customer.totalSpent.toFixed(2)}</p>
                      <p className="text-gray-500 text-sm">{customer.orders} pedidos</p>
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
          ) : reviewsError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">Error al cargar reporte de reviews: {reviewsError}</p>
            </div>
          ) : reviewsReport ? (
            <>
              {/* Reviews Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Total Reviews</p>
                      <p className="text-2xl font-bold text-gray-900 mt-2">
                        {reviewsReport.summary.total_reviews}
                      </p>
                    </div>
                    <MessageSquare className="w-8 h-8 text-blue-500" />
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Reviews Aprobadas</p>
                      <p className="text-2xl font-bold text-gray-900 mt-2">
                        {reviewsReport.summary.approved_reviews}
                      </p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-primary-600" />
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Reviews Pendientes</p>
                      <p className="text-2xl font-bold text-gray-900 mt-2">
                        {reviewsReport.summary.pending_reviews}
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-500" />
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Rating Promedio</p>
                      <p className="text-2xl font-bold text-gray-900 mt-2">
                        {reviewsReport.summary.average_rating.toFixed(1)}
                      </p>
                    </div>
                    <Star className="w-8 h-8 text-primary-500" />
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Rating Distribution */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Distribución de Ratings</h3>
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
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Reviews por Mes</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsLineChart data={reviewsReport.monthly_reviews}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="month" stroke="#9CA3AF" />
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
                        dataKey="count"
                        stroke="#0ea5e9"
                        strokeWidth={3}
                        dot={{ fill: '#0ea5e9', strokeWidth: 2, r: 4 }}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Reviewed Products */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Productos Más Revisados</h3>
                  <a
                    href="/admin/products"
                    className="flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
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
                      className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-primary-100 text-primary-500 rounded-full flex items-center justify-center mr-4 font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-gray-900 font-medium">{product.name}</p>
                            <p className="text-gray-500 text-sm">{product.review_count} reviews</p>
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
                          <p className="text-primary-500 font-semibold mr-4">{product.average_rating.toFixed(1)}</p>
                          <Eye className="w-4 h-4 text-gray-500" />
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