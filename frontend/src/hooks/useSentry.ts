import { useCallback } from 'react'
import * as Sentry from '@sentry/nextjs'

export const useSentry = () => {
  const captureException = useCallback((error: Error, context?: Record<string, any>) => {
    Sentry.captureException(error, {
      tags: {
        component: 'frontend',
      },
      extra: context,
    })
  }, [])

  const captureMessage = useCallback((message: string, level: Sentry.SeverityLevel = 'info', context?: Record<string, any>) => {
    Sentry.captureMessage(message, {
      level,
      tags: {
        component: 'frontend',
      },
      extra: context,
    })
  }, [])

  const setUser = useCallback((user: { id: string; email?: string; username?: string }) => {
    Sentry.setUser(user)
  }, [])

  const setContext = useCallback((key: string, context: any) => {
    Sentry.setContext(key, context)
  }, [])

  const setTag = useCallback((key: string, value: string) => {
    Sentry.setTag(key, value)
  }, [])

  const addBreadcrumb = useCallback((breadcrumb: Sentry.Breadcrumb) => {
    Sentry.addBreadcrumb(breadcrumb)
  }, [])

  const startTransaction = useCallback((name: string, op: string) => {
    return Sentry.startTransaction({ name, op })
  }, [])

  return {
    captureException,
    captureMessage,
    setUser,
    setContext,
    setTag,
    addBreadcrumb,
    startTransaction,
  }
}
