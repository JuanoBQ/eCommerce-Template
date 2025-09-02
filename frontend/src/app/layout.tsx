import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { AuthProvider } from '@/components/providers/auth-provider'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FitStore - Ropa Deportiva Premium',
  description: 'Descubre la mejor ropa deportiva diseñada para atletas que buscan superar sus límites. Calidad premium, tecnología avanzada y estilo único.',
  keywords: 'ropa deportiva, fitness, gym, atletas, entrenamiento, moda deportiva, gymshark, nike, adidas',
  authors: [{ name: 'FitStore Team' }],
  openGraph: {
    title: 'FitStore - Ropa Deportiva Premium',
    description: 'Descubre la mejor ropa deportiva diseñada para atletas que buscan superar sus límites.',
    type: 'website',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FitStore - Ropa Deportiva Premium',
    description: 'Descubre la mejor ropa deportiva diseñada para atletas que buscan superar sus límites.',
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
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
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
