'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Package, Mail, Home, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

const CheckoutSuccessPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  useEffect(() => {
    const order = searchParams.get('order');
    const payment = searchParams.get('payment');
    
    if (order) setOrderId(order);
    if (payment) setPaymentId(payment);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          {/* Icono de éxito */}
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>

          {/* Título principal */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            ¡Pago Exitoso!
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            Tu pedido ha sido procesado correctamente. Recibirás un email de confirmación pronto.
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
              
              {paymentId && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">ID del Pago:</span>
                  <span className="font-medium text-gray-900">#{paymentId}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Estado:</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Completado
                </span>
              </div>
            </div>
          </div>

          {/* Próximos pasos */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              ¿Qué sigue ahora?
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-left">
                  <p className="font-medium text-blue-900">
                    Email de confirmación
                  </p>
                  <p className="text-sm text-blue-700">
                    Te enviaremos un email con todos los detalles de tu pedido
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Package className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-left">
                  <p className="font-medium text-blue-900">
                    Preparación del pedido
                  </p>
                  <p className="text-sm text-blue-700">
                    Nuestro equipo preparará tu pedido para el envío
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Package className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-left">
                  <p className="font-medium text-blue-900">
                    Envío
                  </p>
                  <p className="text-sm text-blue-700">
                    Te notificaremos cuando tu pedido esté en camino
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/cuenta/pedidos"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <Package className="w-5 h-5 mr-2" />
              Ver Mis Pedidos
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

          {/* Información adicional */}
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500">
              ¿Tienes alguna pregunta sobre tu pedido?
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

export default CheckoutSuccessPage;
