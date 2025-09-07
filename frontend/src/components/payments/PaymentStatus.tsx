'use client';

import React from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  RefreshCw,
  CreditCard,
  Banknote
} from 'lucide-react';

interface PaymentStatusProps {
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  amount?: number;
  currency?: string;
  paymentId?: string;
  provider?: string;
  processedAt?: string;
  failureReason?: string;
  className?: string;
}

const statusConfig = {
  pending: {
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    title: 'Pago Pendiente',
    description: 'Tu pago está siendo procesado'
  },
  processing: {
    icon: RefreshCw,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    title: 'Procesando Pago',
    description: 'Estamos verificando tu pago'
  },
  completed: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    title: 'Pago Completado',
    description: 'Tu pago ha sido procesado exitosamente'
  },
  failed: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    title: 'Pago Fallido',
    description: 'No se pudo procesar tu pago'
  },
  cancelled: {
    icon: XCircle,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    title: 'Pago Cancelado',
    description: 'El pago fue cancelado'
  },
  refunded: {
    icon: Banknote,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    title: 'Pago Reembolsado',
    description: 'El pago ha sido reembolsado'
  }
};

const PaymentStatus: React.FC<PaymentStatusProps> = ({
  status,
  amount,
  currency = 'COP',
  paymentId,
  provider,
  processedAt,
  failureReason,
  className = ''
}) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-6 ${className}`}>
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-full ${config.bgColor} ${config.color}`}>
          <Icon className={`w-6 h-6 ${status === 'processing' ? 'animate-spin' : ''}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className={`text-lg font-semibold ${config.color}`}>
              {config.title}
            </h3>
            {provider && (
              <span className="px-2 py-1 text-xs font-medium bg-white rounded-full capitalize">
                {provider}
              </span>
            )}
          </div>
          
          <p className={`text-sm mt-1 ${config.color.replace('600', '700')}`}>
            {config.description}
          </p>

          {amount && (
            <div className="mt-3">
              <p className="text-2xl font-bold text-gray-900">
                {formatAmount(amount)}
              </p>
            </div>
          )}

          {paymentId && (
            <div className="mt-3">
              <p className="text-sm text-gray-600">
                <span className="font-medium">ID del pago:</span> {paymentId}
              </p>
            </div>
          )}

          {processedAt && (
            <div className="mt-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Procesado:</span> {formatDate(processedAt)}
              </p>
            </div>
          )}

          {failureReason && (
            <div className="mt-3 p-3 bg-red-100 border border-red-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800">Razón del fallo:</p>
                  <p className="text-sm text-red-700 mt-1">{failureReason}</p>
                </div>
              </div>
            </div>
          )}

          {status === 'processing' && (
            <div className="mt-4">
              <div className="flex items-center space-x-2 text-sm text-blue-600">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Verificando estado del pago...</span>
              </div>
            </div>
          )}

          {status === 'completed' && (
            <div className="mt-4">
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span>¡Pago confirmado! Recibirás un email de confirmación.</span>
              </div>
            </div>
          )}

          {status === 'failed' && (
            <div className="mt-4">
              <div className="flex items-center space-x-2 text-sm text-red-600">
                <XCircle className="w-4 h-4" />
                <span>El pago no pudo ser procesado. Intenta nuevamente.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentStatus;
