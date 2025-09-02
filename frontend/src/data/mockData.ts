import { Category, Brand } from '@/types'

// Mock Categories para tienda de ropa
export const mockCategories: Category[] = [
  {
    id: 1,
    name: 'Ropa Deportiva',
    slug: 'ropa-deportiva',
    description: 'Ropa para deportes y actividades físicas',
    is_active: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Ropa Casual',
    slug: 'ropa-casual',
    description: 'Ropa cómoda para uso diario',
    is_active: true,
    sort_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    name: 'Ropa Formal',
    slug: 'ropa-formal',
    description: 'Ropa elegante para ocasiones especiales',
    is_active: true,
    sort_order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 4,
    name: 'Calzado',
    slug: 'calzado',
    description: 'Zapatos y zapatillas para todas las ocasiones',
    is_active: true,
    sort_order: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 5,
    name: 'Accesorios',
    slug: 'accesorios',
    description: 'Bolsos, cinturones, relojes y más',
    is_active: true,
    sort_order: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 6,
    name: 'Ropa Interior',
    slug: 'ropa-interior',
    description: 'Ropa íntima y de dormir',
    is_active: true,
    sort_order: 6,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 7,
    name: 'Baño y Playa',
    slug: 'bano-y-playa',
    description: 'Trajes de baño y ropa para playa',
    is_active: true,
    sort_order: 7,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 8,
    name: 'Ropa de Invierno',
    slug: 'ropa-invierno',
    description: 'Abrigos, chaquetas y ropa de abrigo',
    is_active: true,
    sort_order: 8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

// Mock Brands para tienda de ropa
export const mockBrands: Brand[] = [
  {
    id: 1,
    name: 'Sin Marca',
    slug: 'sin-marca',
    description: 'Productos sin marca específica',
    is_active: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Nike',
    slug: 'nike',
    description: 'Just Do It - Marca deportiva líder mundial',
    is_active: true,
    sort_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    name: 'Adidas',
    slug: 'adidas',
    description: 'Impossible is Nothing - Innovación deportiva',
    is_active: true,
    sort_order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 4,
    name: 'Puma',
    slug: 'puma',
    description: 'Forever Faster - Rendimiento y estilo',
    is_active: true,
    sort_order: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 5,
    name: 'Zara',
    slug: 'zara',
    description: 'Moda rápida y tendencias actuales',
    is_active: true,
    sort_order: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 6,
    name: 'H&M',
    slug: 'h-m',
    description: 'Moda consciente y accesible',
    is_active: true,
    sort_order: 6,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 7,
    name: 'Uniqlo',
    slug: 'uniqlo',
    description: 'LifeWear - Ropa para la vida diaria',
    is_active: true,
    sort_order: 7,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 8,
    name: 'Levi\'s',
    slug: 'levis',
    description: 'Los jeans originales desde 1873',
    is_active: true,
    sort_order: 8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 9,
    name: 'Calvin Klein',
    slug: 'calvin-klein',
    description: 'Moda minimalista y elegante',
    is_active: true,
    sort_order: 9,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 10,
    name: 'Tommy Hilfiger',
    slug: 'tommy-hilfiger',
    description: 'Estilo americano clásico',
    is_active: true,
    sort_order: 10,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 11,
    name: 'Lacoste',
    slug: 'lacoste',
    description: 'El cocodrilo - Elegancia deportiva',
    is_active: true,
    sort_order: 11,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 12,
    name: 'Ralph Lauren',
    slug: 'ralph-lauren',
    description: 'Estilo americano de lujo',
    is_active: true,
    sort_order: 12,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 13,
    name: 'Champion',
    slug: 'champion',
    description: 'Ropa deportiva y casual',
    is_active: true,
    sort_order: 13,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 14,
    name: 'Vans',
    slug: 'vans',
    description: 'Off The Wall - Cultura skate y streetwear',
    is_active: true,
    sort_order: 14,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 15,
    name: 'Converse',
    slug: 'converse',
    description: 'All Star - Zapatillas icónicas',
    is_active: true,
    sort_order: 15,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

// Función para obtener categorías mock
export const getMockCategories = (): Category[] => {
  return mockCategories
}

// Función para obtener marcas mock
export const getMockBrands = (): Brand[] => {
  return mockBrands
}

// Función para obtener categoría por ID
export const getMockCategoryById = (id: number): Category | undefined => {
  return mockCategories.find(category => category.id === id)
}

// Función para obtener marca por ID
export const getMockBrandById = (id: number): Brand | undefined => {
  return mockBrands.find(brand => brand.id === id)
}
