import React from 'react'

interface TableSkeletonProps {
  rows?: number
  columns?: number
  showHeader?: boolean
}

const TableSkeleton: React.FC<TableSkeletonProps> = ({ 
  rows = 5, 
  columns = 4, 
  showHeader = true 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {showHeader && (
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-4">
            {Array.from({ length: columns }).map((_, index) => (
              <div key={index} className="h-4 bg-gray-200 rounded animate-pulse flex-1"></div>
            ))}
          </div>
        </div>
      )}
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4">
            <div className="flex items-center space-x-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div key={colIndex} className="h-4 bg-gray-200 rounded animate-pulse flex-1"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TableSkeleton
