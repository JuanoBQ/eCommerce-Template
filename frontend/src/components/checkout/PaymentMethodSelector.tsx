'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, Lock } from 'lucide-react';

interface PaymentMethodSelectorProps {
  selectedMethod: string;
  onMethodChange: (method: string) => void;
  orderId?: number;
  className?: string;
}

// Métodos de pago disponibles
const paymentMethods = [
  { 
    id: 'wompi', 
    name: 'Wompi', 
    icon: '💳', 
    description: 'Pago seguro con tarjetas de crédito/débito',
    logo: '/static/images/payment-logos/wompi.png'
  },
  { 
    id: 'mercadopago', 
    name: 'MercadoPago', 
    icon: '🅿️', 
    description: 'Pago con MercadoPago y múltiples métodos',
    logo: '/static/images/payment-logos/mercadopago.png'
  }
];

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onMethodChange,
  orderId,
  className = ''
}) => {
  // El componente padre maneja el cambio a través de onMethodChange

  const handleMethodSelect = (methodId: string) => {
    onMethodChange(methodId);
  };

  // Ya no necesitamos estas funciones porque el pago se procesa directamente en checkout

  return (
    <div className={`space-y-6 ${className}`}>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Selecciona tu método de pago
        </h3>
        
        {/* Métodos de pago disponibles */}
        <div className="space-y-3">
          <div className="flex items-center mb-4">
            <h4 className="text-sm font-medium text-gray-700">
              Pagos en línea 
            </h4>
            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
              <Lock className="w-3 h-3 mr-1" />
              Seguro
            </span>
          </div>
          
          {paymentMethods.map((method) => (
            <label
              key={method.id}
              className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedMethod === method.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="payment_method"
                value={method.id}
                checked={selectedMethod === method.id}
                onChange={(e) => handleMethodSelect(e.target.value)}
                className="sr-only"
              />
              <div className="flex items-center space-x-4 flex-1">
                <span className="text-2xl">{method.icon}</span>
                <div className="flex-1">
                  <span className="text-gray-900 font-medium block">{method.name}</span>
                  <span className="text-sm text-gray-600">{method.description}</span>
                </div>
                {selectedMethod === method.id && (
                  <CheckCircle className="w-5 h-5 text-blue-500" />
                )}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Información después de crear orden */}
      {selectedMethod && orderId && (
        <div className="border-t border-gray-200 pt-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                ¡Orden creada exitosamente!
              </span>
            </div>
            <p className="text-xs text-green-600 mt-1">
              Te hemos redirigido automáticamente a la pasarela de pago segura
            </p>
          </div>
        </div>
      )}

      {/* Información sin orden creada */}
      {selectedMethod && !orderId && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              Método seleccionado: {paymentMethods.find(m => m.id === selectedMethod)?.name}
            </span>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            Haz clic en "Finalizar Compra" para proceder al pago seguro
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSelector;
