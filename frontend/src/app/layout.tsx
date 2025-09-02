import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { AuthProvider } from '@/components/providers/auth-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Ecommerce de Ropa - Tienda Online',
  description: 'Descubre las últimas tendencias en moda. Ropa de calidad para hombres, mujeres y niños.',
  keywords: 'ropa, moda, tienda online, ecommerce, fashion',
  authors: [{ name: 'Ecommerce Team' }],
  openGraph: {
    title: 'Ecommerce de Ropa - Tienda Online',
    description: 'Descubre las últimas tendencias en moda. Ropa de calidad para hombres, mujeres y niños.',
    type: 'website',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ecommerce de Ropa - Tienda Online',
    description: 'Descubre las últimas tendencias en moda. Ropa de calidad para hombres, mujeres y niños.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#4ade80',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
