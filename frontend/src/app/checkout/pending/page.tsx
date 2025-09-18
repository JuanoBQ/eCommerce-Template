'use client'

import { useEffect, useState, Suspense, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiClient } from '@/lib/api'
import toast from 'react-hot-toast'
import { Loader2, CreditCard, ArrowRight } from 'lucide-react'

interface PaymentInfo {
  success: boolean
  payment_id: number
  payment_url: string
  provider: string
  status: string
  order_number: string
}

function CheckoutPendingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutos
  const [paymentWindowOpened, setPaymentWindowOpened] = useState(false)
  const [verificationStopped, setVerificationStopped] = useState(false)
  const [isMounted, setIsMounted] = useState(true)
  const [verificationAttempts, setVerificationAttempts] = useState(0)
  const [maxVerificationAttempts] = useState(30) // Máximo 30 intentos (5 minutos / 10 segundos)
  const [lastVerificationTime, setLastVerificationTime] = useState<number | null>(null)
  
  // Usar useRef para mantener referencia estable al intervalo y estados
  const statusIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const verificationStoppedRef = useRef<boolean>(false)
  const verificationAttemptsRef = useRef<number>(0)

  const orderNumber = searchParams.get('order')
  const paymentId = searchParams.get('payment')

  // Declarar stopVerification antes de usarlo en los useEffect
  const stopVerification = useCallback((reason: string) => {
    console.log(`🛑 Deteniendo verificación: ${reason}`)
    
    // Marcar como detenido en la referencia
    verificationStoppedRef.current = true
    
    // Detener el intervalo si existe
    if (statusIntervalRef.current) {
      clearInterval(statusIntervalRef.current)
      statusIntervalRef.current = null
      console.log('✅ Intervalo de verificación detenido')
    }
    
    // Marcar como detenido en el estado
    setVerificationStopped(true)
    
    // Mostrar notificación
    toast(`Se detuvo la verificación automática (${reason}). Puedes verificar manualmente en "Mis Pedidos".`, {
      icon: 'ℹ️',
      duration: 4000
    })
  }, [])

  useEffect(() => {
    if (orderNumber && paymentId) {
      loadPaymentInfo()
    } else {
      setLoading(false)
      toast.error('Información de pago incompleta')
    }
  }, [orderNumber, paymentId])

  // Temporizador para redirigir automáticamente
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      // Detener verificación de estado cuando se agote el tiempo
      stopVerification('Tiempo agotado')
      
      // Redirigir a página de pedidos después de 5 minutos
      router.push('/account/orders')
    }
  }, [timeLeft, router, stopVerification])

  // Sincronizar referencias con estados
  useEffect(() => {
    verificationAttemptsRef.current = verificationAttempts
  }, [verificationAttempts])

  useEffect(() => {
    verificationStoppedRef.current = verificationStopped
  }, [verificationStopped])

  // Detener verificación cuando se alcance el límite de intentos
  useEffect(() => {
    if (verificationAttempts >= maxVerificationAttempts) {
      stopVerification('Límite de intentos alcanzado')
    }
  }, [verificationAttempts, maxVerificationAttempts, stopVerification])

  // Limpiar intervalo cuando el componente se desmonte
  useEffect(() => {
    return () => {
      setIsMounted(false)
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current)
        statusIntervalRef.current = null
      }
    }
  }, [])

  const loadPaymentInfo = async () => {
    try {
      // Obtener información del pago
      const paymentResponse = await apiClient.get(`/payments/payments/${paymentId}/`) as any

      setPaymentInfo({
        success: true,
        payment_id: paymentResponse.id,
        payment_url: paymentResponse.provider_response?.payment_url || '',
        provider: paymentResponse.provider,
        status: paymentResponse.status,
        order_number: orderNumber || ''
      })

      // Marcar que la ventana ya se abrió automáticamente
      setPaymentWindowOpened(true)

      // Verificar estado del pago periódicamente
      const checkStatus = async () => {
        // Verificar si el componente sigue montado
        if (!isMounted) {
          console.log('🛑 Componente desmontado, deteniendo verificación')
          return
        }

        // Verificar si la verificación ya fue detenida
        if (verificationStoppedRef.current) {
          console.log('🛑 Verificación ya detenida, no continuar')
          return
        }

        // Verificar límite de intentos usando la referencia actual
        if (verificationAttemptsRef.current >= maxVerificationAttempts) {
          console.log(`🛑 Límite de intentos alcanzado (${verificationAttemptsRef.current}/${maxVerificationAttempts}), deteniendo verificación`)
          stopVerification('Límite de intentos alcanzado')
          return
        }

        // Verificar tiempo transcurrido desde la última verificación
        const now = Date.now()
        if (lastVerificationTime && (now - lastVerificationTime) < 10000) {
          // No verificar si han pasado menos de 10 segundos
          return
        }

        try {
          setLastVerificationTime(now)
          setVerificationAttempts(prev => {
            const newAttempts = prev + 1
            verificationAttemptsRef.current = newAttempts
            return newAttempts
          })
          
          console.log(`🔄 Verificación #${verificationAttemptsRef.current}/${maxVerificationAttempts}`)
          
          const statusResponse = await apiClient.get(`/payments/payments/check_status/?order=${orderNumber}`) as any
          
          if (statusResponse.success) {
            const paymentStatus = statusResponse.status
            console.log(`📊 Estado recibido: ${paymentStatus}`)
            
            // Detener verificación para cualquier estado final
            if (paymentStatus === 'completed') {
              stopVerification('Pago completado')
              toast.success('¡Pago completado!')
              router.push('/account/orders')
            } else if (paymentStatus === 'failed') {
              stopVerification('Pago fallido')
              toast.error('El pago no pudo ser procesado. Intenta nuevamente.')
              router.push('/checkout')
            } else if (paymentStatus === 'refunded') {
              stopVerification('Pago reembolsado')
              toast.info('El pago ha sido reembolsado.')
              router.push('/account/orders')
            } else if (paymentStatus === 'cancelled') {
              stopVerification('Pago cancelado')
              toast.warning('El pago fue cancelado.')
              router.push('/checkout')
            }
            // Si el estado sigue siendo 'pending', continuar verificando
          }
        } catch (error: any) {
          console.warn('Error verificando estado del pago:', error)
          
          // Si la orden no existe (404), detener la verificación inmediatamente
          if (error?.response?.status === 404) {
            console.log('🛑 Orden no encontrada (404), deteniendo verificación')
            stopVerification('Orden no encontrada')
            toast.error('La orden no existe o ha sido eliminada.')
            router.push('/account/orders')
            return
          }
          
          // Si hay error de red o servidor, detener después de varios intentos
          if (verificationAttemptsRef.current >= 5) {
            console.log('🛑 Límite de errores alcanzado, deteniendo verificación')
            stopVerification('Error de conexión')
            toast.error('Error de conexión. Verifica tu conexión a internet.')
            router.push('/account/orders')
            return
          }
          
          // Error silencioso en verificación, pero contar como intento
          console.log(`⚠️ Error en verificación ${verificationAttemptsRef.current + 1}/${maxVerificationAttempts}:`, error?.message || 'Error desconocido')
        }
      }

      // Verificar cada 10 segundos
      const intervalRef = setInterval(checkStatus, 10000)
      statusIntervalRef.current = intervalRef
    } catch (error) {
      toast.error('Error al cargar información del pago')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handlePaymentRedirect = () => {
    if (paymentInfo?.payment_url) {
      window.open(paymentInfo.payment_url, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Cargando información del pago...
          </h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <CreditCard className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Pago en Proceso
          </h2>
          <p className="text-gray-600 mb-6">
            {paymentWindowOpened ? (
              <>
                Se ha abierto la pasarela de {paymentInfo?.provider === 'wompi' ? 'Wompi' : 'MercadoPago'} en una nueva pestaña. 
                <br />
                Completa el proceso de pago y regresa aquí.
              </>
            ) : (
              `Hemos creado tu intención de pago. Completa el proceso en la pasarela de ${paymentInfo?.provider === 'wompi' ? 'Wompi' : 'MercadoPago'}.`
            )}
          </p>

          {paymentInfo && (
            <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
              <div className="space-y-4">
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-500">Número de orden</p>
                  <p className="font-mono text-lg font-semibold">{orderNumber}</p>
                </div>

                <div className="text-left">
                  <p className="text-sm font-medium text-gray-500">ID de Pago</p>
                  <p className="font-mono text-lg font-semibold">#{paymentInfo.payment_id}</p>
                </div>

                <div className="text-left">
                  <p className="text-sm font-medium text-gray-500">Estado</p>
                  <p className="text-lg font-semibold text-yellow-600">{paymentInfo.status}</p>
                </div>

                <div className="text-left">
                  <p className="text-sm font-medium text-gray-500">Tiempo restante</p>
                  <p className="text-lg font-semibold text-red-600">{formatTime(timeLeft)}</p>
                  {verificationStopped && (
                    <p className="text-xs text-gray-500 mt-1">⏸️ Verificación automática detenida</p>
                  )}
                </div>

                <div className="text-left">
                  <p className="text-sm font-medium text-gray-500">Verificaciones</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {verificationAttempts}/{maxVerificationAttempts}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {verificationStopped ? 'Detenida' : 'Verificando cada 10 segundos'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {paymentWindowOpened ? (
              // Si ya se abrió la ventana automáticamente, mostrar mensaje y botón de respaldo
              <>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-800">
                        ✅ Pasarela de {paymentInfo?.provider === 'wompi' ? 'Wompi' : 'MercadoPago'} abierta en nueva pestaña
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePaymentRedirect}
                  className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 border"
                >
                  <CreditCard className="w-5 h-5" />
                  Abrir {paymentInfo?.provider === 'wompi' ? 'Wompi' : 'MercadoPago'} de Nuevo (si se cerró)
                  <ArrowRight className="w-5 h-5" />
                </button>

                <button
                  onClick={() => router.push('/account/orders')}
                  className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  ✅ Ya Completé el Pago
                </button>

                {!verificationStopped && (
                  <button
                    onClick={() => stopVerification('Detenido manualmente')}
                    className="w-full bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    ⏸️ Detener Verificación Automática
                  </button>
                )}
              </>
            ) : (
              // Si no se abrió automáticamente, mostrar botón principal
              <>
                <button
                  onClick={handlePaymentRedirect}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-5 h-5" />
                  Ir a Pagar con {paymentInfo?.provider === 'wompi' ? 'Wompi' : 'MercadoPago'}
                  <ArrowRight className="w-5 h-5" />
                </button>

                <button
                  onClick={() => router.push('/account/orders')}
                  className="w-full bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Ya Completé el Pago
                </button>

                {!verificationStopped && (
                  <button
                    onClick={() => stopVerification('Detenido manualmente')}
                    className="w-full bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    ⏸️ Detener Verificación Automática
                  </button>
                )}
              </>
            )}
          </div>

          <div className="mt-6 text-sm text-gray-500">
            {paymentWindowOpened ? (
              <>
                <p>Completa el pago en la pestaña de {paymentInfo?.provider === 'wompi' ? 'Wompi' : 'MercadoPago'} que se abrió.</p>
                <p className="mt-2">Una vez completado, regresa aquí o ve a "Mis Pedidos" para ver el estado.</p>
                <p className="mt-2 text-xs">
                  🔄 Verificamos automáticamente cada 10 segundos (máximo {maxVerificationAttempts} intentos en 5 minutos).
                </p>
              </>
            ) : (
              <>
                <p>Si no completas el pago en 5 minutos, serás redirigido automáticamente.</p>
                <p className="mt-2">Puedes cerrar esta ventana y volver más tarde desde "Mis Pedidos".</p>
                <p className="mt-2 text-xs">
                  🔄 Verificamos automáticamente cada 10 segundos (máximo {maxVerificationAttempts} intentos en 5 minutos).
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPending() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Cargando información del pago...</p>
        </div>
      </div>
    }>
      <CheckoutPendingContent />
    </Suspense>
  )
}