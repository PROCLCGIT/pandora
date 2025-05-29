// /ws/appclc/pandora/src/modulos/brief/pages/BriefDetallePage.jsx

import React, { useState } from 'react';
import { 
  Calendar, 
  FilePenLine, 
  FileText, 
  Filter, 
  Plus, 
  Trash2, 
  FileDown, 
  Printer, 
  Eye,
  Search,
  Clock,
  User,
  MapPin,
  Info,
  Clipboard,
  ArrowUpDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// Removed CSS import - using inline Tailwind classes instead

const BriefDetallePage = () => {
  const [items, setItems] = useState([
    { id: 1, codigo: 'P001', producto: 'Producto 1', descripcion: 'Descripción del producto 1', unidad: 'Unidad', cantidad: 4 },
    { id: 2, codigo: 'P002', producto: 'Producto 2', descripcion: 'Descripción del producto 2', unidad: 'Kilogramo', cantidad: 8 },
  ]);
  const [newItem, setNewItem] = useState({
    id: 3,
    codigo: '',
    producto: '',
    descripcion: '',
    unidad: 'UND',
    cantidad: 0
  });

  const handleAddItem = () => {
    if (newItem.producto && newItem.cantidad > 0) {
      setItems([...items, {...newItem}]);
      setNewItem({
        id: newItem.id + 1,
        codigo: '',
        producto: '',
        descripcion: '',
        unidad: 'UND',
        cantidad: 0
      });
    }
  };

  const handleDeleteItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const totalItems = items.reduce((sum, item) => sum + Number(item.cantidad), 0);

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Encabezado */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-sm p-6 mb-8 border border-blue-100">
        <div className="flex flex-col md:flex-row md:items-start gap-4">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-5 rounded-xl shadow-md flex items-center justify-center">
            <FileText size={40} strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-800">Brief</h1>
              <Badge className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 hover:from-blue-200 hover:to-indigo-200 px-3 py-1 text-sm rounded-md shadow-sm whitespace-nowrap">
                <span className="font-mono font-bold">BF-202506</span>
              </Badge>
              <Badge className="bg-green-100 text-green-700 px-3 py-1 text-sm shadow-sm">Activo</Badge>
            </div>
            <p className="text-gray-600 mt-2 font-medium">Formulario de requerimientos para clientes</p>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                <span>jueves, 1 de mayo de 2025</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-blue-500" />
                <span>Creado hace 2 días</span>
              </div>
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2 text-blue-500" />
                <span>Por: Admin</span>
              </div>
            </div>
          </div>
          <div className="bg-white shadow-md p-5 rounded-xl text-center min-w-[140px] border border-blue-100 flex flex-col justify-center">
            <p className="text-sm text-gray-500 mb-1">Total Items</p>
            <p className="text-3xl font-bold text-blue-700">{totalItems}</p>
            <div className="mt-2 text-xs text-gray-400">Última actualización: hoy</div>
          </div>
        </div>
      </div>

      {/* Información del cliente y detalles del brief */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Info Brief */}
        <Card className="border-blue-100">
          <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-t-lg">
            <CardTitle className="flex items-center text-lg font-semibold text-blue-900">
              <User className="mr-2 h-5 w-5 text-blue-600" />
              Información del Cliente
            </CardTitle>
            <CardDescription>Datos del solicitante y origen</CardDescription>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="space-y-4">
              <div className="flex items-center">
                <span className="font-medium w-28 text-gray-700">Código:</span>
                <span className="bg-blue-50 px-2 py-1 rounded-md font-mono text-blue-800">BF-202506</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium w-28 text-gray-700">Cliente:</span>
                <span className="text-gray-500 italic">No asignado</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium w-28 text-gray-700">Origen:</span>
                <span className="text-gray-500 italic">No especificado</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium w-28 text-gray-700">Dirección:</span>
                <span className="text-gray-500 italic flex items-center">
                  <MapPin className="h-3 w-3 mr-1 text-gray-400" /> 
                  No especificada
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50 border-t">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                    <FilePenLine className="mr-2 h-4 w-4" />
                    Editar Datos de Cliente
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Editar información del cliente</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardFooter>
        </Card>

        {/* Detalles de la Proforma */}
        <Card className="border-blue-100">
          <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-t-lg">
            <CardTitle className="flex items-center text-lg font-semibold text-blue-900">
              <FileText className="mr-2 h-5 w-5 text-blue-600" />
              Detalles del Brief
            </CardTitle>
            <CardDescription>Información y configuración</CardDescription>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="space-y-4">
              <div className="flex items-center">
                <span className="font-medium w-40 text-gray-700">Código Brief:</span>
                <span className="bg-blue-50 px-2 py-1 rounded-md font-mono text-blue-800">BF-202506</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium w-40 text-gray-700">Fecha emisión:</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-800">2025-05-02</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-full hover:bg-blue-100">
                          <FilePenLine className="h-3.5 w-3.5 text-blue-600" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Editar fecha</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <div className="flex items-start">
                <span className="font-medium w-40 text-gray-700 pt-1">Estado:</span>
                <Badge className="bg-green-100 text-green-800 py-1">Activo</Badge>
              </div>
              <div className="flex items-start">
                <span className="font-medium w-40 text-gray-700 pt-1.5">Observaciones:</span>
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-gray-500 italic">No hay observaciones</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-full hover:bg-blue-100">
                          <FilePenLine className="h-3.5 w-3.5 text-blue-600" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Añadir observaciones</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50 border-t justify-end">
            <Badge variant="outline" className="text-blue-600 border-blue-300">
              <Clock className="h-3 w-3 mr-1" />
              <span className="text-xs">Actualizado: hoy 14:25</span>
            </Badge>
          </CardFooter>
        </Card>
      </div>

      {/* Tabla de productos */}
      <Card className="border-blue-100 overflow-hidden mb-8">
        <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-t-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <CardTitle className="flex items-center text-lg font-semibold text-blue-900">
                <Clipboard className="mr-2 h-5 w-5 text-blue-600" />
                Listado de Items
              </CardTitle>
              <CardDescription>Productos y cantidades requeridas</CardDescription>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar items..."
                  className="pl-9 h-9 border-blue-200 focus:border-blue-400"
                />
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" className="border-blue-200 h-9 bg-white/80">
                      <Filter className="h-4 w-4 mr-2 text-blue-600" />
                      <span>Filtrar</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Filtrar por categoría o estado</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" className="border-blue-200 h-9 bg-white/80">
                      <ArrowUpDown className="h-4 w-4 mr-2 text-blue-600" />
                      <span>Ordenar</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Ordenar por código, nombre o cantidad</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 h-9">
                      <Plus className="h-4 w-4 mr-2" />
                      <span>Nuevo Item</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Agregar un nuevo producto al brief</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-blue-50 to-transparent border-y border-blue-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-blue-800 w-16">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-blue-800 w-32">CÓDIGO</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-blue-800">PRODUCTO</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-blue-800">DESCRIPCIÓN</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-blue-800 w-32">UNIDAD</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-blue-800 w-32">CANTIDAD</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-blue-800 w-24">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="brief-table-cell">
                      <span className="brief-table-id">{item.id}</span>
                    </td>
                    <td className="brief-table-cell">
                      <Badge variant="outline" className="brief-table-code">
                        {item.codigo}
                      </Badge>
                    </td>
                    <td className="brief-table-cell font-medium text-gray-800">{item.producto}</td>
                    <td className="brief-table-cell text-gray-600">{item.descripcion}</td>
                    <td className="brief-table-cell">{item.unidad}</td>
                    <td className="brief-table-cell font-medium text-blue-800">{item.cantidad}</td>
                    <td className="brief-table-cell">
                      <div className="brief-action-buttons">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="brief-action-button"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Ver detalles</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="brief-action-button"
                              >
                                <FilePenLine className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Editar item</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                onClick={() => handleDeleteItem(item.id)}
                                variant="ghost" 
                                size="sm" 
                                className="brief-delete-button"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Eliminar item</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {/* Fila para agregar nuevo item */}
                <tr className="bg-gradient-to-r from-blue-50 to-blue-50/30 border-blue-100/60">
                  <td className="brief-table-cell">
                    <span className="brief-table-id">
                      <Plus className="h-4 w-4" />
                    </span>
                  </td>
                  <td className="brief-table-cell">
                    <Input 
                      value={newItem.codigo} 
                      onChange={(e) => setNewItem({...newItem, codigo: e.target.value})}
                      placeholder="Código" 
                      className="h-9 border-blue-200 focus:border-blue-400"
                    />
                  </td>
                  <td className="brief-table-cell">
                    <Input 
                      value={newItem.producto} 
                      onChange={(e) => setNewItem({...newItem, producto: e.target.value})}
                      placeholder="Nombre del producto" 
                      className="h-9 border-blue-200 focus:border-blue-400"
                    />
                  </td>
                  <td className="brief-table-cell">
                    <Input 
                      value={newItem.descripcion} 
                      onChange={(e) => setNewItem({...newItem, descripcion: e.target.value})}
                      placeholder="Descripción" 
                      className="h-9 border-blue-200 focus:border-blue-400"
                    />
                  </td>
                  <td className="brief-table-cell">
                    <Select
                      value={newItem.unidad}
                      onValueChange={(value) => setNewItem({...newItem, unidad: value})}
                    >
                      <SelectTrigger className="h-9 border-blue-200 focus:border-blue-400">
                        <SelectValue placeholder="Unidad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UND">UND</SelectItem>
                        <SelectItem value="Unidad">Unidad</SelectItem>
                        <SelectItem value="Kilogramo">Kilogramo</SelectItem>
                        <SelectItem value="Litro">Litro</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="brief-table-cell">
                    <Input 
                      type="number"
                      value={newItem.cantidad} 
                      onChange={(e) => setNewItem({...newItem, cantidad: parseInt(e.target.value, 10) || 0})}
                      placeholder="0" 
                      className="h-9 border-blue-200 focus:border-blue-400"
                    />
                  </td>
                  <td className="brief-table-cell text-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            onClick={handleAddItem}
                            size="sm" 
                            className="bg-blue-600 hover:bg-blue-700 h-8 w-8 p-0"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Agregar item</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-blue-100/30 py-3 border-t border-blue-100">
          <div className="text-sm text-blue-700 font-medium">
            Mostrando {items.length} de {items.length} items
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-100 text-blue-800 border-none">
              <span className="font-semibold">Total Items: {totalItems}</span>
            </Badge>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-blue-200 text-blue-700 bg-white hover:bg-blue-50"
            >
              <FileDown className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Historial */}
      <Card className="brief-card overflow-hidden mb-8">
        <CardHeader className="brief-card-header">
          <CardTitle className="brief-card-title">
            <Clock className="brief-card-icon" />
            Historial de cambios
          </CardTitle>
          <CardDescription>Registro cronológico de modificaciones realizadas</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="brief-history">
            {/* Item de historial 1 */}
            <div className="brief-history-item">
              <div className="brief-history-icon bg-blue-600">
                <Clock className="h-4 w-4 text-white" />
              </div>
              <div className="brief-history-content bg-gradient-to-r from-blue-50 to-transparent border-blue-100">
                <div className="brief-history-meta">
                  <p className="font-semibold text-blue-800">Brief creado</p>
                  <Badge className="bg-blue-100 text-blue-800 border-none">
                    <span className="font-mono text-xs">01/05/2025 - 10:32</span>
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mt-1">Se creó el documento BF-202506 con estado Activo</p>
                <div className="brief-history-user">
                  <div className="brief-history-user-icon bg-blue-100">
                    <User className="h-3 w-3 text-blue-700" />
                  </div>
                  <span className="text-xs text-gray-500">Admin</span>
                </div>
              </div>
            </div>
            
            {/* Item de historial 2 */}
            <div className="brief-history-item">
              <div className="brief-history-icon bg-green-600">
                <Plus className="h-4 w-4 text-white" />
              </div>
              <div className="brief-history-content bg-gradient-to-r from-green-50 to-transparent border-green-100">
                <div className="brief-history-meta">
                  <p className="font-semibold text-green-800">Productos agregados (2)</p>
                  <Badge className="bg-green-100 text-green-800 border-none">
                    <span className="font-mono text-xs">01/05/2025 - 11:15</span>
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mt-1">Se agregaron 2 productos al brief: P001 y P002</p>
                <div className="brief-history-user">
                  <div className="brief-history-user-icon bg-green-100">
                    <User className="h-3 w-3 text-green-700" />
                  </div>
                  <span className="text-xs text-gray-500">Admin</span>
                </div>
              </div>
            </div>
            
            {/* Item de historial 3 */}
            <div className="brief-history-item">
              <div className="brief-history-icon bg-amber-500">
                <FilePenLine className="h-4 w-4 text-white" />
              </div>
              <div className="brief-history-content bg-gradient-to-r from-amber-50 to-transparent border-amber-100">
                <div className="brief-history-meta">
                  <p className="font-semibold text-amber-800">Brief modificado</p>
                  <Badge className="bg-amber-100 text-amber-800 border-none">
                    <span className="font-mono text-xs">02/05/2025 - 09:45</span>
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mt-1">Se actualizó la información del brief</p>
                <div className="brief-history-user">
                  <div className="brief-history-user-icon bg-amber-100">
                    <User className="h-3 w-3 text-amber-700" />
                  </div>
                  <span className="text-xs text-gray-500">Admin</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-gradient-to-r from-blue-50 to-blue-100/30 py-3 border-t border-blue-100 flex justify-center">
          <Button variant="outline" size="sm" className="border-blue-200 text-blue-700 hover:bg-blue-50">
            <Clock className="mr-2 h-4 w-4" />
            Ver historial completo
          </Button>
        </CardFooter>
      </Card>

      {/* Botones de acción */}
      <div className="brief-footer">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" className="brief-footer-button">
                <Eye className="mr-2 h-4 w-4" />
                Vista Previa
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Ver preview del brief</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" className="brief-footer-button">
                <Printer className="mr-2 h-4 w-4" />
                Imprimir
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Imprimir documento</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" className="brief-footer-button">
                <FileDown className="mr-2 h-4 w-4" />
                Exportar PDF
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Descargar como PDF</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button className="brief-primary-button">
                <FileDown className="mr-2 h-4 w-4" />
                Guardar Brief
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Guardar todos los cambios</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default BriefDetallePage;