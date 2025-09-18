'use client'

import React from 'react'

const ProductDetailLoader: React.FC = () => {
  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm">
            <div className="h-4 bg-gray-100 rounded w-12"></div>
            <span className="text-gray-400">/</span>
            <div className="h-4 bg-gray-100 rounded w-16"></div>
            <span className="text-gray-400">/</span>
            <div className="h-4 bg-gray-100 rounded w-24"></div>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Galería de imágenes */}
          <div className="space-y-4">
            {/* Información de imágenes */}
            <div className="flex items-center justify-between text-sm bg-gray-50 px-3 py-2 rounded-lg">
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>

            {/* Imagen principal */}
            <div className="aspect-square bg-gray-100 border border-gray-200 rounded-xl"></div>

            {/* Descripción completa debajo de la imagen */}
            <div className="mt-6">
              <div className="h-5 bg-gray-100 rounded w-24 mb-3"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-100 rounded w-full"></div>
                <div className="h-4 bg-gray-100 rounded w-4/5"></div>
                <div className="h-4 bg-gray-100 rounded w-3/5"></div>
              </div>
            </div>

            {/* Miniaturas */}
            <div className="space-y-2">
              <div className="h-4 bg-gray-100 rounded w-32"></div>
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="aspect-square bg-gray-100 border border-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>

            {/* Navegación de imágenes */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg w-20 h-8"></div>
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg w-20 h-8"></div>
            </div>
          </div>

          {/* Información del producto */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              {/* Título */}
              <div className="h-9 bg-gray-100 rounded w-3/4 mb-4"></div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="h-4 bg-gray-100 rounded w-20"></div>
                <div className="h-4 bg-gray-100 rounded w-16"></div>
              </div>

              {/* Precio */}
              <div className="flex items-center gap-3 mb-4">
                <div className="h-9 bg-gray-100 rounded w-32"></div>
                <div className="h-6 bg-gray-100 rounded w-20"></div>
                <div className="h-6 bg-gray-100 rounded w-12"></div>
              </div>

              {/* Descripción corta */}
              <div className="mb-6">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-full"></div>
                  <div className="h-4 bg-gray-100 rounded w-4/5"></div>
                  <div className="h-4 bg-gray-100 rounded w-3/5"></div>
                </div>
              </div>
            </div>

            {/* Variantes */}
            <div className="space-y-6">
              {/* Tallas */}
              <div>
                <div className="h-6 bg-gray-100 rounded w-16 mb-3"></div>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="h-10 bg-gray-100 rounded w-16"></div>
                  ))}
                </div>
              </div>

              {/* Colores */}
              <div>
                <div className="h-6 bg-gray-100 rounded w-16 mb-3"></div>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="w-10 h-10 bg-gray-100 rounded-full"></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Cantidad */}
            <div>
              <div className="h-6 bg-gray-100 rounded w-20 mb-3"></div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-white border border-gray-300 rounded-md">
                  <div className="w-8 h-8 bg-gray-100 rounded"></div>
                  <div className="w-12 h-8 bg-gray-100 rounded"></div>
                  <div className="w-8 h-8 bg-gray-100 rounded"></div>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3">
              <div className="flex-1 h-12 bg-gray-100 rounded"></div>
              <div className="w-12 h-12 bg-gray-100 rounded"></div>
              <div className="w-12 h-12 bg-gray-100 rounded"></div>
            </div>

            {/* Información de envío */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-gray-100 rounded"></div>
                  <div className="h-4 bg-gray-100 rounded w-48"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews section */}
        <div className="mt-16 space-y-6">
          <div className="h-8 bg-gray-100 rounded w-48"></div>
          
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-24"></div>
                    <div className="h-3 bg-gray-100 rounded w-16"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-full"></div>
                  <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Loading indicator */}
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-gray-500">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-primary-500 rounded-full animate-spin"></div>
            <span className="text-sm font-medium">Cargando producto...</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailLoader
