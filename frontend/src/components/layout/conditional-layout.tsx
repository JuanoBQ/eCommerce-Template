"use client"

import { usePathname } from 'next/navigation'
import Header from './header'
import Footer from './footer'
// import AdminHeader from './admin-header' // Archivo no existe

interface ConditionalLayoutProps {
  children: React.ReactNode
}

const ConditionalLayout = ({ children }: ConditionalLayoutProps) => {
  const pathname = usePathname()
  const isAdminRoute = pathname.startsWith('/admin')
  const isAuthRoute = pathname.startsWith('/auth')

  if (isAdminRoute || isAuthRoute) {
    return (
      <div className="min-h-screen">
        {children}
        {/* Admin and Auth layouts don't include header/footer */}
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default ConditionalLayout
