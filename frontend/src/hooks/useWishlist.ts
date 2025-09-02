import { useState, useEffect, useCallback } from 'react'
import { Product } from '@/types'
import toast from 'react-hot-toast'

interface WishlistItem {
  id: number
  product: Product
  added_at: string
}

// Global wishlist state
let globalWishlistState: WishlistItem[] = []

// Global listeners for state changes
let listeners: Set<() => void> = new Set()

// Function to notify all listeners
const notifyListeners = () => {
  listeners.forEach(listener => listener())
}

// Function to update global state
const updateGlobalState = (newState: WishlistItem[]) => {
  globalWishlistState = newState
  localStorage.setItem('fitstore_wishlist', JSON.stringify(newState))
  notifyListeners()
}

export const useWishlist = () => {
  const [, forceUpdate] = useState({})

  // Force re-render
  const rerender = useCallback(() => {
    forceUpdate({})
  }, [])

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem('fitstore_wishlist')
    if (savedWishlist) {
      try {
        const wishlistData = JSON.parse(savedWishlist)
        globalWishlistState = wishlistData
        console.log('Wishlist loaded from storage:', wishlistData)
      } catch (error) {
        console.error('Error loading wishlist:', error)
        globalWishlistState = []
      }
    }

    // Add listener
    listeners.add(rerender)

    // Cleanup listener on unmount
    return () => {
      listeners.delete(rerender)
    }
  }, [rerender])

  // Add to wishlist
  const addToWishlist = useCallback((product: Product) => {
    console.log('Adding to wishlist:', product.id, product.name)

    // Check if product is already in wishlist
    const existingItem = globalWishlistState.find(item => item.product.id === product.id)
    
    if (existingItem) {
      toast.error('Este producto ya está en tu lista de deseos')
      return
    }

    // Add new item
    const newItem: WishlistItem = {
      id: Date.now(),
      product,
      added_at: new Date().toISOString()
    }

    const newState = [...globalWishlistState, newItem]
    updateGlobalState(newState)
    toast.success('Producto agregado a tu lista de deseos')
    console.log('Added to wishlist:', newItem)
  }, [])

  // Remove from wishlist
  const removeFromWishlist = useCallback((productId: number) => {
    console.log('Removing from wishlist:', productId)

    const newState = globalWishlistState.filter(item => item.product.id !== productId)
    updateGlobalState(newState)
    toast.success('Producto eliminado de tu lista de deseos')
    console.log('Removed from wishlist:', productId)
  }, [])

  // Check if product is in wishlist
  const isInWishlist = useCallback((productId: number) => {
    return globalWishlistState.some(item => item.product.id === productId)
  }, [])

  // Clear wishlist
  const clearWishlist = useCallback(() => {
    updateGlobalState([])
    toast.success('Lista de deseos vaciada')
  }, [])

  // Get wishlist items
  const getWishlistItems = useCallback(() => {
    return globalWishlistState
  }, [])

  // Get wishlist count
  const getWishlistCount = useCallback(() => {
    return globalWishlistState.length
  }, [])

  return {
    items: globalWishlistState,
    count: globalWishlistState.length,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    getWishlistItems,
    getWishlistCount
  }
}
