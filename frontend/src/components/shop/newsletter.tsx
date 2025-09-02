"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Mail, Check } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('Por favor ingresa tu correo electrónico')
      return
    }

    setIsLoading(true)
    
    try {
      // Aquí harías la llamada a la API para suscribir al usuario
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulación
      
      setIsSubscribed(true)
      setEmail('')
      toast.success('¡Te has suscrito exitosamente!')
    } catch (error) {
      toast.error('Error al suscribirse. Inténtalo de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubscribed) {
    return (
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto bg-primary-foreground/10 border-primary-foreground/20">
            <CardContent className="p-8 text-center">
              <div className="bg-green-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">¡Gracias por suscribirte!</h2>
              <p className="text-primary-foreground/80">
                Recibirás nuestras últimas ofertas y novedades en tu correo electrónico.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <Card className="max-w-2xl mx-auto bg-primary-foreground/10 border-primary-foreground/20">
          <CardContent className="p-8 text-center">
            <div className="bg-primary-foreground/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Mantente al día</h2>
            <p className="text-primary-foreground/80 mb-6">
              Suscríbete a nuestro boletín y recibe ofertas exclusivas, 
              nuevas colecciones y consejos de moda.
            </p>
            
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Tu correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background text-foreground border-primary-foreground/20"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              >
                {isLoading ? 'Suscribiendo...' : 'Suscribirse'}
              </Button>
            </form>
            
            <p className="text-sm text-primary-foreground/60 mt-4">
              No compartimos tu información. Puedes cancelar la suscripción en cualquier momento.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
