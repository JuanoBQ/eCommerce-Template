"""
Constantes centralizadas para el proyecto eCommerce.
"""

# Estados de orden
class OrderStatus:
    PENDING = 'pending'
    CONFIRMED = 'confirmed'
    PROCESSING = 'processing'
    SHIPPED = 'shipped'
    DELIVERED = 'delivered'
    CANCELLED = 'cancelled'
    REFUNDED = 'refunded'
    
    CHOICES = [
        (PENDING, 'Pendiente'),
        (CONFIRMED, 'Confirmado'),
        (PROCESSING, 'Procesando'),
        (SHIPPED, 'Enviado'),
        (DELIVERED, 'Entregado'),
        (CANCELLED, 'Cancelado'),
        (REFUNDED, 'Reembolsado'),
    ]

# Estados de pago
class PaymentStatus:
    PENDING = 'pending'
    PAID = 'paid'
    FAILED = 'failed'
    REFUNDED = 'refunded'
    PARTIALLY_REFUNDED = 'partially_refunded'
    
    CHOICES = [
        (PENDING, 'Pendiente'),
        (PAID, 'Pagado'),
        (FAILED, 'Fallido'),
        (REFUNDED, 'Reembolsado'),
        (PARTIALLY_REFUNDED, 'Reembolsado Parcialmente'),
    ]

# Métodos de pago
class PaymentMethod:
    CREDIT_CARD = 'credit_card'
    DEBIT_CARD = 'debit_card'
    BANK_TRANSFER = 'bank_transfer'
    CASH_ON_DELIVERY = 'cash_on_delivery'
    DIGITAL_WALLET = 'digital_wallet'
    CRYPTOCURRENCY = 'cryptocurrency'
    
    CHOICES = [
        (CREDIT_CARD, 'Tarjeta de Crédito'),
        (DEBIT_CARD, 'Tarjeta de Débito'),
        (BANK_TRANSFER, 'Transferencia Bancaria'),
        (CASH_ON_DELIVERY, 'Pago Contra Entrega'),
        (DIGITAL_WALLET, 'Billetera Digital'),
        (CRYPTOCURRENCY, 'Criptomoneda'),
    ]

# Proveedores de pago
class PaymentProvider:
    WOMPI = 'wompi'
    MERCADOPAGO = 'mercadopago'
    STRIPE = 'stripe'
    PAYPAL = 'paypal'
    MANUAL = 'manual'
    
    CHOICES = [
        (WOMPI, 'Wompi'),
        (MERCADOPAGO, 'MercadoPago'),
        (STRIPE, 'Stripe'),
        (PAYPAL, 'PayPal'),
        (MANUAL, 'Manual'),
    ]

# Estados de producto
class ProductStatus:
    DRAFT = 'draft'
    PUBLISHED = 'published'
    ARCHIVED = 'archived'
    
    CHOICES = [
        (DRAFT, 'Borrador'),
        (PUBLISHED, 'Publicado'),
        (ARCHIVED, 'Archivado'),
    ]

# Géneros de producto
class ProductGender:
    MASCULINO = 'masculino'
    FEMENINO = 'femenino'
    UNISEX = 'unisex'
    
    CHOICES = [
        (MASCULINO, 'Masculino'),
        (FEMENINO, 'Femenino'),
        (UNISEX, 'Unisex'),
    ]

# Estados de reclamo
class ClaimStatus:
    OPEN = 'open'
    IN_PROGRESS = 'in_progress'
    RESOLVED = 'resolved'
    CLOSED = 'closed'
    
    CHOICES = [
        (OPEN, 'Abierto'),
        (IN_PROGRESS, 'En Progreso'),
        (RESOLVED, 'Resuelto'),
        (CLOSED, 'Cerrado'),
    ]

# Tipos de reclamo
class ClaimType:
    PRODUCT_QUALITY = 'product_quality'
    SHIPPING_DELAY = 'shipping_delay'
    WRONG_ITEM = 'wrong_item'
    DAMAGED_ITEM = 'damaged_item'
    RETURN_REQUEST = 'return_request'
    OTHER = 'other'
    
    CHOICES = [
        (PRODUCT_QUALITY, 'Calidad del Producto'),
        (SHIPPING_DELAY, 'Retraso en Envío'),
        (WRONG_ITEM, 'Artículo Incorrecto'),
        (DAMAGED_ITEM, 'Artículo Dañado'),
        (RETURN_REQUEST, 'Solicitud de Devolución'),
        (OTHER, 'Otro'),
    ]

# Límites del sistema
class SystemLimits:
    MAX_CART_ITEMS = 50
    MAX_WISHLIST_ITEMS = 100
    MAX_ORDER_ITEMS = 20
    MAX_PRODUCT_IMAGES = 10
    MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10MB
    MIN_PASSWORD_LENGTH = 8
    MAX_REVIEW_LENGTH = 1000
    MAX_CLAIM_MESSAGE_LENGTH = 500

# Configuración de inventario
class InventoryConfig:
    LOW_STOCK_THRESHOLD = 5
    CRITICAL_STOCK_THRESHOLD = 1
    RESERVATION_TIMEOUT_MINUTES = 30

# Configuración de emails
class EmailConfig:
    ORDER_CONFIRMATION_TEMPLATE = 'emails/order_confirmation.html'
    PAYMENT_CONFIRMATION_TEMPLATE = 'emails/payment_confirmation.html'
    SHIPPING_NOTIFICATION_TEMPLATE = 'emails/shipping_notification.html'
    PASSWORD_RESET_TEMPLATE = 'emails/password_reset.html'

# Códigos de error personalizados
class ErrorCodes:
    INSUFFICIENT_STOCK = 'insufficient_stock'
    INVALID_PAYMENT_METHOD = 'invalid_payment_method'
    ORDER_NOT_FOUND = 'order_not_found'
    PRODUCT_NOT_AVAILABLE = 'product_not_available'
    USER_NOT_AUTHORIZED = 'user_not_authorized'
    INVALID_CREDENTIALS = 'invalid_credentials'
    PAYMENT_FAILED = 'payment_failed'
    
# URLs de redirección para pagos
class PaymentRedirectUrls:
    SUCCESS_PATH = '/checkout/success/'
    FAILURE_PATH = '/checkout/failure/'
    PENDING_PATH = '/checkout/pending/'
