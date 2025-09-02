import { useState, useEffect, useCallback } from 'react'
import { cartApi } from '@/lib/api'
import { Cart, CartItem, Product, ProductVariant } from '@/types'
import toast from 'react-hot-toast'

interface CartState {
  cart: Cart | null
  items: CartItem[]
  totalItems: number
  totalPrice: number
  isLoading: boolean
  error: string | null
}

export const useCart = () => {
  const [cartState, setCartState] = useState<CartState>({
    cart: null,
    items: [],
    totalItems: 0,
    totalPrice: 0,
    isLoading: true,
    error: null,
  })

  // Load cart on mount
  useEffect(() => {
    loadCart()
  }, [])

  const loadCart = useCallback(async () => {
    try {
      setCartState(prev => ({ ...prev, isLoading: true, error: null }))
      
      const cart = await cartApi.getCart()
      
      setCartState({
        cart,
        items: cart.items || [],
        totalItems: cart.total_items || 0,
        totalPrice: cart.total_price || 0,
        isLoading: false,
        error: null,
      })
    } catch (error: any) {
      console.error('Failed to load cart:', error)
      setCartState(prev => ({
        ...prev,
        isLoading: false,
        error: error.response?.data?.detail || 'Error al cargar el carrito',
      }))
    }
  }, [])

  const addToCart = useCallback(async (productId: number, quantity: number = 1, variantId?: number) => {
    try {
      setCartState(prev => ({ ...prev, isLoading: true, error: null }))
      
      const data = {
        product: productId,
        quantity,
        ...(variantId && { variant: variantId }),
      }
      
      await cartApi.addToCart(data)
      
      // Reload cart to get updated data
      await loadCart()
      
      toast.success('Producto agregado al carrito')
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Error al agregar al carrito'
      setCartState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }))
      toast.error(errorMessage)
    }
  }, [loadCart])

  const updateCartItem = useCallback(async (itemId: number, quantity: number) => {
    try {
      setCartState(prev => ({ ...prev, isLoading: true, error: null }))
      
      await cartApi.updateCartItem(itemId, { quantity })
      
      // Reload cart to get updated data
      await loadCart()
      
      toast.success('Carrito actualizado')
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Error al actualizar el carrito'
      setCartState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }))
      toast.error(errorMessage)
    }
  }, [loadCart])

  const removeFromCart = useCallback(async (itemId: number) => {
    try {
      setCartState(prev => ({ ...prev, isLoading: true, error: null }))
      
      await cartApi.removeFromCart(itemId)
      
      // Reload cart to get updated data
      await loadCart()
      
      toast.success('Producto eliminado del carrito')
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Error al eliminar del carrito'
      setCartState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }))
      toast.error(errorMessage)
    }
  }, [loadCart])

  const clearCart = useCallback(async () => {
    try {
      setCartState(prev => ({ ...prev, isLoading: true, error: null }))
      
      await cartApi.clearCart()
      
      setCartState({
        cart: null,
        items: [],
        totalItems: 0,
        totalPrice: 0,
        isLoading: false,
        error: null,
      })
      
      toast.success('Carrito vaciado')
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Error al vaciar el carrito'
      setCartState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }))
      toast.error(errorMessage)
    }
  }, [])

  const addToWishlist = useCallback(async (productId: number) => {
    try {
      await cartApi.addToWishlist(productId)
      toast.success('Producto agregado a favoritos')
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Error al agregar a favoritos'
      toast.error(errorMessage)
    }
  }, [])

  const removeFromWishlist = useCallback(async (itemId: number) => {
    try {
      await cartApi.removeFromWishlist(itemId)
      toast.success('Producto eliminado de favoritos')
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Error al eliminar de favoritos'
      toast.error(errorMessage)
    }
  }, [])

  const getWishlist = useCallback(async () => {
    try {
      const wishlist = await cartApi.getWishlist()
      return wishlist
    } catch (error: any) {
      console.error('Failed to load wishlist:', error)
      toast.error('Error al cargar favoritos')
      return null
    }
  }, [])

  const isInCart = useCallback((productId: number, variantId?: number) => {
    return cartState.items.some(item => 
      item.product === productId && 
      (variantId ? item.variant === variantId : !item.variant)
    )
  }, [cartState.items])

  const getCartItemQuantity = useCallback((productId: number, variantId?: number) => {
    const item = cartState.items.find(item => 
      item.product === productId && 
      (variantId ? item.variant === variantId : !item.variant)
    )
    return item ? item.quantity : 0
  }, [cartState.items])

  const getCartItem = useCallback((productId: number, variantId?: number) => {
    return cartState.items.find(item => 
      item.product === productId && 
      (variantId ? item.variant === variantId : !item.variant)
    )
  }, [cartState.items])

  return {
    ...cartState,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    addToWishlist,
    removeFromWishlist,
    getWishlist,
    isInCart,
    getCartItemQuantity,
    getCartItem,
    loadCart,
  }
}

export default useCart
