"use client"

import { usePathname } from 'next/navigation'
import Header from './header'
import Footer from './footer'
import AdminHeader from './admin-header'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

const ConditionalLayout = ({ children }: ConditionalLayoutProps) => {
  const pathname = usePathname()
  const isAdminRoute = pathname.startsWith('/admin')

  if (isAdminRoute) {
    return (
      <div className="min-h-screen">
        {children}
        {/* Admin layout already includes its own header and sidebar */}
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default ConditionalLayout
