"use client"

import React, { useState, useCallback, useMemo } from 'react'
import { X, Filter, Search, ChevronDown, ChevronUp, SlidersHorizontal, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export interface FilterOption {
  id: string
  label: string
  value: string | number | null
  count?: number
}

export interface FilterGroup {
  id: string
  label: string
  options: FilterOption[]
  type: 'single' | 'multiple'
  collapsible?: boolean
}

export interface StoreFiltersProps {
  filterGroups: FilterGroup[]
  activeFilters: Record<string, (string | number | null)[]>
  onFilterChange: (groupId: string, values: (string | number | null)[]) => void
  onClearAll: () => void
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  className?: string
  isMobile?: boolean
  showSearch?: boolean
  isLoading?: boolean
}

const FilterChip: React.FC<{
  label: string
  onRemove: () => void
  groupLabel: string
}> = ({ label, onRemove, groupLabel }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
  >
    <span className="text-xs text-gray-500">{groupLabel}:</span>
    <span>{label}</span>
    <button
      onClick={onRemove}
      className="ml-1 hover:bg-gray-300 rounded-full p-0.5 transition-colors"
      aria-label={`Quitar filtro ${label}`}
    >
      <X className="w-3 h-3" />
    </button>
  </motion.div>
)

const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'sm' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }
  
  return (
    <Loader2 className={`${sizeClasses[size]} animate-spin text-primary-500`} />
  )
}

const LoadingOverlay: React.FC<{ isLoading: boolean }> = ({ isLoading }) => (
  <AnimatePresence>
    {isLoading && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl shadow-lg border border-gray-200"
        >
          <LoadingSpinner size="md" />
          <span className="text-sm font-medium text-gray-700">Cargando filtros...</span>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
)

const FilterGroup: React.FC<{
  group: FilterGroup
  activeValues: (string | number | null)[]
  onToggle: (value: string | number | null) => void
  isExpanded: boolean
  onToggleExpanded: () => void
}> = React.memo(({ group, activeValues, onToggle, isExpanded, onToggleExpanded }) => {
  const filteredOptions = group.options

  const hasActiveValues = activeValues.length > 0

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={onToggleExpanded}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        aria-expanded={isExpanded ? 'true' : 'false'}
        type="button"
      >
        <div className="flex items-center gap-3">
          <span className="font-medium text-gray-900">{group.label}</span>
          {hasActiveValues && (
            <span className="bg-primary-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
              {activeValues.length}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400 transition-transform duration-200" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400 transition-transform duration-200" />
        )}
      </button>

      <AnimatePresence mode="wait">
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ 
              duration: 0.3,
              ease: "easeInOut"
            }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">

              <div className="space-y-2">
                {filteredOptions.map((option) => {
                  const isActive = activeValues.includes(option.value)
                  return (
                    <motion.label
                      key={option.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                    >
                      <input
                        type={group.type === 'multiple' ? 'checkbox' : 'radio'}
                        name={group.type === 'single' ? group.id : undefined}
                        checked={isActive}
                        onChange={() => onToggle(option.value)}
                        aria-label={`${group.type === 'multiple' ? 'Seleccionar' : 'Elegir'} ${option.label}`}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 transition-all duration-200"
                      />
                      <span className="flex-1 text-sm text-gray-700">{option.label}</span>
                      {option.count !== undefined && (
                        <span className="text-xs text-gray-500">({option.count})</span>
                      )}
                    </motion.label>
                  )
                })}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

FilterGroup.displayName = 'FilterGroup'

const MobileFilterDrawer: React.FC<{
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}> = ({ isOpen, onClose, children }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl z-50 flex flex-col"
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Cerrar filtros"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
)

export const StoreFilters: React.FC<StoreFiltersProps> = ({
  filterGroups,
  activeFilters,
  onFilterChange,
  onClearAll,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Buscar productos...",
  className = "",
  isMobile = false,
  showSearch = true,
  isLoading = false
}) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)

  const toggleGroupExpanded = useCallback((groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev)
      if (newSet.has(groupId)) {
        newSet.delete(groupId)
      } else {
        newSet.add(groupId)
      }
      return newSet
    })
  }, [])

  const handleFilterToggle = useCallback((groupId: string, value: string | number | null) => {
    // handleFilterToggle called
    const group = filterGroups.find(g => g.id === groupId)
    if (!group) return

    const currentValues = activeFilters[groupId] || []
    
    if (group.type === 'single') {
      // Single filter - calling onFilterChange
      onFilterChange(groupId, [value])
    } else {
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value]
      // Multiple filter - calling onFilterChange
      onFilterChange(groupId, newValues)
    }
  }, [filterGroups, activeFilters, onFilterChange])

  // Memoizar las funciones de toggle para evitar re-renders
  const toggleFunctions = useMemo(() => {
    const functions: Record<string, (value: string | number | null) => void> = {}
    filterGroups.forEach(group => {
      functions[group.id] = (value: string | number | null) => handleFilterToggle(group.id, value)
    })
    return functions
  }, [filterGroups, handleFilterToggle])

  const toggleExpandedFunctions = useMemo(() => {
    const functions: Record<string, () => void> = {}
    filterGroups.forEach(group => {
      functions[group.id] = () => toggleGroupExpanded(group.id)
    })
    return functions
  }, [filterGroups, toggleGroupExpanded])

  const activeFiltersList = useMemo(() => {
    const list: Array<{ groupId: string; groupLabel: string; value: string | number | null; label: string }> = []
    
    Object.entries(activeFilters).forEach(([groupId, values]) => {
      const group = filterGroups.find(g => g.id === groupId)
      if (!group) return

      values.forEach(value => {
        const option = group.options.find(o => o.value === value)
        if (option) {
          list.push({
            groupId,
            groupLabel: group.label,
            value,
            label: option.label
          })
        }
      })
    })

    return list
  }, [activeFilters, filterGroups])

  const hasActiveFilters = activeFiltersList.length > 0

  const filterContent = useMemo(() => {
    return (
      <div className="space-y-0">
        {filterGroups.map((group) => {
          const activeValues = activeFilters[group.id] || []
          
          return (
            <FilterGroup
              key={group.id}
              group={group}
              activeValues={activeValues}
              onToggle={toggleFunctions[group.id]}
              isExpanded={expandedGroups.has(group.id)}
              onToggleExpanded={toggleExpandedFunctions[group.id]}
            />
          )
        })}
      </div>
    )
  }, [filterGroups, activeFilters, expandedGroups, toggleFunctions, toggleExpandedFunctions])

  if (isMobile) {
    return (
      <div className={className}>
        {/* Mobile Search Bar */}
        {showSearch && (
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        )}

        {/* Mobile Filter Button */}
        <button
          onClick={() => setIsMobileDrawerOpen(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filtros</span>
          {hasActiveFilters && (
            <span className="bg-gray-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
              {activeFiltersList.length}
            </span>
          )}
        </button>

        {/* Active Filters Chips */}
        {hasActiveFilters && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Filtros activos:</span>
              <button
                onClick={onClearAll}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Limpiar todos
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {activeFiltersList.map((filter) => (
                  <FilterChip
                    key={`${filter.groupId}-${filter.value}`}
                    label={filter.label}
                    groupLabel={filter.groupLabel}
                    onRemove={() => {
                      const group = filterGroups.find(g => g.id === filter.groupId)
                      if (group) {
                        const newValues = (activeFilters[filter.groupId] || []).filter(v => v !== filter.value)
                        onFilterChange(filter.groupId, newValues)
                      }
                    }}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Mobile Filter Drawer */}
        <MobileFilterDrawer
          isOpen={isMobileDrawerOpen}
          onClose={() => setIsMobileDrawerOpen(false)}
        >
          <div className="relative">
            {filterContent}
            <LoadingOverlay isLoading={isLoading} />
          </div>
        </MobileFilterDrawer>
      </div>
    )
  }

  return (
    <div className={`bg-transparent ${className}`}>
      {/* Desktop Search Bar */}
      {showSearch && (
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm"
            />
          </div>
        </div>
      )}

      {/* Desktop Filter Groups */}
      <div className="relative bg-white rounded-lg shadow-sm overflow-hidden">
        <div>
          {filterContent}
        </div>
        <LoadingOverlay isLoading={isLoading} />

        {/* Active Filters and Clear Button */}
        {hasActiveFilters && (
          <div className="px-6 py-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Filtros activos:</span>
              <button
                onClick={onClearAll}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Limpiar todos
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {activeFiltersList.map((filter) => (
                  <FilterChip
                    key={`${filter.groupId}-${filter.value}`}
                    label={filter.label}
                    groupLabel={filter.groupLabel}
                    onRemove={() => {
                      const group = filterGroups.find(g => g.id === filter.groupId)
                      if (group) {
                        const newValues = (activeFilters[filter.groupId] || []).filter(v => v !== filter.value)
                        onFilterChange(filter.groupId, newValues)
                      }
                    }}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StoreFilters
