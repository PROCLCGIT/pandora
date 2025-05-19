// /pandora/src/modulos/basic/pages/proveedores/proveedorPage.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Building2, Filter } from 'lucide-react';

// Importar hook de búsqueda personalizado para debounce
import { useSearch } from '@/hooks/custom/useSearch';

// Servicios (ejemplo, deberás crear estos servicios)
// import { useProveedores, useDeleteProveedor } from '../../api/proveedorService';

import { useToast } from '@/hooks/use-toast';
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

// Importar componentes personalizados
import { PageHeader } from '../../components/layout/PageHeader';
import { FilterCard } from '../../components/layout/FilterCard';
import { DataTable } from '../../components/data/DataTable';
import { ActionButtons } from '../../components/ui/ActionButtons';
import { SearchInput } from '../../components/ui/SearchInput';

// Datos de ejemplo (reemplazar con datos reales de la API)
const proveedoresData = {
  count: 3,
  results: [
    { 
      id: 1, 
      nombre: 'Medical Supplies Inc.', 
      identificacion: 'MS-12345', 
      categoria: 'Insumos Médicos',
      contacto: 'info@medicalsupplies.com / +593 912345678'
    },
    { 
      id: 2, 
      nombre: 'TechnoMedical Equipment',
      identificacion: 'TM-67890',
      categoria: 'Equipos Médicos',
      contacto: 'ventas@technomedical.com'
    },
    { 
      id: 3, 
      nombre: 'Healthcare Services',
      identificacion: 'HS-54321',
      categoria: 'Servicios de Mantenimiento',
      contacto: null
    }
  ]
};

export default function ProveedorPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [filters, setFilters] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [proveedorToDelete, setProveedorToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(proveedoresData);

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
    
    // Simulación de filtrado (reemplazar con lógica real)
    if (debouncedSearch) {
      const filteredResults = proveedoresData.results.filter(
        proveedor => 
          proveedor.nombre.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          proveedor.identificacion.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          (proveedor.categoria && proveedor.categoria.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
          (proveedor.contacto && proveedor.contacto.toLowerCase().includes(debouncedSearch.toLowerCase()))
      );
      
      setData({
        count: filteredResults.length,
        results: filteredResults
      });
    } else {
      setData(proveedoresData);
    }
  }, [debouncedSearch]);
  
  // Función para simular recargar datos
  const refetch = () => {
    setIsLoading(true);
    setTimeout(() => {
      setData(proveedoresData);
      setIsLoading(false);
    }, 500);
  };

  // Manejadores de eventos
  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };

  const handleDeleteClick = (proveedor) => {
    setProveedorToDelete(proveedor);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    // Simulación de eliminación (reemplazar con mutación real)
    setIsLoading(true);
    setTimeout(() => {
      toast({
        title: "Proveedor eliminado",
        description: proveedorToDelete 
          ? `El proveedor "${proveedorToDelete.nombre}" ha sido eliminado correctamente.`
          : "El proveedor ha sido eliminado correctamente.",
      });
      
      // Actualizar la lista después de eliminar
      setData({
        count: data.count - 1,
        results: data.results.filter(item => item.id !== proveedorToDelete.id)
      });
      
      setDeleteDialogOpen(false);
      setProveedorToDelete(null);
      setIsLoading(false);
    }, 500);
  };

  // Función para truncar texto largo
  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  // Definición de columnas para la tabla
  const columns = [
    {
      header: 'Nombre',
      accessor: 'nombre',
      cell: (proveedor) => (
        <div className="font-medium flex items-center text-gray-800">
          <Building2 className="h-4 w-4 mr-2 text-blue-500 flex-shrink-0" />
          <span className="truncate" title={proveedor.nombre}>{proveedor.nombre}</span>
        </div>
      )
    },
    {
      header: 'RUC/Identificación',
      accessor: 'identificacion',
      cell: (proveedor) => (
        <Badge variant="outline" className="font-mono bg-blue-50 text-blue-800 border-blue-200">
          {proveedor.identificacion || 'N/A'}
        </Badge>
      )
    },
    {
      header: 'Categoría',
      accessor: 'categoria',
      cell: (proveedor) => (
        <span className="text-gray-700">
          {proveedor.categoria || 'Sin categoría'}
        </span>
      )
    },
    {
      header: 'Contacto',
      accessor: 'contacto',
      cell: (proveedor) => (
        proveedor.contacto ? (
          <span title={proveedor.contacto}>
            {truncateText(proveedor.contacto, 60)}
          </span>
        ) : (
          <span className="text-muted-foreground text-sm italic">
            Sin información de contacto
          </span>
        )
      )
    },
    {
      header: 'Acciones',
      accessor: 'id',
      style: { textAlign: 'center', width: '7rem' },
      cell: (proveedor) => (
        <ActionButtons 
          onView={() => navigate(`/basic/proveedores/${proveedor.id}`)}
          onEdit={() => navigate(`/basic/proveedores/edit/${proveedor.id}`)}
          onDelete={() => handleDeleteClick(proveedor)}
        />
      )
    }
  ];

  // Renderizado de la página
  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Cabecera de la página */}
      <PageHeader 
        icon={<Building2 size={40} strokeWidth={1.5} />}
        title="Gestión de Proveedores"
        description="Administra los proveedores de insumos y servicios médicos."
        action={{
          label: "Agregar Proveedor",
          icon: <Plus className="h-4 w-4" />,
          onClick: () => navigate('/basic/proveedores/add')
        }}
      />

      {/* Tarjeta de filtros */}
      <FilterCard
        title="Filtros de Búsqueda"
        description="Busca proveedores por nombre, identificación, categoría o contacto."
        icon={<Filter className="mr-2 h-5 w-5 text-blue-600" />}
        onClear={() => {
          setSearchValue('');
          setFilters({});
          setData(proveedoresData);
        }}
      >
        <SearchInput 
          value={searchValue}
          onChange={handleSearchChange}
          placeholder="Buscar por nombre, identificación, categoría o contacto..."
          debouncedValue={debouncedSearch}
        />
      </FilterCard>

      {/* Tabla de datos */}
      <DataTable 
        columns={columns}
        data={data?.results}
        isLoading={isLoading}
        isError={isError}
        errorMessage={error?.message}
        onRetry={refetch}
        emptyMessage="No se encontraron proveedores que coincidan con la búsqueda."
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
              ¿Estás seguro de que deseas eliminar el proveedor "{proveedorToDelete?.nombre}"?
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
              disabled={isLoading}
            >
              {isLoading ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}