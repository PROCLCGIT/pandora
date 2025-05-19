// /pandora/src/modulos/directorio/pages/contactos/contactoPage.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter, UserCircle } from 'lucide-react';

// Importaciones del servicio de contacto
import { useContactos, useDeleteContacto } from '../../api/contactoService';

// Importar hook de búsqueda personalizado para debounce
import { useSearch } from '@/hooks/custom/useSearch';

import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Importar componentes personalizados
import { PageHeader } from '@/modulos/basic/components/layout/PageHeader';
import { FilterCard } from '@/modulos/basic/components/layout/FilterCard';
import { SearchInput } from '@/modulos/basic/components/ui/SearchInput';
import { ContactosList } from '../../components/contactos/ContactosList';

export default function ContactoPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [filters, setFilters] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contactoToDelete, setContactoToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Utilizar hook personalizado para la búsqueda con debounce
  const { 
    inputValue: searchValue, 
    setInputValue: setSearchValue, 
    debouncedValue: debouncedSearch 
  } = useSearch({
    initialValue: '',
    delay: 500,
  });
  
  // Efecto para actualizar los filtros cuando cambia el valor de búsqueda con debounce
  useEffect(() => {
    setCurrentPage(1);
    setFilters(prevFilters => ({ ...prevFilters, search: debouncedSearch }));
  }, [debouncedSearch]);

  // Consulta de datos con useContactos
  const { data, isLoading, isError, error, refetch } = useContactos({
    ...filters,
    search: debouncedSearch,
    ordering: '-created_at',
    page: currentPage,
    page_size: pageSize
  }, {
    keepPreviousData: true,
    onError: (error) => {
      toast({
        title: "Error al cargar datos",
        description: `No se pudieron cargar los contactos: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Mutación para eliminar
  const deleteContactoMutation = useDeleteContacto({
    onSuccess: () => {
      toast({
        title: "Contacto eliminado",
        description: contactoToDelete 
          ? `El contacto "${contactoToDelete.nombre}" ha sido eliminado correctamente.`
          : "El contacto ha sido eliminado correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al eliminar",
        description: `No se pudo eliminar el contacto: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Manejadores de eventos
  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };

  const handleDeleteClick = (contacto) => {
    setContactoToDelete(contacto);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    deleteContactoMutation.mutate(contactoToDelete.id, {
      onSettled: () => {
        setDeleteDialogOpen(false);
        setContactoToDelete(null);
        refetch();
      }
    });
  };

  // Renderizado de la página
  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Cabecera de la página */}
      <PageHeader 
        icon={<UserCircle size={40} strokeWidth={1.5} />}
        title="Gestión de Contactos"
        description="Administra los contactos y su información."
        action={{
          label: "Nuevo Contacto",
          icon: <Plus className="h-4 w-4" />,
          onClick: () => navigate('/directorio/contactos/add')
        }}
      />

      {/* Tarjeta de filtros */}
      <FilterCard
        title="Filtros de Búsqueda"
        description="Busca contactos por nombre, alias o email."
        icon={<Filter className="mr-2 h-5 w-5 text-blue-600" />}
        onClear={() => {
          setSearchValue('');
          setFilters({});
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex flex-col space-y-1.5">
            <label htmlFor="search" className="text-sm font-medium">Buscar</label>
            <SearchInput 
              value={searchValue}
              onChange={handleSearchChange}
              placeholder="Buscar por nombre, alias o email..."
              debouncedValue={debouncedSearch}
              inputProps={{ id: "search" }}
            />
          </div>
        </div>
      </FilterCard>
      
      <div className="mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/directorio/contactos/infinite')}
          className="border-blue-200 text-blue-700 hover:bg-blue-50"
        >
          Ver con paginación infinita
        </Button>
      </div>

      {/* Tabla de datos */}
      <ContactosList 
        data={data}
        isLoading={isLoading}
        isError={isError}
        error={error}
        refetch={refetch}
        onDeleteClick={handleDeleteClick}
        pagination={{
          currentPage,
          totalPages: Math.ceil((data?.count || 0) / pageSize),
          totalItems: data?.count || 0,
          pageSize,
          onPageChange: setCurrentPage
        }}
      />

      {/* Diálogo de confirmación para eliminar */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar el contacto "{contactoToDelete?.nombre}"?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={deleteContactoMutation.isPending}
            >
              {deleteContactoMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}