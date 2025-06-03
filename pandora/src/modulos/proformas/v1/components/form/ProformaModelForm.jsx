import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  FileText,
  Shield
} from 'lucide-react';

import ProductosServiciosTable from './ProductosServiciosTable';
import ValidationModal from '../modals/ValidationModal';

const ProformaModelForm = ({
  proformaData = null,
  productos = [],
  onProductosChange,
  onTotalesChange,
  onModeloChange,
  modeloTemplate = 'basico',
  camposConfig = null,
  porcentajeImpuesto = 15,
  readOnly = false
}) => {
  const [validacionActual, setValidacionActual] = useState(null);
  const [mostrarModalValidacion, setMostrarModalValidacion] = useState(false);
  const [productosConErrores, setProductosConErrores] = useState([]);
  const [validationResults, setValidationResults] = useState({ errors: [], warnings: [], info: [] });

  const getModeloTitulo = () => {
    const titulos = {
      basico: 'Básico',
      cudin: 'CUDIN',
      cudin_modelo: 'CUDIN + Modelo',
      cudin_serie: 'CUDIN + Serie',
      sanitario: 'Sanitario',
      completo: 'Completo'
    };
    return titulos[modeloTemplate] || modeloTemplate;
  };

  // Validar productos según el modelo actual
  const validarProductosSegunModelo = () => {
    // Obtener configuración del modelo actual
    const modelosConfig = {
      basico: {
        campos: ['codigo', 'descripcion', 'unidad', 'cantidad', 'precio_unitario', 'total'],
        headers: ['Código', 'Descripción', 'Unidad', 'Cantidad', 'Precio Unit.', 'Total'],
        requeridos: ['codigo', 'descripcion']
      },
      cudin: {
        campos: ['cudim', 'descripcion', 'unidad', 'cantidad', 'precio_unitario', 'total'],
        headers: ['CUDIN', 'Descripción', 'Unidad', 'Cantidad', 'Precio Unit.', 'Total'],
        requeridos: ['cudim', 'descripcion']
      },
      cudin_modelo: {
        campos: ['cudim', 'descripcion', 'modelo', 'unidad', 'cantidad', 'precio_unitario', 'total'],
        headers: ['CUDIN', 'Descripción', 'Modelo', 'Unidad', 'Cantidad', 'Precio Unit.', 'Total'],
        requeridos: ['cudim', 'descripcion', 'modelo']
      },
      cudin_serie: {
        campos: ['cudim', 'descripcion', 'serial', 'unidad', 'cantidad', 'precio_unitario', 'total'],
        headers: ['CUDIN', 'Descripción', 'Serie', 'Unidad', 'Cantidad', 'Precio Unit.', 'Total'],
        requeridos: ['cudim', 'descripcion', 'serial']
      },
      sanitario: {
        campos: ['cudim', 'descripcion', 'lote', 'registro_sanitario', 'unidad', 'cantidad', 'precio_unitario', 'total'],
        headers: ['CUDIN', 'Descripción', 'Lote', 'Registro Sanitario', 'Unidad', 'Cantidad', 'Precio Unit.', 'Total'],
        requeridos: ['cudim', 'descripcion', 'lote', 'registro_sanitario']
      },
      completo: {
        campos: ['codigo', 'cudim', 'registro_sanitario', 'fecha_vencimiento', 'descripcion', 'modelo', 'unidad', 'cantidad', 'precio_unitario', 'total'],
        headers: ['Código', 'CUDIN', 'Registro', 'Fecha Venc.', 'Descripción', 'Modelo', 'Unidad', 'Cantidad', 'Precio Unit.', 'Total'],
        requeridos: ['codigo', 'cudim', 'descripcion']
      }
    };

    const config = camposConfig || modelosConfig[modeloTemplate] || modelosConfig.basico;
    const itemsConErrores = [];
    const errors = [];
    const warnings = [];
    const info = [];

    // Agregar información sobre el modelo actual
    info.push(`Modelo actual: ${getModeloTitulo()}`);
    info.push(`Campos requeridos: ${config.requeridos.map(c => config.headers[config.campos.indexOf(c)]).join(', ')}`);

    productos.forEach((item, index) => {
      const erroresItem = [];
      
      config.requeridos.forEach(campo => {
        const valor = item[campo];
        if (!valor || (typeof valor === 'string' && !valor.trim())) {
          erroresItem.push({
            campo,
            header: config.headers[config.campos.indexOf(campo)]
          });
        }
      });

      if (erroresItem.length > 0) {
        itemsConErrores.push(index);
        const identificador = item.codigo || item.cudim || item.descripcion || `Producto ${index + 1}`;
        const camposFaltantes = erroresItem.map(e => e.header).join(', ');
        errors.push(`${identificador}: Faltan los campos ${camposFaltantes}`);
      }
    });

    // Agregar advertencias si hay muchos errores
    if (itemsConErrores.length > 5) {
      warnings.push(`Se encontraron errores en ${itemsConErrores.length} productos. Considere revisar el modelo seleccionado.`);
    }

    setProductosConErrores(itemsConErrores);
    
    const validacion = {
      esValida: itemsConErrores.length === 0,
      totalItems: productos.length,
      itemsValidos: productos.length - itemsConErrores.length,
      itemsConErrores: itemsConErrores.length,
      errors,
      warnings,
      info
    };

    setValidacionActual(validacion);
    setValidationResults({ errors, warnings, info });
    return validacion;
  };

  // Manejar cambio de modelo
  const handleModeloChange = (nuevoModelo) => {
    if (onModeloChange) {
      onModeloChange(nuevoModelo);
    }
    // No validar automáticamente
  };

  // Manejar vista previa de cambio de modelo
  const handlePreviewChange = (previewData) => {
    // No mostrar validación automáticamente
  };

  // Limpiar errores
  const handleErrorClear = () => {
    setProductosConErrores([]);
  };

  // Validar manualmente
  const handleValidarManual = () => {
    if (productos.length === 0) {
      setValidationResults({ 
        errors: ['No hay productos para validar'], 
        warnings: [], 
        info: [] 
      });
      setMostrarModalValidacion(true);
      return;
    }

    const validacion = validarProductosSegunModelo();
    setMostrarModalValidacion(true);
    return validacion;
  };

  return (
    <div className="space-y-6">
      {/* Información del modelo actual (solo lectura) */}
      {readOnly && (
        <Card className="border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-gray-600" />
              <span className="font-medium text-gray-700">Modelo:</span>
              <Badge variant="outline">{getModeloTitulo()}</Badge>
            </div>
          </CardContent>
        </Card>
      )}


      {/* Tabla de productos y servicios */}
      <ProductosServiciosTable
        productos={productos}
        onProductosChange={onProductosChange}
        onTotalesChange={onTotalesChange}
        productosConErrores={productosConErrores}
        onErrorClear={handleErrorClear}
        porcentajeImpuesto={porcentajeImpuesto}
        modeloTemplate={modeloTemplate}
        camposConfig={camposConfig}
      />

      {/* Información de resumen */}
      {!readOnly && productos.length > 0 && (
        <Card className="border-gray-200">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                <strong>{productos.length}</strong> producto(s) en la proforma • 
                Modelo: <strong className="ml-1">{getModeloTitulo()}</strong>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de validación */}
      <ValidationModal
        isOpen={mostrarModalValidacion}
        onClose={() => setMostrarModalValidacion(false)}
        validationResults={validationResults}
      />
    </div>
  );
};

export default ProformaModelForm;