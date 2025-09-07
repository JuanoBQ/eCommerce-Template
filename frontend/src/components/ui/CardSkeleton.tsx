import React from 'react'

interface CardSkeletonProps {
  count?: number
  showImage?: boolean
  showActions?: boolean
}

const CardSkeleton: React.FC<CardSkeletonProps> = ({ 
  count = 6, 
  showImage = true, 
  showActions = true 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {showImage && (
            <div className="h-48 bg-gray-200 animate-pulse"></div>
          )}
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
            </div>
            <div className="flex items-center justify-between">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-20"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
            </div>
            {showActions && (
              <div className="flex space-x-2">
                <div className="h-8 bg-gray-200 rounded animate-pulse flex-1"></div>
                <div className="h-8 bg-gray-200 rounded animate-pulse flex-1"></div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default CardSkeleton
