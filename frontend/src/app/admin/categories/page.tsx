"use client"

import { useState } from 'react'
import { Tag, Search, Filter, MoreVertical, Edit, Trash2, Plus } from 'lucide-react'

// Mock data para categorías
const mockCategories = [
  {
    id: 1,
    name: 'Ropa Deportiva',
    slug: 'ropa-deportiva',
    description: 'Ropa para deportes y actividades físicas',
    is_active: true,
    sort_order: 1,
    created_at: '2024-01-01',
    updated_at: '2024-01-15'
  },
  {
    id: 2,
    name: 'Ropa Casual',
    slug: 'ropa-casual',
    description: 'Ropa cómoda para uso diario',
    is_active: true,
    sort_order: 2,
    created_at: '2024-01-01',
    updated_at: '2024-01-15'
  }
]

export default function CategoriesPage() {
  const [categories] = useState(mockCategories)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Categorías</h1>
          <p className="text-dark-400 mt-2">Gestiona las categorías de productos</p>
        </div>
        <button className="px-4 py-2 bg-neon-green text-dark-900 font-medium rounded-lg hover:bg-neon-green/90 transition-colors">
          Nueva Categoría
        </button>
      </div>

      {/* Filters */}
      <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar categorías..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
            />
          </div>
          <button className="px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white hover:bg-dark-600 transition-colors flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
          </button>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-700">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-white">Categoría</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white">Descripción</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white">Estado</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white">Orden</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-white">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {filteredCategories.map((category) => (
                <tr key={category.id} className="hover:bg-dark-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-neon-green rounded-full flex items-center justify-center">
                        <Tag className="w-5 h-5 text-dark-900" />
                      </div>
                      <div>
                        <div className="text-white font-medium">{category.name}</div>
                        <div className="text-dark-400 text-sm">/{category.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-dark-400">{category.description}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      category.is_active 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {category.is_active ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-dark-400">{category.sort_order}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="p-2 text-dark-400 hover:text-white transition-colors" title="Editar">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-dark-400 hover:text-red-400 transition-colors" title="Eliminar">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-400 text-sm">Total Categorías</p>
              <p className="text-2xl font-bold text-white">{categories.length}</p>
            </div>
            <Tag className="w-8 h-8 text-neon-green" />
          </div>
        </div>
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-400 text-sm">Categorías Activas</p>
              <p className="text-2xl font-bold text-white">
                {categories.filter(c => c.is_active).length}
              </p>
            </div>
            <Tag className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-400 text-sm">Categorías Inactivas</p>
              <p className="text-2xl font-bold text-white">
                {categories.filter(c => !c.is_active).length}
              </p>
            </div>
            <Tag className="w-8 h-8 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  )
}