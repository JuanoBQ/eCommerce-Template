'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { XCircle, RefreshCw, Home, ShoppingBag, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const CheckoutFailurePageContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const order = searchParams.get('order');
    const error = searchParams.get('error');
    
    if (order) setOrderId(order);
    if (error) setErrorMessage(decodeURIComponent(error));
  }, [searchParams]);

  const handleRetryPayment = () => {
    if (orderId) {
      router.push(`/checkout?order=${orderId}`);
    } else {
      router.push('/checkout');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          {/* Icono de error */}
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 mb-6">
            <XCircle className="h-12 w-12 text-red-600" />
          </div>

          {/* Título principal */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Pago No Procesado
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            No pudimos procesar tu pago. Esto puede deberse a varios motivos.
          </p>

          {/* Información del error */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Detalles del Error
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
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  <XCircle className="w-3 h-3 mr-1" />
                  Fallido
                </span>
              </div>
            </div>

            {errorMessage && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  <span className="font-medium">Error:</span> {errorMessage}
                </p>
              </div>
            )}
          </div>

          {/* Posibles causas */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-yellow-900 mb-4">
              Posibles Causas
            </h3>
            
            <div className="space-y-3 text-left">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2"></div>
                <p className="text-sm text-yellow-800">
                  Fondos insuficientes en tu cuenta
                </p>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2"></div>
                <p className="text-sm text-yellow-800">
                  Datos de la tarjeta incorrectos
                </p>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2"></div>
                <p className="text-sm text-yellow-800">
                  Tarjeta expirada o bloqueada
                </p>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2"></div>
                <p className="text-sm text-yellow-800">
                  Problemas de conectividad
                </p>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleRetryPayment}
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Intentar Nuevamente
            </button>
            
            <Link
              href="/checkout"
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Volver al Checkout
            </Link>
            
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

          {/* Información de contacto */}
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500">
              ¿Necesitas ayuda con tu pago?
            </p>
            <p className="text-sm text-gray-500">
              Contáctanos en{' '}
              <a 
                href="mailto:soporte@tienda.com" 
                className="text-blue-600 hover:text-blue-500"
              >
                soporte@tienda.com
              </a>
              {' '}o llama al{' '}
              <a 
                href="tel:+573001234567" 
                className="text-blue-600 hover:text-blue-500"
              >
                +57 300 123 4567
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckoutFailurePage: React.FC = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-8 w-8 animate-pulse mx-auto mb-4 text-red-500" />
          <p>Cargando información del error...</p>
        </div>
      </div>
    }>
      <CheckoutFailurePageContent />
    </Suspense>
  );
};

export default CheckoutFailurePage;
