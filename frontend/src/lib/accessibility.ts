/**
 * Utilidades para mejorar la accesibilidad del sitio web.
 * Proporciona funciones para generar ARIA labels y mejorar la experiencia de usuarios con discapacidades.
 */

// ARIA labels comunes
export const ariaLabels = {
  // Navegación
  mainNavigation: 'Navegación principal',
  breadcrumb: 'Navegación de migas de pan',
  pagination: 'Navegación de páginas',
  
  // Productos
  productCard: 'Tarjeta de producto',
  productImage: 'Imagen del producto',
  productName: 'Nombre del producto',
  productPrice: 'Precio del producto',
  productDescription: 'Descripción del producto',
  addToCart: 'Agregar al carrito',
  addToWishlist: 'Agregar a lista de deseos',
  removeFromWishlist: 'Quitar de lista de deseos',
  
  // Carrito
  cartIcon: 'Icono del carrito',
  cartItem: 'Artículo del carrito',
  cartQuantity: 'Cantidad en el carrito',
  cartTotal: 'Total del carrito',
  removeFromCart: 'Quitar del carrito',
  
  // Formularios
  searchInput: 'Campo de búsqueda',
  searchButton: 'Botón de búsqueda',
  filterButton: 'Botón de filtros',
  sortSelect: 'Selector de ordenamiento',
  
  // Botones
  closeButton: 'Cerrar',
  openButton: 'Abrir',
  submitButton: 'Enviar',
  cancelButton: 'Cancelar',
  saveButton: 'Guardar',
  editButton: 'Editar',
  deleteButton: 'Eliminar',
  
  // Estados
  loading: 'Cargando',
  error: 'Error',
  success: 'Éxito',
  warning: 'Advertencia',
  
  // Modal y overlays
  modal: 'Ventana modal',
  overlay: 'Capa superpuesta',
  closeModal: 'Cerrar modal',
  
  // Tablas
  table: 'Tabla de datos',
  tableHeader: 'Encabezado de tabla',
  tableRow: 'Fila de tabla',
  tableCell: 'Celda de tabla',
  sortAscending: 'Ordenar ascendente',
  sortDescending: 'Ordenar descendente',
}

// Generar ARIA labels dinámicos
export function generateAriaLabel(type: keyof typeof ariaLabels, context?: string): string {
  const baseLabel = ariaLabels[type]
  return context ? `${baseLabel}: ${context}` : baseLabel
}

// Generar ARIA labels para productos
export function generateProductAriaLabels(product: {
  name: string
  price: number
  inStock: boolean
  inWishlist?: boolean
}) {
  return {
    card: `Producto: ${product.name}, Precio: $${product.price.toLocaleString()}`,
    image: `Imagen del producto ${product.name}`,
    name: `Nombre: ${product.name}`,
    price: `Precio: $${product.price.toLocaleString()}`,
    addToCart: `Agregar ${product.name} al carrito`,
    addToWishlist: `Agregar ${product.name} a lista de deseos`,
    removeFromWishlist: `Quitar ${product.name} de lista de deseos`,
    stockStatus: product.inStock ? 'Disponible' : 'Agotado',
  }
}

// Generar ARIA labels para carrito
export function generateCartAriaLabels(item: {
  name: string
  quantity: number
  price: number
  total: number
}) {
  return {
    item: `Artículo: ${item.name}, Cantidad: ${item.quantity}, Precio: $${item.price.toLocaleString()}`,
    quantity: `Cantidad de ${item.name}: ${item.quantity}`,
    total: `Total: $${item.total.toLocaleString()}`,
    remove: `Quitar ${item.name} del carrito`,
  }
}

// Generar ARIA labels para formularios
export function generateFormAriaLabels(field: {
  name: string
  label: string
  required?: boolean
  error?: string
}) {
  const baseLabel = field.label
  const requiredText = field.required ? ' (requerido)' : ''
  const errorText = field.error ? `, Error: ${field.error}` : ''
  
  return {
    label: `${baseLabel}${requiredText}${errorText}`,
    error: field.error ? `Error en ${field.label}: ${field.error}` : undefined,
  }
}

// Generar ARIA labels para navegación
export function generateNavigationAriaLabels(nav: {
  currentPage?: number
  totalPages?: number
  currentItem?: string
}) {
  return {
    pagination: nav.currentPage && nav.totalPages 
      ? `Página ${nav.currentPage} de ${nav.totalPages}`
      : 'Navegación de páginas',
    breadcrumb: nav.currentItem 
      ? `Estás en: ${nav.currentItem}`
      : 'Navegación de migas de pan',
  }
}

// Generar ARIA labels para botones de acción
export function generateActionAriaLabels(action: {
  type: 'add' | 'remove' | 'edit' | 'delete' | 'save' | 'cancel'
  item?: string
  context?: string
}) {
  const actionLabels = {
    add: 'Agregar',
    remove: 'Quitar',
    edit: 'Editar',
    delete: 'Eliminar',
    save: 'Guardar',
    cancel: 'Cancelar',
  }
  
  const baseAction = actionLabels[action.type]
  const itemText = action.item ? ` ${action.item}` : ''
  const contextText = action.context ? ` en ${action.context}` : ''
  
  return `${baseAction}${itemText}${contextText}`
}

// Generar ARIA labels para estados de carga
export function generateLoadingAriaLabels(loading: {
  type: 'page' | 'component' | 'data'
  message?: string
}) {
  const typeLabels = {
    page: 'Cargando página',
    component: 'Cargando componente',
    data: 'Cargando datos',
  }
  
  const baseMessage = typeLabels[loading.type]
  const customMessage = loading.message ? `: ${loading.message}` : ''
  
  return `${baseMessage}${customMessage}`
}

// Generar ARIA labels para errores
export function generateErrorAriaLabels(error: {
  type: 'validation' | 'network' | 'server' | 'unknown'
  message: string
  field?: string
}) {
  const typeLabels = {
    validation: 'Error de validación',
    network: 'Error de conexión',
    server: 'Error del servidor',
    unknown: 'Error desconocido',
  }
  
  const baseType = typeLabels[error.type]
  const fieldText = error.field ? ` en ${error.field}` : ''
  
  return `${baseType}${fieldText}: ${error.message}`
}

// Generar ARIA labels para tablas
export function generateTableAriaLabels(table: {
  name: string
  totalRows?: number
  currentPage?: number
  sortColumn?: string
  sortDirection?: 'asc' | 'desc'
}) {
  return {
    table: `Tabla: ${table.name}`,
    summary: table.totalRows 
      ? `Tabla con ${table.totalRows} filas`
      : `Tabla: ${table.name}`,
    sort: table.sortColumn && table.sortDirection
      ? `Ordenado por ${table.sortColumn} ${table.sortDirection === 'asc' ? 'ascendente' : 'descendente'}`
      : undefined,
  }
}
