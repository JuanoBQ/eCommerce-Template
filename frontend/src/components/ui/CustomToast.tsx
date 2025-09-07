"use client"

import { Toaster } from 'react-hot-toast'

export default function CustomToast() {
  return (
    <Toaster
      position="bottom-right"
      reverseOrder={false}
      gutter={12}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        // Configuración por defecto - minimalista
        duration: 3000,
        style: {
          background: '#ffffff',
          color: '#1f2937',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          fontSize: '14px',
          fontWeight: '500',
          padding: '12px 16px',
          maxWidth: '320px',
          minWidth: '280px',
        },
        // Configuración para éxito - verde minimalista
        success: {
          duration: 2500,
          style: {
            background: '#f0fdf4',
            color: '#166534',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            fontSize: '14px',
            fontWeight: '500',
            padding: '12px 16px',
            maxWidth: '320px',
            minWidth: '280px',
          },
          iconTheme: {
            primary: '#22c55e',
            secondary: '#ffffff',
          },
        },
        // Configuración para error - rojo minimalista
        error: {
          duration: 4000,
          style: {
            background: '#fef2f2',
            color: '#991b1b',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            fontSize: '14px',
            fontWeight: '500',
            padding: '12px 16px',
            maxWidth: '320px',
            minWidth: '280px',
          },
          iconTheme: {
            primary: '#ef4444',
            secondary: '#ffffff',
          },
        },
        // Configuración para loading - azul minimalista
        loading: {
          style: {
            background: '#f8fafc',
            color: '#1e40af',
            border: '1px solid #dbeafe',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            fontSize: '14px',
            fontWeight: '500',
            padding: '12px 16px',
            maxWidth: '320px',
            minWidth: '280px',
          },
          iconTheme: {
            primary: '#3b82f6',
            secondary: '#ffffff',
          },
        },
      }}
    />
  )
}
