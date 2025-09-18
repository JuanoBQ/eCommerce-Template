import { Metadata } from 'next'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article' | 'product'
  price?: number
  currency?: string
  availability?: 'in stock' | 'out of stock' | 'preorder'
  brand?: string
  category?: string
}

const defaultSEO = {
  title: 'eCommerce Template - Tienda Online de Ropa',
  description: 'Descubre la mejor selección de ropa y accesorios en nuestra tienda online. Calidad, estilo y comodidad en cada prenda.',
  keywords: ['ropa', 'moda', 'tienda online', 'accesorios', 'calidad'],
  image: '/images/og-image.jpg',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  type: 'website' as const,
}

export function generateMetadata({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  price,
  currency = 'COP',
  availability = 'in stock',
  brand,
  category,
}: SEOProps = {}): Metadata {
  const fullTitle = title ? `${title} | ${defaultSEO.title}` : defaultSEO.title
  const fullDescription = description || defaultSEO.description
  const fullKeywords = keywords ? [...defaultSEO.keywords, ...keywords] : defaultSEO.keywords
  const fullImage = image || defaultSEO.image
  const fullUrl = url || defaultSEO.url

  const metadata: Metadata = {
    title: fullTitle,
    description: fullDescription,
    keywords: fullKeywords.join(', '),
    openGraph: {
      title: fullTitle,
      description: fullDescription,
      url: fullUrl,
      siteName: 'eCommerce Template',
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      locale: 'es_CO',
      type,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: fullDescription,
      images: [fullImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: fullUrl,
    },
  }

  // Agregar metadata específica para productos
  if (type === 'product' && price) {
    metadata.other = {
      'product:price:amount': price.toString(),
      'product:price:currency': currency,
      'product:availability': availability,
    }

    if (brand) {
      metadata.other['product:brand'] = brand
    }

    if (category) {
      metadata.other['product:category'] = category
    }
  }

  return metadata
}

// Metadata específica para páginas comunes
export const commonMetadata = {
  home: generateMetadata({
    title: 'Inicio',
    description: 'Bienvenido a nuestra tienda online de ropa. Descubre las últimas tendencias en moda.',
  }),
  
  shop: generateMetadata({
    title: 'Tienda',
    description: 'Explora nuestra amplia selección de ropa y accesorios para todas las ocasiones.',
    keywords: ['tienda', 'catalogo', 'productos'],
  }),
  
  about: generateMetadata({
    title: 'Acerca de Nosotros',
    description: 'Conoce más sobre nuestra historia y compromiso con la calidad y el estilo.',
  }),
  
  contact: generateMetadata({
    title: 'Contacto',
    description: 'Ponte en contacto con nosotros. Estamos aquí para ayudarte.',
  }),
  
  cart: generateMetadata({
    title: 'Carrito de Compras',
    description: 'Revisa los productos en tu carrito y completa tu compra.',
  }),
  
  checkout: generateMetadata({
    title: 'Finalizar Compra',
    description: 'Completa tu compra de forma segura y rápida.',
  }),
}

// Función para generar metadata de productos
export function generateProductMetadata(product: {
  name: string
  description: string
  price: number
  images?: string[]
  brand?: string
  category?: string
  inStock?: boolean
}): Metadata {
  return generateMetadata({
    title: product.name,
    description: product.description,
    keywords: [product.name, product.brand, product.category].filter(Boolean),
    image: product.images?.[0],
    type: 'product',
    price: product.price,
    availability: product.inStock ? 'in stock' : 'out of stock',
    brand: product.brand,
    category: product.category,
  })
}
