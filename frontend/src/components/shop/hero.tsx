"use client"

import { Button } from '@/components/ui/button'
import { ShoppingBag, Star, Truck, Shield } from 'lucide-react'
import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Descubre las Últimas Tendencias
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            Ropa de calidad para hombres, mujeres y niños. 
            Estilo, comodidad y moda en un solo lugar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              <Link href="/shop/products">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Ver Productos
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600">
              <Link href="/shop/categories">
                Explorar Categorías
              </Link>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Features */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="bg-white/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Truck className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Envío Gratis</h3>
            <p className="text-blue-100">En compras superiores a $100.000</p>
          </div>
          <div className="text-center">
            <div className="bg-white/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Compra Segura</h3>
            <p className="text-blue-100">Protegemos tus datos personales</p>
          </div>
          <div className="text-center">
            <div className="bg-white/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Star className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Calidad Premium</h3>
            <p className="text-blue-100">Productos seleccionados cuidadosamente</p>
          </div>
        </div>
      </div>
    </section>
  )
}
