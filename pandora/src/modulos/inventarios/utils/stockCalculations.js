/**
 * Utilidades para cálculos de inventario
 */

/**
 * Calcula el costo promedio ponderado
 */
export const calcularCostoPromedio = (cantidadActual, costoActual, cantidadNueva, costoNuevo) => {
  if (cantidadActual + cantidadNueva === 0) return 0;
  
  const totalAnterior = cantidadActual * costoActual;
  const totalNuevo = cantidadNueva * costoNuevo;
  
  return (totalAnterior + totalNuevo) / (cantidadActual + cantidadNueva);
};

/**
 * Calcula el punto de reorden basado en consumo promedio
 */
export const calcularPuntoReorden = (consumoPromedioDiario, tiempoEntrega, stockSeguridad = 0) => {
  return (consumoPromedioDiario * tiempoEntrega) + stockSeguridad;
};

/**
 * Calcula la cantidad económica de pedido (EOQ)
 */
export const calcularEOQ = (demandaAnual, costoPedido, costoAlmacenamiento) => {
  if (costoAlmacenamiento === 0) return 0;
  return Math.sqrt((2 * demandaAnual * costoPedido) / costoAlmacenamiento);
};

/**
 * Calcula la rotación de inventario
 */
export const calcularRotacionInventario = (costoVentas, inventarioPromedio) => {
  if (inventarioPromedio === 0) return 0;
  return costoVentas / inventarioPromedio;
};

/**
 * Calcula días de inventario
 */
export const calcularDiasInventario = (inventarioActual, consumoPromedioDiario) => {
  if (consumoPromedioDiario === 0) return Infinity;
  return Math.floor(inventarioActual / consumoPromedioDiario);
};

/**
 * Determina la criticidad del stock
 */
export const determinarCriticidad = (cantidadActual, stockMinimo, stockMaximo = null) => {
  if (cantidadActual === 0) return 'agotado';
  if (cantidadActual <= stockMinimo) return 'critico';
  if (cantidadActual <= stockMinimo * 1.5) return 'bajo';
  if (stockMaximo && cantidadActual >= stockMaximo) return 'alto';
  return 'normal';
};

/**
 * Calcula el valor del inventario
 */
export const calcularValorInventario = (items) => {
  return items.reduce((total, item) => {
    return total + (item.cantidad * item.costo_promedio);
  }, 0);
};

/**
 * Genera sugerencias de reabastecimiento
 */
export const generarSugerenciasReabastecimiento = (stock, consumoPromedio, tiempoEntrega) => {
  const puntoReorden = calcularPuntoReorden(consumoPromedio, tiempoEntrega, stock.stock_minimo);
  
  if (stock.cantidad <= puntoReorden) {
    const cantidadSugerida = stock.stock_maximo 
      ? stock.stock_maximo - stock.cantidad
      : (stock.stock_minimo * 3) - stock.cantidad;
    
    return {
      necesitaReabastecimiento: true,
      cantidadSugerida: Math.ceil(cantidadSugerida),
      urgencia: stock.cantidad <= stock.stock_minimo ? 'alta' : 'media',
      diasCobertura: calcularDiasInventario(stock.cantidad, consumoPromedio),
    };
  }
  
  return {
    necesitaReabastecimiento: false,
    diasCobertura: calcularDiasInventario(stock.cantidad, consumoPromedio),
  };
};

/**
 * Valida si hay suficiente stock disponible
 */
export const validarDisponibilidad = (cantidadRequerida, cantidadDisponible, cantidadReservada = 0) => {
  const disponibleReal = cantidadDisponible - cantidadReservada;
  return {
    disponible: disponibleReal >= cantidadRequerida,
    faltante: cantidadRequerida > disponibleReal ? cantidadRequerida - disponibleReal : 0,
    disponibleReal,
  };
};

/**
 * Formatea el estado del stock para mostrar
 */
export const formatearEstadoStock = (estado) => {
  const estados = {
    agotado: { label: 'Agotado', color: 'destructive' },
    critico: { label: 'Crítico', color: 'destructive' },
    bajo: { label: 'Bajo', color: 'warning' },
    normal: { label: 'Normal', color: 'success' },
    alto: { label: 'Alto', color: 'secondary' },
  };
  
  return estados[estado] || estados.normal;
};
