'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ChevronDown, Shirt, Zap, Star, Tag } from 'lucide-react'
import { useCategories } from '@/hooks/useCategories'

interface NavigationDropdownProps {
  title: string
  gender: 'men' | 'women'
  className?: string
}

export default function NavigationDropdown({ title, gender, className = '' }: NavigationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { categories } = useCategories()
  const timeoutRef = useRef<NodeJS.Timeout>()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 150) // Delay de 150ms antes de cerrar
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <div 
      className={`relative ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={dropdownRef}
    >
      {/* Trigger */}
      <button className="flex items-center gap-1 text-sm text-gray-700 hover:text-black transition-all duration-200 font-medium uppercase tracking-wide group">
        {title}
        <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} group-hover:text-primary-500`} />
      </button>

      {/* Dropdown Menu - Diseño moderno y minimalista */}
      {isOpen && (
        <>
          {/* Overlay invisible para mantener el hover */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-screen max-w-4xl h-4 z-40" />
          
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 w-screen max-w-6xl bg-white border border-gray-200 rounded-md shadow-2xl z-50 overflow-hidden">
            <div className="p-8">
              {/* Header minimalista */}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {title}
                </h3>
                <p className="text-gray-600 text-sm">
                  Descubre nuestra colección completa
                </p>
              </div>

              {/* Grid de contenido */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                
                {/* Columna 1: Ver Todo */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Shirt className="w-5 h-5 text-primary-500" />
                    <span className="text-gray-900 font-bold text-sm uppercase tracking-wider">
                      Explorar
                    </span>
                  </div>
                  
                  <Link
                    href={`/tienda?gender=${gender}&from_nav=true&clear_filters=true`}
                    className="group block p-4 bg-gray-50 rounded-lg hover:bg-primary-50 transition-all duration-300 border border-transparent hover:border-primary-200 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-gray-900 font-bold text-base group-hover:text-primary-600 transition-colors">
                          Ver Todo
                        </h4>
                        <p className="text-gray-600 text-sm">
                          Toda la colección
                        </p>
                      </div>
                      <ChevronDown className="w-5 h-5 text-primary-500 rotate-[-90deg] group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </div>

                {/* Columna 2: Categorías */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-5 h-5 text-primary-500" />
                    <span className="text-gray-900 font-bold text-sm uppercase tracking-wider">
                      Categorías
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {categories.slice(0, 5).map((category) => (
                      <Link
                        key={category.id}
                        href={`/tienda?category=${category.slug}&gender=${gender}&from_nav=true`}
                        className="group flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-all duration-200 border border-transparent hover:border-gray-200"
                      >
                        <span className="text-gray-700 group-hover:text-gray-900 font-medium text-sm">
                          {category.name}
                        </span>
                        <ChevronDown className="w-4 h-4 text-gray-400 rotate-[-90deg] group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Columna 3: Destacados */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-5 h-5 text-primary-500" />
                    <span className="text-gray-900 font-bold text-sm uppercase tracking-wider">
                      Especiales
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <Link
                      href={`/tienda?gender=${gender}&featured=true&from_nav=true`}
                      className="group block p-3 rounded-lg hover:bg-yellow-50 transition-all duration-200 border border-transparent hover:border-yellow-200 hover:shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-gray-700 group-hover:text-gray-900 font-medium text-sm">
                          Destacados
                        </span>
                      </div>
                    </Link>
                    
                    <Link
                      href={`/tienda?gender=${gender}&sale=true&from_nav=true`}
                      className="group block p-3 rounded-lg hover:bg-red-50 transition-all duration-200 border border-transparent hover:border-red-200 hover:shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <Tag className="w-4 h-4 text-red-500" />
                        <span className="text-gray-700 group-hover:text-gray-900 font-medium text-sm">
                          Ofertas
                        </span>
                      </div>
                    </Link>
                  </div>
                </div>

                {/* Columna 4: Novedades */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-5 h-5 text-primary-500" />
                    <span className="text-gray-900 font-bold text-sm uppercase tracking-wider">
                      Novedades
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <Link
                      href={`/tienda?gender=${gender}&new=true&from_nav=true`}
                      className="group block p-3 rounded-lg hover:bg-primary-50 transition-all duration-200 border border-transparent hover:border-primary-200 hover:shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-primary-500 rounded-full"></div>
                        <span className="text-gray-700 group-hover:text-gray-900 font-medium text-sm">
                          Nuevos Productos
                        </span>
                      </div>
                    </Link>
                    
                    <Link
                      href={`/tienda?gender=${gender}&trending=true&from_nav=true`}
                      className="group block p-3 rounded-lg hover:bg-green-50 transition-all duration-200 border border-transparent hover:border-green-200 hover:shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                        <span className="text-gray-700 group-hover:text-gray-900 font-medium text-sm">
                          Tendencia
                        </span>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Footer del dropdown */}
              <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                <p className="text-gray-500 text-sm">
                  Envío gratis en pedidos superiores a $150.000
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
