import React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'black' | 'white'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
    
    const variants = {
      primary: 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
      outline: 'border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 focus:ring-gray-500',
      ghost: 'text-gray-900 hover:bg-gray-100 focus:ring-gray-500',
      black: 'bg-black text-white hover:bg-gray-900 focus:ring-gray-500',
      white: 'bg-white text-black hover:bg-gray-50 focus:ring-gray-500'
    }
    
    const sizes = {
      sm: 'px-3 py-2 text-sm rounded-md',
      md: 'px-4 py-2 text-base rounded-md',
      lg: 'px-6 py-3 text-lg rounded-md'
    }

    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
