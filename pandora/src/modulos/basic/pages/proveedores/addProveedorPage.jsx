// /pandora/src/modulos/basic/pages/proveedores/addProveedorPage.jsx

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Building2, AtSign, Phone, Upload, X } from 'lucide-react';

// Importar servicios (estos serían los servicios que habría que crear)
// import { 
//   useProveedorById, 
//   useCreateProveedor, 
//   useUpdateProveedor
// } from '../../api/proveedorService';

import { useToast } from '@/hooks/use-toast';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

// Importar componente personalizado para formularios
import { FormCard } from '../../components/form/FormCard';

// Esquema de validación con Yup
const proveedorSchema = yup.object({
  nombre: yup.string().required('El nombre es obligatorio').max(100, 'El nombre no debe exceder los 100 caracteres'),
  identificacion: yup.string().required('La identificación es obligatoria').max(20, 'La identificación no debe exceder los 20 caracteres'),
  categoria: yup.string().required('La categoría es obligatoria'),
  email: yup.string().email('Ingrese un correo electrónico válido').required('El correo electrónico es obligatorio'),
  telefono: yup.string().max(20, 'El teléfono no debe exceder los 20 caracteres'),
  direccion: yup.string().max(200, 'La dirección no debe exceder los 200 caracteres'),
  notas: yup.string().max(500, 'Las notas no deben exceder los 500 caracteres'),
});

// Lista de categorías de proveedores (esto podría venir de una API en un caso real)
const categorias = [
  { id: 'insumos', nombre: 'Insumos Médicos' },
  { id: 'equipos', nombre: 'Equipos Médicos' },
  { id: 'mantenimiento', nombre: 'Servicios de Mantenimiento' },
  { id: 'consultoria', nombre: 'Consultoría' },
  { id: 'software', nombre: 'Software Médico' },
  { id: 'otros', nombre: 'Otros Servicios' },
];

// Datos de ejemplo para edición (reemplazar con datos reales de la API)
const proveedorEjemplo = {
  id: 1,
  nombre: 'Medical Supplies Inc.',
  identificacion: 'MS-12345',
  categoria: 'insumos',
  email: 'info@medicalsupplies.com',
  telefono: '+593 912345678',
  direccion: 'Av. Principal 123, Guayaquil, Ecuador',
  notas: 'Proveedor principal de insumos médicos desechables y de un solo uso.',
  documentos: [
    {
      id: 101,
      nombre: 'contrato_2023.pdf',
      tipo: 'application/pdf',
      tamaño: 1254000,
      fecha: '2023-05-15T10:30:00'
    },
    {
      id: 102,
      nombre: 'catalogo_productos.pdf',
      tipo: 'application/pdf',
      tamaño: 3540000,
      fecha: '2023-06-20T15:45:00'
    }
  ]
};

export default function AddProveedorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = Boolean(id);
  
  // Estado para manejar documentos adjuntos
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Formulario con React Hook Form y Yup
  const form = useForm({
    resolver: yupResolver(proveedorSchema),
    defaultValues: {
      nombre: '',
      identificacion: '',
      categoria: '',
      email: '',
      telefono: '',
      direccion: '',
      notas: '',
    },
  });

  // Simulación de carga de datos para edición
  useEffect(() => {
    if (isEditing) {
      setIsLoading(true);
      // Simular carga de datos
      setTimeout(() => {
        form.reset({
          nombre: proveedorEjemplo.nombre,
          identificacion: proveedorEjemplo.identificacion,
          categoria: proveedorEjemplo.categoria,
          email: proveedorEjemplo.email,
          telefono: proveedorEjemplo.telefono,
          direccion: proveedorEjemplo.direccion,
          notas: proveedorEjemplo.notas,
        });
        
        // Cargar documentos
        setDocuments(proveedorEjemplo.documentos);
        setIsLoading(false);
      }, 800);
    }
  }, [form, isEditing]);

  // Manejar envío del formulario
  const onSubmit = (data) => {
    try {
      // Agregar documentos a los datos
      const dataWithDocuments = {
        ...data,
        documentos: documents
      };
      
      // Simular envío
      setIsLoading(true);
      setTimeout(() => {
        if (isEditing) {
          toast({
            title: 'Proveedor actualizado',
            description: 'El proveedor ha sido actualizado exitosamente.',
            variant: 'success',
          });
        } else {
          toast({
            title: 'Proveedor creado',
            description: 'El proveedor ha sido creado exitosamente.',
            variant: 'success',
          });
        }
        setIsLoading(false);
        navigate('/basic/proveedores');
      }, 1000);
    } catch (error) {
      console.error('Error en formulario:', error);
      toast({
        title: 'Error en el formulario',
        description: 'Hubo un error al procesar el formulario. Por favor, revisa los datos ingresados.',
        variant: 'destructive',
      });
    }
  };

  // Función para agregar un documento
  const handleAddDocument = (e) => {
    // Esta función es un ejemplo y debe adaptarse a tu implementación de carga
    // En una implementación real, se enviaría el archivo a un servidor
    console.log("Documento seleccionado:", e.target.files[0]);
    
    // Simulamos la adición de un documento
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDocuments([...documents, {
        id: Date.now(), // Generamos ID temporal
        nombre: file.name,
        tipo: file.type,
        tamaño: file.size,
        fecha: new Date().toISOString()
      }]);
    }
  };

  // Función para eliminar un documento
  const handleRemoveDocument = (docId) => {
    setDocuments(documents.filter(doc => doc.id !== docId));
  };

  return (
    <FormCard
      title={isEditing ? 'Editar Proveedor' : 'Nuevo Proveedor'}
      description={isEditing
        ? 'Actualiza la información del proveedor existente'
        : 'Completa el formulario para registrar un nuevo proveedor'}
      onSubmit={form.handleSubmit(onSubmit)}
      onCancel={() => navigate('/basic/proveedores')}
      backLink="Volver a proveedores"
      isSubmitting={isLoading}
      icon={<Building2 size={24} strokeWidth={1.5} />}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Sección de información principal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre o Razón Social</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre del proveedor" {...field} />
                  </FormControl>
                  <FormDescription>
                    Nombre completo o razón social de la empresa
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="identificacion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RUC/Identificación</FormLabel>
                  <FormControl>
                    <Input placeholder="Número de identificación" {...field} />
                  </FormControl>
                  <FormDescription>
                    Número de RUC, cédula o identificación fiscal
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="categoria"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoría</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categorias.map((categoria) => (
                      <SelectItem 
                        key={categoria.id} 
                        value={categoria.id}
                      >
                        {categoria.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Tipo principal de productos o servicios ofrecidos
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Sección de información de contacto */}
          <div className="space-y-4 border p-4 rounded-md border-blue-100">
            <h3 className="text-lg font-medium text-blue-900">Información de Contacto</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Electrónico</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <AtSign className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                        <Input placeholder="correo@ejemplo.com" className="pl-9" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="telefono"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                        <Input placeholder="+593 xxx xxx xxxx" className="pl-9" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="direccion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección</FormLabel>
                  <FormControl>
                    <Input placeholder="Dirección completa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Sección de notas adicionales */}
          <FormField
            control={form.control}
            name="notas"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notas Adicionales</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Información adicional sobre el proveedor..." 
                    className="min-h-[100px]" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Observaciones, términos de servicio, o información relevante
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Sección para documentos adjuntos */}
          <div className="border rounded-md p-4 border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-blue-900">Documentos</h3>
                <p className="text-sm text-muted-foreground">
                  Adjunta contratos, certificaciones u otros documentos relevantes
                </p>
              </div>
              <div>
                <Button 
                  type="button" 
                  variant="outline"
                  className="flex items-center border-blue-200 text-blue-700 hover:bg-blue-50"
                  onClick={() => document.getElementById('file-upload').click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Subir documento
                </Button>
                <input 
                  type="file" 
                  id="file-upload" 
                  className="hidden" 
                  onChange={handleAddDocument}
                />
              </div>
            </div>
            
            {/* Lista de documentos */}
            <div className="border rounded-md p-3 bg-muted/30 min-h-[100px] border-blue-100">
              {documents.length === 0 ? (
                <div className="flex items-center justify-center h-[100px] text-muted-foreground text-sm">
                  No hay documentos adjuntos
                </div>
              ) : (
                <div className="space-y-2">
                  {documents.map(doc => (
                    <div 
                      key={doc.id} 
                      className="flex items-center justify-between p-2 bg-white rounded border border-blue-100/60"
                    >
                      <div className="flex items-center">
                        <Building2 className="h-4 w-4 mr-2 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium">{doc.nombre}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(doc.fecha).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveDocument(doc.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </form>
      </Form>
    </FormCard>
  );
}