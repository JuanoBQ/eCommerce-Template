"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Play } from 'lucide-react'

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
      link: "/shop/new",
      gradient: "from-neon-green/20 to-neon-blue/20"
    },
    {
      id: 2,
      title: "ENTRENA MÁS FUERTE",
      subtitle: "SIN LÍMITES",
      description: "Ropa que se adapta a tu movimiento, tecnología que potencia tu entrenamiento",
      image: "/images/hero-2.jpg",
      cta: "Comprar Ahora",
      link: "/shop/men",
      gradient: "from-neon-pink/20 to-neon-purple/20"
    },
    {
      id: 3,
      title: "MUJERES",
      subtitle: "POWER COLLECTION",
      description: "Diseñado para mujeres que no se conforman con menos que la excelencia",
      image: "/images/hero-3.jpg",
      cta: "Explorar",
      link: "/shop/women",
      gradient: "from-neon-blue/20 to-neon-green/20"
    }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [slides.length])

  return (
    <section className="relative h-screen overflow-hidden">
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
          <div className="absolute inset-0 bg-dark-900/40" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            <div className="animate-fade-in">
              <h1 className="text-6xl md:text-8xl font-display font-black mb-4">
                <span className="block text-white">{slides[currentSlide].title}</span>
                <span className="block text-gradient">{slides[currentSlide].subtitle}</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-lg leading-relaxed">
                {slides[currentSlide].description}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href={slides[currentSlide].link}
                  className="btn-primary inline-flex items-center justify-center group"
                >
                  {slides[currentSlide].cta}
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
                
                <button className="btn-outline inline-flex items-center justify-center group">
                  <Play className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                  Ver Video
                </button>
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
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'bg-neon-green scale-125'
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
          <div className="w-px h-8 bg-gradient-to-b from-neon-green to-transparent" />
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-1/4 right-8 z-10 animate-pulse-slow">
        <div className="w-20 h-20 bg-neon-green/20 rounded-full blur-xl" />
      </div>
      <div className="absolute bottom-1/4 left-8 z-10 animate-pulse-slow delay-1000">
        <div className="w-32 h-32 bg-neon-blue/20 rounded-full blur-xl" />
      </div>
    </section>
  )
}

export default Hero