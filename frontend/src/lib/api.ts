import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ApiResponse, ApiError } from '@/types'

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Debug: Log the base URL
console.log('🔍 API Client - Base URL:', api.defaults.baseURL);

  // Request interceptor
  api.interceptors.request.use(
    (config) => {
      console.log('🔍 API Client - Enviando petición:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        fullURL: `${config.baseURL}${config.url}`
      });
      
      // Add auth token if available
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
          console.log('🔍 API Client - Token de autenticación agregado');
        } else {
          console.log('🔍 API Client - No hay token de autenticación');
        }
      }
      return config
    },
    (error) => {
      console.error('🔍 API Client - Error en request interceptor:', error);
      return Promise.reject(error)
    }
  )

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('🔍 API Client - Respuesta recibida:', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      data: response.data
    });
    return response
  },
  async (error) => {
    console.error('🔍 API Client - Error en respuesta:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message
    });
    
    const originalRequest = error.config

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('🔍 API Client - Error 401, intentando refrescar token');
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refresh_token')
        if (refreshToken) {
          console.log('🔍 API Client - Refrescando token...');
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/auth/token/refresh/`,
            { refresh: refreshToken }
          )

          const { access } = response.data
          localStorage.setItem('access_token', access)
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`
          console.log('🔍 API Client - Token refrescado, reintentando petición');
          return api(originalRequest)
        }
      } catch (refreshError) {
        console.error('🔍 API Client - Error al refrescar token:', refreshError);
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        if (typeof window !== 'undefined') {
          // Mostrar mensaje de sesión expirada
          console.warn('Sesión expirada. Redirigiendo al login...')
          window.location.href = '/auth/login'
        }
      }
    }

    return Promise.reject(error)
  }
)

// Generic API methods
export const apiClient = {
  // GET request
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await api.get<T>(url, config)
    return response.data
  },

  // POST request
  post: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await api.post<T>(url, data, config)
    return response.data
  },

  // PUT request
  put: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await api.put<T>(url, data, config)
    return response.data
  },

  // PATCH request
  patch: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await api.patch<T>(url, data, config)
    return response.data
  },

  // DELETE request
  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await api.delete<T>(url, config)
    return response.data
  },

  // Upload file
  upload: async <T>(url: string, file: File, onProgress?: (progress: number) => void): Promise<T> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    })

    return response.data
  },
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login/', { email, password }),

  register: (userData: any) =>
    apiClient.post('/auth/registration/', userData),

  logout: () =>
    apiClient.post('/auth/logout/', {}),

  refreshToken: (refresh: string) =>
    apiClient.post('/auth/token/refresh/', { refresh }),

  verifyToken: (token: string) =>
    apiClient.post('/auth/token/verify/', { token }),

  resetPassword: (email: string) =>
    apiClient.post('/auth/password/reset/', { email }),

  confirmPasswordReset: (data: any) =>
    apiClient.post('/auth/password/reset/confirm/', data),

  changePassword: (data: any) =>
    apiClient.post('/users/change-password/', data),
}

// Products API
export const productsApi = {
  getProducts: (params?: any) =>
    apiClient.get<ApiResponse<any>>('/products/', { params }),

  getProduct: (id: number) =>
    apiClient.get(`/products/${id}/`),

  createProduct: (data: any) =>
    apiClient.post('/products/', data),

  updateProduct: (id: number, data: any) =>
    apiClient.patch(`/products/${id}/`, data),

  deleteProduct: (id: number) =>
    apiClient.delete(`/products/${id}/`),

  getProductVariants: (productId: number) =>
    apiClient.get(`/products/${productId}/variants/`),

  createProductVariant: (productId: number, data: any) =>
    apiClient.post(`/products/${productId}/variants/`, data),

  updateProductVariant: (productId: number, variantId: number, data: any) =>
    apiClient.patch(`/products/${productId}/variants/${variantId}/`, data),

  deleteProductVariant: (productId: number, variantId: number) =>
    apiClient.delete(`/products/${productId}/variants/${variantId}/`),

  getProductReviews: (productId: number, params?: any) =>
    apiClient.get<ApiResponse<any>>(`/products/${productId}/reviews/`, { params }),

  createProductReview: (productId: number, data: any) =>
    apiClient.post(`/products/${productId}/reviews/`, data),

  uploadProductImage: (productId: number, file: File, onProgress?: (progress: number) => void) =>
    apiClient.upload(`/products/${productId}/images/`, file, onProgress),

  uploadVariantImage: (variantId: number, file: File, onProgress?: (progress: number) => void) =>
    apiClient.upload(`/products/variants/${variantId}/image/`, file, onProgress),
}

// Categories API
export const categoriesApi = {
  getCategories: (params?: any) =>
    apiClient.get<ApiResponse<any>>('/categories/categories/', { params }),

  getCategory: (id: number) =>
    apiClient.get(`/categories/categories/${id}/`),

  createCategory: (data: any) =>
    apiClient.post('/categories/categories/', data),

  updateCategory: (id: number, data: any) =>
    apiClient.patch(`/categories/categories/${id}/`, data),

  deleteCategory: (id: number) =>
    apiClient.delete(`/categories/categories/${id}/`),

  getBrands: (params?: any) =>
    apiClient.get<ApiResponse<any>>('/categories/brands/', { params }),

  getBrand: (id: number) =>
    apiClient.get(`/categories/brands/${id}/`),

  createBrand: (data: any) =>
    apiClient.post('/categories/brands/', data),

  updateBrand: (id: number, data: any) =>
    apiClient.patch(`/categories/brands/${id}/`, data),

  deleteBrand: (id: number) =>
    apiClient.delete(`/categories/brands/${id}/`),

  getSizes: (type?: 'clothing' | 'shoes' | 'accessories') =>
    apiClient.get<ApiResponse<any>>('/categories/sizes/', { 
      params: type ? { type } : {} 
    }),

  getSize: (id: number) =>
    apiClient.get(`/categories/sizes/${id}/`),

  createSize: (data: any) =>
    apiClient.post('/categories/sizes/', data),

  updateSize: (id: number, data: any) =>
    apiClient.patch(`/categories/sizes/${id}/`, data),

  deleteSize: (id: number) =>
    apiClient.delete(`/categories/sizes/${id}/`),

  getColors: (params?: any) =>
    apiClient.get<ApiResponse<any>>('/categories/colors/', { params }),

  getColor: (id: number) =>
    apiClient.get(`/categories/colors/${id}/`),

  createColor: (data: any) =>
    apiClient.post('/categories/colors/', data),

  updateColor: (id: number, data: any) =>
    apiClient.patch(`/categories/colors/${id}/`, data),

  deleteColor: (id: number) =>
    apiClient.delete(`/categories/colors/${id}/`),
}

// Cart API
export const cartApi = {
  getCart: () =>
    apiClient.get('/cart/'),

  addToCart: (data: any) =>
    apiClient.post('/cart/items/', data),

  updateCartItem: (itemId: number, data: any) =>
    apiClient.patch(`/cart/items/${itemId}/`, data),

  removeFromCart: (itemId: number) =>
    apiClient.delete(`/cart/items/${itemId}/`),

  clearCart: () =>
    apiClient.delete('/cart/clear/'),

  getWishlist: () =>
    apiClient.get('/cart/wishlist/'),

  addToWishlist: (productId: number) =>
    apiClient.post('/cart/wishlist/', { product: productId }),

  removeFromWishlist: (itemId: number) =>
    apiClient.delete(`/cart/wishlist/${itemId}/`),
}

// Orders API
export const ordersApi = {
  getOrders: (params?: any) =>
    apiClient.get<ApiResponse<any>>('/orders/', { params }),

  getOrder: (id: number) =>
    apiClient.get(`/orders/${id}/`),

  createOrder: (data: any) =>
    apiClient.post('/orders/', data),

  updateOrder: (id: number, data: any) =>
    apiClient.patch(`/orders/${id}/`, data),

  cancelOrder: (id: number) =>
    apiClient.post(`/orders/${id}/cancel/`),

  getOrderItems: (orderId: number) =>
    apiClient.get(`/orders/${orderId}/items/`),

  getOrderStatusHistory: (orderId: number) =>
    apiClient.get(`/orders/${orderId}/status-history/`),

  addOrderNote: (orderId: number, data: any) =>
    apiClient.post(`/orders/${orderId}/notes/`, data),
}

// Payments API
export const paymentsApi = {
  getPayments: (params?: any) =>
    apiClient.get<ApiResponse<any>>('/payments/', { params }),

  getPayment: (id: number) =>
    apiClient.get(`/payments/${id}/`),

  createPayment: (data: any) =>
    apiClient.post('/payments/', data),

  processPayment: (paymentId: number, data: any) =>
    apiClient.post(`/payments/${paymentId}/process/`, data),

  getRefunds: (params?: any) =>
    apiClient.get<ApiResponse<any>>('/payments/refunds/', { params }),

  createRefund: (data: any) =>
    apiClient.post('/payments/refunds/', data),


}

// Users API
export const usersApi = {
  getProfile: () =>
    apiClient.get('/users/profile/'),

  updateProfile: (data: any) =>
    apiClient.patch('/users/profile/', data),

  getUsers: (params?: any) =>
    apiClient.get<ApiResponse<any>>('/users/', { params }),

  // Addresses API - Usando endpoint simple que funciona
  getAddresses: () =>
    apiClient.get('/users/simple-addresses/'),

  createAddress: (data: any) =>
    apiClient.post('/users/simple-addresses/', data),

  updateAddress: (id: number, data: any) =>
    apiClient.patch(`/users/addresses/${id}/`, data),

  deleteAddress: (id: number) =>
    apiClient.delete(`/users/addresses/${id}/`),

  setDefaultAddress: (id: number) =>
    apiClient.post(`/users/addresses/${id}/set_default/`),

  getDefaultAddress: () =>
    apiClient.get('/users/addresses/default/'),

  getUser: (id: number) =>
    apiClient.get(`/users/${id}/`),

  updateUser: (id: number, data: any) =>
    apiClient.patch(`/users/${id}/`, data),

  deleteUser: (id: number) =>
    apiClient.delete(`/users/${id}/`),
}

// Reports API
export const reportsApi = {
  getDashboardData: () =>
    apiClient.get('/reports/dashboard/'),

  // Claims API
  getClaims: (params?: any) =>
    apiClient.get<ApiResponse<any>>('/reports/claims/', { params }),

  getClaim: (id: number) =>
    apiClient.get(`/reports/claims/${id}/`),

  createClaim: (data: any) =>
    apiClient.post('/reports/claims/', data),

  updateClaim: (id: number, data: any) =>
    apiClient.patch(`/reports/claims/${id}/`, data),

  deleteClaim: (id: number) =>
    apiClient.delete(`/reports/claims/${id}/`),

  addMessage: (claimId: number, data: any) =>
    apiClient.post(`/reports/claims/${claimId}/add_message/`, data),

  getClaimsReport: () =>
    apiClient.get('/reports/claims-report/'),

  // Reviews API
  getReviewsReport: () =>
    apiClient.get('/reports/reviews/'),
}

export default api
