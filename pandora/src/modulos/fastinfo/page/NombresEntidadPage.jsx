import React, { useState } from 'react';
import { useNombresEntidad } from '../hooks/useFastinfo';
import NombresEntidadTable from '../components/NombresEntidadTable';
import NombreEntidadForm from '../components/NombreEntidadForm';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle } from 'lucide-react';

const NombresEntidadPage = () => {
  const { 
    nombres, 
    loading, 
    error, 
    fetchNombres, 
    createNombre, 
    updateNombre, 
    deleteNombre 
  } = useNombresEntidad();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNombre, setEditingNombre] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCreate = () => {
    setEditingNombre(null);
    setIsFormOpen(true);
  };

  const handleEdit = (nombre) => {
    setEditingNombre(nombre);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    setFormLoading(true);
    try {
      if (editingNombre) {
        await updateNombre(editingNombre.id, formData);
        showNotification('Entidad actualizada exitosamente');
      } else {
        await createNombre(formData);
        showNotification('Entidad creada exitosamente');
      }
      setIsFormOpen(false);
      setEditingNombre(null);
    } catch (error) {
      console.error('Error en formulario:', error);
      showNotification('Error al guardar la entidad', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNombre(id);
      showNotification('Entidad eliminada exitosamente');
    } catch (error) {
      console.error('Error al eliminar:', error);
      showNotification('Error al eliminar la entidad', 'error');
    }
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingNombre(null);
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Notificaciones */}
      {notification && (
        <Alert variant={notification.type === 'error' ? 'destructive' : 'default'}>
          {notification.type === 'error' ? (
            <XCircle className="h-4 w-4" />
          ) : (
            <CheckCircle className="h-4 w-4" />
          )}
          <AlertDescription>{notification.message}</AlertDescription>
        </Alert>
      )}

      {/* Error global */}
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>Error: {error}</AlertDescription>
        </Alert>
      )}

      {/* Tabla principal */}
      <NombresEntidadTable
        nombres={nombres}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={handleCreate}
        onRefresh={fetchNombres}
      />

      {/* Modal de formulario */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingNombre ? 'Editar' : 'Crear'} Nombre de Entidad
            </DialogTitle>
          </DialogHeader>
          <NombreEntidadForm
            nombreEntidad={editingNombre}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            loading={formLoading}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NombresEntidadPage;