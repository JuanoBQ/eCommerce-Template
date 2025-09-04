import { ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

interface SelectOption {
  value: string | number
  label: string
}

interface SelectProps {
  options: SelectOption[]
  value: string | number
  onChange: (value: string | number) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  error?: boolean
  loading?: boolean
}

export default function Select({
  options,
  value,
  onChange,
  placeholder = 'Seleccionar...',
  disabled = false,
  className = '',
  error = false,
  loading = false
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selectRef = useRef<HTMLDivElement>(null)

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = options.find(option => option.value === value)

  const handleSelect = (optionValue: string | number) => {
    onChange(optionValue)
    setIsOpen(false)
  }

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      <button
        type="button"
        onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
        disabled={disabled || loading}
        className={`
          w-full px-4 py-3 text-left bg-white border rounded-md
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-colors duration-200
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${disabled || loading ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'hover:border-gray-400'}
        `}
      >
        <div className="flex items-center justify-between">
          <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
            {loading ? 'Cargando...' : selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown 
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        </div>
      </button>

      {isOpen && !disabled && !loading && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {options.length === 0 ? (
            <div className="px-4 py-3 text-gray-500 text-sm">
              No hay opciones disponibles
            </div>
          ) : (
            options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`
                  w-full px-4 py-3 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none
                  transition-colors duration-150
                  ${option.value === value ? 'bg-blue-50 text-blue-700' : 'text-gray-900'}
                `}
              >
                {option.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
