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
      
      const params = new URLSearchParams();
      if (country) params.append('country', country);
      if (currency) params.append('currency', currency);
      
      const queryString = params.toString();
      const url = `/payments/providers/${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiClient.get(url) as PaymentProvidersResponse;
      return response;
    } catch (err: any) {
      const errorMessage = 'Error al obtener proveedores de pago';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createPaymentIntent = useCallback(async (data: CreatePaymentIntentRequest): Promise<CreatePaymentIntentResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.post('/payments/payments/create_payment_intent/', data) as CreatePaymentIntentResponse;
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Error al crear intención de pago';
      setError(errorMessage);
      
      const errorResponse = {
        success: false,
        error: errorMessage,
        error_code: err.response?.data?.error_code
      };
      
      return errorResponse;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyPayment = useCallback(async (paymentId: number): Promise<VerifyPaymentResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.post(`/payments/payments/${paymentId}/verify_payment/`) as any;
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Error al verificar pago';
      setError(errorMessage);
      
      const errorResponse = {
        success: false,
        error: errorMessage,
        error_code: err.response?.data?.error_code
      };
      
      return errorResponse;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refundPayment = useCallback(async (paymentId: number, data: RefundPaymentRequest): Promise<RefundPaymentResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.post(`/payments/payments/${paymentId}/refund_payment/`, data) as any;
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Error al procesar reembolso';
      setError(errorMessage);
      
      const errorResponse = {
        success: false,
        error: errorMessage,
        error_code: err.response?.data?.error_code
      };
      
      return errorResponse;
    } finally {
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