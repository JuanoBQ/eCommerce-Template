'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react'
import { Size, Color } from '@/hooks/useSizesAndColors'
import { formatPrice } from '@/utils/currency'

interface ProductVariant {
  id?: number
  size?: number
  color?: number
  size_details?: Size
  color_details?: Color
  inventory_quantity?: number
  image?: File
  image_url?: string
}

interface ProductVariantsProps {
  variants: ProductVariant[]
  sizes: Size[]
  colors: Color[]
  onVariantsChange: (variants: ProductVariant[]) => void
  onRegisterFunctions?: (functions: {
    getVariantsToDelete: () => number[]
    getActiveVariants: () => ProductVariant[]
    clearVariantsToDelete: () => void
  }) => void
  selectedCategory?: number // ID de la categoría seleccionada
}

export default function ProductVariants({
  variants,
  sizes,
  colors,
  onVariantsChange,
  onRegisterFunctions,
  selectedCategory
}: ProductVariantsProps) {
  const [editingVariant, setEditingVariant] = useState<number | null>(null)
  const [newVariant, setNewVariant] = useState<Partial<ProductVariant>>({
    size: undefined,
    color: undefined,
    inventory_quantity: 0,
    image: undefined
  })

  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedSizeType, setSelectedSizeType] = useState<'clothing' | 'shoes' | 'accessories' | undefined>(undefined)
  const [variantsToDelete, setVariantsToDelete] = useState<number[]>([])

  // Filtrar tallas basado en el tipo seleccionado
  const getFilteredSizes = (sizeType?: 'clothing' | 'shoes' | 'accessories'): Size[] => {
    if (!sizeType) {
      return sizes
    }
    return sizes.filter(size => size.type === sizeType)
  }

  // Generar SKU automáticamente
  const generateSKU = (sizeId?: number, colorId?: number) => {
    const size = sizes.find(s => s.id === sizeId)
    const color = colors.find(c => c.id === colorId)
    
    let sku = 'VAR'
    if (size) sku += `-${size.name}`
    if (color) sku += `-${color.name.substring(0, 3).toUpperCase()}`
    sku += `-${Date.now().toString().slice(-4)}`
    
    return sku
  }

  const handleAddVariant = () => {
    if (!newVariant.size && !newVariant.color) {
      alert('Debe seleccionar al menos una talla o un color')
      return
    }

    const variant: ProductVariant = {
      size: newVariant.size,
      color: newVariant.color,
      inventory_quantity: newVariant.inventory_quantity || 0,
      image: newVariant.image
    }

    onVariantsChange([...variants, variant])
    setNewVariant({
      size: undefined,
      color: undefined,
      inventory_quantity: 0,
      image: undefined
    })
    setSelectedSizeType(undefined)
    setShowAddForm(false)
  }

  const handleUpdateVariant = (index: number, updatedVariant: ProductVariant) => {
    const newVariants = [...variants]
    newVariants[index] = updatedVariant
    onVariantsChange(newVariants)
    setEditingVariant(null)
  }

  const handleDeleteVariant = (index: number) => {
    if (confirm('¿Está seguro de que desea eliminar esta variante?')) {
      const variant = variants[index]
      if (variant.id) {
        // Marcar variante existente para eliminación
        setVariantsToDelete(prev => [...prev, variant.id!])
      } else {
        // Eliminar variante nueva inmediatamente (no tiene ID)
        const newVariants = variants.filter((_, i) => i !== index)
        onVariantsChange(newVariants)
      }
    }
  }

  const getVariantDisplayName = (variant: ProductVariant) => {
    const parts = []
    if (variant.size_details) parts.push(variant.size_details.name)
    if (variant.color_details) parts.push(variant.color_details.name)
    return parts.length > 0 ? parts.join(' - ') : 'Sin variantes'
  }

  // Función para obtener los detalles de talla basándose en el ID
  const getSizeDetails = (sizeId: number | undefined) => {
    if (!sizeId) return null
    const found = sizes.find(size => size.id === sizeId)
    return found || null
  }

  // Función para obtener los detalles de color basándose en el ID
  const getColorDetails = (colorId: number | undefined) => {
    if (!colorId) return null
    const found = colors.find(color => color.id === colorId)
    return found || null
  }

  // Función para obtener los detalles de talla desde variant.size_details
  const getSizeDetailsFromVariant = (variant: ProductVariant) => {
    // Si size_details es un objeto completo, lo devolvemos
    if (variant.size_details && typeof variant.size_details === 'object' && variant.size_details.name) {
      return variant.size_details
    }
    // Si size_details es un ID (número), lo buscamos
    if (variant.size_details && typeof variant.size_details === 'number') {
      return getSizeDetails(variant.size_details)
    }
    // Si tenemos size ID, lo buscamos
    if (variant.size) {
      return getSizeDetails(variant.size)
    }
    return null
  }

  // Función para obtener los detalles de color desde variant.color_details
  const getColorDetailsFromVariant = (variant: ProductVariant) => {
    // Si color_details es un objeto completo, lo devolvemos
    if (variant.color_details && typeof variant.color_details === 'object' && variant.color_details.name) {
      return variant.color_details
    }
    // Si color_details es un ID (número), lo buscamos
    if (variant.color_details && typeof variant.color_details === 'number') {
      return getColorDetails(variant.color_details)
    }
    // Si tenemos color ID, lo buscamos
    if (variant.color) {
      return getColorDetails(variant.color)
    }
    return null
  }

  // Función para obtener las variantes que deben eliminarse
  const getVariantsToDelete = () => {
    return variantsToDelete
  }

  // Función para obtener las variantes activas (sin las marcadas para eliminación)
  const getActiveVariants = () => {
    return variants.filter(variant => !variant.id || !variantsToDelete.includes(variant.id))
  }

  // Función para limpiar las variantes marcadas para eliminación
  const clearVariantsToDelete = () => {
    setVariantsToDelete([])
  }

  // Registrar las funciones con el componente padre
  React.useEffect(() => {
    if (onRegisterFunctions) {
      onRegisterFunctions({
        getVariantsToDelete,
        getActiveVariants,
        clearVariantsToDelete
      })
    }
  }, [onRegisterFunctions, getVariantsToDelete, getActiveVariants, clearVariantsToDelete])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Variantes del Producto
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Selecciona tallas y colores para crear variantes del producto
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="w-4 h-4 mr-1" />
          Agregar Variante
        </button>
      </div>

      {/* Formulario para agregar nueva variante */}
      {showAddForm && (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h4 className="text-md font-medium text-gray-900 mb-4">
            Nueva Variante
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tipo de Talla
              </label>
              <select
                value={selectedSizeType || ''}
                onChange={(e) => {
                  const type = e.target.value as 'clothing' | 'shoes' | 'accessories' | ''
                  setSelectedSizeType(type || undefined)
                  setNewVariant({ ...newVariant, size: undefined }) // Reset size when type changes
                }}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                title="Seleccionar tipo de talla"
                aria-label="Seleccionar tipo de talla"
              >
                <option value="">Seleccionar tipo de talla</option>
                <option value="clothing">Ropa (S, M, L, XL)</option>
                <option value="shoes">Calzado (35, 36, 37...)</option>
                <option value="accessories">Accesorios (Talla Única)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Talla
              </label>
              <select
                value={newVariant.size || ''}
                onChange={(e) => setNewVariant({
                  ...newVariant,
                  size: e.target.value ? parseInt(e.target.value) : undefined
                })}
                disabled={!selectedSizeType}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
                title="Seleccionar talla"
                aria-label="Seleccionar talla"
              >
                <option value="">Seleccionar talla</option>
                {getFilteredSizes(selectedSizeType).map((size) => (
                  <option key={size.id} value={size.id}>
                    {size.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Color
              </label>
              <select
                value={newVariant.color || ''}
                onChange={(e) => setNewVariant({
                  ...newVariant,
                  color: e.target.value ? parseInt(e.target.value) : undefined
                })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                title="Seleccionar color"
                aria-label="Seleccionar color"
              >
                <option value="">Seleccionar color</option>
                {colors.map((color) => (
                  <option key={color.id} value={color.id}>
                    {color.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Cantidad en Stock
              </label>
              <input
                type="number"
                min="0"
                value={newVariant.inventory_quantity || 0}
                onChange={(e) => setNewVariant({
                  ...newVariant,
                  inventory_quantity: parseInt(e.target.value) || 0
                })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                title="Cantidad en stock para esta variante"
                aria-label="Cantidad en stock para esta variante"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Imagen de la Variante
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setNewVariant({
                      ...newVariant,
                      image: file
                    })
                  }
                }}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                title="Seleccionar imagen para esta variante"
                aria-label="Seleccionar imagen para esta variante"
              />
              {newVariant.image && (
                <p className="text-sm text-gray-600 mt-1">
                  Archivo seleccionado: {newVariant.image.name}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false)
                setSelectedSizeType(undefined)
                setNewVariant({
                  size: undefined,
                  color: undefined,
                  inventory_quantity: 0,
                  image: undefined
                })
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleAddVariant}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Agregar Variante
            </button>
          </div>
        </div>
      )}

      {/* Lista de variantes existentes */}
      <div className="space-y-4">
        {variants.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay variantes agregadas. Agregue al menos una variante para este producto.
          </div>
        ) : (
          <>
            <div className="text-sm text-gray-600 mb-4">
              Total de variantes: {variants.length} | Marcadas para eliminación: {variantsToDelete.length}
            </div>
            {          variants.map((variant, index) => {
            const isMarkedForDeletion = variant.id && variantsToDelete.includes(variant.id)

            return (
            <div key={index} className={`border rounded-lg p-4 ${
              isMarkedForDeletion 
                ? 'bg-red-50 border-red-200 opacity-60' 
                : 'bg-white border-gray-200'
            }`}>
              {editingVariant === index ? (
                <VariantEditForm
                  variant={variant}
                  sizes={sizes}
                  colors={colors}
                  selectedCategory={selectedCategory}
                  onSave={(updatedVariant) => handleUpdateVariant(index, updatedVariant)}
                  onCancel={() => setEditingVariant(null)}
                />
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {(() => {
                            const sizeDetails = getSizeDetailsFromVariant(variant)
                            const colorDetails = getColorDetailsFromVariant(variant)
                            
                            if (sizeDetails && colorDetails) {
                              return `${sizeDetails.name} - ${colorDetails.name}`
                            } else if (sizeDetails) {
                              return sizeDetails.name
                            } else if (colorDetails) {
                              return colorDetails.name
                            } else {
                              return 'Variante sin especificar'
                            }
                          })()}
                        </h4>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        <div className="grid grid-cols-2 gap-2">
                          {(() => {
                            const sizeDetails = getSizeDetailsFromVariant(variant)
                            return sizeDetails && (
                              <div>
                                <span className="font-medium">Talla:</span> {sizeDetails.name}
                                <span className={`text-xs px-2 py-1 rounded-full ml-2 ${
                                  sizeDetails.type === 'clothing' 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : sizeDetails.type === 'shoes'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-purple-100 text-purple-800'
                                }`}>
                                  {sizeDetails.type === 'clothing' ? 'Ropa' : 
                                   sizeDetails.type === 'shoes' ? 'Calzado' : 'Accesorios'}
                                </span>
                              </div>
                            )
                          })()}
                          {(() => {
                            const colorDetails = getColorDetailsFromVariant(variant)
                            return colorDetails && (
                              <div>
                                <span className="font-medium">Color:</span> {colorDetails.name}
                              </div>
                            )
                          })()}
                          <div>
                            <span className="font-medium">Stock:</span> 
                            <span className={`ml-1 ${
                              (variant.inventory_quantity || 0) === 0 
                                ? 'text-red-600 font-medium' 
                                : (variant.inventory_quantity || 0) <= (variant.low_stock_threshold || 5)
                                ? 'text-yellow-600 font-medium'
                                : 'text-green-600 font-medium'
                            }`}>
                              {variant.inventory_quantity || 0}
                            </span>
                            {(variant.inventory_quantity || 0) === 0 && (
                              <span className="text-xs text-red-500 ml-1">(Sin stock)</span>
                            )}
                            {(variant.inventory_quantity || 0) > 0 && (variant.inventory_quantity || 0) <= (variant.low_stock_threshold || 5) && (
                              <span className="text-xs text-yellow-500 ml-1">(Bajo stock)</span>
                            )}
                          </div>
                          {variant.sku && (
                            <div>
                              <span className="font-medium">SKU:</span> {variant.sku}
                            </div>
                          )}
                        </div>
                        {isMarkedForDeletion && (
                          <div className="text-red-600 font-medium text-xs mt-2">
                            ⚠️ Marcada para eliminación
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setEditingVariant(index)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                      title="Editar variante"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteVariant(index)}
                      className="p-2 text-gray-400 hover:text-red-600"
                      title="Eliminar variante"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
            )
            })}
          </>
        )}
      </div>
    </div>
  )
}

// Componente para editar variante
interface VariantEditFormProps {
  variant: ProductVariant
  sizes: Size[]
  colors: Color[]
  selectedCategory?: number
  onSave: (variant: ProductVariant) => void
  onCancel: () => void
}

function VariantEditForm({
  variant,
  sizes,
  colors,
  selectedCategory,
  onSave,
  onCancel
}: VariantEditFormProps) {
  const [editedVariant, setEditedVariant] = useState<ProductVariant>(variant)

  // Mapeo de categorías a tipos de talla (duplicado del componente principal)
  const getSizeTypeForCategory = (categoryId?: number): 'clothing' | 'shoes' | 'accessories' => {
    if (!categoryId) return 'clothing'
    
    // Mapeo específico de categorías a tipos de talla basado en los datos reales de la DB
    const categorySizeMapping: Record<number, 'clothing' | 'shoes' | 'accessories'> = {
      1: 'clothing',    // Ropa Deportiva
      2: 'shoes',       // Calzado  
      3: 'accessories', // Accesorios
      4: 'accessories', // Equipamiento
      5: 'clothing',    // Ropa Casual
      6: 'clothing',    // Ropa Formal
      7: 'clothing',    // Ropa Interior
    }
    
    return categorySizeMapping[categoryId] || 'clothing'
  }

  // Filtrar tallas basado en la categoría seleccionada
  const getFilteredSizes = (): Size[] => {
    if (!selectedCategory) {
      return sizes
    }
    
    const sizeType = getSizeTypeForCategory(selectedCategory)
    return sizes.filter(size => size.type === sizeType)
  }

  const handleSave = () => {
    onSave(editedVariant)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Talla {selectedCategory && (
              <span className="text-xs text-gray-500">
                ({getSizeTypeForCategory(selectedCategory) === 'clothing' ? 'Ropa' : 
                  getSizeTypeForCategory(selectedCategory) === 'shoes' ? 'Calzado' : 'Accesorios'})
              </span>
            )}
          </label>
          <select
            value={editedVariant.size || ''}
            onChange={(e) => setEditedVariant({
              ...editedVariant,
              size: e.target.value ? parseInt(e.target.value) : undefined
            })}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            title="Seleccionar talla"
            aria-label="Seleccionar talla"
          >
            <option value="">Seleccionar talla</option>
            {getFilteredSizes().map((size) => (
              <option key={size.id} value={size.id}>
                {size.name} ({size.type_display})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Color
          </label>
          <select
            value={editedVariant.color || ''}
            onChange={(e) => setEditedVariant({
              ...editedVariant,
              color: e.target.value ? parseInt(e.target.value) : undefined
            })}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            title="Seleccionar color"
            aria-label="Seleccionar color"
          >
            <option value="">Seleccionar color</option>
            {colors.map((color) => (
              <option key={color.id} value={color.id}>
                {color.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Cantidad en Stock
          </label>
          <input
            type="number"
            min="0"
            value={editedVariant.inventory_quantity || 0}
            onChange={(e) => setEditedVariant({
              ...editedVariant,
              inventory_quantity: parseInt(e.target.value) || 0
            })}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            title="Cantidad en stock para esta variante"
            aria-label="Cantidad en stock para esta variante"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Imagen de la Variante
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                setEditedVariant({
                  ...editedVariant,
                  image: file
                })
              }
            }}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            title="Seleccionar imagen para esta variante"
            aria-label="Seleccionar imagen para esta variante"
          />
          {editedVariant.image && (
            <p className="text-sm text-gray-600 mt-1">
              Archivo seleccionado: {editedVariant.image.name}
            </p>
          )}
          {editedVariant.image_url && !editedVariant.image && (
            <p className="text-sm text-gray-600 mt-1">
              Imagen actual: {editedVariant.image_url}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Guardar
        </button>
      </div>
    </div>
  )
}
