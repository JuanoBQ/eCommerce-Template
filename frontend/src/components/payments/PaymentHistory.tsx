'use client';

import React, { useState, useEffect } from 'react';
import { usePayments } from '@/hooks/usePayments';
import PaymentStatus from './PaymentStatus';
import { CreditCard, Calendar, DollarSign, ExternalLink } from 'lucide-react';

interface Payment {
  id: number;
  payment_id: string;
  amount: number;
  currency: string;
  method: string;
  provider: string;
  status: string;
  created_at: string;
  processed_at?: string;
  failure_reason?: string;
  order: {
    id: number;
    order_number: string;
  };
}

interface PaymentHistoryProps {
  className?: string;
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({ className = '' }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPayments = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Aquí harías la llamada a la API para obtener los pagos del usuario
        // const response = await apiClient.get('/payments/');
        // setPayments(response.data.results);
        
        // Mock data por ahora
        setPayments([]);
      } catch (err: any) {
        setError('Error al cargar el historial de pagos');
      } finally {
        setIsLoading(false);
      }
    };

    loadPayments();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'credit_card':
      case 'debit_card':
        return <CreditCard className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No hay pagos registrados
        </h3>
        <p className="text-gray-500">
          Tus pagos aparecerán aquí una vez que realices una compra.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Historial de Pagos
        </h2>
        <span className="text-sm text-gray-500">
          {payments.length} pago{payments.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-4">
        {payments.map((payment) => (
          <div
            key={payment.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  {getMethodIcon(payment.method)}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    Pago #{payment.payment_id}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Orden #{payment.order.order_number}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-lg font-semibold text-gray-900">
                  {formatAmount(payment.amount, payment.currency)}
                </p>
                <p className="text-sm text-gray-500 capitalize">
                  {payment.provider}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(payment.created_at)}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  payment.status === 'completed' 
                    ? 'bg-green-100 text-green-800'
                    : payment.status === 'failed'
                    ? 'bg-red-100 text-red-800'
                    : payment.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {payment.status === 'completed' ? 'Completado' :
                   payment.status === 'failed' ? 'Fallido' :
                   payment.status === 'pending' ? 'Pendiente' :
                   payment.status === 'processing' ? 'Procesando' :
                   payment.status === 'cancelled' ? 'Cancelado' :
                   payment.status === 'refunded' ? 'Reembolsado' :
                   payment.status}
                </span>
                
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>

            {payment.failure_reason && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  <span className="font-medium">Error:</span> {payment.failure_reason}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentHistory;
