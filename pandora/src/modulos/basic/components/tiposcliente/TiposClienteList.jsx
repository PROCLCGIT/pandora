// /pandora/src/modulos/basic/components/tiposcliente/TiposClienteList.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Edit, Trash2, ArrowUpDown } from 'lucide-react';
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

// Importar hooks de React Query
import { useTiposCliente, useDeleteTipoCliente } from '../../api/tipoClienteService';

/**
 * Componente que muestra un listado de tipos de cliente con opciones de filtrado y paginación
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.filters - Filtros a aplicar (opcional)
 * @param {Function} props.onDelete - Función a ejecutar cuando se elimina un tipo de cliente (opcional)
 */
export default function TiposClienteList({ filters = {}, onDelete }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Estado para el tipo de cliente seleccionado para eliminar
  const [tipoClienteToDelete, setTipoClienteToDelete] = useState(null);
  
  // Estado para ordenamiento
  const [sorting, setSorting] = useState([]);
  
  // Consulta con React Query
  const { 
    data, 
    isLoading, 
    isError,
    error,
    refetch 
  } = useTiposCliente(filters);
  
  // Mutación para eliminar
  const deleteMutation = useDeleteTipoCliente({
    onSuccess: (id) => {
      toast({
        title: 'Tipo de cliente eliminado',
        description: 'El tipo de cliente se ha eliminado correctamente.',
      });
      
      // Notificar al componente padre
      if (onDelete) onDelete(id);
      
      // Recargar datos
      refetch();
    },
    onError: (error) => {
      toast({
        title: 'Error al eliminar',
        description: `No se pudo eliminar el tipo de cliente: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  // Definición de columnas
  const columns = [
    {
      accessorKey: 'code',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Código
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="font-medium">{row.getValue('code')}</div>,
    },
    {
      accessorKey: 'nombre',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nombre
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-500" />
          <span>{row.getValue('nombre')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Fecha de Creación',
      cell: ({ row }) => {
        const date = new Date(row.original.created_at);
        return <div>{date.toLocaleDateString()}</div>;
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const tipoCliente = row.original;
        
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/basic/tiposcliente/${tipoCliente.id}`);
              }}
              title="Editar tipo de cliente"
            >
              <Edit className="h-4 w-4 text-blue-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setTipoClienteToDelete(tipoCliente);
              }}
              title="Eliminar tipo de cliente"
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        );
      },
    },
  ];
  
  // Instancia de la tabla
  const table = useReactTable({
    data: data?.results || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });
  
  // Función para confirmar eliminación
  const confirmDelete = () => {
    if (tipoClienteToDelete) {
      deleteMutation.mutate(tipoClienteToDelete.id);
      setTipoClienteToDelete(null);
    }
  };
  
  // Mostrar mensaje de carga
  if (isLoading) {
    return <div className="flex justify-center items-center p-8">Cargando tipos de cliente...</div>;
  }
  
  // Mostrar mensaje de error
  if (isError) {
    return (
      <div className="text-center p-4 text-red-500">
        Error al cargar tipos de cliente: {error.message}
      </div>
    );
  }
  
  // Si no hay resultados
  if (!data?.results?.length) {
    return (
      <div className="text-center p-8 text-gray-500">
        No se encontraron tipos de cliente con los criterios especificados.
      </div>
    );
  }
  
  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="cursor-pointer hover:bg-blue-50"
                onClick={() => navigate(`/basic/tiposcliente/${row.original.id}`)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Controles de paginación */}
      <div className="flex items-center justify-between py-4">
        <div className="text-sm text-gray-500">
          Total: {data?.count || 0} tipos de cliente
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Página {table.getState().pagination.pageIndex + 1} de{' '}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              {'<'}
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              {'>'}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Diálogo de confirmación para eliminar */}
      <Dialog open={!!tipoClienteToDelete} onOpenChange={(open) => !open && setTipoClienteToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Está seguro de que desea eliminar el tipo de cliente "{tipoClienteToDelete?.nombre}"?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setTipoClienteToDelete(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}