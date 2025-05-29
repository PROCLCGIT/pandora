// /pandora/src/modulos/brief/components/BriefItemsList.jsx

import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Hash,
  Ruler
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

const BriefItemsList = ({ briefId, items = [], onAddItem, onEditItem, onDeleteItem }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);

  // Filtrar items por búsqueda
  const filteredItems = items.filter(item =>
    item.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.specifications?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular totales
  const totalItems = filteredItems.length;
  const totalQuantity = filteredItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const totalEstimated = filteredItems.reduce((sum, item) => {
    const price = Number(item.precio_estimado) || 0;
    const quantity = Number(item.quantity) || 0;
    return sum + (price * quantity);
  }, 0);

  const ItemRow = ({ item, index }) => {
    const totalPrice = (Number(item.precio_estimado) || 0) * (Number(item.quantity) || 0);
    const hasReference = !!item.product_reference;

    return (
      <TableRow className="hover:bg-blue-50/50">
        <TableCell className="font-mono text-sm">
          {String(index + 1).padStart(2, '0')}
        </TableCell>
        
        <TableCell>
          <div className="space-y-1">
            <div className="font-medium text-gray-900">
              {item.product}
            </div>
            {hasReference && (
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                <CheckCircle className="w-3 h-3 mr-1" />
                En inventario
              </Badge>
            )}
            {item.product_reference_name && (
              <div className="text-xs text-gray-500">
                Ref: {item.product_reference_name}
              </div>
            )}
          </div>
        </TableCell>

        <TableCell>
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-600">
              {Number(item.quantity).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">
              {item.unit_name || item.unit || 'UND'}
            </div>
          </div>
        </TableCell>

        <TableCell>
          <div className="text-right">
            {item.precio_estimado ? (
              <>
                <div className="font-medium text-gray-900">
                  ${Number(item.precio_estimado).toLocaleString('es-ES', { 
                    minimumFractionDigits: 2 
                  })}
                </div>
                <div className="text-xs text-gray-500">por unidad</div>
              </>
            ) : (
              <div className="text-sm text-gray-400 italic">
                Sin precio
              </div>
            )}
          </div>
        </TableCell>

        <TableCell>
          <div className="text-right">
            {totalPrice > 0 ? (
              <div className="font-semibold text-green-600">
                ${totalPrice.toLocaleString('es-ES', { 
                  minimumFractionDigits: 2 
                })}
              </div>
            ) : (
              <div className="text-sm text-gray-400 italic">
                --
              </div>
            )}
          </div>
        </TableCell>

        <TableCell>
          {(item.specifications || item.notes) && (
            <div className="max-w-xs">
              {item.specifications && (
                <div className="text-sm text-gray-700 line-clamp-2">
                  <span className="font-medium">Esp:</span> {item.specifications}
                </div>
              )}
              {item.notes && (
                <div className="text-sm text-gray-500 line-clamp-1 mt-1">
                  <span className="font-medium">Nota:</span> {item.notes}
                </div>
              )}
            </div>
          )}
        </TableCell>

        <TableCell className="text-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEditItem?.(item)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => onDeleteItem?.(item)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    );
  };

  if (!items || items.length === 0) {
    return (
      <Card className="border-0 shadow-md">
        <CardContent className="py-12 text-center">
          <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No hay items en este brief
          </h3>
          <p className="text-gray-500 mb-6">
            Comienza agregando productos o servicios a este brief.
          </p>
          <Button onClick={onAddItem}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar primer item
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header con estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{totalItems}</div>
            <div className="text-sm text-gray-500">Items</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {totalQuantity.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Cantidad Total</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              ${totalEstimated.toLocaleString('es-ES')}
            </div>
            <div className="text-sm text-gray-500">Valor Estimado</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {items.filter(item => item.product_reference).length}
            </div>
            <div className="text-sm text-gray-500">En Inventario</div>
          </CardContent>
        </Card>
      </div>

      {/* Herramientas de búsqueda y filtros */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              Items del Brief
              <Badge variant="outline">{totalItems}</Badge>
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtrar
              </Button>
              <Button size="sm" onClick={onAddItem}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Item
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-16 text-center">#</TableHead>
                  <TableHead className="min-w-64">Producto</TableHead>
                  <TableHead className="w-32 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Hash className="h-4 w-4" />
                      Cantidad
                    </div>
                  </TableHead>
                  <TableHead className="w-32 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      Precio Unit.
                    </div>
                  </TableHead>
                  <TableHead className="w-32 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      Total
                    </div>
                  </TableHead>
                  <TableHead className="min-w-48">
                    <div className="flex items-center gap-1">
                      <Ruler className="h-4 w-4" />
                      Especificaciones
                    </div>
                  </TableHead>
                  <TableHead className="w-20 text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item, index) => (
                  <ItemRow 
                    key={item.id || index} 
                    item={item} 
                    index={index} 
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        {/* Footer con totales */}
        <div className="border-t bg-gray-50 p-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Mostrando {filteredItems.length} de {totalItems} items
            </div>
            <div className="flex items-center gap-6 text-sm font-medium">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Cantidad Total:</span>
                <span className="text-purple-600 font-bold">
                  {totalQuantity.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Valor Estimado:</span>
                <span className="text-green-600 font-bold">
                  ${totalEstimated.toLocaleString('es-ES', { 
                    minimumFractionDigits: 2 
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Alertas y notificaciones */}
      {items.some(item => !item.product_reference) && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Algunos items no están vinculados con productos del inventario. 
            Considera vincularlos para mejor seguimiento.
          </AlertDescription>
        </Alert>
      )}

      {totalEstimated === 0 && (
        <Alert className="border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No hay precios estimados para los items. 
            Agrega precios para calcular el valor total del brief.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default BriefItemsList;
