"use client"

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

interface DropdownOption {
  value: string | number | null
  label: string
  count?: number
}

interface DropdownProps {
  label: string
  options: DropdownOption[]
  value: string | number | null
  onChange: (value: string | number | null) => void
  placeholder?: string
  className?: string
}

export default function Dropdown({ 
  label, 
  options, 
  value, 
  onChange, 
  placeholder = "Seleccionar...",
  className = ""
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(option => option.value === value)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (optionValue: string | number | null) => {
    onChange(optionValue)
    setIsOpen(false)
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white hover:border-dark-600 transition-colors"
        aria-label={`${label} dropdown`}
      >
        <div className="flex flex-col items-start">
          <span className="text-sm text-dark-300">{label}</span>
          <span className="text-white font-medium">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown 
          className={`w-4 h-4 text-dark-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-dark-800 border border-dark-700 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option.value || 'all'}
              onClick={() => handleSelect(option.value)}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-dark-700 transition-colors first:rounded-t-lg last:rounded-b-lg"
            >
              <div className="flex items-center gap-3">
                <span className="text-white">{option.label}</span>
                {option.count !== undefined && (
                  <span className="text-dark-400 text-sm">({option.count})</span>
                )}
              </div>
              {option.value === value && (
                <Check className="w-4 h-4 text-neon-green" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
