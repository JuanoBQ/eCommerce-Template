import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './button'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  isLoading?: boolean
  showInfo?: boolean
  totalItems?: number
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
  showInfo = true,
  totalItems
}: PaginationProps) {
  if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      // Mostrar todas las páginas si son pocas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Lógica para mostrar páginas con ellipsis
      const startPage = Math.max(1, currentPage - 2)
      const endPage = Math.min(totalPages, currentPage + 2)

      if (startPage > 1) {
        pages.push(1)
        if (startPage > 2) pages.push('...')
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
  }

  const handlePageClick = (page: number | string) => {
    if (typeof page === 'number' && !isLoading) {
      onPageChange(page)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 mt-12">
      {/* Controles de paginación */}
      <div className="flex items-center gap-2">
        {/* Botón Anterior */}
        <Button
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          variant="outline"
          className="px-4 py-2"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Anterior
        </Button>

        {/* Números de página */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => (
            <div key={index}>
              {page === '...' ? (
                <span className="px-3 py-2 text-gray-500">...</span>
              ) : (
                <Button
                  onClick={() => handlePageClick(page as number)}
                  disabled={isLoading}
                  variant={page === currentPage ? "primary" : "outline"}
                  className={`px-3 py-2 min-w-[40px] ${
                    page === currentPage
                      ? 'bg-primary-500 text-white hover:bg-primary-600'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {page}
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Botón Siguiente */}
        <Button
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
          variant="outline"
          className="px-4 py-2"
        >
          Siguiente
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {/* Información de paginación */}
      {showInfo && (
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Página {currentPage} de {totalPages}
            {totalItems && ` • Total: ${totalItems} productos`}
          </p>
        </div>
      )}
    </div>
  )
}
