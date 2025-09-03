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
      <button className="flex items-center gap-1 text-white hover:text-neon-green transition-all duration-200 font-medium py-2 px-1 group">
        {title}
        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} group-hover:text-neon-green`} />
      </button>

      {/* Dropdown Menu - Diseño moderno y minimalista */}
      {isOpen && (
        <>
          {/* Overlay invisible para mantener el hover */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-screen max-w-4xl h-4 z-40" />
          
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 w-screen max-w-4xl bg-white/95 backdrop-blur-md border border-gray-200/20 rounded-2xl shadow-2xl z-50 overflow-hidden">
            <div className="p-8">
              {/* Header minimalista */}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-dark-900 mb-2">
                  {title}
                </h3>
                <p className="text-dark-600 text-sm">
                  Descubre nuestra colección completa
                </p>
              </div>

              {/* Grid de contenido */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Columna 1: Ver Todo */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Shirt className="w-5 h-5 text-neon-green" />
                    <span className="text-dark-900 font-semibold text-sm uppercase tracking-wide">
                      Explorar
                    </span>
                  </div>
                  
                  <Link
                    href={`/tienda?gender=${gender}&from_nav=true&clear_filters=true`}
                    className="group block p-4 bg-gradient-to-r from-neon-green/10 to-neon-blue/10 rounded-xl hover:from-neon-green/20 hover:to-neon-blue/20 transition-all duration-300 border border-transparent hover:border-neon-green/30"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-dark-900 font-bold text-lg group-hover:text-neon-green transition-colors">
                          Ver Todo
                        </h4>
                        <p className="text-dark-600 text-sm">
                          Toda la colección
                        </p>
                      </div>
                      <ChevronDown className="w-5 h-5 text-neon-green rotate-[-90deg] group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </div>

                {/* Columna 2: Categorías */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-5 h-5 text-neon-green" />
                    <span className="text-dark-900 font-semibold text-sm uppercase tracking-wide">
                      Categorías
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {categories.slice(0, 4).map((category) => (
                      <Link
                        key={category.id}
                        href={`/tienda?category=${category.slug}&gender=${gender}&from_nav=true`}
                        className="group flex items-center justify-between p-3 rounded-lg hover:bg-dark-50 transition-all duration-200"
                      >
                        <span className="text-dark-700 group-hover:text-dark-900 font-medium">
                          {category.name}
                        </span>
                        <ChevronDown className="w-4 h-4 text-dark-400 rotate-[-90deg] group-hover:text-neon-green group-hover:translate-x-1 transition-all" />
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Columna 3: Destacados */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-5 h-5 text-neon-green" />
                    <span className="text-dark-900 font-semibold text-sm uppercase tracking-wide">
                      Especiales
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <Link
                      href={`/tienda?gender=${gender}&featured=true&from_nav=true`}
                      className="group block p-3 rounded-lg hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 transition-all duration-200 border border-transparent hover:border-yellow-200"
                    >
                      <div className="flex items-center gap-3">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-dark-700 group-hover:text-dark-900 font-medium">
                          Destacados
                        </span>
                      </div>
                    </Link>
                    
                    <Link
                      href={`/tienda?gender=${gender}&sale=true&from_nav=true`}
                      className="group block p-3 rounded-lg hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-200 border border-transparent hover:border-red-200"
                    >
                      <div className="flex items-center gap-3">
                        <Tag className="w-4 h-4 text-red-500" />
                        <span className="text-dark-700 group-hover:text-dark-900 font-medium">
                          Ofertas
                        </span>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Footer del dropdown */}
              <div className="mt-8 pt-6 border-t border-gray-200/30 text-center">
                <p className="text-dark-500 text-xs">
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
