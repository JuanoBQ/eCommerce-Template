import { useState, useEffect, useCallback } from 'react'
import { CartItem, Product } from '@/types'
import toast from 'react-hot-toast'

interface CartState {
  items: CartItem[]
  totalItems: number
  totalPrice: number
}

// Global cart state
let globalCartState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
}

// Global listeners for state changes
let listeners: Set<() => void> = new Set()

// Function to notify all listeners
const notifyListeners = () => {
  listeners.forEach(listener => listener())
}

// Function to update global state
const updateGlobalState = (newState: CartState) => {
  globalCartState = newState
  localStorage.setItem('fitstore_cart', JSON.stringify(newState))
  notifyListeners()
}

export const useCartGlobal = () => {
  const [, forceUpdate] = useState({})

  // Force re-render
  const rerender = useCallback(() => {
    forceUpdate({})
  }, [])

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('fitstore_cart')
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart)
        globalCartState = cartData
        console.log('Cart loaded from storage:', cartData)
      } catch (error) {
        console.error('Error loading cart:', error)
      }
    }

    // Add listener
    listeners.add(rerender)

    // Cleanup listener on unmount
    return () => {
      listeners.delete(rerender)
    }
  }, [rerender])

  const addToCart = useCallback((product: Product, quantity: number = 1) => {
    console.log('Adding to cart:', product.id, product.name, quantity)

    const existingItemIndex = globalCartState.items.findIndex(item => item.product === product.id)
    let newItems: CartItem[]

    if (existingItemIndex >= 0) {
      // Update existing item
      newItems = [...globalCartState.items]
      const newQuantity = newItems[existingItemIndex].quantity + quantity
      newItems[existingItemIndex] = {
        ...newItems[existingItemIndex],
        quantity: newQuantity,
        total_price: product.price * newQuantity
      }
      console.log('Updated existing item:', newItems[existingItemIndex])
    } else {
      // Add new item
      const newItem: CartItem = {
        id: Date.now(),
        cart: 1,
        product: product.id,
        variant: undefined,
        quantity,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        product_details: product,
        unit_price: product.price,
        total_price: product.price * quantity
      }
      newItems = [...globalCartState.items, newItem]
      console.log('Added new item:', newItem)
    }

    const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0)
    const totalPrice = newItems.reduce((sum, item) => sum + (item.total_price || 0), 0)

    const newState = {
      items: newItems,
      totalItems,
      totalPrice,
    }

    console.log('New cart state:', newState)
    updateGlobalState(newState)
    
    toast.success('Producto agregado al carrito')
  }, [])

  const updateCartItem = useCallback((itemId: number, quantity: number) => {
    const newItems = globalCartState.items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          quantity,
          total_price: (item.unit_price || 0) * quantity
        }
      }
      return item
    }).filter(item => item.quantity > 0)

    const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0)
    const totalPrice = newItems.reduce((sum, item) => sum + (item.total_price || 0), 0)

    const newState = {
      items: newItems,
      totalItems,
      totalPrice,
    }

    updateGlobalState(newState)
    toast.success('Carrito actualizado')
  }, [])

  const removeFromCart = useCallback((itemId: number) => {
    const newItems = globalCartState.items.filter(item => item.id !== itemId)
    const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0)
    const totalPrice = newItems.reduce((sum, item) => sum + (item.total_price || 0), 0)

    const newState = {
      items: newItems,
      totalItems,
      totalPrice,
    }

    updateGlobalState(newState)
    toast.success('Producto eliminado del carrito')
  }, [])

  const clearCart = useCallback(() => {
    const newState = {
      items: [],
      totalItems: 0,
      totalPrice: 0,
    }

    updateGlobalState(newState)
    toast.success('Carrito vaciado')
  }, [])

  const isInCart = useCallback((productId: number) => {
    return globalCartState.items.some(item => item.product === productId)
  }, [])

  const getCartItemQuantity = useCallback((productId: number) => {
    const item = globalCartState.items.find(item => item.product === productId)
    return item ? item.quantity : 0
  }, [])

  // Debug: Log every time the hook returns values (commented out for production)
  // console.log('useCartGlobal returning:', {
  //   items: globalCartState.items.length,
  //   totalItems: globalCartState.totalItems,
  //   totalPrice: globalCartState.totalPrice
  // })

  return {
    items: globalCartState.items,
    totalItems: globalCartState.totalItems,
    totalPrice: globalCartState.totalPrice,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    isInCart,
    getCartItemQuantity,
  }
}

export default useCartGlobal
