"use client"

import { Dumbbell, Shirt, Heart, Zap, Target, Trophy } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

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
    gradient: 'from-neon-green/20 to-neon-blue/20',
    textColor: 'text-neon-green'
  },
  {
    id: 2,
    name: 'MUJERES',
    slug: 'women',
    description: 'Colección diseñada para mujeres atletas y fitness enthusiasts',
    icon: Heart,
    image: '/images/categories/women.jpg',
    product_count: 203,
    gradient: 'from-neon-pink/20 to-neon-purple/20',
    textColor: 'text-neon-pink'
  },
  {
    id: 3,
    name: 'ACCESORIOS',
    slug: 'accessories',
    description: 'Complementa tu entrenamiento con nuestros accesorios premium',
    icon: Zap,
    image: '/images/categories/accessories.jpg',
    product_count: 89,
    gradient: 'from-neon-blue/20 to-neon-green/20',
    textColor: 'text-neon-blue'
  },
  {
    id: 4,
    name: 'NUEVOS',
    slug: 'new',
    description: 'Descubre las últimas tendencias en ropa deportiva',
    icon: Target,
    image: '/images/categories/new.jpg',
    product_count: 67,
    gradient: 'from-neon-purple/20 to-neon-pink/20',
    textColor: 'text-neon-purple'
  },
  {
    id: 5,
    name: 'OFERTAS',
    slug: 'sale',
    description: 'No te pierdas nuestras ofertas especiales y descuentos',
    icon: Trophy,
    image: '/images/categories/sale.jpg',
    product_count: 45,
    gradient: 'from-accent-500/20 to-neon-green/20',
    textColor: 'text-accent-500'
  },
  {
    id: 6,
    name: 'COLLECTIONS',
    slug: 'collections',
    description: 'Colecciones especiales y ediciones limitadas',
    icon: Shirt,
    image: '/images/categories/collections.jpg',
    product_count: 34,
    gradient: 'from-neon-green/20 to-neon-purple/20',
    textColor: 'text-neon-green'
  },
]

export default function Categories() {
  return (
    <section className="py-20 bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-display font-black mb-4">
            <span className="text-white">EXPLORA</span>
            <span className="block text-gradient">CATEGORÍAS</span>
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
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
                href={`/shop/${category.slug}`}
                className="group relative block"
              >
                <div className="relative h-80 rounded-2xl overflow-hidden card-hover">
                  {/* Background Image */}
                  <div className="absolute inset-0">
                    <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient}`} />
                    <div 
                      className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                      style={{ backgroundImage: `url(${category.image})` }}
                    />
                    <div className="absolute inset-0 bg-dark-900/60" />
                  </div>

                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col justify-between p-8">
                    {/* Icon */}
                    <div className="flex justify-end">
                      <div className={`p-4 rounded-full bg-dark-800/50 backdrop-blur-sm ${category.textColor}`}>
                        <IconComponent className="w-8 h-8" />
                      </div>
                    </div>

                    {/* Text Content */}
                    <div className="space-y-4">
                      <h3 className={`text-3xl font-display font-black ${category.textColor} group-hover:scale-105 transition-transform duration-300`}>
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
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-neon-green/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </Link>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <Link
            href="/shop"
            className="btn-outline inline-flex items-center group"
          >
            Ver Todas las Categorías
            <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}