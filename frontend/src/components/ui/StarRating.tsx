'use client'

import React from 'react'
import { Star } from 'lucide-react'

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  interactive?: boolean
  onRatingChange?: (rating: number) => void
  className?: string
}

export default function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  showValue = false,
  interactive = false,
  onRatingChange,
  className = ''
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = React.useState(0)
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }
  
  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  const handleStarClick = (starRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating)
    }
  }

  const handleStarHover = (starRating: number) => {
    if (interactive) {
      setHoverRating(starRating)
    }
  }

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0)
    }
  }

  const getStarFill = (starIndex: number) => {
    const currentRating = interactive && hoverRating > 0 ? hoverRating : rating
    
    if (starIndex <= Math.floor(currentRating)) {
      return 'fill-yellow-400 text-yellow-400'
    } else if (starIndex <= currentRating) {
      // Estrella parcialmente llena
      return 'fill-yellow-200 text-yellow-400'
    } else {
      return 'fill-gray-200 text-gray-300'
    }
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div 
        className="flex items-center gap-0.5"
        onMouseLeave={handleMouseLeave}
      >
        {Array.from({ length: maxRating }, (_, index) => {
          const starIndex = index + 1
          return (
            <Star
              key={starIndex}
              className={`
                ${sizeClasses[size]} 
                ${getStarFill(starIndex)}
                ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}
              `}
              onClick={() => handleStarClick(starIndex)}
              onMouseEnter={() => handleStarHover(starIndex)}
            />
          )
        })}
      </div>
      
      {showValue && (
        <span className={`text-gray-600 ml-1 ${textSizeClasses[size]}`}>
          ({rating.toFixed(1)})
        </span>
      )}
    </div>
  )
}
