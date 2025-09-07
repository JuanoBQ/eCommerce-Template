'use client';

import React, { useState, useEffect } from 'react';
import { usePayments, PaymentProvider } from '@/hooks/usePayments';
import { CreditCard, Smartphone, Building2, Globe } from 'lucide-react';

interface PaymentProviderSelectorProps {
  country?: string;
  currency?: string;
  selectedProvider?: string;
  onProviderSelect: (provider: string) => void;
  className?: string;
}

const providerIcons = {
  wompi: <Building2 className="w-6 h-6" />,
  mercadopago: <Smartphone className="w-6 h-6" />,
  stripe: <Globe className="w-6 h-6" />,
  default: <CreditCard className="w-6 h-6" />
};

const PaymentProviderSelector: React.FC<PaymentProviderSelectorProps> = ({
  country = 'CO',
  currency = 'COP',
  selectedProvider,
  onProviderSelect,
  className = ''
}) => {
  const { getProviders, isLoading, error } = usePayments();
  const [providers, setProviders] = useState<Record<string, PaymentProvider>>({});
  const [availableProviders, setAvailableProviders] = useState<string[]>([]);

  useEffect(() => {
    const loadProviders = async () => {
      console.log('🔍 PaymentProviderSelector - Cargando proveedores...', { country, currency });
      const response = await getProviders(country, currency);
      console.log('🔍 PaymentProviderSelector - Respuesta del API:', response);
      if (response) {
        setProviders(response.configs);
        setAvailableProviders(response.providers);
        console.log('🔍 PaymentProviderSelector - Proveedores configurados:', response.providers);
        console.log('🔍 PaymentProviderSelector - Configuraciones:', response.configs);
        
        // Seleccionar el proveedor por defecto si no hay uno seleccionado
        if (!selectedProvider && response.default_provider) {
          onProviderSelect(response.default_provider);
        }
      } else {
        console.log('🔍 PaymentProviderSelector - No se recibió respuesta del API');
      }
    };

    loadProviders();
  }, [country, currency, getProviders, selectedProvider, onProviderSelect]);

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
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

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Selecciona tu método de pago
        </h3>
        <p className="text-sm text-gray-600">
          Elige la pasarela de pago que prefieras
        </p>
      </div>

      <div className="space-y-3">
        {availableProviders.map((providerKey) => {
          const provider = providers[providerKey];
          if (!provider) return null;

          const isSelected = selectedProvider === providerKey;
          const Icon = providerIcons[providerKey as keyof typeof providerIcons] || providerIcons.default;

          return (
            <button
              key={providerKey}
              onClick={() => onProviderSelect(providerKey)}
              className={`w-full p-4 border-2 rounded-lg transition-all duration-200 ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-lg ${
                  isSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {Icon}
                </div>
                
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">
                      {provider.display_name}
                    </h4>
                    {provider.environment === 'sandbox' && (
                      <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                        Sandbox
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-1">
                    {provider.description}
                  </p>
                  
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-gray-500">Monedas:</span>
                      <span className="text-xs font-medium text-gray-700">
                        {provider.supported_currencies.join(', ')}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-gray-500">Países:</span>
                      <span className="text-xs font-medium text-gray-700">
                        {provider.supported_countries.join(', ')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={`w-5 h-5 rounded-full border-2 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                }`}>
                  {isSelected && (
                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {availableProviders.length === 0 && (
        <div className="text-center py-8">
          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No hay proveedores de pago disponibles</p>
          <p className="text-sm text-gray-400 mt-1">
            Para {country} con moneda {currency}
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentProviderSelector;
