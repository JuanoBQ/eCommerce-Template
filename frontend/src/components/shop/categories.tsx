"use client"

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shirt, Baby, Footprints, Clock, ShoppingBag, Package } from 'lucide-react'
import Link from 'next/link'

// Mock data - En producción esto vendría de la API
const categories = [
  {
    id: 1,
    name: 'Ropa de Hombre',
    slug: 'ropa-hombre',
    description: 'Camisetas, pantalones, chaquetas y más',
    icon: Shirt,
    image: '/images/categories/hombre.jpg',
    product_count: 156,
  },
  {
    id: 2,
    name: 'Ropa de Mujer',
    slug: 'ropa-mujer',
    description: 'Vestidos, blusas, pantalones y más',
    icon: Shirt,
    image: '/images/categories/mujer.jpg',
    product_count: 203,
  },
  {
    id: 3,
    name: 'Ropa de Niños',
    slug: 'ropa-ninos',
    description: 'Ropa cómoda y divertida para niños',
    icon: Baby,
    image: '/images/categories/ninos.jpg',
    product_count: 89,
  },
  {
    id: 4,
    name: 'Zapatos',
    slug: 'zapatos',
    description: 'Zapatos para toda la familia',
    icon: Footprints,
    image: '/images/categories/zapatos.jpg',
    product_count: 67,
  },
  {
    id: 5,
    name: 'Accesorios',
    slug: 'accesorios',
    description: 'Bolsos, relojes, gafas y más',
    icon: Clock,
    image: '/images/categories/accesorios.jpg',
    product_count: 45,
  },
  {
    id: 6,
    name: 'Bolsos',
    slug: 'bolsos',
    description: 'Bolsos y carteras de moda',
    icon: ShoppingBag,
    image: '/images/categories/bolsos.jpg',
    product_count: 34,
  },
]

export default function Categories() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Nuestras Categorías
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explora nuestra amplia gama de categorías y encuentra exactamente lo que buscas.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const IconComponent = category.icon
            return (
              <Card key={category.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <div className="aspect-[4/3] bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                      <IconComponent className="h-16 w-16 text-blue-600" />
                    </div>
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                      <Link href={`/shop/categories/${category.slug}`}>
                        {category.name}
                      </Link>
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {category.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {category.product_count} productos
                      </span>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/shop/categories/${category.slug}`}>
                          Ver Categoría
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
