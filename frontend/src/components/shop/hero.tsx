"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      id: 1,
      title: "NUEVA COLECCIÓN",
      subtitle: "FITNESS 2024",
      description: "Descubre la última tecnología en ropa deportiva diseñada para maximizar tu rendimiento",
      image: "/images/hero-1.jpg",
      cta: "Ver Colección",
      link: "/tienda",
      gradient: "from-primary-500/10 to-primary-600/10"
    },
    {
      id: 2,
      title: "ENTRENA MÁS FUERTE",
      subtitle: "SIN LÍMITES",
      description: "Ropa que se adapta a tu movimiento, tecnología que potencia tu entrenamiento",
      image: "/images/hero-2.jpg",
      cta: "Comprar Ahora",
      link: "/tienda?gender=men",
      gradient: "from-gray-500/10 to-gray-600/10"
    },
    {
      id: 3,
      title: "MUJERES",
      subtitle: "POWER COLLECTION",
      description: "Diseñado para mujeres que no se conforman con menos que la excelencia",
      image: "/images/hero-3.jpg",
      cta: "Explorar",
      link: "/tienda?gender=women",
      gradient: "from-primary-500/10 to-primary-600/10"
    }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [slides.length])

  return (
    <section className="relative h-screen overflow-hidden bg-white">
      {/* Background Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient}`} />
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${slide.image})` }}
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            <div className="animate-fade-in">
              <h1 className="text-6xl md:text-8xl font-display font-black mb-4">
                <span className="block text-white">{slides[currentSlide].title}</span>
                <span className="block text-primary-500">{slides[currentSlide].subtitle}</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-lg leading-relaxed">
                {slides[currentSlide].description}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href={slides[currentSlide].link} className="inline-flex items-center justify-center group">
                  <Button variant="primary" size="lg">
                    {slides[currentSlide].cta}
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </Button>
                </Link>
                
                <Button variant="outline" size="lg" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <Play className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                  Ver Video
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex space-x-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              title={`Ir a la diapositiva ${index + 1}`}
              aria-label={`Ir a la diapositiva ${index + 1}`}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'bg-primary-500 scale-125'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 right-8 z-20">
        <div className="flex flex-col items-center space-y-2 text-white/70">
          <span className="text-sm font-medium">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-primary-500 to-transparent" />
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-1/4 right-8 z-10 animate-pulse-slow">
        <div className="w-20 h-20 bg-primary-500/20 rounded-full blur-xl" />
      </div>
      <div className="absolute bottom-1/4 left-8 z-10 animate-pulse-slow delay-1000">
        <div className="w-32 h-32 bg-primary-500/20 rounded-full blur-xl" />
      </div>
    </section>
  )
}

export default Hero
