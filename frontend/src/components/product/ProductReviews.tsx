'use client'

import React, { useState } from 'react'
import { User, Calendar, ShieldCheck, Edit2, Trash2, Plus, Star } from 'lucide-react'
import StarRating from '@/components/ui/StarRating'
import { useReviews, Review, CreateReviewData } from '@/hooks/useReviews'
import { useAuth } from '@/hooks/useAuth'
import { formatPrice } from '@/utils/currency'

interface ProductReviewsProps {
  productId: number
  productName: string
}

export default function ProductReviews({ productId, productName }: ProductReviewsProps) {
  const { user } = useAuth()
  const { reviews, isLoading, createReview, updateReview, deleteReview, getReviewStats } = useReviews(productId)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingReview, setEditingReview] = useState<number | null>(null)
  const [starFilter, setStarFilter] = useState<number | null>(null)
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest')

  const stats = getReviewStats()
  const userReview = reviews.find(review => review.user === user?.id)

  // Filtrar y ordenar reseñas
  const filteredAndSortedReviews = reviews
    .filter(review => {
      if (starFilter === null) return true
      return review.rating === starFilter
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'highest':
          return b.rating - a.rating
        case 'lowest':
          return a.rating - b.rating
        default:
          return 0
      }
    })

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white">
      {/* Header con estadísticas - Estilo Adidas */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            Valoraciones ({stats.totalReviews})
          </h3>
          {stats.totalReviews > 0 && (
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-gray-900">
                  {stats.averageRating}
                </span>
                <div className="flex flex-col">
                  <StarRating rating={stats.averageRating} size="lg" />
                  <span className="text-sm text-gray-500 mt-1">
                    {stats.totalReviews} {stats.totalReviews === 1 ? 'reseña' : 'reseñas'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Botón para agregar reseña - Estilo Adidas */}
        {user && !userReview && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-900 text-gray-900 font-medium rounded-sm hover:bg-gray-900 hover:text-white transition-colors text-sm"
          >
            Escribir una reseña
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Filtros y ordenamiento - Estilo Adidas */}
      {stats.totalReviews > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-8">
            {/* Filtros por estrellas */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Filtrar por estrellas</h4>
              <div className="flex gap-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution]
                  const isActive = starFilter === rating
                  return (
                    <button
                      key={rating}
                      onClick={() => setStarFilter(isActive ? null : rating)}
                      className={`flex items-center gap-1 px-3 py-1.5 border text-sm font-medium rounded-sm transition-colors ${
                        isActive
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-300 text-gray-700 hover:border-gray-900 hover:text-gray-900'
                      }`}
                    >
                      <Star className="w-3 h-3 fill-current" />
                      {rating}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Ordenar por */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Ordenar por</h4>
              <div className="flex gap-2">
                {[
                  { value: 'newest', label: 'Novedades' },
                  { value: 'oldest', label: 'Más antiguas' },
                  { value: 'highest', label: 'Más altas' },
                  { value: 'lowest', label: 'Más bajas' }
                ].map((option) => {
                  const isActive = sortBy === option.value
                  return (
                    <button
                      key={option.value}
                      onClick={() => setSortBy(option.value as any)}
                      className={`px-3 py-1.5 border text-sm font-medium rounded-sm transition-colors ${
                        isActive
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-300 text-gray-700 hover:border-gray-900 hover:text-gray-900'
                      }`}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formulario para agregar reseña */}
      {showAddForm && (
        <AddReviewForm
          productName={productName}
          onSubmit={async (data) => {
            await createReview(data)
            setShowAddForm(false)
          }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Lista de reseñas */}
      <div>
        {filteredAndSortedReviews.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-gray-600">
                {starFilter ? `No hay reseñas de ${starFilter} estrellas` : 'Aún no hay reseñas para este producto'}
              </p>
              <p className="text-sm text-gray-500">
                {starFilter ? 'Intenta con otro filtro' : '¡Sé el primero en escribir una!'}
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredAndSortedReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                isOwner={user?.id === review.user}
                isEditing={editingReview === review.id}
                onEdit={() => setEditingReview(review.id)}
                onCancelEdit={() => setEditingReview(null)}
                onUpdate={async (data) => {
                  await updateReview(review.id, data)
                  setEditingReview(null)
                }}
                onDelete={() => deleteReview(review.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Componente para agregar nueva reseña
interface AddReviewFormProps {
  productName: string
  onSubmit: (data: CreateReviewData) => Promise<void>
  onCancel: () => void
}

function AddReviewForm({ productName, onSubmit, onCancel }: AddReviewFormProps) {
  const [formData, setFormData] = useState<CreateReviewData>({
    rating: 5,
    title: '',
    comment: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.comment.trim()) {
      return
    }

    try {
      setIsSubmitting(true)
      await onSubmit(formData)
    } catch (error) {
      // El error ya se maneja en el hook
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h4 className="text-gray-900 font-semibold mb-4">Escribir Reseña para {productName}</h4>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating */}
        <div>
          <label className="block text-gray-900 text-sm font-medium mb-2">
            Calificación
          </label>
          <StarRating
            rating={formData.rating}
            interactive
            size="lg"
            onRatingChange={(rating) => setFormData(prev => ({ ...prev, rating }))}
          />
        </div>

        {/* Título */}
        <div>
          <label className="block text-gray-900 text-sm font-medium mb-2">
            Título de la reseña
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Resume tu experiencia..."
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            maxLength={200}
            required
          />
        </div>

        {/* Comentario */}
        <div>
          <label className="block text-gray-900 text-sm font-medium mb-2">
            Tu reseña
          </label>
          <textarea
            value={formData.comment}
            onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
            placeholder="Comparte tu experiencia con este producto..."
            rows={4}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            required
          />
        </div>

        {/* Botones */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting || !formData.title.trim() || !formData.comment.trim()}
            className="px-4 py-2 bg-gray-900 text-white font-medium rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Publicando...' : 'Publicar Reseña'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-900 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}

// Componente para mostrar una reseña individual
interface ReviewCardProps {
  review: Review
  isOwner: boolean
  isEditing: boolean
  onEdit: () => void
  onCancelEdit: () => void
  onUpdate: (data: Partial<CreateReviewData>) => Promise<void>
  onDelete: () => void
}

function ReviewCard({ 
  review, 
  isOwner, 
  isEditing, 
  onEdit, 
  onCancelEdit, 
  onUpdate, 
  onDelete 
}: ReviewCardProps) {
  const [editData, setEditData] = useState({
    rating: review.rating,
    title: review.title,
    comment: review.comment
  })
  const [isUpdating, setIsUpdating] = useState(false)

  const handleUpdate = async () => {
    try {
      setIsUpdating(true)
      await onUpdate(editData)
    } catch (error) {
      // El error ya se maneja en el hook
    } finally {
      setIsUpdating(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (isEditing) {
    return (
      <div className="py-4 border-b border-gray-200 last:border-b-0">
        <div className="space-y-4">
          {/* Rating */}
          <div>
            <label className="block text-gray-900 text-sm font-medium mb-2">
              Calificación
            </label>
            <StarRating
              rating={editData.rating}
              interactive
              onRatingChange={(rating) => setEditData(prev => ({ ...prev, rating }))}
            />
          </div>

          {/* Título */}
          <div>
            <input
              type="text"
              value={editData.title}
              onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-sm text-gray-900 focus:outline-none focus:border-gray-900"
              maxLength={200}
              placeholder="Título de la reseña"
              aria-label="Título de la reseña"
            />
          </div>

          {/* Comentario */}
          <div>
            <textarea
              value={editData.comment}
              onChange={(e) => setEditData(prev => ({ ...prev, comment: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-sm text-gray-900 focus:outline-none focus:border-gray-900 resize-none"
              placeholder="Tu comentario"
              aria-label="Comentario de la reseña"
            />
          </div>

          {/* Botones */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="px-3 py-1 bg-gray-900 text-white text-sm font-medium rounded-sm hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {isUpdating ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              onClick={onCancelEdit}
              className="px-3 py-1 border border-gray-300 text-gray-900 text-sm rounded-sm hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-4 border-b border-gray-200 last:border-b-0">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          {/* Rating y usuario */}
          <div className="flex items-center gap-3 mb-2">
            <StarRating rating={review.rating} />
            <span className="text-gray-900 font-medium text-sm">{review.user_details}</span>
            {review.is_verified_purchase && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Compra verificada</span>
            )}
          </div>
          
          {/* Fecha */}
          <div className="text-xs text-gray-500 mb-3">
            {formatDate(review.created_at)}
          </div>
        </div>

        {/* Acciones para el dueño */}
        {isOwner && (
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="p-1 text-gray-400 hover:text-gray-900 transition-colors"
              title="Editar reseña"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (confirm('¿Estás seguro de que deseas eliminar esta reseña?')) {
                  onDelete()
                }
              }}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              title="Eliminar reseña"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="space-y-3">
        <h4 className="text-gray-900 font-medium text-sm">{review.title}</h4>
        <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
        

      </div>
    </div>
  )
}
