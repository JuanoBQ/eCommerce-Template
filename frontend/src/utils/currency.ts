/**
 * Utilidades para formateo de moneda en pesos colombianos (COP)
 */

/**
 * Formatea un precio en pesos colombianos
 * @param price - Precio en centavos (desde la base de datos)
 * @param options - Opciones de formateo
 * @returns Precio formateado como string
 */
export const formatPrice = (
  price: number, 
  options: {
    showCurrency?: boolean;
    showDecimals?: boolean;
    compact?: boolean;
  } = {}
): string => {
  const {
    showCurrency = true,
    showDecimals = false,
    compact = false
  } = options;

  // Convertir de centavos a pesos
  const pesos = price / 100;

  const formatOptions: Intl.NumberFormatOptions = {
    style: showCurrency ? 'currency' : 'decimal',
    currency: 'COP',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
    ...(compact && { notation: 'compact' })
  };

  return new Intl.NumberFormat('es-CO', formatOptions).format(pesos);
};

/**
 * Formatea un precio con descuento
 * @param originalPrice - Precio original en centavos
 * @param discountPrice - Precio con descuento en centavos
 * @returns Objeto con precios formateados y porcentaje de descuento
 */
export const formatPriceWithDiscount = (
  originalPrice: number,
  discountPrice: number
) => {
  const original = formatPrice(originalPrice);
  const discounted = formatPrice(discountPrice);
  const discountPercentage = Math.round(((originalPrice - discountPrice) / originalPrice) * 100);

  return {
    original,
    discounted,
    discountPercentage
  };
};

/**
 * Formatea un rango de precios
 * @param minPrice - Precio mínimo en centavos
 * @param maxPrice - Precio máximo en centavos
 * @returns Rango de precios formateado
 */
export const formatPriceRange = (minPrice: number, maxPrice: number): string => {
  if (minPrice === maxPrice) {
    return formatPrice(minPrice);
  }
  
  return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
};

/**
 * Formatea un precio para mostrar en listas compactas
 * @param price - Precio en centavos
 * @returns Precio formateado de forma compacta
 */
export const formatCompactPrice = (price: number): string => {
  return formatPrice(price, { compact: true });
};

/**
 * Formatea un precio sin símbolo de moneda
 * @param price - Precio en centavos
 * @returns Precio formateado sin símbolo de moneda
 */
export const formatPriceWithoutCurrency = (price: number): string => {
  return formatPrice(price, { showCurrency: false });
};

/**
 * Formatea un precio con decimales
 * @param price - Precio en centavos
 * @returns Precio formateado con decimales
 */
export const formatPriceWithDecimals = (price: number): string => {
  return formatPrice(price, { showDecimals: true });
};
