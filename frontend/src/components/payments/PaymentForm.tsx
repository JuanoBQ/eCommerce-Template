'use client';

import React, { useState, useEffect } from 'react';
import { usePayments, CreatePaymentIntentRequest, CreatePaymentIntentResponse } from '@/hooks/usePayments';
import { CreditCard, Lock, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import PaymentProviderSelector from './PaymentProviderSelector';

interface PaymentFormProps {
  orderId: number;
  amount: number;
  currency?: string;
  country?: string;
  onPaymentSuccess?: (paymentId: number) => void;
  onPaymentError?: (error: string) => void;
  className?: string;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  orderId,
  amount,
  currency = 'COP',
  country = 'CO',
  onPaymentSuccess,
  onPaymentError,
  className = ''
}) => {
  const { createPaymentIntent, verifyPayment, isLoading, error } = usePayments();
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [paymentIntent, setPaymentIntent] = useState<CreatePaymentIntentResponse | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [verificationInterval, setVerificationInterval] = useState<NodeJS.Timeout | null>(null);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleProviderSelect = (provider: string) => {
    setSelectedProvider(provider);
    setPaymentIntent(null);
    setPaymentStatus('idle');
  };

  const handleCreatePayment = async () => {
    console.log('🔍 PaymentForm - Iniciando proceso de pago...');
    console.log('🔍 PaymentForm - Provider seleccionado:', selectedProvider);
    console.log('🔍 PaymentForm - Order ID:', orderId);
    console.log('🔍 PaymentForm - Amount:', amount);
    console.log('🔍 PaymentForm - Currency:', currency);
    console.log('🔍 PaymentForm - Country:', country);
    
    if (!selectedProvider) {
      console.log('🔍 PaymentForm - Error: No hay proveedor seleccionado');
      onPaymentError?.('Por favor selecciona un método de pago');
      return;
    }

    try {
      console.log('🔍 PaymentForm - Estableciendo estado de procesamiento');
      setPaymentStatus('processing');
      
      const request: CreatePaymentIntentRequest = {
        order_id: orderId,
        provider: selectedProvider
      };

      console.log('🔍 PaymentForm - Datos de pago a enviar:', request);
      const response = await createPaymentIntent(request);
      console.log('🔍 PaymentForm - Respuesta de createPaymentIntent:', response);
      
      if (response?.success) {
        console.log('🔍 PaymentForm - Pago creado exitosamente');
        setPaymentIntent(response);
        setPaymentStatus('success');
        
        // Si hay una URL de pago, redirigir al usuario
        if (response.payment_url) {
          console.log('🔍 PaymentForm - Redirigiendo a URL de pago:', response.payment_url);
          window.open(response.payment_url, '_blank');
        }
        
        console.log('🔍 PaymentForm - Llamando onPaymentSuccess con payment_id:', response.payment_id);
        onPaymentSuccess?.(response.payment_id!);
      } else {
        console.log('🔍 PaymentForm - Error al crear pago:', response?.error);
        setPaymentStatus('error');
        onPaymentError?.(response?.error || 'Error al crear el pago');
      }
    } catch (err) {
      console.error('🔍 PaymentForm - Error inesperado al procesar pago:', err);
      setPaymentStatus('error');
      onPaymentError?.('Error inesperado al procesar el pago');
    }
  };

  const handleVerifyPayment = async () => {
    if (!paymentIntent?.payment_id) {
      console.log('🔍 PaymentForm - No hay payment_id para verificar');
      return;
    }

    console.log('🔍 PaymentForm - Verificando pago con ID:', paymentIntent.payment_id);

    try {
      const response = await verifyPayment(paymentIntent.payment_id);
      console.log('🔍 PaymentForm - Respuesta de verificación:', response);
      
      if (response?.success) {
        console.log('🔍 PaymentForm - Estado del pago:', response.status);
        if (response.status === 'completed') {
          console.log('🔍 PaymentForm - Pago completado exitosamente');
          setPaymentStatus('success');
          if (verificationInterval) {
            console.log('🔍 PaymentForm - Limpiando intervalo de verificación');
            clearInterval(verificationInterval);
            setVerificationInterval(null);
          }
        } else if (response.status === 'failed') {
          console.log('🔍 PaymentForm - Pago falló');
          setPaymentStatus('error');
          if (verificationInterval) {
            console.log('🔍 PaymentForm - Limpiando intervalo de verificación');
            clearInterval(verificationInterval);
            setVerificationInterval(null);
          }
        }
      } else {
        console.log('🔍 PaymentForm - Error en verificación:', response?.error);
      }
    } catch (err) {
      console.error('🔍 PaymentForm - Error al verificar pago:', err);
    }
  };

  // Verificar el estado del pago periódicamente
  useEffect(() => {
    if (paymentIntent?.payment_id && paymentStatus === 'processing') {
      const interval = setInterval(handleVerifyPayment, 5000); // Verificar cada 5 segundos
      setVerificationInterval(interval);

      return () => {
        clearInterval(interval);
      };
    }
  }, [paymentIntent?.payment_id, paymentStatus]);

  // Limpiar interval al desmontar
  useEffect(() => {
    return () => {
      if (verificationInterval) {
        clearInterval(verificationInterval);
      }
    };
  }, [verificationInterval]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Resumen del pago */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Total a pagar</h3>
            <p className="text-sm text-gray-600">Orden #{orderId}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">
              {formatAmount(amount)}
            </p>
            <p className="text-sm text-gray-600">{currency}</p>
          </div>
        </div>
      </div>

      {/* Selector de proveedor */}
      <PaymentProviderSelector
        country={country}
        currency={currency}
        selectedProvider={selectedProvider}
        onProviderSelect={handleProviderSelect}
      />

      {/* Botón de pago */}
      <div className="space-y-4">
        <button
          onClick={handleCreatePayment}
          disabled={!selectedProvider || isLoading || paymentStatus === 'processing'}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
            !selectedProvider || isLoading || paymentStatus === 'processing'
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
          }`}
        >
          {isLoading || paymentStatus === 'processing' ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Procesando...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <CreditCard className="w-5 h-5" />
              <span>Proceder al pago</span>
            </div>
          )}
        </button>

        {/* Estado del pago */}
        {paymentStatus === 'success' && paymentIntent && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div className="flex-1">
                <p className="font-medium text-green-800">Pago creado exitosamente</p>
                <p className="text-sm text-green-600">
                  ID del pago: {paymentIntent.payment_id}
                </p>
                {paymentIntent.payment_url && (
                  <a
                    href={paymentIntent.payment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-sm text-green-700 hover:text-green-800 mt-2"
                  >
                    <span>Completar pago</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {paymentStatus === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="font-medium text-red-800">Error en el pago</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Información de seguridad */}
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Lock className="w-4 h-4" />
          <span>Tu información de pago está protegida y encriptada</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;
