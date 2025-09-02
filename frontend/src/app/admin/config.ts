// Configuración del panel administrativo

export const ADMIN_CONFIG = {
  // Configuración de la navegación
  navigation: [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: 'LayoutDashboard',
      description: 'Vista general del negocio'
    },
    {
      name: 'Productos',
      href: '/admin/products',
      icon: 'Package',
      description: 'Gestionar catálogo de productos'
    },
    {
      name: 'Categorías',
      href: '/admin/categories',
      icon: 'BarChart3',
      description: 'Organizar productos por categorías'
    },
    {
      name: 'Usuarios',
      href: '/admin/users',
      icon: 'Users',
      description: 'Gestionar usuarios y permisos'
    },
    {
      name: 'Pedidos',
      href: '/admin/orders',
      icon: 'ShoppingCart',
      description: 'Procesar y gestionar pedidos'
    },
    {
      name: 'Reportes',
      href: '/admin/reports',
      icon: 'BarChart3',
      description: 'Análisis y estadísticas'
    },
    {
      name: 'Configuración',
      href: '/admin/settings',
      icon: 'Settings',
      description: 'Configuración del sistema'
    }
  ],

  // Configuración de permisos
  permissions: {
    dashboard: ['admin', 'staff'],
    products: ['admin', 'staff'],
    categories: ['admin', 'staff'],
    users: ['admin'],
    orders: ['admin', 'staff'],
    reports: ['admin', 'staff'],
    settings: ['admin']
  },

  // Configuración de estados de productos
  productStatuses: [
    { value: 'draft', label: 'Borrador', color: 'yellow' },
    { value: 'active', label: 'Activo', color: 'green' },
    { value: 'inactive', label: 'Inactivo', color: 'red' }
  ],

  // Configuración de estados de pedidos
  orderStatuses: [
    { value: 'pending', label: 'Pendiente', color: 'yellow', icon: 'Clock' },
    { value: 'processing', label: 'Procesando', color: 'blue', icon: 'Package' },
    { value: 'shipped', label: 'Enviado', color: 'purple', icon: 'Truck' },
    { value: 'delivered', label: 'Entregado', color: 'green', icon: 'CheckCircle' },
    { value: 'cancelled', label: 'Cancelado', color: 'red', icon: 'XCircle' }
  ],

  // Configuración de roles de usuario
  userRoles: [
    { value: 'customer', label: 'Cliente', color: 'green' },
    { value: 'staff', label: 'Staff', color: 'blue' },
    { value: 'admin', label: 'Administrador', color: 'red' }
  ],

  // Configuración de categorías por defecto
  defaultCategories: [
    'Ropa Deportiva',
    'Calzado',
    'Accesorios',
    'Equipamiento',
    'Suplementos'
  ],

  // Configuración de paginación
  pagination: {
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100]
  },

  // Configuración de exportación
  exportFormats: [
    { value: 'pdf', label: 'PDF', icon: 'FileText', color: 'red' },
    { value: 'excel', label: 'Excel', icon: 'FileSpreadsheet', color: 'green' },
    { value: 'csv', label: 'CSV', icon: 'FileText', color: 'blue' }
  ],

  // Configuración de notificaciones
  notifications: {
    enabled: true,
    types: ['success', 'error', 'warning', 'info'],
    duration: 5000
  }
}

// Utilidades para el admin
export const ADMIN_UTILS = {
  // Formatear números como moneda
  formatCurrency: (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency
    }).format(amount)
  },

  // Formatear fechas
  formatDate: (date: string | Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date))
  },

  // Formatear fechas con hora
  formatDateTime: (date: string | Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  },

  // Generar colores para gráficos
  generateChartColors: (count: number) => {
    const colors = [
      '#00ff88', // neon-green
      '#00d4aa', // neon-blue
      '#00b4d8', // neon-cyan
      '#7209b7', // neon-purple
      '#ff6b6b', // neon-pink
      '#ffd93d', // neon-yellow
      '#6bcf7f', // neon-lime
      '#4d96ff'  // neon-indigo
    ]
    
    return Array.from({ length: count }, (_, i) => colors[i % colors.length])
  },

  // Validar permisos de usuario
  hasPermission: (userRole: string, requiredPermission: string) => {
    const permissions = ADMIN_CONFIG.permissions[requiredPermission as keyof typeof ADMIN_CONFIG.permissions]
    return permissions ? permissions.includes(userRole as any) : false
  },

  // Obtener configuración de estado
  getStatusConfig: (type: 'product' | 'order' | 'user', value: string) => {
    const configs = {
      product: ADMIN_CONFIG.productStatuses,
      order: ADMIN_CONFIG.orderStatuses,
      user: ADMIN_CONFIG.userRoles
    }
    
    return configs[type].find(config => config.value === value)
  }
}

