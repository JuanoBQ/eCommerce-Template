import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api';

export interface PaymentProvider {
  name: string;
  display_name: string;
  description: string;
  supported_currencies: string[];
  supported_countries: string[];
  payment_methods: string[];
  environment: string;
  website: string;
  logo_url: string;
}

export interface PaymentProvidersResponse {
  providers: string[];
  configs: Record<string, PaymentProvider>;
  default_provider: string;
}

export interface CreatePaymentIntentRequest {
  order_id: number;
  provider: string;
  payment_method?: Record<string, any>;
}

export interface CreatePaymentIntentResponse {
  success: boolean;
  payment_id?: number;
  payment_url?: string;
  client_secret?: string;
  expires_at?: string;
  provider?: string;
  error?: string;
  error_code?: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  status?: string;
  amount?: number;
  currency?: string;
  processed_at?: string;
  error?: string;
  error_code?: string;
}

export interface RefundPaymentRequest {
  amount?: number;
  reason?: string;
}

export interface RefundPaymentResponse {
  success: boolean;
  refund_id?: number;
  amount?: number;
  status?: string;
  error?: string;
  error_code?: string;
}

export const usePayments = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getProviders = useCallback(async (country?: string, currency?: string): Promise<PaymentProvidersResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔍 usePayments - Obteniendo proveedores de pago del backend');
      console.log('🔍 usePayments - Parámetros:', { country, currency });
      
      const params = new URLSearchParams();
      if (country) params.append('country', country);
      if (currency) params.append('currency', currency);
      
      const queryString = params.toString();
      const url = `/payments/providers/${queryString ? `?${queryString}` : ''}`;
      
      console.log('🔍 usePayments - URL de petición:', url);
      const response = await apiClient.get(url);
      
      console.log('🔍 usePayments - Respuesta del backend:', response);
      return response;
    } catch (err: any) {
      console.error('🔍 usePayments - Error en la petición:', err);
      const errorMessage = 'Error al obtener proveedores de pago';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createPaymentIntent = useCallback(async (data: CreatePaymentIntentRequest): Promise<CreatePaymentIntentResponse | null> => {
    try {
      console.log('🔍 usePayments - Iniciando creación de intención de pago...');
      console.log('🔍 usePayments - Datos de entrada:', data);
      
      setIsLoading(true);
      setError(null);

      console.log('🔍 usePayments - Enviando petición POST a /payments/create_payment_intent/');
      const response = await apiClient.post('/payments/create_payment_intent/', data);
      
      console.log('🔍 usePayments - Respuesta del servidor:', response.data);
      console.log('🔍 usePayments - Status code:', response.status);
      
      return response.data;
    } catch (err: any) {
      console.error('🔍 usePayments - Error al crear intención de pago:', err);
      console.error('🔍 usePayments - Error response:', err.response?.data);
      console.error('🔍 usePayments - Error status:', err.response?.status);
      
      const errorMessage = err.response?.data?.error || 'Error al crear intención de pago';
      setError(errorMessage);
      
      const errorResponse = {
        success: false,
        error: errorMessage,
        error_code: err.response?.data?.error_code
      };
      
      console.log('🔍 usePayments - Devolviendo respuesta de error:', errorResponse);
      return errorResponse;
    } finally {
      console.log('🔍 usePayments - Finalizando creación de intención de pago');
      setIsLoading(false);
    }
  }, []);

  const verifyPayment = useCallback(async (paymentId: number): Promise<VerifyPaymentResponse | null> => {
    try {
      console.log('🔍 usePayments - Iniciando verificación de pago...');
      console.log('🔍 usePayments - Payment ID:', paymentId);
      
      setIsLoading(true);
      setError(null);

      console.log(`🔍 usePayments - Enviando petición POST a /payments/${paymentId}/verify_payment/`);
      const response = await apiClient.post(`/payments/${paymentId}/verify_payment/`);
      
      console.log('🔍 usePayments - Respuesta de verificación:', response.data);
      console.log('🔍 usePayments - Status code:', response.status);
      
      return response.data;
    } catch (err: any) {
      console.error('🔍 usePayments - Error al verificar pago:', err);
      console.error('🔍 usePayments - Error response:', err.response?.data);
      console.error('🔍 usePayments - Error status:', err.response?.status);
      
      const errorMessage = err.response?.data?.error || 'Error al verificar pago';
      setError(errorMessage);
      
      const errorResponse = {
        success: false,
        error: errorMessage,
        error_code: err.response?.data?.error_code
      };
      
      console.log('🔍 usePayments - Devolviendo respuesta de error:', errorResponse);
      return errorResponse;
    } finally {
      console.log('🔍 usePayments - Finalizando verificación de pago');
      setIsLoading(false);
    }
  }, []);

  const refundPayment = useCallback(async (paymentId: number, data: RefundPaymentRequest): Promise<RefundPaymentResponse | null> => {
    try {
      console.log('🔍 usePayments - Iniciando reembolso de pago...');
      console.log('🔍 usePayments - Payment ID:', paymentId);
      console.log('🔍 usePayments - Datos de reembolso:', data);
      
      setIsLoading(true);
      setError(null);

      console.log(`🔍 usePayments - Enviando petición POST a /payments/${paymentId}/refund_payment/`);
      const response = await apiClient.post(`/payments/${paymentId}/refund_payment/`, data);
      
      console.log('🔍 usePayments - Respuesta de reembolso:', response.data);
      console.log('🔍 usePayments - Status code:', response.status);
      
      return response.data;
    } catch (err: any) {
      console.error('🔍 usePayments - Error al procesar reembolso:', err);
      console.error('🔍 usePayments - Error response:', err.response?.data);
      console.error('🔍 usePayments - Error status:', err.response?.status);
      
      const errorMessage = err.response?.data?.error || 'Error al procesar reembolso';
      setError(errorMessage);
      
      const errorResponse = {
        success: false,
        error: errorMessage,
        error_code: err.response?.data?.error_code
      };
      
      console.log('🔍 usePayments - Devolviendo respuesta de error:', errorResponse);
      return errorResponse;
    } finally {
      console.log('🔍 usePayments - Finalizando reembolso de pago');
      setIsLoading(false);
    }
  }, []);

  const getPaymentMethods = useCallback(async (provider: string): Promise<any> => {
    try {
      setIsLoading(true);
      setError(null);

      // Esta funcionalidad se implementaría según el proveedor
      // Por ahora retornamos un mock
      return {
        success: true,
        payment_methods: ['credit_card', 'debit_card', 'bank_transfer']
      };
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Error al obtener métodos de pago';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    getProviders,
    createPaymentIntent,
    verifyPayment,
    refundPayment,
    getPaymentMethods,
    clearError: () => setError(null)
  };
};
