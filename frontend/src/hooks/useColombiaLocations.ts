import { useState, useEffect, useCallback } from 'react'

export interface Department {
  id: number
  name: string
  code: string
}

export interface City {
  id: number
  name: string
  departmentId: number
}

export const useColombiaLocations = () => {
  const [departments, setDepartments] = useState<Department[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false)
  const [isLoadingCities, setIsLoadingCities] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar departamentos de Colombia
  const loadDepartments = useCallback(async () => {
    try {
      setIsLoadingDepartments(true)
      setError(null)
      
      const response = await fetch('https://api-colombia.com/api/v1/Department')
      if (!response.ok) {
        throw new Error('Error al cargar departamentos')
      }
      
      const data = await response.json()
      setDepartments(data)
    } catch (err: any) {
      console.error('Error al cargar departamentos:', err)
      setError(err.message)
    } finally {
      setIsLoadingDepartments(false)
    }
  }, [])

  // Cargar ciudades por departamento
  const loadCitiesByDepartment = useCallback(async (departmentId: number) => {
    try {
      setIsLoadingCities(true)
      setError(null)
      
      const response = await fetch(`https://api-colombia.com/api/v1/Department/${departmentId}/cities`)
      if (!response.ok) {
        throw new Error('Error al cargar ciudades')
      }
      
      const data = await response.json()
      setCities(data)
    } catch (err: any) {
      console.error('Error al cargar ciudades:', err)
      setError(err.message)
    } finally {
      setIsLoadingCities(false)
    }
  }, [])

  // Cargar departamentos al montar el componente
  useEffect(() => {
    loadDepartments()
  }, [loadDepartments])

  return {
    departments,
    cities,
    isLoadingDepartments,
    isLoadingCities,
    error,
    loadCitiesByDepartment
  }
}
