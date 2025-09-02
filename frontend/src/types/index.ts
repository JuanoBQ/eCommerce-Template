// User Types
export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  phone?: string
  birth_date?: string
  avatar?: string
  is_vendor: boolean
  is_customer: boolean
  is_admin?: boolean
  is_staff?: boolean
  is_superuser?: boolean
  date_joined?: string
  default_address?: string
  default_city?: string
  default_state?: string
  default_country?: string
  default_postal_code?: string
  email_notifications: boolean
  sms_notifications: boolean
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: number
  user: number
  bio?: string
  website?: string
  favorite_categories: number[]
  preferred_size?: string
  preferred_brand?: string
  show_email: boolean
  show_phone: boolean
  created_at: string
  updated_at: string
}

export interface Address {
  id: number
  user: number
  type: 'home' | 'work' | 'other'
  is_default: boolean
  street_address: string
  apartment?: string
  city: string
  state: string
  country: string
  postal_code: string
  contact_name: string
  contact_phone: string
  delivery_instructions?: string
  created_at: string
  updated_at: string
}

// Category Types
export interface Category {
  id: number
  name: string
  slug: string
  description?: string
  image?: string
  icon?: string
  parent?: number
  is_active: boolean
  sort_order: number
  meta_title?: string
  meta_description?: string
  created_at: string
  updated_at: string
  children?: Category[]
}

export interface Brand {
  id: number
  name: string
  slug: string
  description?: string
  logo?: string
  website?: string
  is_active: boolean
  sort_order: number
  meta_title?: string
  meta_description?: string
  created_at: string
  updated_at: string
}

export interface Size {
  id: number
  name: string
  type: 'clothing' | 'shoes' | 'accessories'
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Color {
  id: number
  name: string
  hex_code?: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

// Product Types
export interface Product {
  id: number
  name: string
  slug: string
  description: string
  short_description?: string
  sku: string
  category: number
  brand?: number
  price: number
  compare_price?: number
  cost_price?: number
  track_inventory: boolean
  inventory_quantity: number
  low_stock_threshold: number
  allow_backorder: boolean
  status: 'draft' | 'published' | 'archived'
  is_featured: boolean
  is_digital: boolean
  requires_shipping: boolean
  weight?: number
  meta_title?: string
  meta_description?: string
  created_at: string
  updated_at: string
  published_at?: string
  images?: ProductImage[]
  variants?: ProductVariant[]
  reviews?: ProductReview[]
  tags?: ProductTag[]
  category_details?: Category
  brand_details?: Brand
}

export interface ProductImage {
  id: number
  product: number
  image: string
  alt_text?: string
  sort_order: number
  is_primary: boolean
  created_at: string
}

export interface ProductVariant {
  id: number
  product: number
  sku: string
  size?: number
  color?: number
  price?: number
  compare_price?: number
  inventory_quantity: number
  low_stock_threshold: number
  is_active: boolean
  weight?: number
  created_at: string
  updated_at: string
  size_details?: Size
  color_details?: Color
}

export interface ProductReview {
  id: number
  product: number
  user: number
  rating: number
  title: string
  comment: string
  is_verified_purchase: boolean
  is_approved: boolean
  created_at: string
  updated_at: string
  user_details?: User
}

export interface ProductTag {
  id: number
  name: string
  slug: string
  color: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// Cart Types
export interface Cart {
  id: number
  user: number
  created_at: string
  updated_at: string
  items?: CartItem[]
  total_items?: number
  total_price?: number
  is_empty?: boolean
}

export interface CartItem {
  id: number
  cart: number
  product: number
  variant?: number
  quantity: number
  created_at: string
  updated_at: string
  product_details?: Product
  variant_details?: ProductVariant
  unit_price?: number
  total_price?: number
}

export interface Wishlist {
  id: number
  user: number
  created_at: string
  updated_at: string
  items?: WishlistItem[]
}

export interface WishlistItem {
  id: number
  wishlist: number
  product: number
  created_at: string
  product_details?: Product
}

// Order Types
export interface Order {
  id: number
  order_number: string
  uuid: string
  user: number
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded'
  email: string
  phone: string
  shipping_first_name: string
  shipping_last_name: string
  shipping_address: string
  shipping_city: string
  shipping_state: string
  shipping_country: string
  shipping_postal_code: string
  billing_first_name?: string
  billing_last_name?: string
  billing_address?: string
  billing_city?: string
  billing_state?: string
  billing_country?: string
  billing_postal_code?: string
  subtotal: number
  tax_amount: number
  shipping_amount: number
  discount_amount: number
  total_amount: number
  notes?: string
  tracking_number?: string
  created_at: string
  updated_at: string
  shipped_at?: string
  delivered_at?: string
  items?: OrderItem[]
  payments?: Payment[]
  user_details?: User
  total_items?: number
  is_paid?: boolean
  can_be_cancelled?: boolean
}

export interface OrderItem {
  id: number
  order: number
  product: number
  variant?: number
  quantity: number
  unit_price: number
  total_price: number
  product_name: string
  product_sku: string
  variant_info?: string
  product_details?: Product
  variant_details?: ProductVariant
}

export interface OrderStatusHistory {
  id: number
  order: number
  status: string
  notes?: string
  created_by?: number
  created_at: string
  created_by_details?: User
}

export interface OrderNote {
  id: number
  order: number
  note: string
  is_public: boolean
  created_by?: number
  created_at: string
  created_by_details?: User
}

// Payment Types
export interface Payment {
  id: number
  payment_id: string
  uuid: string
  order: number
  user: number
  amount: number
  currency: string
  method: 'credit_card' | 'debit_card' | 'bank_transfer' | 'cash_on_delivery' | 'digital_wallet' | 'cryptocurrency'
  provider: 'wompi' | 'mercadopago' | 'stripe' | 'paypal' | 'manual'
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded' | 'partially_refunded'
  provider_payment_id?: string
  provider_transaction_id?: string
  provider_response?: any
  card_last_four?: string
  card_brand?: string
  card_exp_month?: string
  card_exp_year?: string
  failure_reason?: string
  notes?: string
  created_at: string
  updated_at: string
  processed_at?: string
  order_details?: Order
  user_details?: User
  is_successful?: boolean
  is_failed?: boolean
  can_be_refunded?: boolean
}

export interface Refund {
  id: number
  refund_id: string
  uuid: string
  payment: number
  order: number
  amount: number
  type: 'full' | 'partial'
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  reason: string
  provider_refund_id?: string
  provider_response?: any
  notes?: string
  processed_by?: number
  created_at: string
  updated_at: string
  processed_at?: string
  payment_details?: Payment
  order_details?: Order
  processed_by_details?: User
}

export interface PaymentMethod {
  id: number
  user: number
  type: string
  provider: string
  is_default: boolean
  card_last_four: string
  card_brand: string
  card_exp_month: string
  card_exp_year: string
  card_holder_name: string
  provider_payment_method_id: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// Report Types
export interface SalesReport {
  id: number
  name: string
  type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'
  start_date: string
  end_date: string
  total_orders: number
  total_revenue: number
  total_products_sold: number
  average_order_value: number
  conversion_rate: number
  cart_abandonment_rate: number
  new_customers: number
  returning_customers: number
  customer_retention_rate: number
  top_selling_product?: number
  top_selling_category?: number
  is_automated: boolean
  generated_by?: number
  created_at: string
  updated_at: string
  top_selling_product_details?: Product
  top_selling_category_details?: Category
  generated_by_details?: User
}

export interface ProductAnalytics {
  id: number
  product: number
  total_views: number
  unique_views: number
  add_to_cart_count: number
  purchase_count: number
  conversion_rate: number
  total_sales: number
  total_quantity_sold: number
  average_rating: number
  total_reviews: number
  stock_turnover_rate: number
  days_in_stock: number
  created_at: string
  updated_at: string
  last_calculated: string
  product_details?: Product
}

export interface CustomerAnalytics {
  id: number
  user: number
  total_orders: number
  total_spent: number
  average_order_value: number
  days_since_last_order?: number
  days_since_registration: number
  order_frequency: number
  total_products_viewed: number
  total_cart_abandonments: number
  total_wishlist_items: number
  total_reviews: number
  average_rating_given: number
  customer_segment?: string
  lifetime_value: number
  created_at: string
  updated_at: string
  last_calculated: string
  user_details?: User
}

export interface WebsiteAnalytics {
  id: number
  date: string
  total_visitors: number
  unique_visitors: number
  page_views: number
  bounce_rate: number
  average_session_duration?: string
  total_sessions: number
  conversion_rate: number
  cart_abandonment_rate: number
  total_orders: number
  total_revenue: number
  average_order_value: number
  products_viewed: number
  products_added_to_cart: number
  new_registrations: number
  returning_users: number
  created_at: string
  updated_at: string
}

export interface DashboardWidget {
  id: number
  name: string
  type: 'chart' | 'metric' | 'table' | 'list'
  chart_type?: 'line' | 'bar' | 'pie' | 'area' | 'doughnut'
  title: string
  description?: string
  query: string
  position_x: number
  position_y: number
  width: number
  height: number
  is_active: boolean
  refresh_interval: number
  created_at: string
  updated_at: string
}

// API Response Types
export interface ApiResponse<T> {
  count: number
  next?: string
  previous?: string
  results: T[]
}

export interface ApiError {
  detail?: string
  message?: string
  errors?: Record<string, string[]>
}

// Form Types
export interface LoginForm {
  email: string
  password: string
  remember_me?: boolean
}

export interface RegisterForm {
  email: string
  password: string
  password_confirm: string
  first_name: string
  last_name: string
  phone?: string
  terms_accepted: boolean
}

export interface ContactForm {
  name: string
  email: string
  subject: string
  message: string
}

export interface CheckoutForm {
  email: string
  phone: string
  shipping_first_name: string
  shipping_last_name: string
  shipping_address: string
  shipping_city: string
  shipping_state: string
  shipping_country: string
  shipping_postal_code: string
  billing_same_as_shipping: boolean
  billing_first_name?: string
  billing_last_name?: string
  billing_address?: string
  billing_city?: string
  billing_state?: string
  billing_country?: string
  billing_postal_code?: string
  payment_method: string
  notes?: string
}

// Filter Types
export interface ProductFilters {
  category?: number
  brand?: number
  min_price?: number
  max_price?: number
  size?: number
  color?: number
  is_featured?: boolean
  is_in_stock?: boolean
  search?: string
  sort_by?: 'name' | 'price' | 'created_at' | 'popularity'
  sort_order?: 'asc' | 'desc'
  page?: number
  page_size?: number
}

export interface OrderFilters {
  status?: string
  payment_status?: string
  date_from?: string
  date_to?: string
  search?: string
  sort_by?: 'created_at' | 'total_amount' | 'order_number'
  sort_order?: 'asc' | 'desc'
  page?: number
  page_size?: number
}

// Chart Data Types
export interface ChartData {
  name: string
  value: number
  color?: string
}

export interface TimeSeriesData {
  date: string
  value: number
  label?: string
}

export interface MetricCard {
  title: string
  value: string | number
  change?: number
  change_type?: 'increase' | 'decrease' | 'neutral'
  icon?: string
  color?: string
}

// Navigation Types
export interface NavItem {
  title: string
  href: string
  icon?: string
  children?: NavItem[]
  badge?: string
  disabled?: boolean
}

export interface BreadcrumbItem {
  title: string
  href?: string
}

// Theme Types
export interface Theme {
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    foreground: string
  }
}

// Notification Types
export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

// Search Types
export interface SearchResult {
  id: number
  title: string
  description?: string
  type: 'product' | 'category' | 'brand'
  url: string
  image?: string
  price?: number
  category?: string
}

export interface SearchFilters {
  type?: string[]
  category?: number[]
  brand?: number[]
  min_price?: number
  max_price?: number
  in_stock?: boolean
}
