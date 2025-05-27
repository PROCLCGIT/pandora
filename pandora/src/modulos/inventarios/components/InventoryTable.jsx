import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  AlertTriangle, 
  Package,
  Edit,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useInventory } from '../hooks/useInventory';
import { formatCurrency, formatNumber } from '../utils/formatters';

const InventoryTable = () => {
  const { stocks, almacenes, loading, fetchStocks } = useInventory();
  const [filtros, setFiltros] = useState({
    search: '',
    almacen: '',
    estado_stock: '',
  });

  useEffect(() => {
    fetchStocks(filtros);
  }, [filtros, fetchStocks]);

  const getEstadoBadge = (estado) => {
    const variants = {
      agotado: { variant: 'destructive', icon: <AlertTriangle className="w-3 h-3" /> },
      critico: { variant: 'destructive', icon: <TrendingDown className="w-3 h-3" /> },
      bajo: { variant: 'warning', icon: <TrendingDown className="w-3 h-3" /> },
      normal: { variant: 'success', icon: <Package className="w-3 h-3" /> },
      alto: { variant: 'secondary', icon: <TrendingUp className="w-3 h-3" /> },
    };

    const config = variants[estado] || variants.normal;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {estado.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar producto..."
            value={filtros.search}
            onChange={(e) => setFiltros({ ...filtros, search: e.target.value })}
            className="pl-10"
          />
        </div>
        
        <Select
          value={filtros.almacen}
          onValueChange={(value) => setFiltros({ ...filtros, almacen: value })}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Todos los almacenes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos los almacenes</SelectItem>
            {almacenes.map((almacen) => (
              <SelectItem key={almacen.id} value={almacen.id.toString()}>
                {almacen.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filtros.estado_stock}
          onValueChange={(value) => setFiltros({ ...filtros, estado_stock: value })}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Todos los estados" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            <SelectItem value="agotado">Agotado</SelectItem>
            <SelectItem value="critico">Crítico</SelectItem>
            <SelectItem value="bajo">Bajo</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="alto">Alto</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabla */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Almacén</TableHead>
              <TableHead className="text-right">Cantidad</TableHead>
              <TableHead className="text-right">Disponible</TableHead>
              <TableHead className="text-right">Mínimo</TableHead>
              <TableHead className="text-right">Costo Prom.</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Cargando inventario...
                </TableCell>
              </TableRow>
            ) : stocks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  No se encontraron productos
                </TableCell>
              </TableRow>
            ) : (
              stocks.map((stock) => (
                <TableRow key={stock.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{stock.producto_detalle?.nombre || 'N/A'}</p>
                      <p className="text-sm text-muted-foreground">
                        {stock.producto_detalle?.codigo || 'N/A'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{stock.almacen_nombre}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatNumber(stock.cantidad)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(stock.cantidad_disponible)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(stock.stock_minimo)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(stock.costo_promedio)}
                  </TableCell>
                  <TableCell>
                    {getEstadoBadge(stock.estado_stock)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default InventoryTable;
