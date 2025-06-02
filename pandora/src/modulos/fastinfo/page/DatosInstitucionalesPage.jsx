import React, { useState } from 'react';
import { useDatosInstitucionales } from '../hooks/useFastinfo';
import DatosInstitucionalesTable from '../components/DatosInstitucionalesTable';
import DatosInstitucionalesForm from '../components/DatosInstitucionalesForm';
import DatoInstitucionalDetalle from '../components/DatoInstitucionlDetalle';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle } from 'lucide-react';

const DatosInstitucionalesPage = () => {
  const { 
    datos, 
    loading, 
    error, 
    fetchDatos, 
    createDato, 
    updateDato, 
    deleteDato 
  } = useDatosInstitucionales();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingDato, setEditingDato] = useState(null);
  const [viewingDato, setViewingDato] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCreate = () => {
    setEditingDato(null);
    setIsFormOpen(true);
  };

  const handleEdit = (dato) => {
    setEditingDato(dato);
    setIsFormOpen(true);
  };

  const handleView = (dato) => {
    setViewingDato(dato);
    setIsDetailOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    setFormLoading(true);
    try {
      if (editingDato) {
        await updateDato(editingDato.id, formData);
        showNotification('Datos institucionales actualizados exitosamente');
      } else {
        await createDato(formData);
        showNotification('Datos institucionales creados exitosamente');
      }
      setIsFormOpen(false);
      setEditingDato(null);
    } catch (error) {
      console.error('Error en formulario:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Error al guardar los datos institucionales';
      showNotification(errorMessage, 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDato(id);
      showNotification('Datos institucionales eliminados exitosamente');
    } catch (error) {
      console.error('Error al eliminar:', error);
      showNotification('Error al eliminar los datos institucionales', 'error');
    }
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingDato(null);
  };

  const handleDetailClose = () => {
    setIsDetailOpen(false);
    setViewingDato(null);
  };

  const handleEditFromDetail = (dato) => {
    setIsDetailOpen(false);
    setViewingDato(null);
    handleEdit(dato);
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
      <DatosInstitucionalesTable
        datos={datos}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={handleCreate}
        onRefresh={fetchDatos}
        onView={handleView}
      />

      {/* Modal de formulario */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingDato ? 'Editar' : 'Crear'} Datos Institucionales
            </DialogTitle>
          </DialogHeader>
          <DatosInstitucionalesForm
            datoInstitucional={editingDato}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            loading={formLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Modal de detalles */}
      <DatoInstitucionalDetalle
        dato={viewingDato}
        isOpen={isDetailOpen}
        onClose={handleDetailClose}
        onEdit={handleEditFromDetail}
      />
    </div>
  );
};

export default DatosInstitucionalesPage;