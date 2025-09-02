"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Heart, ShoppingCart, Star } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

// Mock data - En producción esto vendría de la API
const featuredProducts = [
  {
    id: 1,
    name: 'Camiseta Básica Premium',
    slug: 'camiseta-basica-premium',
    price: 45000,
    compare_price: 60000,
    image: '/images/products/camiseta-1.jpg',
    rating: 4.8,
    reviews: 124,
    is_featured: true,
    is_in_stock: true,
  },
  {
    id: 2,
    name: 'Jeans Slim Fit',
    slug: 'jeans-slim-fit',
    price: 120000,
    compare_price: 150000,
    image: '/images/products/jeans-1.jpg',
    rating: 4.6,
    reviews: 89,
    is_featured: true,
    is_in_stock: true,
  },
  {
    id: 3,
    name: 'Vestido Elegante',
    slug: 'vestido-elegante',
    price: 180000,
    compare_price: 220000,
    image: '/images/products/vestido-1.jpg',
    rating: 4.9,
    reviews: 67,
    is_featured: true,
    is_in_stock: true,
  },
  {
    id: 4,
    name: 'Chaqueta Casual',
    slug: 'chaqueta-casual',
    price: 200000,
    compare_price: 250000,
    image: '/images/products/chaqueta-1.jpg',
    rating: 4.7,
    reviews: 45,
    is_featured: true,
    is_in_stock: true,
  },
]

export default function FeaturedProducts() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Productos Destacados
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Descubre nuestra selección de productos más populares y mejor valorados por nuestros clientes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <Card key={product.id} className="group hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  <div className="aspect-square bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">Imagen del producto</span>
                  </div>
                  {product.compare_price && (
                    <Badge className="absolute top-2 left-2 bg-red-500">
                      -{Math.round(((product.compare_price - product.price) / product.compare_price) * 100)}%
                    </Badge>
                  )}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="secondary" className="h-8 w-8">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-4">
                <div className="flex items-center gap-1 mb-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{product.rating}</span>
                  <span className="text-sm text-gray-500">({product.reviews})</span>
                </div>
                
                <CardTitle className="text-lg mb-2 line-clamp-2">
                  <Link 
                    href={`/shop/products/${product.slug}`}
                    className="hover:text-primary transition-colors"
                  >
                    {product.name}
                  </Link>
                </CardTitle>
                
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-primary">
                    {formatPrice(product.price)}
                  </span>
                  {product.compare_price && (
                    <span className="text-sm text-gray-500 line-through">
                      {formatPrice(product.compare_price)}
                    </span>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="p-4 pt-0">
                <Button className="w-full" asChild>
                  <Link href={`/shop/products/${product.slug}`}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Ver Producto
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button asChild size="lg" variant="outline">
            <Link href="/shop/products">
              Ver Todos los Productos
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
