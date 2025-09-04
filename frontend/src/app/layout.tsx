import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { AuthProvider } from '@/components/providers/auth-provider'
import ConditionalLayout from '@/components/layout/conditional-layout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FitStore - Ropa Deportiva Minimalista',
  description: 'Descubre la mejor ropa deportiva con un diseño minimalista y elegante. Calidad premium, tecnología avanzada y estilo único.',
  keywords: 'ropa deportiva, fitness, gym, atletas, entrenamiento, moda deportiva, minimalista, elegante',
  authors: [{ name: 'FitStore Team' }],
  openGraph: {
    title: 'FitStore - Ropa Deportiva Minimalista',
    description: 'Descubre la mejor ropa deportiva con un diseño minimalista y elegante.',
    type: 'website',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FitStore - Ropa Deportiva Minimalista',
    description: 'Descubre la mejor ropa deportiva con un diseño minimalista y elegante.',
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
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1e293b',
                  color: '#fff',
                  border: '1px solid #334155',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#00ff88',
                    secondary: '#0f172a',
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
