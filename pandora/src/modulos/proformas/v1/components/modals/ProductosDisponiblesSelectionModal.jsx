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
  Tags,
  Grid3X3,
  List,
  Eye,
  X,
  Zap
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
  const [viewMode, setViewMode] = useState('table');
  const [showPreview, setShowPreview] = useState(false);
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
        precio = parseFloat(product.precio_venta_privado || product.precio_sie_referencial || 0);
      } else if (activeTab === 'ofertados') {
        isProductoDisponible = false;
        precio = product.precio_oferta || 0;
      } else {
        // Fallback: determine by properties
        isProductoDisponible = product.precio_venta_privado !== undefined || product.precio_sie_referencial !== undefined;
        precio = isProductoDisponible ? parseFloat(product.precio_venta_privado || product.precio_sie_referencial || 0) : (product.precio_oferta || 0);
      }
      
      return {
        id: `temp_${Date.now()}_${product.id}`, // Temporary ID for the proforma table
        producto_disponible_id: isProductoDisponible ? product.id : null,
        producto_ofertado_id: !isProductoDisponible ? product.id : null,
        tipo_item: isProductoDisponible ? 'producto_disponible' : 'producto_ofertado',
        codigo: product.codigo || product.code || '',
        nombre: product.nombre,
        descripcion: product.descripcion || product.modelo || product.nombre || '',
        precioUnitario: precio, // Frontend uses camelCase
        precio_unitario: precio, // Backend uses snake_case
        precio: precio, // Also include as 'precio' for compatibility
        cantidad: 1, // Default quantity
        descuento: 0, // Default discount percentage (frontend uses 'descuento')
        porcentaje_descuento: 0, // Backend uses 'porcentaje_descuento'
        total: precio, // Initial total equals price * quantity (1)
        unidad_id: product.unidad_presentacion?.id || product.unidad_id || 1, // Include unidad ID, default to 1
        unidad: product.unidad_presentacion?.nombre || 'UNIDAD',
        // Additional data for reference
        marca: product.marca_nombre || '',
        especialidad: product.especialidad_nombre || '',
        procedencia: product.procedencia_nombre || '',
        categoria: product.categoria_nombre || '',
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

  // Calculate total value of selected products
  const totalValue = selectedProducts.reduce((sum, product) => {
    const precio = activeTab === 'disponibles' 
      ? parseFloat(product.precio_venta_privado || product.precio_sie_referencial || 0)
      : (product.precio_oferta || 0);
    return sum + precio;
  }, 0);

  // Reset selected products when switching tabs (optional)
  const handleTabChange = (value) => {
    setActiveTab(value);
    setPage(1); // Reset page when switching tabs
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col mx-4">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Catálogo de Productos
                </h2>
                <p className="text-gray-600">
                  Selecciona productos para agregar a tu proforma
                </p>
              </div>
            </div>
            
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Selection Summary */}
          {selectedProducts.length > 0 && (
            <div className="bg-white rounded-lg p-4 border border-blue-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-blue-900 flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  {selectedProducts.length} producto(s) seleccionado(s)
                </h4>
                <div className="text-lg font-bold text-blue-600">
                  Total: ${totalValue.toFixed(2)}
                </div>
              </div>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Eye className="h-3 w-3" />
                {showPreview ? 'Ocultar' : 'Ver'} detalles
              </button>
              
              {showPreview && (
                <div className="mt-3 flex flex-wrap gap-2 max-h-20 overflow-y-auto">
                  {selectedProducts.map((product) => (
                    <span
                      key={product.id}
                      className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                    >
                      {product.nombre}
                      <button
                        onClick={() => handleProductSelect(product, false)}
                        className="hover:bg-blue-200 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-6 border-b border-gray-200">
          {/* Tabs */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => handleTabChange('disponibles')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${
                  activeTab === 'disponibles'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Package className="h-4 w-4" />
                Disponibles
                <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">
                  {productosDisponiblesData?.count || 0}
                </span>
              </button>
              
              <button
                onClick={() => handleTabChange('ofertados')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${
                  activeTab === 'ofertados'
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Tags className="h-4 w-4" />
                Ofertas
                <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-xs">
                  {productosOfertadosData?.count || 0}
                </span>
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-80"
                />
              </div>

              <div className="flex border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 ${viewMode === 'table' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-hidden">
          <div className="h-full border border-gray-200 rounded-lg overflow-hidden">
            <div className="h-96 overflow-y-auto">
              {viewMode === 'grid' ? (
                // Grid View
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                  {isLoading ? (
                    <div className="col-span-full flex items-center justify-center p-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Cargando productos...</span>
                    </div>
                  ) : isError ? (
                    <div className="col-span-full flex items-center justify-center p-8 text-red-600">
                      Error al cargar los productos
                    </div>
                  ) : currentProducts.length === 0 ? (
                    <div className="col-span-full flex items-center justify-center p-8 text-gray-500">
                      {searchTerm ? 'No se encontraron productos' : 'No hay productos'}
                    </div>
                  ) : (
                    currentProducts.map((product) => {
                      const isSelected = isProductSelected(product.id);
                      const precio = activeTab === 'disponibles' 
                        ? parseFloat(product.precio_venta_privado || product.precio_sie_referencial || 0)
                        : (product.precio_oferta || 0);
                      
                      return (
                        <div
                          key={product.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                            isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                          }`}
                          onClick={() => handleProductSelect(product, !isSelected)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                                {activeTab === 'disponibles' ? (
                                  <Package className="h-5 w-5 text-blue-600" />
                                ) : (
                                  <Tags className="h-5 w-5 text-orange-600" />
                                )}
                              </div>
                              <div>
                                <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  {product.codigo || product.code}
                                </code>
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => handleProductSelect(product, e.target.checked)}
                              onClick={(e) => e.stopPropagation()}
                              className="rounded"
                            />
                          </div>

                          <h4 className="font-semibold text-gray-900 mb-2">
                            {product.nombre}
                          </h4>
                          
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {product.descripcion || product.modelo || product.nombre}
                          </p>

                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Marca:</span>
                              <span className="font-medium">{product.marca_nombre || '-'}</span>
                            </div>
                            
                            {activeTab === 'disponibles' && (
                              <div className="flex justify-between">
                                <span className="text-gray-500">Especialidad:</span>
                                <span className="font-medium text-blue-600">
                                  {product.especialidad_nombre || '-'}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-3 mt-3 border-t">
                            <div className="text-lg font-bold text-green-600">
                              ${precio.toFixed(2)}
                            </div>
                            {activeTab === 'ofertados' && (
                              <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-medium">
                                OFERTA
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              ) : (
                // Table View
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={`${activeTab === 'disponibles' ? 'bg-blue-50' : 'bg-orange-50'}`}>
                      <tr>
                        <th className="w-12 p-4">
                          <Checkbox
                            checked={allSelected}
                            onCheckedChange={handleSelectAll}
                            disabled={isLoading || currentProducts.length === 0}
                          />
                        </th>
                        <th className="text-left p-4 font-semibold">Código</th>
                        <th className="text-left p-4 font-semibold">Producto</th>
                        <th className="text-left p-4 font-semibold">Marca</th>
                        <th className="text-left p-4 font-semibold">
                          {activeTab === 'disponibles' ? 'Especialidad' : 'Categoría'}
                        </th>
                        <th className="text-right p-4 font-semibold">Precio</th>
                        <th className="text-center p-4 font-semibold">
                          {activeTab === 'disponibles' ? 'Procedencia' : 'Procedencia'}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        <tr>
                          <td colSpan="7" className="p-8 text-center">
                            <div className="flex items-center justify-center">
                              <Loader2 className="h-6 w-6 animate-spin mr-2" />
                              <span>Cargando productos...</span>
                            </div>
                          </td>
                        </tr>
                      ) : isError ? (
                        <tr>
                          <td colSpan="7" className="p-8 text-center text-red-600">
                            Error al cargar los productos
                          </td>
                        </tr>
                      ) : currentProducts.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="p-8 text-center text-gray-500">
                            {searchTerm ? 'No se encontraron productos' : 'No hay productos'}
                          </td>
                        </tr>
                      ) : (
                        currentProducts.map((product) => {
                          const isSelected = isProductSelected(product.id);
                          const precio = activeTab === 'disponibles' 
                            ? parseFloat(product.precio_venta_privado || product.precio_sie_referencial || 0)
                            : (product.precio_oferta || 0);
                          
                          return (
                            <tr 
                              key={product.id}
                              className={`border-b cursor-pointer transition-colors ${
                                isSelected 
                                  ? `${activeTab === 'disponibles' ? 'bg-blue-50' : 'bg-orange-50'}` 
                                  : 'hover:bg-gray-50'
                              }`}
                              onClick={() => handleProductSelect(product, !isSelected)}
                            >
                              <td className="p-4">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => handleProductSelect(product, e.target.checked)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="rounded"
                                />
                              </td>
                              <td className="p-4">
                                <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                                  {product.codigo || product.code}
                                </code>
                              </td>
                              <td className="p-4">
                                <div>
                                  <div className="font-semibold text-gray-900 flex items-center gap-2">
                                    {product.nombre}
                                    {activeTab === 'ofertados' && (
                                      <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                        <Zap className="h-3 w-3" />
                                        OFERTA
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-600 truncate max-w-xs">
                                    {product.descripcion || product.modelo || product.nombre}
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 text-sm font-medium">
                                {product.marca_nombre || '-'}
                              </td>
                              <td className="p-4">
                                <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                                  {activeTab === 'disponibles' 
                                    ? (product.especialidad_nombre || '-') 
                                    : (product.categoria_nombre || '-')
                                  }
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <span className={`font-bold ${activeTab === 'disponibles' ? 'text-green-600' : 'text-orange-600'}`}>
                                  ${precio.toFixed(2)}
                                </span>
                              </td>
                              <td className="p-4 text-center">
                                <span className="text-sm">{product.procedencia_nombre || '-'}</span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Mostrando {currentProducts.length} productos
              {selectedProducts.length > 0 && (
                <span className="ml-4 font-semibold text-blue-600">
                  {selectedProducts.length} seleccionado(s) • Total: ${totalValue.toFixed(2)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={handleClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleAddProducts}
                disabled={selectedProducts.length === 0}
                className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  selectedProducts.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg'
                }`}
              >
                <ShoppingCart className="h-4 w-4" />
                Agregar {selectedProducts.length > 0 ? `(${selectedProducts.length})` : ''}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductosDisponiblesSelectionModal;