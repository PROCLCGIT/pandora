import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import {
  FileText,
  Search,
  Filter,
  ArrowLeftRight,
  PlusSquare,
  Trash2,
  Edit2,
  X,
  Check,
  AlertCircle,
} from 'lucide-react';

const ProductosServiciosTable = ({ 
  productos = [], 
  onProductosChange, 
  onTotalesChange, 
  productosConErrores = [], 
  onErrorClear, 
  porcentajeImpuesto = 15,
  modeloTemplate = 'basico',
  camposConfig = null 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingItem, setEditingItem] = useState({});

  // Configuración por defecto de modelos si no se proporciona
  const modelosConfig = {
    basico: {
      campos: ['codigo', 'descripcion', 'unidad', 'cantidad', 'precio_unitario', 'total'],
      headers: ['Código', 'Descripción', 'Unidad', 'Cantidad', 'Precio Unit.', 'Total'],
      requeridos: ['codigo', 'descripcion'],
      anchos: ['120px', 'auto', '100px', '100px', '120px', '120px'],
      tipos: ['text', 'text', 'text', 'number', 'number', 'number']
    },
    cudin: {
      campos: ['cudim', 'descripcion', 'unidad', 'cantidad', 'precio_unitario', 'total'],
      headers: ['CUDIN', 'Descripción', 'Unidad', 'Cantidad', 'Precio Unit.', 'Total'],
      requeridos: ['cudim', 'descripcion'],
      anchos: ['140px', 'auto', '100px', '100px', '120px', '120px'],
      tipos: ['text', 'text', 'text', 'number', 'number', 'number']
    },
    cudin_modelo: {
      campos: ['cudim', 'descripcion', 'modelo', 'unidad', 'cantidad', 'precio_unitario', 'total'],
      headers: ['CUDIN', 'Descripción', 'Modelo', 'Unidad', 'Cantidad', 'Precio Unit.', 'Total'],
      requeridos: ['cudim', 'descripcion', 'modelo'],
      anchos: ['140px', 'auto', '120px', '100px', '100px', '120px', '120px'],
      tipos: ['text', 'text', 'text', 'text', 'number', 'number', 'number']
    },
    cudin_serie: {
      campos: ['cudim', 'descripcion', 'serial', 'unidad', 'cantidad', 'precio_unitario', 'total'],
      headers: ['CUDIN', 'Descripción', 'Serie', 'Unidad', 'Cantidad', 'Precio Unit.', 'Total'],
      requeridos: ['cudim', 'descripcion', 'serial'],
      anchos: ['140px', 'auto', '120px', '100px', '100px', '120px', '120px'],
      tipos: ['text', 'text', 'text', 'text', 'number', 'number', 'number']
    },
    sanitario: {
      campos: ['cudim', 'descripcion', 'lote', 'registro_sanitario', 'unidad', 'cantidad', 'precio_unitario', 'total'],
      headers: ['CUDIN', 'Descripción', 'Lote', 'Registro Sanitario', 'Unidad', 'Cantidad', 'Precio Unit.', 'Total'],
      requeridos: ['cudim', 'descripcion', 'lote', 'registro_sanitario'],
      anchos: ['140px', 'auto', '120px', '150px', '100px', '100px', '120px', '120px'],
      tipos: ['text', 'text', 'text', 'text', 'text', 'number', 'number', 'number']
    },
    completo: {
      campos: ['codigo', 'cudim', 'registro_sanitario', 'fecha_vencimiento', 'descripcion', 'modelo', 'unidad', 'cantidad', 'precio_unitario', 'total'],
      headers: ['Código', 'CUDIN', 'Registro', 'Fecha Venc.', 'Descripción', 'Modelo', 'Unidad', 'Cantidad', 'Precio Unit.', 'Total'],
      requeridos: ['codigo', 'cudim', 'descripcion'],
      anchos: ['120px', '140px', '130px', '120px', 'auto', '120px', '100px', '100px', '120px', '120px'],
      tipos: ['text', 'text', 'text', 'date', 'text', 'text', 'text', 'number', 'number', 'number']
    }
  };

  // Obtener configuración actual
  const config = camposConfig || modelosConfig[modeloTemplate] || modelosConfig.basico;

  // Calcular total por línea (sin descuento por ahora)
  const calculateLineTotal = (item) => {
    return (item.cantidad || 0) * (item.precio_unitario || 0);
  };

  // Calcular totales cuando cambien los productos
  useEffect(() => {
    const subtotal = productos.reduce((sum, item) => {
      const total = calculateLineTotal(item);
      return sum + total;
    }, 0);

    const iva = subtotal * (porcentajeImpuesto / 100); // IVA dinámico
    const total = subtotal + iva;

    if (onTotalesChange) {
      onTotalesChange({ subtotal, iva, total });
    }
  }, [productos, onTotalesChange, porcentajeImpuesto]);

  // Verificar si un campo es requerido
  const esCampoRequerido = (campo) => {
    return config.requeridos.includes(campo);
  };

  // Verificar si un item tiene errores en campos requeridos
  const tieneErroresCampoRequerido = (item) => {
    return config.requeridos.some(campo => {
      const valor = item[campo];
      return !valor || (typeof valor === 'string' && !valor.trim());
    });
  };

  // Obtener mensaje de error para un campo
  const getMensajeErrorCampo = (item, campo) => {
    if (esCampoRequerido(campo)) {
      const valor = item[campo];
      if (!valor || (typeof valor === 'string' && !valor.trim())) {
        const header = config.headers[config.campos.indexOf(campo)];
        return `${header} es requerido`;
      }
    }
    return null;
  };

  // Agregar producto en blanco
  const handleAddBlankItem = () => {
    const newItem = {
      id: Date.now(),
      // Inicializar todos los campos posibles
      codigo: '',
      cudim: '',
      descripcion: '',
      modelo: '',
      serial: '',
      lote: '',
      registro_sanitario: '',
      fecha_vencimiento: '',
      marca: '',
      unidad: 'UND',
      unidad_id: 1,
      cantidad: 1,
      precio_unitario: 0,
      total: 0,
    };
    onProductosChange([...productos, newItem]);
    setEditingId(newItem.id);
    setEditingItem(newItem);
  };

  // Eliminar producto
  const handleDeleteItem = (id) => {
    onProductosChange(productos.filter(item => item.id !== id));
  };

  // Iniciar edición
  const handleStartEdit = (item) => {
    setEditingId(item.id);
    setEditingItem({ ...item });
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingItem({});
  };

  // Guardar edición
  const handleSaveEdit = () => {
    // Calcular el total del item antes de guardarlo
    const updatedItem = {
      ...editingItem,
      total: calculateLineTotal(editingItem)
    };
    
    onProductosChange(
      productos.map(item => 
        item.id === editingId ? updatedItem : item
      )
    );
    setEditingId(null);
    setEditingItem({});
  };

  // Actualizar campo en edición
  const handleEditChange = (field, value) => {
    setEditingItem({ ...editingItem, [field]: value });
    // Clear error when user starts editing
    if (onErrorClear && productosConErrores.length > 0) {
      onErrorClear();
    }
  };

  // Filtrar productos
  const filteredProductos = productos.filter(item => {
    const searchFields = ['codigo', 'cudim', 'descripcion', 'modelo', 'serial', 'lote'];
    return searchFields.some(field => 
      item[field]?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Renderizar celda según tipo de campo
  const renderCellContent = (item, campo, tipo = 'text') => {
    const valor = item[campo];
    
    if (tipo === 'date' && valor) {
      return new Date(valor).toLocaleDateString();
    }
    
    if (tipo === 'number') {
      if (campo === 'precio_unitario') {
        return `$${(valor || 0).toFixed(2)}`;
      }
      if (campo === 'total') {
        return `$${calculateLineTotal(item).toFixed(2)}`;
      }
      return valor || 0;
    }
    
    return valor || '';
  };

  // Renderizar input según tipo de campo
  const renderEditInput = (campo, valor, tipo = 'text') => {
    const isRequired = esCampoRequerido(campo);
    
    const commonProps = {
      value: valor || '',
      onChange: (e) => handleEditChange(campo, tipo === 'number' ? parseFloat(e.target.value) || 0 : e.target.value),
      className: 'h-8',
      placeholder: isRequired ? `${config.headers[config.campos.indexOf(campo)]} *` : config.headers[config.campos.indexOf(campo)]
    };

    if (tipo === 'number') {
      return (
        <Input
          type="number"
          {...commonProps}
          min="0"
          step={campo === 'cantidad' || campo.includes('precio') ? "0.01" : "1"}
          className={`${commonProps.className} text-right`}
        />
      );
    }
    
    if (tipo === 'date') {
      return (
        <Input
          type="date"
          {...commonProps}
        />
      );
    }
    
    return <Input type="text" {...commonProps} />;
  };

  return (
    <Card>
      <CardHeader className="py-3 px-4 bg-blue-300/20">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center justify-between text-lg font-bold w-full">
            <div className="flex items-center">
              <FileText className="mr-2 h-4 w-4 text-blue-600" />
              Productos y Servicios
              {modeloTemplate !== 'basico' && (
                <span className="ml-2 text-sm font-normal text-blue-600">
                  (Modelo: {modelosConfig[modeloTemplate]?.headers?.[0] ? 
                    modelosConfig[modeloTemplate].headers.slice(0, 2).join(', ') + '...' : 
                    modeloTemplate})
                </span>
              )}
            </div>
            <span className="text-xs text-gray-500 font-normal ml-4">
              Doble clic para editar
            </span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Input
                placeholder="Buscar en la tabla..."
                className="w-64 bg-white pr-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filtrar
            </Button>
            <Button variant="outline" size="sm">
              <ArrowLeftRight className="mr-2 h-4 w-4" />
              Ordenar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {config.headers.map((header, index) => {
                  const campo = config.campos[index];
                  const ancho = config.anchos[index];
                  const isRequired = esCampoRequerido(campo);
                  
                  return (
                    <TableHead 
                      key={campo} 
                      className={`${ancho !== 'auto' ? `w-[${ancho}]` : ''} ${
                        campo.includes('precio') || campo === 'cantidad' || campo === 'total' ? 'text-right' : ''
                      }`}
                      style={{ width: ancho !== 'auto' ? ancho : undefined }}
                    >
                      {header}
                      {isRequired && <span className="text-red-500 ml-1">*</span>}
                    </TableHead>
                  );
                })}
                <TableHead className="w-[100px] text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProductos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={config.campos.length + 1} className={`text-center py-8 ${
                    productosConErrores.length > 0 || productos.length === 0 && searchTerm === '' ? 
                    'text-red-600 font-medium' : 'text-gray-500'
                  }`}>
                    {productosConErrores.length > 0 || productos.length === 0 && searchTerm === '' ? 
                      '⚠️ Debe agregar al menos un producto. Haga clic en "Agregar ítem en blanco" o use las herramientas arriba.' : 
                      'No hay productos agregados. Haga clic en "Agregar ítem en blanco" para comenzar.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredProductos.map((item, index) => {
                  return (
                    <TableRow 
                      key={item.id}
                      onDoubleClick={() => handleStartEdit(item)}
                      className="cursor-pointer hover:bg-gray-50"
                      title="Doble clic para editar"
                    >
                      {editingId === item.id ? (
                        // Modo edición
                        <>
                          {config.campos.map((campo, campoIndex) => {
                            const tipo = config.tipos[campoIndex];
                            
                            if (campo === 'total') {
                              return (
                                <TableCell key={campo} className="text-right font-medium">
                                  ${calculateLineTotal(editingItem).toFixed(2)}
                                </TableCell>
                              );
                            }
                            
                            return (
                              <TableCell key={campo}>
                                {renderEditInput(campo, editingItem[campo], tipo)}
                              </TableCell>
                            );
                          })}
                          <TableCell>
                            <div className="flex justify-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0"
                                onClick={handleSaveEdit}
                              >
                                <Check className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0"
                                onClick={handleCancelEdit}
                              >
                                <X className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      ) : (
                        // Modo vista
                        <>
                          {config.campos.map((campo, campoIndex) => {
                            const tipo = config.tipos[campoIndex];
                            const esRequerido = esCampoRequerido(campo);
                            const tieneError = esRequerido && (!item[campo] || (typeof item[campo] === 'string' && !item[campo].trim()));
                            
                            return (
                              <TableCell 
                                key={campo} 
                                className={`${
                                  campo === 'codigo' || campo === 'cudim' ? 'font-mono text-sm' : ''
                                } ${
                                  tipo === 'number' && campo !== 'total' ? 'text-right' : ''
                                } ${
                                  campo === 'total' ? 'text-right font-medium' : ''
                                }`}
                              >
                                {renderCellContent(item, campo, tipo)}
                              </TableCell>
                            );
                          })}
                          <TableCell onDoubleClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0"
                                onClick={() => handleStartEdit(item)}
                              >
                                <Edit2 className="h-4 w-4 text-blue-600" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0"
                                onClick={() => handleDeleteItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={handleAddBlankItem}
            className="text-blue-600 hover:text-blue-700"
          >
            <PlusSquare className="mr-2 h-4 w-4" />
            Agregar ítem en blanco
          </Button>
          
          <div className="flex items-center space-x-4">
            {config.requeridos.length > 0 && (
              <div className="text-sm text-gray-500 flex items-center">
                <span className="text-red-500 mr-1">*</span>
                Campos requeridos para este modelo
              </div>
            )}
            <Button variant="link" className="text-blue-600">
              Ver catálogo completo →
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductosServiciosTable;