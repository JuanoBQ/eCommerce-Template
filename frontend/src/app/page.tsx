import { Metadata } from 'next'
import Hero from '@/components/shop/hero'
import FeaturedProducts from '@/components/shop/featured-products'
import Categories from '@/components/shop/categories'
import Newsletter from '@/components/shop/newsletter'

export const metadata: Metadata = {
  title: 'Inicio - Ecommerce de Ropa',
  description: 'Descubre las últimas tendencias en moda. Ropa de calidad para hombres, mujeres y niños.',
}

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Hero />
      <FeaturedProducts />
      <Categories />
      <Newsletter />
    </main>
  )
}
