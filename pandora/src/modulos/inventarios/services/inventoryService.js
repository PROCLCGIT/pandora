import { inventoryApi } from '../api/inventoryApi';

class InventoryService {
  /**
   * Calcula métricas de inventario
   */
  static calculateMetrics(stocks) {
    const metrics = {
      totalItems: stocks.length,
      totalValue: 0,
      averageValue: 0,
      stockByState: {
        normal: 0,
        bajo: 0,
        critico: 0,
        agotado: 0,
      },
      lowStockItems: [],
      expiringSoon: [],
    };

    stocks.forEach(stock => {
      // Valor total
      const itemValue = stock.cantidad * stock.costo_promedio;
      metrics.totalValue += itemValue;

      // Conteo por estado
      if (stock.estado_stock) {
        metrics.stockByState[stock.estado_stock]++;
      }

      // Items con stock bajo
      if (stock.estado_stock === 'critico' || stock.estado_stock === 'bajo') {
        metrics.lowStockItems.push({
          id: stock.id,
          producto: stock.producto_detalle?.nombre,
          cantidad: stock.cantidad,
          minimo: stock.stock_minimo,
          estado: stock.estado_stock,
        });
      }

      // Items próximos a vencer
      if (stock.fecha_vencimiento) {
        const diasParaVencer = Math.floor(
          (new Date(stock.fecha_vencimiento) - new Date()) / (1000 * 60 * 60 * 24)
        );
        
        if (diasParaVencer <= 30 && diasParaVencer > 0) {
          metrics.expiringSoon.push({
            id: stock.id,
            producto: stock.producto_detalle?.nombre,
            diasParaVencer,
            fecha_vencimiento: stock.fecha_vencimiento,
            lote: stock.lote,
          });
        }
      }
    });

    metrics.averageValue = metrics.totalItems > 0 
      ? metrics.totalValue / metrics.totalItems 
      : 0;

    return metrics;
  }

  /**
   * Genera recomendaciones de reabastecimiento
   */
  static generateRestockRecommendations(stocks) {
    const recommendations = [];

    stocks.forEach(stock => {
      if (stock.estado_stock === 'critico' || stock.estado_stock === 'agotado') {
        const cantidadRecomendada = stock.stock_maximo 
          ? stock.stock_maximo - stock.cantidad
          : stock.stock_minimo * 3 - stock.cantidad;

        if (cantidadRecomendada > 0) {
          recommendations.push({
            producto: stock.producto_detalle,
            almacen: stock.almacen_nombre,
            cantidadActual: stock.cantidad,
            cantidadRecomendada: Math.ceil(cantidadRecomendada),
            prioridad: stock.estado_stock === 'agotado' ? 'alta' : 'media',
            valorEstimado: cantidadRecomendada * stock.costo_promedio,
          });
        }
      }
    });

    // Ordenar por prioridad y valor
    recommendations.sort((a, b) => {
      if (a.prioridad === 'alta' && b.prioridad !== 'alta') return -1;
      if (a.prioridad !== 'alta' && b.prioridad === 'alta') return 1;
      return b.valorEstimado - a.valorEstimado;
    });

    return recommendations;
  }

  /**
   * Valida un movimiento antes de confirmarlo
   */
  static async validateMovement(movimiento) {
    const errors = [];

    // Validar datos básicos
    if (!movimiento.tipo_movimiento) {
      errors.push('Debe seleccionar un tipo de movimiento');
    }

    if (!movimiento.fecha) {
      errors.push('Debe especificar una fecha');
    }

    if (!movimiento.detalles || movimiento.detalles.length === 0) {
      errors.push('Debe agregar al menos un producto');
    }

    // Validar según tipo de movimiento
    const tipoMovimiento = movimiento.tipo_movimiento;
    
    if (tipoMovimiento === 'salida' || tipoMovimiento === 'transferencia') {
      if (!movimiento.almacen_origen) {
        errors.push('Debe especificar el almacén de origen');
      }

      // Validar disponibilidad de stock
      for (const detalle of movimiento.detalles) {
        try {
          const stockResponse = await inventoryApi.getStocks({
            producto: detalle.producto,
            almacen: movimiento.almacen_origen,
          });

          const stock = stockResponse.data[0];
          if (!stock || stock.cantidad_disponible < detalle.cantidad) {
            errors.push(
              `Stock insuficiente para ${detalle.producto_nombre || 'el producto'}`
            );
          }
        } catch (error) {
          errors.push('Error al verificar disponibilidad de stock');
        }
      }
    }

    if (tipoMovimiento === 'entrada' || tipoMovimiento === 'transferencia') {
      if (!movimiento.almacen_destino) {
        errors.push('Debe especificar el almacén de destino');
      }
    }

    // Validar detalles
    movimiento.detalles.forEach((detalle, index) => {
      if (!detalle.producto) {
        errors.push(`Debe seleccionar el producto en la línea ${index + 1}`);
      }
      if (!detalle.cantidad || detalle.cantidad <= 0) {
        errors.push(`La cantidad debe ser mayor a 0 en la línea ${index + 1}`);
      }
      if (!detalle.unidad_medida) {
        errors.push(`Debe especificar la unidad de medida en la línea ${index + 1}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Exporta datos de inventario a CSV
   */
  static exportToCSV(stocks, filename = 'inventario.csv') {
    const headers = [
      'Código',
      'Producto',
      'Almacén',
      'Cantidad',
      'Disponible',
      'Mínimo',
      'Máximo',
      'Costo Promedio',
      'Valor Total',
      'Estado',
      'Lote',
      'Vencimiento',
    ];

    const rows = stocks.map(stock => [
      stock.producto_detalle?.codigo || '',
      stock.producto_detalle?.nombre || '',
      stock.almacen_nombre || '',
      stock.cantidad || 0,
      stock.cantidad_disponible || 0,
      stock.stock_minimo || 0,
      stock.stock_maximo || '',
      stock.costo_promedio || 0,
      (stock.cantidad * stock.costo_promedio) || 0,
      stock.estado_stock || '',
      stock.lote || '',
      stock.fecha_vencimiento || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  }

  /**
   * Calcula el ABC del inventario
   */
  static calculateABC(stocks) {
    // Calcular valor total de cada item y ordenar
    const itemsWithValue = stocks.map(stock => ({
      ...stock,
      valorTotal: stock.cantidad * stock.costo_promedio,
    })).sort((a, b) => b.valorTotal - a.valorTotal);

    const valorTotal = itemsWithValue.reduce((sum, item) => sum + item.valorTotal, 0);
    
    let acumulado = 0;
    const result = {
      A: [],
      B: [],
      C: [],
    };

    itemsWithValue.forEach(item => {
      acumulado += item.valorTotal;
      const porcentajeAcumulado = (acumulado / valorTotal) * 100;

      if (porcentajeAcumulado <= 80) {
        result.A.push({ ...item, categoria: 'A' });
      } else if (porcentajeAcumulado <= 95) {
        result.B.push({ ...item, categoria: 'B' });
      } else {
        result.C.push({ ...item, categoria: 'C' });
      }
    });

    return result;
  }
}

export default InventoryService;
