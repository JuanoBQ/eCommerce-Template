'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Clock, RefreshCw, Home, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

const CheckoutPendingPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const order = searchParams.get('order');
    if (order) setOrderId(order);
  }, [searchParams]);

  const handleCheckStatus = async () => {
    setIsChecking(true);
    
    try {
      // Aquí harías la llamada a la API para verificar el estado del pago
      // const response = await apiClient.get(`/orders/${orderId}/status/`);
      
      // Simular verificación
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirigir según el estado
      // if (response.data.status === 'completed') {
      //   router.push(`/checkout/success?order=${orderId}`);
      // } else if (response.data.status === 'failed') {
      //   router.push(`/checkout/failure?order=${orderId}`);
      // }
      
    } catch (error) {
      console.error('Error al verificar estado:', error);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          {/* Icono de pendiente */}
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-yellow-100 mb-6">
            <Clock className="h-12 w-12 text-yellow-600" />
          </div>

          {/* Título principal */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Pago Pendiente
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            Tu pago está siendo procesado. Te notificaremos cuando esté confirmado.
          </p>

          {/* Información del pedido */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Detalles del Pedido
            </h2>
            
            <div className="space-y-3">
              {orderId && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Número de Orden:</span>
                  <span className="font-medium text-gray-900">#{orderId}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Estado:</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  <Clock className="w-3 h-3 mr-1" />
                  Pendiente
                </span>
              </div>
            </div>
          </div>

          {/* Información sobre el proceso */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              ¿Qué está pasando?
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <div className="text-left">
                  <p className="font-medium text-blue-900">
                    Pago enviado
                  </p>
                  <p className="text-sm text-blue-700">
                    Tu pago ha sido enviado a la pasarela de pago
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-yellow-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <div className="text-left">
                  <p className="font-medium text-blue-900">
                    Procesando
                  </p>
                  <p className="text-sm text-blue-700">
                    La pasarela está verificando tu pago
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-600">
                    Confirmación
                  </p>
                  <p className="text-sm text-gray-500">
                    Te notificaremos cuando esté confirmado
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleCheckStatus}
              disabled={isChecking}
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
            >
              {isChecking ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Verificar Estado
                </>
              )}
            </button>
            
            <Link
              href="/tienda"
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Seguir Comprando
            </Link>
            
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <Home className="w-5 h-5 mr-2" />
              Ir al Inicio
            </Link>
          </div>

          {/* Información adicional */}
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500">
              El procesamiento puede tomar unos minutos
            </p>
            <p className="text-sm text-gray-500">
              Si tienes dudas, contáctanos en{' '}
              <a 
                href="mailto:soporte@tienda.com" 
                className="text-blue-600 hover:text-blue-500"
              >
                soporte@tienda.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPendingPage;
