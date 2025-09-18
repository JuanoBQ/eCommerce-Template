"use client"

import { lazy, Suspense } from 'react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// Lazy load de componentes pesados
export const ProductDetail = lazy(() => import('@/components/product/ProductDetail'))
export const AdminPanel = lazy(() => import('@/components/admin/AdminPanel'))
export const PaymentForm = lazy(() => import('@/components/payments/PaymentForm'))
export const CartSidebar = lazy(() => import('@/components/cart/CartSidebar'))
export const WishlistDropdown = lazy(() => import('@/components/layout/WishlistDropdown'))

// Componente wrapper con Suspense
interface LazyWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function LazyWrapper({ children, fallback }: LazyWrapperProps) {
  return (
    <Suspense fallback={fallback || <LoadingSpinner />}>
      {children}
    </Suspense>
  )
}

// Componentes específicos con lazy loading
export function LazyProductDetail(props: any) {
  return (
    <LazyWrapper>
      <ProductDetail {...props} />
    </LazyWrapper>
  )
}

export function LazyAdminPanel(props: any) {
  return (
    <LazyWrapper>
      <AdminPanel {...props} />
    </LazyWrapper>
  )
}

export function LazyPaymentForm(props: any) {
  return (
    <LazyWrapper>
      <PaymentForm {...props} />
    </LazyWrapper>
  )
}

export function LazyCartSidebar(props: any) {
  return (
    <LazyWrapper>
      <CartSidebar {...props} />
    </LazyWrapper>
  )
}

export function LazyWishlistDropdown(props: any) {
  return (
    <LazyWrapper>
      <WishlistDropdown {...props} />
    </LazyWrapper>
  )
}
