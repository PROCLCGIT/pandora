// /pandora/src/modulos/basic/components/especialidades/EspecialidadesList.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, Edit, Trash2, ArrowUpDown } from 'lucide-react';
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
import { useEspecialidades, useDeleteEspecialidad } from '../../api/especialidadService';

/**
 * Componente que muestra un listado de especialidades con opciones de filtrado y paginación
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.filters - Filtros a aplicar (opcional)
 * @param {Function} props.onDelete - Función a ejecutar cuando se elimina una especialidad (opcional)
 */
export default function EspecialidadesList({ filters = {}, onDelete }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Estado para la especialidad seleccionada para eliminar
  const [especialidadToDelete, setEspecialidadToDelete] = useState(null);
  
  // Estado para ordenamiento
  const [sorting, setSorting] = useState([]);
  
  // Consulta con React Query
  const { 
    data, 
    isLoading, 
    isError,
    error,
    refetch 
  } = useEspecialidades(filters);
  
  // Mutación para eliminar
  const deleteMutation = useDeleteEspecialidad({
    onSuccess: (id) => {
      toast({
        title: 'Especialidad eliminada',
        description: 'La especialidad se ha eliminado correctamente.',
      });
      
      // Notificar al componente padre
      if (onDelete) onDelete(id);
      
      // Recargar datos
      refetch();
    },
    onError: (error) => {
      toast({
        title: 'Error al eliminar',
        description: `No se pudo eliminar la especialidad: ${error.message}`,
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
          <Stethoscope className="h-4 w-4 text-gray-500" />
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
        const especialidad = row.original;
        
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/basic/especialidades/${especialidad.id}`);
              }}
              title="Editar especialidad"
            >
              <Edit className="h-4 w-4 text-blue-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setEspecialidadToDelete(especialidad);
              }}
              title="Eliminar especialidad"
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
    if (especialidadToDelete) {
      deleteMutation.mutate(especialidadToDelete.id);
      setEspecialidadToDelete(null);
    }
  };
  
  // Mostrar mensaje de carga
  if (isLoading) {
    return <div className="flex justify-center items-center p-8">Cargando especialidades...</div>;
  }
  
  // Mostrar mensaje de error
  if (isError) {
    return (
      <div className="text-center p-4 text-red-500">
        Error al cargar especialidades: {error.message}
      </div>
    );
  }
  
  // Si no hay resultados
  if (!data?.results?.length) {
    return (
      <div className="text-center p-8 text-gray-500">
        No se encontraron especialidades con los criterios especificados.
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
                onClick={() => navigate(`/basic/especialidades/${row.original.id}`)}
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
          Total: {data?.count || 0} especialidades
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
      <Dialog open={!!especialidadToDelete} onOpenChange={(open) => !open && setEspecialidadToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Está seguro de que desea eliminar la especialidad "{especialidadToDelete?.nombre}"?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEspecialidadToDelete(null)}
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