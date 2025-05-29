import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { 
  Search, 
  Package, 
  Plus, 
  Check,
  Loader2,
  ShoppingCart,
  Package2,
  Tags
} from 'lucide-react';

// Import services
import { useProductosDisponibles } from '@/modulos/productos/api/productoDisponibleService';
import { useProductosOfertados } from '@/modulos/productos/api/productoOfertadoService';

const ProductosDisponiblesSelectionModal = ({ 
  isOpen, 
  onClose, 
  onProductosSelected 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('disponibles');
  const [page, setPage] = useState(1);
  const pageSize = 50; // Increased page size for better UX

  // Fetch productos disponibles
  const { 
    data: productosDisponiblesData, 
    isLoading: loadingDisponibles, 
    isError: errorDisponibles 
  } = useProductosDisponibles({
    search: searchTerm,
    page,
    page_size: pageSize,
  });

  // Fetch productos ofertados
  const { 
    data: productosOfertadosData, 
    isLoading: loadingOfertados, 
    isError: errorOfertados 
  } = useProductosOfertados({
    search: searchTerm,
    page,
    page_size: pageSize,
  });

  // Get current products based on active tab
  const currentProducts = useMemo(() => {
    if (activeTab === 'disponibles') {
      return productosDisponiblesData?.results || [];
    } else {
      return productosOfertadosData?.results || [];
    }
  }, [activeTab, productosDisponiblesData, productosOfertadosData]);

  // Get current loading/error states
  const isLoading = activeTab === 'disponibles' ? loadingDisponibles : loadingOfertados;
  const isError = activeTab === 'disponibles' ? errorDisponibles : errorOfertados;
  const currentData = activeTab === 'disponibles' ? productosDisponiblesData : productosOfertadosData;

  // Handle product selection
  const handleProductSelect = (product, isSelected) => {
    if (isSelected) {
      setSelectedProducts(prev => [...prev, product]);
    } else {
      setSelectedProducts(prev => prev.filter(p => p.id !== product.id));
    }
  };

  // Handle select all
  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      setSelectedProducts(prev => [...prev, ...currentProducts.filter(p => !prev.some(sp => sp.id === p.id))]);
    } else {
      // Remove products from current tab from selection
      setSelectedProducts(prev => prev.filter(p => !currentProducts.some(cp => cp.id === p.id)));
    }
  };

  // Check if product is selected
  const isProductSelected = (productId) => {
    return selectedProducts.some(p => p.id === productId);
  };

  // Handle adding selected products
  const handleAddProducts = () => {
    if (selectedProducts.length === 0) {
      toast({
        title: "Sin selección",
        description: "Debes seleccionar al menos un producto.",
        variant: "destructive"
      });
      return;
    }

    // Transform selected products to the format expected by the proforma
    const formattedProducts = selectedProducts.map(product => {
      // Determine product type based on the active tab and product properties
      let isProductoDisponible;
      let precio;
      
      if (activeTab === 'disponibles') {
        isProductoDisponible = true;
        precio = product.precio_venta || 0;
      } else if (activeTab === 'ofertados') {
        isProductoDisponible = false;
        precio = product.precio_oferta || 0;
      } else {
        // Fallback: determine by properties
        isProductoDisponible = product.stock !== undefined || product.precio_venta !== undefined;
        precio = isProductoDisponible ? (product.precio_venta || 0) : (product.precio_oferta || 0);
      }
      
      return {
        id: `temp_${Date.now()}_${product.id}`, // Temporary ID for the proforma table
        producto_disponible_id: isProductoDisponible ? product.id : null,
        producto_ofertado_id: !isProductoDisponible ? product.id : null,
        tipo_item: isProductoDisponible ? 'producto_disponible' : 'producto_ofertado',
        codigo: product.codigo || product.code || '',
        nombre: product.nombre,
        descripcion: product.descripcion || product.nombre || '',
        precio_unitario: precio,
        precio: precio, // Also include as 'precio' for compatibility
        cantidad: 1, // Default quantity
        porcentaje_descuento: 0, // Default discount percentage
        total: precio, // Add total property
        unidad_id: product.unidad_presentacion?.id || product.unidad_id || 1, // Include unidad ID, default to 1
        unidad: product.unidad_presentacion?.nombre || 'UNIDAD',
        // Additional data for reference
        marca: product.marca?.nombre || '',
        especialidad: product.especialidad?.nombre || '',
        procedencia: product.procedencia?.nombre || '',
        categoria: product.categoria?.nombre || '',
      };
    });

    // Call the callback with formatted products
    onProductosSelected(formattedProducts);

    // Show success message
    toast({
      title: "Productos agregados",
      description: `Se agregaron ${selectedProducts.length} producto(s) a la proforma.`,
    });

    // Reset state and close modal
    setSelectedProducts([]);
    setSearchTerm('');
    onClose();
  };

  // Handle modal close
  const handleClose = () => {
    setSelectedProducts([]);
    setSearchTerm('');
    setPage(1);
    onClose();
  };

  const allSelected = currentProducts.length > 0 && 
    currentProducts.every(product => isProductSelected(product.id));
  const someSelected = selectedProducts.length > 0;

  // Reset selected products when switching tabs (optional)
  const handleTabChange = (value) => {
    setActiveTab(value);
    setPage(1); // Reset page when switching tabs
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            Seleccionar Productos
          </DialogTitle>
          <DialogDescription>
            Busca y selecciona productos disponibles u ofertados para agregar a la proforma.
          </DialogDescription>
        </DialogHeader>

        {/* Tabs and Search */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="flex items-center justify-between gap-4 pb-4">
            <TabsList className="grid w-[400px] grid-cols-2">
              <TabsTrigger value="disponibles" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Productos Disponibles
              </TabsTrigger>
              <TabsTrigger value="ofertados" className="flex items-center gap-2">
                <Tags className="h-4 w-4" />
                Productos Ofertados
              </TabsTrigger>
            </TabsList>
            
            {selectedProducts.length > 0 && (
              <Badge variant="secondary" className="whitespace-nowrap">
                {selectedProducts.length} seleccionado(s)
              </Badge>
            )}
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={`Buscar ${activeTab === 'disponibles' ? 'productos disponibles' : 'productos ofertados'} por código, nombre, marca...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Table Content for both tabs */}
          <TabsContent value="disponibles" className="flex-1 mt-0">
            <div className="flex-1 border rounded-lg">
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    disabled={loadingDisponibles || currentProducts.length === 0}
                  />
                  <span className="text-sm font-medium">
                    Seleccionar todos ({currentProducts.length})
                  </span>
                </div>
              </div>

              <ScrollArea className="flex-1 max-h-[400px]">
                {loadingDisponibles ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Cargando productos disponibles...</span>
                  </div>
                ) : errorDisponibles ? (
                  <div className="flex items-center justify-center p-8 text-red-600">
                    Error al cargar los productos disponibles
                  </div>
                ) : currentProducts.length === 0 ? (
                  <div className="flex items-center justify-center p-8 text-gray-500">
                    {searchTerm ? 'No se encontraron productos disponibles' : 'No hay productos disponibles'}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Código</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Marca</TableHead>
                        <TableHead>Especialidad</TableHead>
                        <TableHead>Precio</TableHead>
                        <TableHead>Stock</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentProducts.map((product) => {
                        const isSelected = isProductSelected(product.id);
                        return (
                          <TableRow 
                            key={product.id}
                            className={`cursor-pointer hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}
                            onClick={() => handleProductSelect(product, !isSelected)}
                          >
                            <TableCell>
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={(checked) => handleProductSelect(product, checked)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {product.codigo}
                            </TableCell>
                            <TableCell className="font-medium">
                              {product.nombre}
                            </TableCell>
                            <TableCell className="text-sm text-gray-600 max-w-xs truncate">
                              {product.descripcion || '-'}
                            </TableCell>
                            <TableCell className="text-sm">
                              {product.marca?.nombre || '-'}
                            </TableCell>
                            <TableCell className="text-sm">
                              {product.especialidad?.nombre || '-'}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              ${product.precio_venta?.toFixed(2) || '0.00'}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge 
                                variant={product.stock > 0 ? "default" : "destructive"}
                                className="text-xs"
                              >
                                {product.stock || 0}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </ScrollArea>
            </div>

            {/* Pagination info for disponibles */}
            {productosDisponiblesData && (
              <div className="text-sm text-gray-500 text-center py-2">
                Mostrando {currentProducts.length} de {productosDisponiblesData.count} productos disponibles
              </div>
            )}
          </TabsContent>

          <TabsContent value="ofertados" className="flex-1 mt-0">
            <div className="flex-1 border rounded-lg">
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    disabled={loadingOfertados || currentProducts.length === 0}
                  />
                  <span className="text-sm font-medium">
                    Seleccionar todos ({currentProducts.length})
                  </span>
                </div>
              </div>

              <ScrollArea className="flex-1 max-h-[400px]">
                {loadingOfertados ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Cargando productos ofertados...</span>
                  </div>
                ) : errorOfertados ? (
                  <div className="flex items-center justify-center p-8 text-red-600">
                    Error al cargar los productos ofertados
                  </div>
                ) : currentProducts.length === 0 ? (
                  <div className="flex items-center justify-center p-8 text-gray-500">
                    {searchTerm ? 'No se encontraron productos ofertados' : 'No hay productos ofertados'}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Código</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Marca</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead>Precio</TableHead>
                        <TableHead>Procedencia</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentProducts.map((product) => {
                        const isSelected = isProductSelected(product.id);
                        return (
                          <TableRow 
                            key={product.id}
                            className={`cursor-pointer hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}
                            onClick={() => handleProductSelect(product, !isSelected)}
                          >
                            <TableCell>
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={(checked) => handleProductSelect(product, checked)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {product.codigo || product.code}
                            </TableCell>
                            <TableCell className="font-medium">
                              {product.nombre}
                            </TableCell>
                            <TableCell className="text-sm text-gray-600 max-w-xs truncate">
                              {product.descripcion || '-'}
                            </TableCell>
                            <TableCell className="text-sm">
                              {product.marca?.nombre || '-'}
                            </TableCell>
                            <TableCell className="text-sm">
                              {product.categoria?.nombre || '-'}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              ${product.precio_oferta?.toFixed(2) || '0.00'}
                            </TableCell>
                            <TableCell className="text-sm">
                              {product.procedencia?.nombre || '-'}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </ScrollArea>
            </div>

            {/* Pagination info for ofertados */}
            {productosOfertadosData && (
              <div className="text-sm text-gray-500 text-center py-2">
                Mostrando {currentProducts.length} de {productosOfertadosData.count} productos ofertados
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleClose}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleAddProducts}
            disabled={selectedProducts.length === 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Agregar {selectedProducts.length > 0 ? `(${selectedProducts.length})` : ''} Producto(s)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductosDisponiblesSelectionModal;