import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Search,
  Filter,
  MoreVertical,
  FileText,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
  Settings
} from 'lucide-react';
import { useMovements } from '../hooks/useMovements';
import { formatDateTime, formatCurrency } from '../utils/formatters';
import { MOVEMENT_TYPES, MOVEMENT_STATES } from '../constants/inventoryConstants';

const MovementHistory = () => {
  const { 
    movimientos, 
    tiposMovimiento, 
    loading, 
    fetchMovimientos, 
    fetchTiposMovimiento,
    confirmarMovimiento,
    anularMovimiento 
  } = useMovements();
  
  const [filtros, setFiltros] = useState({
    search: '',
    tipo_movimiento: '',
    estado: '',
  });

  useEffect(() => {
    fetchTiposMovimiento();
  }, [fetchTiposMovimiento]);

  useEffect(() => {
    fetchMovimientos(filtros);
  }, [filtros, fetchMovimientos]);

  const getMovementIcon = (tipo) => {
    switch (tipo) {
      case MOVEMENT_TYPES.ENTRADA:
        return <ArrowDownRight className="w-4 h-4 text-green-600" />;
      case MOVEMENT_TYPES.SALIDA:
        return <ArrowUpRight className="w-4 h-4 text-red-600" />;
      case MOVEMENT_TYPES.TRANSFERENCIA:
        return <ArrowLeftRight className="w-4 h-4 text-blue-600" />;
      case MOVEMENT_TYPES.AJUSTE:
        return <Settings className="w-4 h-4 text-orange-600" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getEstadoBadge = (estado) => {
    const variants = {
      [MOVEMENT_STATES.BORRADOR]: { variant: 'outline', label: 'Borrador' },
      [MOVEMENT_STATES.CONFIRMADO]: { variant: 'success', label: 'Confirmado' },
      [MOVEMENT_STATES.ANULADO]: { variant: 'destructive', label: 'Anulado' },
    };

    const config = variants[estado] || variants[MOVEMENT_STATES.BORRADOR];

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleConfirmar = async (movimientoId) => {
    if (window.confirm('¿Está seguro de confirmar este movimiento?')) {
      await confirmarMovimiento(movimientoId);
    }
  };

  const handleAnular = async (movimientoId) => {
    if (window.confirm('¿Está seguro de anular este movimiento?')) {
      await anularMovimiento(movimientoId);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por número de documento..."
            value={filtros.search}
            onChange={(e) => setFiltros({ ...filtros, search: e.target.value })}
            className="pl-10"
          />
        </div>
        
        <Select
          value={filtros.tipo_movimiento}
          onValueChange={(value) => setFiltros({ ...filtros, tipo_movimiento: value })}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Todos los tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos los tipos</SelectItem>
            {tiposMovimiento.map((tipo) => (
              <SelectItem key={tipo.id} value={tipo.id.toString()}>
                {tipo.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filtros.estado}
          onValueChange={(value) => setFiltros({ ...filtros, estado: value })}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Todos los estados" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            <SelectItem value={MOVEMENT_STATES.BORRADOR}>Borrador</SelectItem>
            <SelectItem value={MOVEMENT_STATES.CONFIRMADO}>Confirmado</SelectItem>
            <SelectItem value={MOVEMENT_STATES.ANULADO}>Anulado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabla */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Origen/Destino</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Cargando movimientos...
                </TableCell>
              </TableRow>
            ) : movimientos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  No se encontraron movimientos
                </TableCell>
              </TableRow>
            ) : (
              movimientos.map((movimiento) => (
                <TableRow key={movimiento.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getMovementIcon(movimiento.tipo_movimiento)}
                      <span className="text-sm">
                        {movimiento.tipo_movimiento_nombre}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatDateTime(movimiento.fecha)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {movimiento.numero_documento || 'S/N'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {movimiento.almacen_origen && (
                        <span>Desde: {movimiento.almacen_origen}</span>
                      )}
                      {movimiento.almacen_origen && movimiento.almacen_destino && (
                        <span> → </span>
                      )}
                      {movimiento.almacen_destino && (
                        <span>Hacia: {movimiento.almacen_destino}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(movimiento.total)}
                  </TableCell>
                  <TableCell>
                    {getEstadoBadge(movimiento.estado)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {movimiento.usuario_nombre}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <FileText className="mr-2 h-4 w-4" />
                          Ver detalles
                        </DropdownMenuItem>
                        {movimiento.estado === MOVEMENT_STATES.BORRADOR && (
                          <DropdownMenuItem 
                            onClick={() => handleConfirmar(movimiento.id)}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Confirmar
                          </DropdownMenuItem>
                        )}
                        {movimiento.estado === MOVEMENT_STATES.CONFIRMADO && (
                          <DropdownMenuItem 
                            onClick={() => handleAnular(movimiento.id)}
                            className="text-destructive"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Anular
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
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

export default MovementHistory;
