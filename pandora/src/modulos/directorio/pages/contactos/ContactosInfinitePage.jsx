// /pandora/src/modulos/directorio/pages/contactos/ContactosInfinitePage.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInfiniteContactos, useDeleteContacto } from '../../api/contactoService';
import { useSearch } from '@/hooks/custom/useSearch';
import { useToast } from '@/hooks/use-toast';
import { useInView } from 'react-intersection-observer';

import { 
  UserCircle, 
  Filter, 
  Plus, 
  ChevronLeft, 
  MapPin, 
  Info, 
  Phone, 
  Mail,
  BadgeCheck,
  BadgeX,
  Building
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { PageHeader } from '@/modulos/basic/components/layout/PageHeader';
import { FilterCard } from '@/modulos/basic/components/layout/FilterCard';
import { SearchInput } from '@/modulos/basic/components/ui/SearchInput';
import { ActionButtons } from '@/modulos/basic/components/ui/ActionButtons';

export default function ContactosInfinitePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [filters, setFilters] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contactoToDelete, setContactoToDelete] = useState(null);
  
  // Utilizar hook personalizado para la búsqueda con debounce
  const { 
    inputValue: searchValue, 
    setInputValue: setSearchValue, 
    debouncedValue: debouncedSearch 
  } = useSearch({
    initialValue: '',
    delay: 500,
  });
  
  // Hook para detectar cuándo el usuario llega al final de la lista
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false
  });
  
  // Consulta de datos con paginación infinita
  const { 
    data, 
    isLoading, 
    isError, 
    error, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage,
    refetch 
  } = useInfiniteContactos({
    ...filters,
    search: debouncedSearch,
    page_size: 15
  }, {
    onError: (error) => {
      toast({
        title: "Error al cargar datos",
        description: `No se pudieron cargar los contactos: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Efecto para cargar más datos cuando se llega al final de la lista
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);
  
  // Efecto para actualizar los filtros cuando cambia el valor de búsqueda con debounce
  useEffect(() => {
    setFilters(prevFilters => ({ ...prevFilters, search: debouncedSearch }));
  }, [debouncedSearch]);
  
  // Mutación para eliminar
  const deleteContactoMutation = useDeleteContacto({
    onSuccess: () => {
      toast({
        title: "Contacto eliminado",
        description: contactoToDelete 
          ? `El contacto "${contactoToDelete.nombre}" ha sido eliminado correctamente.`
          : "El contacto ha sido eliminado correctamente.",
      });
      refetch();
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
      }
    });
  };
  
  // Aplanar los datos de paginación infinita
  const flattenedData = data?.pages.flatMap(page => page.results) || [];
  
  // Renderizado de la página
  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Cabecera de la página */}
      <PageHeader 
        icon={<UserCircle size={40} strokeWidth={1.5} />}
        title="Contactos - Vista Infinita"
        description="Visualiza todos los contactos con paginación infinita."
        action={{
          label: "Nuevo Contacto",
          icon: <Plus className="h-4 w-4" />,
          onClick: () => navigate('/directorio/contactos/add')
        }}
      />
      
      <div className="mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/directorio/contactos')}
          className="border-blue-200 text-blue-700 hover:bg-blue-50"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Volver a vista normal
        </Button>
      </div>
      
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

      {/* Grid de tarjetas de contactos */}
      <div className="mt-6">
        {isLoading && flattenedData.length === 0 ? (
          <div className="flex justify-center items-center min-h-60 w-full bg-gray-50 rounded-md border border-gray-200">
            <div className="flex flex-col items-center text-gray-500">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-3"></div>
              <p>Cargando contactos...</p>
            </div>
          </div>
        ) : isError ? (
          <div className="p-6 text-center min-h-60 bg-red-50 rounded-md border border-red-200">
            <div className="flex flex-col items-center text-red-700">
              <Info className="h-10 w-10 mb-2 text-red-500" />
              <h3 className="font-semibold text-lg mb-1">Error al cargar datos</h3>
              <p className="mb-3">{error?.message || 'No se pudieron obtener los contactos'}</p>
              <Button variant="outline" onClick={() => refetch()}>Reintentar</Button>
            </div>
          </div>
        ) : flattenedData.length === 0 ? (
          <div className="p-6 text-center min-h-60 bg-gray-50 rounded-md border border-gray-200">
            <div className="flex flex-col items-center text-gray-500">
              <UserCircle className="h-10 w-10 mb-2 text-gray-400" />
              <h3 className="font-semibold text-lg mb-1">No se encontraron contactos</h3>
              <p className="mb-3">No hay contactos que coincidan con los criterios de búsqueda.</p>
              <Button variant="outline" onClick={() => navigate('/directorio/contactos/add')}>
                <Plus className="h-4 w-4 mr-1" />
                Agregar Nuevo Contacto
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {flattenedData.map(contacto => (
              <div 
                key={contacto.id} 
                className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-4 border-b border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 truncate flex items-center" title={contacto.nombre}>
                        <UserCircle className="h-4 w-4 mr-1.5 text-indigo-500 flex-shrink-0" />
                        <span>{contacto.nombre}</span>
                      </h3>
                      {contacto.alias && (
                        <Badge variant="outline" className="mt-1 w-fit">
                          {contacto.alias}
                        </Badge>
                      )}
                    </div>
                    <Badge 
                      variant="outline" 
                      className="bg-indigo-50 text-indigo-700 border-indigo-200"
                    >
                      {contacto.ingerencia}
                    </Badge>
                  </div>
                </div>
                
                <div className="px-4 py-2 bg-gray-50 text-sm">
                  <div className="flex items-center text-gray-600 mb-1">
                    <Mail className="h-3.5 w-3.5 mr-2 flex-shrink-0 text-blue-600" />
                    <a href={`mailto:${contacto.email}`} className="truncate hover:text-blue-600 hover:underline">
                      {contacto.email}
                    </a>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-3.5 w-3.5 mr-2 flex-shrink-0 text-blue-600" />
                    <a href={`tel:${contacto.telefono}`} className="hover:text-blue-600 hover:underline">
                      {contacto.telefono}
                    </a>
                  </div>
                  {contacto.telefono2 && (
                    <div className="flex items-center text-gray-600 mt-1">
                      <Phone className="h-3.5 w-3.5 mr-2 flex-shrink-0 text-gray-400" />
                      <a href={`tel:${contacto.telefono2}`} className="hover:text-blue-600 hover:underline">
                        {contacto.telefono2}
                      </a>
                    </div>
                  )}
                </div>
                
                <div className="px-4 py-2 border-t border-gray-100 flex justify-between items-center">
                  {contacto.direccion ? (
                    <div className="flex items-center text-xs text-gray-500">
                      <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                      <span className="truncate">{contacto.direccion}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">Sin dirección</span>
                  )}
                  
                  <div className="flex">
                    <ActionButtons 
                      onView={() => navigate(`/directorio/contactos/${contacto.id}`)}
                      onEdit={() => navigate(`/directorio/contactos/edit/${contacto.id}`)}
                      onDelete={() => handleDeleteClick(contacto)}
                      compact={true}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Elemento de referencia para detección de scroll y carga infinita */}
        {!isLoading && !isError && hasNextPage && (
          <div 
            ref={loadMoreRef} 
            className="my-6 py-4 text-center text-sm text-gray-500 flex justify-center items-center"
          >
            {isFetchingNextPage ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-2"></div>
                Cargando más contactos...
              </>
            ) : (
              "Scroll para cargar más contactos"
            )}
          </div>
        )}
        
        {!isLoading && !isError && !hasNextPage && flattenedData.length > 0 && (
          <div className="my-6 py-4 text-center text-sm text-gray-500">
            --- No hay más contactos para mostrar ---
          </div>
        )}
      </div>
      
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