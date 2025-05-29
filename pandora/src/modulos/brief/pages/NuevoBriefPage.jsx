// /Users/clc/Ws/Appclc/pandora/src/modulos/brief/pages/NuevoBriefPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Send,
  Calendar,
  Search,
  X,
  FileText,
  User,
  Package,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/custom/useDebounce';
import * as briefService from '../api/briefService';

// Esquema de validación
const briefSchema = yup.object({
  title: yup.string().required('El título es requerido'),
  client: yup.string().required('El cliente es requerido'),
  origin: yup.string().required('El origen es requerido'),
  description: yup.string().required('La descripción es requerida'),
  priority: yup.string().required('La prioridad es requerida'),
  tiempo_entrega: yup.number().positive('Debe ser mayor a 0').required('El tiempo de entrega es requerido'),
  forma_pago: yup.string().required('La forma de pago es requerida'),
  destino: yup.string().required('El destino es requerido'),
  operador: yup.string().required('El operador es requerido'),
  items: yup.array().min(1, 'Debe agregar al menos un item')
});

const NuevoBriefPage = () => {
  const navigate = useNavigate();
  const { briefId } = useParams();
  const { toast } = useToast();
  const isEdit = !!briefId;

  // Estados
  const [loading, setLoading] = useState(false);
  const [choices, setChoices] = useState({});
  const [clientes, setClientes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [productos, setProductos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [currentItemIndex, setCurrentItemIndex] = useState(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Formulario
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(briefSchema),
    defaultValues: {
      title: '',
      client: '',
      origin: '',
      description: '',
      priority: 'media',
      presupuesto: '',
      tiempo_entrega: 30,
      forma_pago: '',
      destino: '',
      estado: 'draft',
      operador: '',
      due_date: '',
      observaciones_internas: '',
      items: []
    }
  });

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'items'
  });

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
    if (isEdit) {
      loadBriefData();
    }
  }, [briefId]);

  // Buscar productos
  useEffect(() => {
    if (debouncedSearchTerm) {
      searchProducts();
    }
  }, [debouncedSearchTerm]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [choicesRes, clientesRes, usuariosRes, unidadesRes] = await Promise.all([
        briefService.getChoices(),
        fetch('/api/directorio/clientes/').then(res => res.json()),
        fetch('/api/users/users/').then(res => res.json()),
        fetch('/api/basic/unidades/').then(res => res.json())
      ]);

      setChoices(choicesRes);
      setClientes(clientesRes.results || clientesRes || []);
      setUsuarios(usuariosRes.results || usuariosRes || []);
      setUnidades(unidadesRes.results || unidadesRes || []);
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast({
        title: 'Error',
        description: 'Error al cargar los datos iniciales',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadBriefData = async () => {
    try {
      const brief = await briefService.getBriefById(briefId);
      reset({
        ...brief,
        client: brief.client?.id || brief.client,
        operador: brief.operador?.id || brief.operador,
        due_date: brief.due_date ? brief.due_date.split('T')[0] : '',
        items: brief.items || []
      });
    } catch (error) {
      console.error('Error loading brief:', error);
      toast({
        title: 'Error',
        description: 'Error al cargar el brief',
        variant: 'destructive'
      });
    }
  };

  const searchProducts = async () => {
    try {
      const response = await fetch(`/api/productos/productos-disponibles/?search=${debouncedSearchTerm}`);
      const data = await response.json();
      setProductos(data.results || data || []);
    } catch (error) {
      console.error('Error searching products:', error);
    }
  };

  const onSubmit = async (data, status = 'draft') => {
    try {
      setLoading(true);
      
      const briefData = {
        ...data,
        estado: status,
        items: data.items.map((item, index) => ({
          ...item,
          orden: index + 1
        }))
      };

      let result;
      if (isEdit) {
        result = await briefService.updateBrief(briefId, briefData);
      } else {
        result = await briefService.createBrief(briefData);
      }

      toast({
        title: 'Éxito',
        description: `Brief ${isEdit ? 'actualizado' : 'creado'} correctamente`,
        variant: 'default'
      });

      navigate('/brief');
    } catch (error) {
      console.error('Error saving brief:', error);
      toast({
        title: 'Error',
        description: `Error al ${isEdit ? 'actualizar' : 'crear'} el brief`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = (data) => {
    onSubmit(data, 'draft');
  };

  const handleSaveActive = (data) => {
    onSubmit(data, 'pending');
  };

  const addItem = (producto = null) => {
    const newItem = {
      product: producto?.nombre || '',
      product_reference: producto?.id || '',
      quantity: 1,
      unit: unidades[0]?.id || '',
      specifications: '',
      notes: '',
      precio_estimado: producto ? parseFloat(producto.precio_venta_privado || 0) : 0
    };
    append(newItem);
    setIsProductModalOpen(false);
  };

  const selectProduct = (producto) => {
    if (currentItemIndex !== null) {
      const precio = producto.precio_venta_privado ? parseFloat(producto.precio_venta_privado) : 0;
      update(currentItemIndex, {
        product: producto.nombre,
        product_reference: producto.id,
        quantity: 1,
        unit: unidades[0]?.id || '',
        specifications: '',
        notes: '',
        precio_estimado: precio
      });
      setCurrentItemIndex(null);
    } else {
      addItem(producto);
    }
    setIsProductModalOpen(false);
  };

  const formatPrice = (price) => {
    if (!price || isNaN(price)) return '$0.00';
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(parseFloat(price));
  };

  if (loading && !isEdit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="text-lg text-gray-600">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/brief')}
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isEdit ? 'Editar Brief' : 'Nuevo Brief'}
              </h1>
              <p className="text-gray-600 mt-1">
                {isEdit ? 'Modifica la información del brief' : 'Completa la información para crear un nuevo brief'}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(handleSaveDraft)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Información General */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Información General
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Título del Brief *
                    </label>
                    <Input
                      {...register('title')}
                      placeholder="Ingrese el título del brief"
                      className={errors.title ? 'border-red-500' : ''}
                    />
                    {errors.title && (
                      <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cliente *
                      </label>
                      <Select
                        value={watch('client')}
                        onValueChange={(value) => setValue('client', value)}
                      >
                        <SelectTrigger className={errors.client ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Seleccionar cliente" />
                        </SelectTrigger>
                        <SelectContent>
                          {clientes.map((cliente) => (
                            <SelectItem key={cliente.id} value={cliente.id.toString()}>
                              {cliente.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.client && (
                        <p className="text-sm text-red-500 mt-1">{errors.client.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Origen *
                      </label>
                      <Select
                        value={watch('origin')}
                        onValueChange={(value) => setValue('origin', value)}
                      >
                        <SelectTrigger className={errors.origin ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Seleccionar origen" />
                        </SelectTrigger>
                        <SelectContent>
                          {choices.origin?.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.origin && (
                        <p className="text-sm text-red-500 mt-1">{errors.origin.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción *
                    </label>
                    <Textarea
                      {...register('description')}
                      placeholder="Describe los requerimientos del brief"
                      rows={4}
                      className={errors.description ? 'border-red-500' : ''}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prioridad *
                      </label>
                      <Select
                        value={watch('priority')}
                        onValueChange={(value) => setValue('priority', value)}
                      >
                        <SelectTrigger className={errors.priority ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Seleccionar prioridad" />
                        </SelectTrigger>
                        <SelectContent>
                          {choices.priority?.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.priority && (
                        <p className="text-sm text-red-500 mt-1">{errors.priority.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tiempo de Entrega (días) *
                      </label>
                      <Input
                        type="number"
                        {...register('tiempo_entrega')}
                        placeholder="30"
                        className={errors.tiempo_entrega ? 'border-red-500' : ''}
                      />
                      {errors.tiempo_entrega && (
                        <p className="text-sm text-red-500 mt-1">{errors.tiempo_entrega.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Presupuesto
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        {...register('presupuesto')}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Forma de Pago *
                      </label>
                      <Select
                        value={watch('forma_pago')}
                        onValueChange={(value) => setValue('forma_pago', value)}
                      >
                        <SelectTrigger className={errors.forma_pago ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Seleccionar forma de pago" />
                        </SelectTrigger>
                        <SelectContent>
                          {choices.forma_pago?.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.forma_pago && (
                        <p className="text-sm text-red-500 mt-1">{errors.forma_pago.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Destino *
                      </label>
                      <Select
                        value={watch('destino')}
                        onValueChange={(value) => setValue('destino', value)}
                      >
                        <SelectTrigger className={errors.destino ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Seleccionar destino" />
                        </SelectTrigger>
                        <SelectContent>
                          {choices.destino?.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.destino && (
                        <p className="text-sm text-red-500 mt-1">{errors.destino.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Operador Asignado *
                      </label>
                      <Select
                        value={watch('operador')}
                        onValueChange={(value) => setValue('operador', value)}
                      >
                        <SelectTrigger className={errors.operador ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Seleccionar operador" />
                        </SelectTrigger>
                        <SelectContent>
                          {usuarios.map((usuario) => (
                            <SelectItem key={usuario.id} value={usuario.id.toString()}>
                              {usuario.first_name} {usuario.last_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.operador && (
                        <p className="text-sm text-red-500 mt-1">{errors.operador.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha Límite
                      </label>
                      <Input
                        type="date"
                        {...register('due_date')}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Observaciones Internas
                    </label>
                    <Textarea
                      {...register('observaciones_internas')}
                      placeholder="Observaciones internas (opcional)"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Items */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-blue-600" />
                      Items del Brief
                    </CardTitle>
                    <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
                      <DialogTrigger asChild>
                        <Button
                          type="button"
                          onClick={() => {
                            setCurrentItemIndex(null);
                            setIsProductModalOpen(true);
                          }}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Agregar Item
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>Seleccionar Producto</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              placeholder="Buscar productos..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                          <div className="max-h-96 overflow-y-auto space-y-2">
                            {productos.map((producto) => (
                              <div
                                key={producto.id}
                                className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                                onClick={() => selectProduct(producto)}
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <h4 className="font-medium">{producto.nombre}</h4>
                                    <p className="text-sm text-gray-600">{producto.codigo}</p>
                                    {producto.descripcion && (
                                      <p className="text-sm text-gray-500 mt-1">{producto.descripcion}</p>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold">
                                      {formatPrice(producto.precio_venta_privado)}
                                    </p>
                                    <Badge variant="outline" className="text-xs">
                                      Stock: {producto.stock_actual || 0}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {fields.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No hay items agregados</p>
                      <p className="text-sm">Haz clic en "Agregar Item" para comenzar</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {fields.map((field, index) => (
                        <div key={field.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-medium">Item #{index + 1}</h4>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => remove(index)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="lg:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Producto *
                              </label>
                              <div className="flex gap-2">
                                <Input
                                  {...register(`items.${index}.product`)}
                                  placeholder="Nombre del producto"
                                  className="flex-1"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setCurrentItemIndex(index);
                                    setIsProductModalOpen(true);
                                  }}
                                >
                                  <Search className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Cantidad *
                              </label>
                              <Input
                                type="number"
                                step="0.01"
                                {...register(`items.${index}.quantity`)}
                                placeholder="1"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Unidad
                              </label>
                              <Select
                                value={watch(`items.${index}.unit`)}
                                onValueChange={(value) => setValue(`items.${index}.unit`, value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Unidad" />
                                </SelectTrigger>
                                <SelectContent>
                                  {unidades.map((unidad) => (
                                    <SelectItem key={unidad.id} value={unidad.id.toString()}>
                                      {unidad.nombre}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Especificaciones
                              </label>
                              <Textarea
                                {...register(`items.${index}.specifications`)}
                                placeholder="Especificaciones del producto"
                                rows={2}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Precio Estimado
                              </label>
                              <Input
                                type="number"
                                step="0.01"
                                {...register(`items.${index}.precio_estimado`)}
                                placeholder="0.00"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {errors.items && (
                    <p className="text-sm text-red-500 mt-2">{errors.items.message}</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    Acciones
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Guardar como Borrador
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSubmit(handleSaveActive)}
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Guardar y Activar
                  </Button>
                </CardContent>
              </Card>

              {/* Resumen */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Resumen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Total de Items:</span>
                    <Badge>{fields.length}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Estado:</span>
                    <Badge variant="outline">
                      {watch('estado') === 'draft' ? 'Borrador' : 'Activo'}
                    </Badge>
                  </div>
                  {watch('presupuesto') && (
                    <div className="flex justify-between text-sm">
                      <span>Presupuesto:</span>
                      <span className="font-medium">
                        {formatPrice(watch('presupuesto'))}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NuevoBriefPage;