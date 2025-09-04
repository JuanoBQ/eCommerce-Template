"use client"

import { Dumbbell, Shirt, Heart, Zap, Target, Trophy, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

// Mock data - En producción esto vendría de la API
const categories = [
  {
    id: 1,
    name: 'HOMBRES',
    slug: 'men',
    description: 'Ropa deportiva para hombres que buscan el máximo rendimiento',
    icon: Dumbbell,
    image: '/images/categories/men.jpg',
    product_count: 156,
    gradient: 'from-primary-500/10 to-primary-600/10',
    textColor: 'text-primary-500'
  },
  {
    id: 2,
    name: 'MUJERES',
    slug: 'women',
    description: 'Colección diseñada para mujeres atletas y fitness enthusiasts',
    icon: Heart,
    image: '/images/categories/women.jpg',
    product_count: 203,
    gradient: 'from-gray-500/10 to-gray-600/10',
    textColor: 'text-gray-600'
  },
  {
    id: 3,
    name: 'ACCESORIOS',
    slug: 'accessories',
    description: 'Complementa tu entrenamiento con nuestros accesorios premium',
    icon: Zap,
    image: '/images/categories/accessories.jpg',
    product_count: 89,
    gradient: 'from-primary-500/10 to-gray-500/10',
    textColor: 'text-primary-500'
  },
  {
    id: 4,
    name: 'NUEVOS',
    slug: 'new',
    description: 'Descubre las últimas tendencias en ropa deportiva',
    icon: Target,
    image: '/images/categories/new.jpg',
    product_count: 67,
    gradient: 'from-gray-600/10 to-primary-500/10',
    textColor: 'text-gray-600'
  },
  {
    id: 5,
    name: 'OFERTAS',
    slug: 'sale',
    description: 'No te pierdas nuestras ofertas especiales y descuentos',
    icon: Trophy,
    image: '/images/categories/sale.jpg',
    product_count: 45,
    gradient: 'from-red-500/10 to-primary-500/10',
    textColor: 'text-red-500'
  },
  {
    id: 6,
    name: 'COLLECTIONS',
    slug: 'collections',
    description: 'Colecciones especiales y ediciones limitadas',
    icon: Shirt,
    image: '/images/categories/collections.jpg',
    product_count: 34,
    gradient: 'from-primary-500/10 to-gray-600/10',
    textColor: 'text-primary-500'
  },
]

export default function Categories() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-display font-black mb-4">
            <span className="text-gray-900">EXPLORA</span>
            <span className="block text-primary-500">CATEGORÍAS</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Encuentra exactamente lo que necesitas para tu entrenamiento
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => {
            const IconComponent = category.icon
            return (
              <Link
                key={category.id}
                href={`/tienda?category=${category.slug}`}
                className="group relative block"
              >
                <div className="relative h-80 rounded-2xl overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  {/* Background Image */}
                  <div className="absolute inset-0">
                    <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient}`} />
                    <div 
                      className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                      style={{ backgroundImage: `url(${category.image})` }}
                    />
                    <div className="absolute inset-0 bg-black/40" />
                  </div>

                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col justify-between p-8">
                    {/* Icon */}
                    <div className="flex justify-end">
                      <div className={`p-4 rounded-full bg-white/90 backdrop-blur-sm ${category.textColor}`}>
                        <IconComponent className="w-8 h-8" />
                      </div>
                    </div>

                    {/* Text Content */}
                    <div className="space-y-4">
                      <h3 className={`text-3xl font-display font-black text-white group-hover:scale-105 transition-transform duration-300`}>
                        {category.name}
                      </h3>
                      <p className="text-white/90 text-lg leading-relaxed">
                        {category.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white/70 font-medium">
                          {category.product_count} productos
                        </span>
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                          <ArrowRight className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-primary-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </Link>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <Link href="/tienda" className="inline-flex items-center gap-2">
            <Button variant="outline" size="lg">
              Ver Todas las Categorías
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
