'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ChevronDown, Shirt, Zap, Star, Tag, ArrowRight, Flame, Heart, Gift, Trophy, Target, Users, Sparkles } from 'lucide-react'
import { useGenderCategories } from '@/hooks/useGenderCategories'
import { motion, AnimatePresence } from 'framer-motion'

interface NavigationDropdownProps {
  title: string
  gender: 'men' | 'women'
  className?: string
}

export default function NavigationDropdown({ title, gender, className = '' }: NavigationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { categories, isLoading, error } = useGenderCategories(gender)
  const timeoutRef = useRef<NodeJS.Timeout>()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Mapear género para la URL
  const getGenderForUrl = (navGender: 'men' | 'women') => {
    return navGender === 'men' ? 'masculino' : 'femenino'
  }


  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 200) // Delay de 200ms antes de cerrar
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
      {/* Trigger con efecto de extensión */}
      <button className="relative flex items-center gap-1 text-sm text-gray-700 hover:text-primary-600 transition-all duration-300 font-medium uppercase tracking-wide group py-4 px-2">
        {title}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <ChevronDown className="w-3 h-3 group-hover:text-primary-500" />
        </motion.div>
        
        {/* Indicador de extensión */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isOpen ? 1 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          style={{ originX: 0 }}
        />
      </button>

      {/* Dropdown Menu estilo Adidas */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay invisible para mantener el hover */}
            <div className="absolute top-full left-0 w-64 h-4 z-40" />
            
            <motion.div
              initial={{ opacity: 0, y: -20, scaleY: 0 }}
              animate={{ opacity: 1, y: 0, scaleY: 1 }}
              exit={{ opacity: 0, y: -20, scaleY: 0 }}
              transition={{ 
                duration: 0.4, 
                ease: "easeOut",
                scaleY: { duration: 0.3, ease: "easeOut" }
              }}
              style={{ originY: 0 }}
              className="absolute top-full left-0 w-64 bg-white shadow-2xl z-50 overflow-hidden rounded-lg"
            >
              <div className="py-4">
                {/* Lista simple de categorías - Una sola columna */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className="min-w-48"
                >
                  <div className="space-y-0">
                    {isLoading ? (
                      // Estado de carga
                      <div className="space-y-2">
                        {[...Array(5)].map((_, index) => (
                          <motion.div 
                            key={index}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                            className="h-8 bg-gray-100 animate-pulse rounded"
                          />
                        ))}
                      </div>
                    ) : error ? (
                      // Estado de error
                      <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                        <p className="text-red-600 text-sm">Error al cargar categorías</p>
                      </div>
                    ) : categories.length === 0 ? (
                      // Sin categorías
                      <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                        <p className="text-gray-500 text-sm">No hay categorías disponibles</p>
                      </div>
                    ) : (
                      // Categorías cargadas
                      <>
                        {categories.slice(0, 8).map((category, index) => (
                          <motion.div
                            key={category.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + index * 0.05, duration: 0.2 }}
                          >
                            <Link
                              href={`/tienda?category=${category.id}&gender=${getGenderForUrl(gender)}&from_nav=true&clear_filters=true`}
                              className="group flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-all duration-200 border-b border-gray-100 last:border-b-0"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {category.name}
                                </span>
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                  {category.productCount}
                                </span>
                              </div>
                              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                            </Link>
                          </motion.div>
                        ))}
                        
                        {/* Enlace para ver todas las categorías */}
                        {categories.length > 8 && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7, duration: 0.2 }}
                          >
                            <Link
                              href={`/tienda?gender=${getGenderForUrl(gender)}&from_nav=true&clear_filters=true`}
                              className="group flex items-center justify-center px-4 py-3 text-sm text-primary-600 hover:text-primary-700 hover:bg-primary-50 transition-all duration-200 border-t border-gray-200 mt-2"
                            >
                              <span className="font-medium">
                                Ver todas las categorías ({categories.length})
                              </span>
                            </Link>
                          </motion.div>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
