"use client"

import React, { createContext, useContext, ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { User } from '@/types'

interface LoginCredentials {
  email: string
  password: string
  remember_me?: boolean
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (credentials: LoginCredentials) => Promise<{ success: boolean }>
  register: (data: any) => Promise<{ success: boolean; message: string }>
  logout: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  changePassword: (data: any) => Promise<void>
  refreshToken: () => Promise<string>
  checkAuthStatus: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth()

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
