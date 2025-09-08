'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { toast } from 'react-hot-toast'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

interface PaymentStatus {
  success: boolean
  status: string
  payment_id: string
  order_number: string
}

function CheckoutSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null)
  const [loading, setLoading] = useState(true)

  const orderNumber = searchParams.get('order')

  useEffect(() => {
    if (orderNumber) {
      checkPaymentStatus()
    } else {
      setLoading(false)
      toast.error('No se encontró el número de orden')
    }
  }, [orderNumber])

  const checkPaymentStatus = async () => {
    try {
      // Verificar el estado del pago en nuestro backend
      const response = await apiClient.get(`/payments/payments/check_status/?order=${orderNumber}`) as any

      setPaymentStatus(response)

      if (response.success && response.status === 'completed') {
        toast.success('¡Pago completado exitosamente!')
        // Redirigir a página de órdenes después de 3 segundos
        setTimeout(() => {
          router.push('/orders')
        }, 3000)
      } else if (response.success && response.status === 'pending') {
        toast('El pago está siendo procesado...', {
          icon: 'ℹ️',
          duration: 3000
        })
        // Verificar nuevamente en 5 segundos
        setTimeout(() => {
          checkPaymentStatus()
        }, 5000)
      } else {
        toast.error('El pago no se completó correctamente')
      }
    } catch (error) {
      toast.error('Error al verificar el estado del pago')
      setPaymentStatus({ success: false, status: 'error', payment_id: '', order_number: orderNumber || '' })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Verificando pago...
          </h2>
          <p className="text-gray-600">
            Estamos confirmando el estado de tu pago
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {paymentStatus?.success && paymentStatus?.status === 'completed' ? (
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                ¡Pago Exitoso!
              </h2>
              <p className="text-gray-600 mb-4">
                Tu pedido ha sido procesado correctamente.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-500">Número de orden:</p>
                <p className="font-mono text-lg font-semibold">{orderNumber}</p>
              </div>
              <p className="text-sm text-gray-600">
                Serás redirigido a tus pedidos en unos segundos...
              </p>
            </div>
          ) : paymentStatus?.success && paymentStatus?.status === 'pending' ? (
            <div className="text-center">
              <Loader2 className="w-16 h-16 animate-spin text-yellow-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Procesando Pago...
              </h2>
              <p className="text-gray-600 mb-4">
                Tu pago está siendo procesado. Esto puede tomar unos momentos.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-500">Número de orden:</p>
                <p className="font-mono text-lg font-semibold">{orderNumber}</p>
              </div>
              <button
                onClick={checkPaymentStatus}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Verificar Estado
              </button>
            </div>
          ) : (
            <div className="text-center">
              <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Error en el Pago
              </h2>
              <p className="text-gray-600 mb-4">
                Hubo un problema al procesar tu pago.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-500">Número de orden:</p>
                <p className="font-mono text-lg font-semibold">{orderNumber}</p>
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => router.push('/checkout')}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Intentar de Nuevo
                </button>
                <button
                  onClick={() => router.push('/orders')}
                  className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Ver Mis Pedidos
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CheckoutSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Verificando estado del pago...</p>
        </div>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  )
}