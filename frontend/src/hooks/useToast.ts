import { useCallback } from 'react'
import toast from 'react-hot-toast'

export const useToast = () => {
  const showSuccess = useCallback((message: string) => {
    return toast.success(message, {
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
    })
  }, [])

  const showError = useCallback((message: string) => {
    return toast.error(message, {
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
    })
  }, [])

  const showLoading = useCallback((message: string) => {
    return toast.loading(message, {
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
    })
  }, [])

  const showInfo = useCallback((message: string) => {
    return toast(message, {
      duration: 3000,
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
    })
  }, [])

  const showWarning = useCallback((message: string) => {
    return toast(message, {
      duration: 3000,
      style: {
        background: '#fffbeb',
        color: '#92400e',
        border: '1px solid #fed7aa',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        fontSize: '14px',
        fontWeight: '500',
        padding: '12px 16px',
        maxWidth: '320px',
        minWidth: '280px',
      },
      iconTheme: {
        primary: '#f59e0b',
        secondary: '#ffffff',
      },
    })
  }, [])

  const updateToast = useCallback((toastId: string, message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const config = {
      success: {
        style: {
          background: '#f0fdf4',
          color: '#166534',
          border: '1px solid #bbf7d0',
        },
        iconTheme: {
          primary: '#22c55e',
          secondary: '#ffffff',
        },
      },
      error: {
        style: {
          background: '#fef2f2',
          color: '#991b1b',
          border: '1px solid #fecaca',
        },
        iconTheme: {
          primary: '#ef4444',
          secondary: '#ffffff',
        },
      },
      info: {
        style: {
          background: '#f8fafc',
          color: '#1e40af',
          border: '1px solid #dbeafe',
        },
        iconTheme: {
          primary: '#3b82f6',
          secondary: '#ffffff',
        },
      },
      warning: {
        style: {
          background: '#fffbeb',
          color: '#92400e',
          border: '1px solid #fed7aa',
        },
        iconTheme: {
          primary: '#f59e0b',
          secondary: '#ffffff',
        },
      },
    }

    return toast(toastId, {
      ...config[type],
      duration: type === 'error' ? 4000 : 2500,
    })
  }, [])

  const dismissToast = useCallback((toastId?: string) => {
    if (toastId) {
      toast.dismiss(toastId)
    } else {
      toast.dismiss()
    }
  }, [])

  return {
    showSuccess,
    showError,
    showLoading,
    showInfo,
    showWarning,
    updateToast,
    dismissToast,
  }
}

export default useToast
