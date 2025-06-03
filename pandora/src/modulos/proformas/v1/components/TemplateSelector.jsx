import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  Info, 
  CheckCircle, 
  AlertTriangle,
  Eye
} from 'lucide-react';

const TemplateSelector = ({ 
  value, 
  onChange, 
  proformaId = null,
  itemsCount = 0,
  onPreviewChange = null,
  disabled = false,
  showPreview = true 
}) => {
  const [modelosDisponibles, setModelosDisponibles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [showingPreview, setShowingPreview] = useState(false);

  // Opciones de modelos hardcodeadas (se pueden cargar desde API)
  const modelosDefault = [
    {
      value: 'basico',
      label: 'Básico',
      description: 'Código, Descripción, Unidad, Cantidad, Precio, Total',
      campos: ['codigo', 'descripcion', 'unidad', 'cantidad', 'precio_unitario', 'total'],
      headers: ['Código', 'Descripción', 'Unidad', 'Cantidad', 'Precio Unit.', 'Total'],
      requeridos: ['codigo', 'descripcion'],
      anchos: ['120px', 'auto', '100px', '100px', '120px', '120px']
    },
    {
      value: 'cudin',
      label: 'CUDIN',
      description: 'CUDIN, Descripción, Unidad, Cantidad, Precio, Total',
      campos: ['cudim', 'descripcion', 'unidad', 'cantidad', 'precio_unitario', 'total'],
      headers: ['CUDIN', 'Descripción', 'Unidad', 'Cantidad', 'Precio Unit.', 'Total'],
      requeridos: ['cudim', 'descripcion'],
      anchos: ['140px', 'auto', '100px', '100px', '120px', '120px']
    },
    {
      value: 'cudin_modelo',
      label: 'CUDIN + Modelo',
      description: 'CUDIN, Descripción, Modelo, Unidad, Cantidad, Precio, Total',
      campos: ['cudim', 'descripcion', 'modelo', 'unidad', 'cantidad', 'precio_unitario', 'total'],
      headers: ['CUDIN', 'Descripción', 'Modelo', 'Unidad', 'Cantidad', 'Precio Unit.', 'Total'],
      requeridos: ['cudim', 'descripcion', 'modelo'],
      anchos: ['140px', 'auto', '120px', '100px', '100px', '120px', '120px']
    },
    {
      value: 'cudin_serie',
      label: 'CUDIN + Serie',
      description: 'CUDIN, Descripción, Serie, Unidad, Cantidad, Precio, Total',
      campos: ['cudim', 'descripcion', 'serial', 'unidad', 'cantidad', 'precio_unitario', 'total'],
      headers: ['CUDIN', 'Descripción', 'Serie', 'Unidad', 'Cantidad', 'Precio Unit.', 'Total'],
      requeridos: ['cudim', 'descripcion', 'serial'],
      anchos: ['140px', 'auto', '120px', '100px', '100px', '120px', '120px']
    },
    {
      value: 'sanitario',
      label: 'Sanitario',
      description: 'CUDIN, Descripción, Lote, Registro Sanitario, Unidad, Cantidad, Precio, Total',
      campos: ['cudim', 'descripcion', 'lote', 'registro_sanitario', 'unidad', 'cantidad', 'precio_unitario', 'total'],
      headers: ['CUDIN', 'Descripción', 'Lote', 'Registro Sanitario', 'Unidad', 'Cantidad', 'Precio Unit.', 'Total'],
      requeridos: ['cudim', 'descripcion', 'lote', 'registro_sanitario'],
      anchos: ['140px', 'auto', '120px', '150px', '100px', '100px', '120px', '120px']
    },
    {
      value: 'completo',
      label: 'Completo',
      description: 'Código, CUDIN, Registro, Fecha Venc., Descripción, Modelo, Unidad, Cantidad, Precio, Total',
      campos: ['codigo', 'cudim', 'registro_sanitario', 'fecha_vencimiento', 'descripcion', 'modelo', 'unidad', 'cantidad', 'precio_unitario', 'total'],
      headers: ['Código', 'CUDIN', 'Registro', 'Fecha Venc.', 'Descripción', 'Modelo', 'Unidad', 'Cantidad', 'Precio Unit.', 'Total'],
      requeridos: ['codigo', 'cudim', 'descripcion'],
      anchos: ['120px', '140px', '130px', '120px', 'auto', '120px', '100px', '100px', '120px', '120px']
    }
  ];

  useEffect(() => {
    setModelosDisponibles(modelosDefault);
  }, []);

  const handleModeloChange = async (nuevoModelo) => {
    if (nuevoModelo === value) return;

    // Si hay proforma existente con ítems, mostrar vista previa
    if (proformaId && itemsCount > 0 && showPreview) {
      await handlePreviewCambio(nuevoModelo);
    } else {
      // Cambio directo
      onChange(nuevoModelo);
    }
  };

  const handlePreviewCambio = async (nuevoModelo) => {
    setLoading(true);
    setShowingPreview(true);
    
    try {
      // Simular llamada a API para vista previa
      // En implementación real: await api.post(`/proformas/${proformaId}/preview_cambio_modelo/`, { modelo_template: nuevoModelo })
      
      const modeloActual = modelosDisponibles.find(m => m.value === value);
      const modeloNuevo = modelosDisponibles.find(m => m.value === nuevoModelo);
      
      // Simular validación de compatibilidad
      const itemsCompatibles = Math.floor(itemsCount * 0.8); // 80% compatibles como ejemplo
      const itemsConErrores = itemsCount - itemsCompatibles;
      
      const previewResult = {
        modelo_actual: {
          valor: value,
          titulo: modeloActual?.label,
          config: modeloActual
        },
        modelo_nuevo: {
          valor: nuevoModelo,
          titulo: modeloNuevo?.label,
          config: modeloNuevo
        },
        compatibilidad: {
          es_compatible: itemsConErrores === 0,
          total_items: itemsCount,
          items_validos: itemsCompatibles,
          items_con_errores: itemsConErrores
        },
        recomendaciones: itemsConErrores > 0 ? [
          `Debe completar ${itemsConErrores} ítem(s) antes de cambiar al nuevo modelo.`,
          'Revise que todos los campos requeridos estén llenos.'
        ] : ['El cambio es compatible con todos los ítems existentes.']
      };
      
      setPreviewData(previewResult);
      
      if (onPreviewChange) {
        onPreviewChange(previewResult);
      }
      
    } catch (error) {
      console.error('Error al obtener vista previa:', error);
    } finally {
      setLoading(false);
    }
  };

  const confirmarCambio = () => {
    if (previewData) {
      onChange(previewData.modelo_nuevo.valor);
      setPreviewData(null);
      setShowingPreview(false);
    }
  };

  const cancelarCambio = () => {
    setPreviewData(null);
    setShowingPreview(false);
  };

  const modeloSeleccionado = modelosDisponibles.find(m => m.value === value);

  return (
    <Card className="w-full">
      <CardHeader className="py-3 px-4 bg-blue-50">
        <CardTitle className="flex items-center text-lg font-bold">
          <FileText className="mr-2 h-4 w-4 text-blue-600" />
          Modelo de Proforma
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {/* Selector de modelo */}
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar Modelo de Template
              </label>
              <Select 
                value={value} 
                onValueChange={handleModeloChange}
                disabled={disabled || loading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccione un modelo..." />
                </SelectTrigger>
                <SelectContent>
                  {modelosDisponibles.map((modelo) => (
                    <SelectItem key={modelo.value} value={modelo.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{modelo.label}</span>
                        <span className="text-xs text-gray-500">{modelo.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {itemsCount > 0 && (
              <div className="text-center">
                <Badge variant="outline" className="mb-1">
                  {itemsCount} ítems
                </Badge>
                <p className="text-xs text-gray-500">en la proforma</p>
              </div>
            )}
          </div>

          {/* Información del modelo seleccionado */}
          {modeloSeleccionado && (
            <div className="bg-gray-50 p-3 rounded-lg border">
              <div className="flex items-start space-x-3">
                <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">
                    {modeloSeleccionado.label}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    {modeloSeleccionado.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1">
                    {modeloSeleccionado.headers.map((header, index) => (
                      <Badge
                        key={index}
                        variant={modeloSeleccionado.requeridos.includes(modeloSeleccionado.campos[index]) ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {header}
                        {modeloSeleccionado.requeridos.includes(modeloSeleccionado.campos[index]) && " *"}
                      </Badge>
                    ))}
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-2">
                    * Campos requeridos
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Vista previa del cambio */}
          {showingPreview && previewData && (
            <div className="space-y-4">
              <Alert className={previewData.compatibilidad.es_compatible ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}>
                <div className="flex items-start space-x-2">
                  {previewData.compatibilidad.es_compatible ? (
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <AlertDescription>
                      <div className="font-medium mb-2">
                        {previewData.compatibilidad.es_compatible ? 
                          "✅ Cambio Compatible" : 
                          "⚠️ Cambio Requiere Atención"
                        }
                      </div>
                      <div className="text-sm space-y-1">
                        <p>
                          <strong>De:</strong> {previewData.modelo_actual.titulo} → 
                          <strong> A:</strong> {previewData.modelo_nuevo.titulo}
                        </p>
                        <p>
                          <strong>Compatibilidad:</strong> {previewData.compatibilidad.items_validos} de {previewData.compatibilidad.total_items} ítems son compatibles
                        </p>
                        {previewData.compatibilidad.items_con_errores > 0 && (
                          <p className="text-amber-700">
                            <strong>{previewData.compatibilidad.items_con_errores} ítems necesitan campos adicionales</strong>
                          </p>
                        )}
                      </div>
                    </AlertDescription>
                  </div>
                </div>
              </Alert>

              {/* Recomendaciones */}
              {previewData.recomendaciones && previewData.recomendaciones.length > 0 && (
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <h5 className="font-medium text-blue-900 mb-2">Recomendaciones:</h5>
                  <ul className="text-sm text-blue-800 space-y-1">
                    {previewData.recomendaciones.map((rec, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-blue-500">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Botones de confirmación */}
              <div className="flex justify-end space-x-3 pt-2">
                <Button 
                  variant="outline" 
                  onClick={cancelarCambio}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={confirmarCambio}
                  disabled={loading}
                  className={previewData.compatibilidad.es_compatible ? "" : "bg-amber-600 hover:bg-amber-700"}
                >
                  {previewData.compatibilidad.es_compatible ? 
                    "Confirmar Cambio" : 
                    "Cambiar de Todas Formas"
                  }
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TemplateSelector;