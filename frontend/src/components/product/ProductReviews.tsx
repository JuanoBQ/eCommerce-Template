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

  const stats = getReviewStats()
  const userReview = reviews.find(review => review.user === user?.id)

  if (isLoading) {
    return (
      <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-dark-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-dark-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
      {/* Header con estadísticas */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Reseñas y Calificaciones
          </h3>
          {stats.totalReviews > 0 && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <StarRating rating={stats.averageRating} showValue size="lg" />
                <span className="text-white text-lg font-medium">
                  {stats.averageRating}/5
                </span>
              </div>
              <span className="text-dark-400">
                ({stats.totalReviews} {stats.totalReviews === 1 ? 'reseña' : 'reseñas'})
              </span>
            </div>
          )}
        </div>

        {/* Botón para agregar reseña */}
        {user && !userReview && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-neon-green text-dark-900 font-medium rounded-lg hover:bg-neon-green/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Escribir Reseña
          </button>
        )}
      </div>

      {/* Distribución de ratings */}
      {stats.totalReviews > 0 && (
        <div className="mb-8 p-4 bg-dark-700/50 rounded-lg">
          <h4 className="text-white font-medium mb-3">Distribución de Calificaciones</h4>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution]
              const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0
              
              return (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-12">
                    <span className="text-white text-sm">{rating}</span>
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="flex-1 h-2 bg-dark-600 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-neon-green transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-dark-400 text-sm w-8">{count}</span>
                </div>
              )
            })}
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
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-dark-400 mb-4">
              <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Aún no hay reseñas para este producto</p>
              <p className="text-sm">¡Sé el primero en escribir una!</p>
            </div>
          </div>
        ) : (
          reviews.map((review) => (
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
          ))
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
    <div className="mb-6 p-4 bg-dark-700/50 rounded-lg border border-dark-600">
      <h4 className="text-white font-medium mb-4">Escribir Reseña para {productName}</h4>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating */}
        <div>
          <label className="block text-white text-sm font-medium mb-2">
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
          <label className="block text-white text-sm font-medium mb-2">
            Título de la reseña
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Resume tu experiencia..."
            className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
            maxLength={200}
            required
          />
        </div>

        {/* Comentario */}
        <div>
          <label className="block text-white text-sm font-medium mb-2">
            Tu reseña
          </label>
          <textarea
            value={formData.comment}
            onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
            placeholder="Comparte tu experiencia con este producto..."
            rows={4}
            className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent resize-none"
            required
          />
        </div>

        {/* Botones */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting || !formData.title.trim() || !formData.comment.trim()}
            className="px-4 py-2 bg-neon-green text-dark-900 font-medium rounded-lg hover:bg-neon-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Publicando...' : 'Publicar Reseña'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-dark-600 text-white rounded-lg hover:bg-dark-700 transition-colors"
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
      <div className="p-4 bg-dark-700/30 border border-dark-600 rounded-lg">
        <div className="space-y-4">
          {/* Rating */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
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
              className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-neon-green"
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
              className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-neon-green resize-none"
              placeholder="Tu comentario"
              aria-label="Comentario de la reseña"
            />
          </div>

          {/* Botones */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="px-3 py-1 bg-neon-green text-dark-900 text-sm font-medium rounded hover:bg-neon-green/90 transition-colors disabled:opacity-50"
            >
              {isUpdating ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              onClick={onCancelEdit}
              className="px-3 py-1 border border-dark-600 text-white text-sm rounded hover:bg-dark-700 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 bg-dark-700/30 border border-dark-600 rounded-lg">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-neon-green/20 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-neon-green" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-medium">{review.user_details}</span>
              {review.is_verified_purchase && (
                <ShieldCheck className="w-4 h-4 text-green-500" title="Compra verificada" />
              )}
            </div>
            <div className="flex items-center gap-2 text-dark-400 text-sm">
              <Calendar className="w-3 h-3" />
              {formatDate(review.created_at)}
            </div>
          </div>
        </div>

        {/* Acciones para el dueño */}
        {isOwner && (
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="p-1 text-dark-400 hover:text-white transition-colors"
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
              className="p-1 text-dark-400 hover:text-red-400 transition-colors"
              title="Eliminar reseña"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Rating */}
      <div className="mb-3">
        <StarRating rating={review.rating} />
      </div>

      {/* Contenido */}
      <div className="space-y-2">
        <h4 className="text-white font-medium">{review.title}</h4>
        <p className="text-dark-300 leading-relaxed">{review.comment}</p>
      </div>
    </div>
  )
}
