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
} from 'lucide-react';

const ProductosServiciosTable = ({ productos = [], onProductosChange, onTotalesChange, productosConErrores = [], onErrorClear }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingItem, setEditingItem] = useState({});

  // Calcular total por línea
  const calculateLineTotal = (item) => {
    const subtotal = (item.cantidad || 0) * (item.precioUnitario || 0);
    const descuento = subtotal * ((item.descuento || 0) / 100);
    return subtotal - descuento;
  };

  // Calcular totales cuando cambien los productos
  useEffect(() => {
    const subtotal = productos.reduce((sum, item) => {
      const total = calculateLineTotal(item);
      return sum + total;
    }, 0);

    const iva = subtotal * 0.12; // 12% IVA
    const total = subtotal + iva;

    if (onTotalesChange) {
      onTotalesChange({ subtotal, iva, total });
    }
  }, [productos, onTotalesChange]);

  // Agregar producto en blanco
  const handleAddBlankItem = () => {
    const newItem = {
      id: Date.now(),
      codigo: '',
      descripcion: '',
      unidad: 'UND',
      unidad_id: 1, // Add default unit ID
      cantidad: 1,
      precioUnitario: 0,
      descuento: 0,
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
  const filteredProductos = productos.filter(item =>
    item.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader className="py-3 px-4 bg-blue-300/20">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center text-lg font-bold">
            <FileText className="mr-2 h-4 w-4 text-blue-600" />
            Productos y Servicios
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
                <TableHead className="w-[120px]">Código</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="w-[100px]">Unidad</TableHead>
                <TableHead className="w-[100px] text-right">Cantidad</TableHead>
                <TableHead className="w-[120px] text-right">Precio Unit.</TableHead>
                <TableHead className="w-[100px] text-right">Desc. %</TableHead>
                <TableHead className="w-[120px] text-right">Total</TableHead>
                <TableHead className="w-[100px] text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProductos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className={`text-center py-8 ${productosConErrores.length > 0 || productos.length === 0 && searchTerm === '' ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                    {productosConErrores.length > 0 || productos.length === 0 && searchTerm === '' ? 
                      '⚠️ Debe agregar al menos un producto. Haga clic en "Agregar ítem en blanco" o use las herramientas arriba.' : 
                      'No hay productos agregados. Haga clic en "Agregar ítem en blanco" para comenzar.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredProductos.map((item, index) => {
                  const hasError = productosConErrores.includes(index);
                  return (
                  <TableRow key={item.id} className={hasError ? 'bg-red-50' : ''}>
                    {editingId === item.id ? (
                      // Modo edición
                      <>
                        <TableCell>
                          <Input
                            value={editingItem.codigo || ''}
                            onChange={(e) => handleEditChange('codigo', e.target.value)}
                            className="h-8"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={editingItem.descripcion || ''}
                            onChange={(e) => handleEditChange('descripcion', e.target.value)}
                            className="h-8"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={editingItem.unidad || ''}
                            onChange={(e) => handleEditChange('unidad', e.target.value)}
                            className="h-8"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={editingItem.cantidad || ''}
                            onChange={(e) => handleEditChange('cantidad', parseFloat(e.target.value) || 0)}
                            className="h-8 text-right"
                            min="0"
                            step="0.01"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={editingItem.precioUnitario || ''}
                            onChange={(e) => handleEditChange('precioUnitario', parseFloat(e.target.value) || 0)}
                            className="h-8 text-right"
                            min="0"
                            step="0.01"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={editingItem.descuento || ''}
                            onChange={(e) => handleEditChange('descuento', parseFloat(e.target.value) || 0)}
                            className="h-8 text-right"
                            min="0"
                            max="100"
                            step="0.01"
                          />
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${calculateLineTotal(editingItem).toFixed(2)}
                        </TableCell>
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
                        <TableCell className="font-mono text-sm">{item.codigo}</TableCell>
                        <TableCell>{item.descripcion}</TableCell>
                        <TableCell>{item.unidad}</TableCell>
                        <TableCell className="text-right">{item.cantidad}</TableCell>
                        <TableCell className="text-right">${item.precioUnitario?.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{item.descuento}%</TableCell>
                        <TableCell className="text-right font-medium">
                          ${calculateLineTotal(item).toFixed(2)}
                        </TableCell>
                        <TableCell>
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
          
          <Button variant="link" className="text-blue-600">
            Ver catálogo completo →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductosServiciosTable;