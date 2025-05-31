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
  Loader2,
  CheckCircle,
  AlertCircle,
  Info,
  Clock,
  DollarSign,
  TruckIcon,
  ShoppingCart,
  Building2,
  Phone,
  CreditCard,
  Target,
  Briefcase,
  Hash,
  PlusCircle,
  MinusCircle
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
import clienteService from '@/modulos/directorio/api/clienteService';
import api from '@/config/axios';

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
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [choicesLoading, setChoicesLoading] = useState(true);
  const [choices, setChoices] = useState({
    origin: [],
    priority: [],
    forma_pago: [],
    destino: [],
    status: []
  });
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

  // Debug: Monitor choices updates
  useEffect(() => {
    console.log('CHOICES UPDATED IN STATE:', choices);
    console.log('Origin options count:', choices.origin?.length || 0);
    console.log('Priority options count:', choices.priority?.length || 0);
    console.log('Forma pago options count:', choices.forma_pago?.length || 0);
  }, [choices]);

  // Buscar productos
  useEffect(() => {
    if (debouncedSearchTerm) {
      searchProducts();
    }
  }, [debouncedSearchTerm]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      console.log('Iniciando carga de datos...');
      
      // Cargar cada recurso por separado para mejor debugging
      try {
        setChoicesLoading(true);
        const choicesRes = await briefService.getBriefChoices();
        console.log('Choices cargados:', choicesRes);
        console.log('Estructura de choices:');
        console.log('- origin:', choicesRes.origin ? `${choicesRes.origin.length} opciones` : 'NO EXISTE');
        console.log('- priority:', choicesRes.priority ? `${choicesRes.priority.length} opciones` : 'NO EXISTE');
        console.log('- forma_pago:', choicesRes.forma_pago ? `${choicesRes.forma_pago.length} opciones` : 'NO EXISTE');
        console.log('- destino:', choicesRes.destino ? `${choicesRes.destino.length} opciones` : 'NO EXISTE');
        console.log('- status:', choicesRes.status ? `${choicesRes.status.length} opciones` : 'NO EXISTE');
        setChoices(choicesRes || {});
        setChoicesLoading(false);
        console.log('Choices guardados en estado');
        // Add a small delay to ensure state update
        setTimeout(() => {
          console.log('Choices after state update:', choices);
        }, 100);
      } catch (error) {
        console.error('Error cargando choices:', error);
        console.error('Detalle completo del error:', error.response || error);
        setChoicesLoading(false);
      }
      
      try {
        setLoadingClientes(true);
        // Intentar con llamada directa para debug
        console.log('Intentando cargar clientes...');
        const clientesRes = await api.get('/directorio/clientes/', {
          params: { page_size: 100, activo: true }
        });
        console.log('Respuesta directa de clientes:', clientesRes);
        console.log('Data de clientes:', clientesRes.data);
        
        // Manejar diferentes formatos de respuesta
        let clientesArray = [];
        if (clientesRes.data) {
          if (Array.isArray(clientesRes.data)) {
            clientesArray = clientesRes.data;
          } else if (clientesRes.data.results) {
            clientesArray = clientesRes.data.results;
          }
        }
        
        console.log('Clientes procesados:', clientesArray);
        setClientes(clientesArray);
      } catch (error) {
        console.error('Error cargando clientes:', error);
        console.error('Detalle del error:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          config: error.config
        });
        
        // Intentar mostrar más información
        if (error.response?.status === 401) {
          toast({
            title: 'Error de autenticación',
            description: 'No tienes permisos para acceder a los clientes',
            variant: 'destructive'
          });
        }
      } finally {
        setLoadingClientes(false);
      }
      
      try {
        const usuariosRes = await api.get('/users/users/');
        console.log('Usuarios cargados:', usuariosRes.data);
        setUsuarios(usuariosRes.data.results || usuariosRes.data || []);
      } catch (error) {
        console.error('Error cargando usuarios:', error);
      }
      
      try {
        const unidadesRes = await api.get('/basic/unidades/');
        console.log('Unidades cargadas:', unidadesRes.data);
        setUnidades(unidadesRes.data.results || unidadesRes.data || []);
      } catch (error) {
        console.error('Error cargando unidades:', error);
      }

    } catch (error) {
      console.error('Error loading initial data:', error);
      console.error('Error detallado:', error.response || error);
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Error al cargar los datos iniciales',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadBriefData = async () => {
    try {
      const brief = await briefService.getBriefById(briefId);
      // Cargar los items del brief
      const items = await briefService.getBriefItems(briefId);
      
      reset({
        ...brief,
        client: brief.client?.toString() || brief.client.toString(),
        operador: brief.operador?.toString() || brief.operador.toString(),
        due_date: brief.due_date ? brief.due_date.split('T')[0] : '',
        items: items.map(item => ({
          product: item.product,
          product_reference: item.product_reference || '',
          quantity: item.quantity,
          unit: item.unit.toString(),
          specifications: item.specifications || '',
          notes: item.notes || '',
          precio_estimado: item.precio_estimado || 0
        }))
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
      const response = await api.get('/productos/productos-disponibles/', {
        params: { search: debouncedSearchTerm }
      });
      setProductos(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error searching products:', error);
    }
  };

  const onSubmit = async (data, status = 'draft') => {
    try {
      setLoading(true);
      
      // Preparar los items para enviar al backend
      const items = data.items.map((item, index) => ({
        product: item.product,
        product_reference: item.product_reference || null,
        quantity: parseFloat(item.quantity),
        unit: parseInt(item.unit),
        specifications: item.specifications || '',
        notes: item.notes || '',
        precio_estimado: item.precio_estimado ? parseFloat(item.precio_estimado) : null,
        orden: index + 1
      }));

      const briefData = {
        ...data,
        client: parseInt(data.client),
        operador: parseInt(data.operador),
        tiempo_entrega: parseInt(data.tiempo_entrega),
        presupuesto: data.presupuesto ? parseFloat(data.presupuesto) : null,
        estado: status
      };

      let result;
      if (isEdit) {
        // En edición, primero actualizar el brief
        result = await briefService.updateBrief(briefId, briefData);
        // Luego actualizar los items
        if (items.length > 0) {
          // Obtener items actuales
          const currentItems = await briefService.getBriefItems(briefId);
          // Eliminar items actuales
          for (const item of currentItems) {
            await briefService.deleteBriefItem(item.id);
          }
          // Agregar nuevos items
          for (const item of items) {
            await briefService.addBriefItem({ ...item, brief: briefId });
          }
        }
      } else {
        // En creación, primero crear el brief
        result = await briefService.createBrief(briefData);
        // Luego agregar los items
        if (items.length > 0) {
          for (const item of items) {
            await briefService.addBriefItem({ ...item, brief: result.id });
          }
        }
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-indigo-50/10">
      {/* Animated background pattern */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto p-6">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/brief')}
                className="group hover:bg-white/80 backdrop-blur-sm transition-all duration-300"
              >
                <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Volver
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    {isEdit ? 'Editar Brief' : 'Nuevo Brief'}
                  </h1>
                  <p className="text-gray-600 text-sm mt-1">
                    {isEdit ? `Editando brief #${briefId}` : 'Complete los datos para crear un nuevo requerimiento'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Progress indicator */}
            <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${watch('title') ? 'bg-green-500' : 'bg-gray-300'} transition-colors`}></div>
                <div className={`w-2 h-2 rounded-full ${watch('client') ? 'bg-green-500' : 'bg-gray-300'} transition-colors`}></div>
                <div className={`w-2 h-2 rounded-full ${fields.length > 0 ? 'bg-green-500' : 'bg-gray-300'} transition-colors`}></div>
              </div>
              <span className="text-xs text-gray-600 font-medium">Completado</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(handleSaveDraft)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Información General */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="text-lg font-semibold text-gray-800">Información General</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Briefcase className="h-4 w-4 text-gray-400" />
                      Título del Brief
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        {...register('title')}
                        placeholder="Ej: Suministros médicos para hospital central"
                        className={`pr-10 transition-all duration-200 ${errors.title ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                      />
                      {watch('title') && !errors.title && (
                        <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                      )}
                    </div>
                    {errors.title && (
                      <p className="flex items-center gap-1 text-sm text-red-600">
                        <AlertCircle className="h-3 w-3" />
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        Cliente
                        <span className="text-red-500">*</span>
                      </label>
                      <Select
                        value={watch('client')}
                        onValueChange={(value) => setValue('client', value)}
                      >
                        <SelectTrigger className={`transition-all duration-200 ${errors.client ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}>
                          <SelectValue placeholder="Seleccionar cliente" />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="p-2">
                            <Input 
                              placeholder="Buscar cliente..." 
                              className="mb-2"
                              onChange={(e) => {
                                // Add search functionality here
                              }}
                            />
                          </div>
                          {loadingClientes ? (
                            <div className="p-4 text-center text-gray-500">
                              <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                              <p>Cargando clientes...</p>
                            </div>
                          ) : clientes.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                              <AlertCircle className="h-5 w-5 mx-auto mb-2 text-orange-500" />
                              <p>No se encontraron clientes</p>
                              <p className="text-xs mt-1">Verifica tu conexión o contacta al administrador</p>
                            </div>
                          ) : (
                            clientes.map((cliente) => (
                              <SelectItem key={cliente.id} value={cliente.id.toString()}>
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                    {(cliente.nombre || 'C').charAt(0).toUpperCase()}
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium">{cliente.nombre}</p>
                                    {cliente.alias && <p className="text-xs text-gray-500">{cliente.alias}</p>}
                                  </div>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      {errors.client && (
                        <p className="flex items-center gap-1 text-sm text-red-600">
                          <AlertCircle className="h-3 w-3" />
                          {errors.client.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Phone className="h-4 w-4 text-gray-400" />
                        Origen
                        <span className="text-red-500">*</span>
                      </label>
                      <Select
                        key={`origin-${choices.origin?.length || 0}`}
                        value={watch('origin')}
                        onValueChange={(value) => setValue('origin', value)}
                      >
                        <SelectTrigger className={`transition-all duration-200 ${errors.origin ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}>
                          <SelectValue placeholder="¿Cómo nos contactó?" />
                        </SelectTrigger>
                        <SelectContent>
                          {(() => {
                            console.log('Rendering origin select. choices.origin:', choices.origin);
                            console.log('Choices loading?', choicesLoading);
                            if (choicesLoading) {
                              return <div className="p-2 text-center text-gray-500 text-sm">Cargando opciones...</div>;
                            }
                            if (!choices.origin || choices.origin.length === 0) {
                              return <div className="p-2 text-center text-gray-500 text-sm">No hay opciones disponibles</div>;
                            }
                            return choices.origin.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center gap-2">
                                {option.value === 'telefono' && <Phone className="h-4 w-4 text-blue-500" />}
                                {option.value === 'email' && <AlertCircle className="h-4 w-4 text-purple-500" />}
                                {option.value === 'whatsapp' && <AlertCircle className="h-4 w-4 text-green-500" />}
                                {option.value === 'presencial' && <User className="h-4 w-4 text-orange-500" />}
                                <span>{option.label}</span>
                              </div>
                            </SelectItem>
                            ));
                          })()}
                        </SelectContent>
                      </Select>
                      {errors.origin && (
                        <p className="flex items-center gap-1 text-sm text-red-600">
                          <AlertCircle className="h-3 w-3" />
                          {errors.origin.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <FileText className="h-4 w-4 text-gray-400" />
                      Descripción
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Textarea
                        {...register('description')}
                        placeholder="Describa detalladamente los productos o servicios requeridos..."
                        rows={4}
                        className={`resize-none transition-all duration-200 ${errors.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                      />
                      <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                        {watch('description')?.length || 0} caracteres
                      </div>
                    </div>
                    {errors.description && (
                      <p className="flex items-center gap-1 text-sm text-red-600">
                        <AlertCircle className="h-3 w-3" />
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <AlertCircle className="h-4 w-4 text-gray-400" />
                        Prioridad
                        <span className="text-red-500">*</span>
                      </label>
                      <Select
                        key={`priority-${choices.priority?.length || 0}`}
                        value={watch('priority')}
                        onValueChange={(value) => setValue('priority', value)}
                      >
                        <SelectTrigger className={`transition-all duration-200 ${errors.priority ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}>
                          <SelectValue placeholder="Seleccionar prioridad" />
                        </SelectTrigger>
                        <SelectContent>
                          {(() => {
                            console.log('Rendering priority select. choices.priority:', choices.priority);
                            if (!choices.priority || choices.priority.length === 0) {
                              return <div className="p-2 text-center text-gray-500 text-sm">No hay opciones disponibles</div>;
                            }
                            return choices.priority.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${
                                  option.value === 'baja' ? 'bg-green-500' :
                                  option.value === 'media' ? 'bg-yellow-500' :
                                  option.value === 'alta' ? 'bg-orange-500' :
                                  option.value === 'urgente' ? 'bg-red-500' :
                                  option.value === 'critica' ? 'bg-purple-500' : 'bg-gray-500'
                                }`}></div>
                                <span className="capitalize">{option.label}</span>
                              </div>
                            </SelectItem>
                            ));
                          })()}
                        </SelectContent>
                      </Select>
                      {errors.priority && (
                        <p className="flex items-center gap-1 text-sm text-red-600">
                          <AlertCircle className="h-3 w-3" />
                          {errors.priority.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Clock className="h-4 w-4 text-gray-400" />
                        Tiempo de Entrega
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Input
                          type="number"
                          {...register('tiempo_entrega')}
                          placeholder="30"
                          className={`pl-10 transition-all duration-200 ${errors.tiempo_entrega ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                        />
                        <span className="absolute left-3 top-3 text-gray-400 text-sm">Días</span>
                      </div>
                      {errors.tiempo_entrega && (
                        <p className="flex items-center gap-1 text-sm text-red-600">
                          <AlertCircle className="h-3 w-3" />
                          {errors.tiempo_entrega.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        Presupuesto
                        <span className="text-gray-400 text-xs">(opcional)</span>
                      </label>
                      <div className="relative">
                        <Input
                          type="number"
                          step="0.01"
                          {...register('presupuesto')}
                          placeholder="0.00"
                          className="pl-8 transition-all duration-200 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <CreditCard className="h-4 w-4 text-gray-400" />
                        Forma de Pago
                        <span className="text-red-500">*</span>
                      </label>
                      <Select
                        key={`forma_pago-${choices.forma_pago?.length || 0}`}
                        value={watch('forma_pago')}
                        onValueChange={(value) => setValue('forma_pago', value)}
                      >
                        <SelectTrigger className={`transition-all duration-200 ${errors.forma_pago ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}>
                          <SelectValue placeholder="Seleccionar forma de pago" />
                        </SelectTrigger>
                        <SelectContent>
                          {(() => {
                            console.log('Rendering forma_pago select. choices.forma_pago:', choices.forma_pago);
                            if (!choices.forma_pago || choices.forma_pago.length === 0) {
                              return <div className="p-2 text-center text-gray-500 text-sm">No hay opciones disponibles</div>;
                            }
                            return choices.forma_pago.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center gap-2">
                                {option.value === 'contado' && <DollarSign className="h-4 w-4 text-green-500" />}
                                {option.value.includes('credito') && <Clock className="h-4 w-4 text-blue-500" />}
                                {option.value === 'transferencia' && <TruckIcon className="h-4 w-4 text-purple-500" />}
                                {option.value === 'cheque' && <FileText className="h-4 w-4 text-gray-500" />}
                                <span>{option.label}</span>
                              </div>
                            </SelectItem>
                            ));
                          })()}
                        </SelectContent>
                      </Select>
                      {errors.forma_pago && (
                        <p className="flex items-center gap-1 text-sm text-red-600">
                          <AlertCircle className="h-3 w-3" />
                          {errors.forma_pago.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Target className="h-4 w-4 text-gray-400" />
                        Destino
                        <span className="text-red-500">*</span>
                      </label>
                      <Select
                        key={`destino-${choices.destino?.length || 0}`}
                        value={watch('destino')}
                        onValueChange={(value) => setValue('destino', value)}
                      >
                        <SelectTrigger className={`transition-all duration-200 ${errors.destino ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}>
                          <SelectValue placeholder="Seleccionar destino" />
                        </SelectTrigger>
                        <SelectContent>
                          {(() => {
                            console.log('Rendering destino select. choices.destino:', choices.destino);
                            if (!choices.destino || choices.destino.length === 0) {
                              return <div className="p-2 text-center text-gray-500 text-sm">No hay opciones disponibles</div>;
                            }
                            return choices.destino.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                              <span className="capitalize">{option.label}</span>
                            </SelectItem>
                            ));
                          })()}
                        </SelectContent>
                      </Select>
                      {errors.destino && (
                        <p className="flex items-center gap-1 text-sm text-red-600">
                          <AlertCircle className="h-3 w-3" />
                          {errors.destino.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <User className="h-4 w-4 text-gray-400" />
                        Operador Asignado
                        <span className="text-red-500">*</span>
                      </label>
                      <Select
                        value={watch('operador')}
                        onValueChange={(value) => setValue('operador', value)}
                      >
                        <SelectTrigger className={`transition-all duration-200 ${errors.operador ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}>
                          <SelectValue placeholder="Seleccionar operador" />
                        </SelectTrigger>
                        <SelectContent>
                          {usuarios.map((usuario) => (
                            <SelectItem key={usuario.id} value={usuario.id.toString()}>
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                  {usuario.first_name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{usuario.first_name} {usuario.last_name}</p>
                                  <p className="text-xs text-gray-500">@{usuario.username}</p>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.operador && (
                        <p className="flex items-center gap-1 text-sm text-red-600">
                          <AlertCircle className="h-3 w-3" />
                          {errors.operador.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        Fecha Límite
                        <span className="text-gray-400 text-xs">(opcional)</span>
                      </label>
                      <div className="relative">
                        <Input
                          type="date"
                          {...register('due_date')}
                          className="pl-10 transition-all duration-200 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Info className="h-4 w-4 text-gray-400" />
                      Observaciones Internas
                      <span className="text-gray-400 text-xs">(no visible para el cliente)</span>
                    </label>
                    <Textarea
                      {...register('observaciones_internas')}
                      placeholder="Notas internas sobre este brief..."
                      rows={3}
                      className="resize-none transition-all duration-200 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Items Section with Enhanced Design */}
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                          <ShoppingCart className="h-5 w-5 text-indigo-600" />
                        </div>
                        <span className="text-lg font-semibold text-gray-800">Items del Brief</span>
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">Agregue los productos requeridos</p>
                    </div>
                    <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
                      <DialogTrigger asChild>
                        <Button
                          type="button"
                          onClick={() => {
                            setCurrentItemIndex(null);
                            setIsProductModalOpen(true);
                          }}
                          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Agregar Item
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh]">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-indigo-600" />
                            Buscar Producto
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              placeholder="Buscar por nombre, código o descripción..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-10 pr-4 h-12 text-lg"
                              autoFocus
                            />
                          </div>
                          
                          {productos.length === 0 ? (
                            <div className="text-center py-12">
                              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                <Search className="h-8 w-8 text-gray-400" />
                              </div>
                              <p className="text-gray-600 font-medium mb-2">
                                {searchTerm ? 'No se encontraron productos' : 'Comience a buscar'}
                              </p>
                              <p className="text-sm text-gray-500">
                                {searchTerm ? 'Intente con otros términos de búsqueda' : 'Escriba para buscar productos disponibles'}
                              </p>
                            </div>
                          ) : (
                            <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-2">
                              {productos.map((producto) => (
                                <div
                                  key={producto.id}
                                  className="group p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 cursor-pointer transition-all duration-200"
                                  onClick={() => selectProduct(producto)}
                                >
                                  <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                                      <Package className="h-8 w-8 text-indigo-600" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-start justify-between">
                                        <div>
                                          <h4 className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">
                                            {producto.nombre}
                                          </h4>
                                          <p className="text-sm text-gray-600">
                                            Código: <span className="font-mono font-medium">{producto.codigo}</span>
                                          </p>
                                          {producto.descripcion && (
                                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                              {producto.descripcion}
                                            </p>
                                          )}
                                        </div>
                                        <div className="text-right ml-4">
                                          <p className="text-lg font-bold text-indigo-600">
                                            {formatPrice(producto.precio_venta_privado)}
                                          </p>
                                          <Badge 
                                            variant="outline" 
                                            className={`text-xs ${
                                              producto.stock_actual > 10 ? 'border-green-300 text-green-700' :
                                              producto.stock_actual > 0 ? 'border-yellow-300 text-yellow-700' :
                                              'border-red-300 text-red-700'
                                            }`}
                                          >
                                            Stock: {producto.stock_actual || 0}
                                          </Badge>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {fields.length === 0 ? (
                    <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full mb-4">
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-gray-600 font-medium mb-2">No hay items agregados</p>
                      <p className="text-sm text-gray-500 mb-4">Comience agregando los productos requeridos</p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsProductModalOpen(true)}
                        className="border-indigo-300 text-indigo-600 hover:bg-indigo-50"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar primer item
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {fields.map((field, index) => (
                        <div key={field.id} className="group relative bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-500 rounded-l-xl"></div>
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-full text-indigo-600 font-bold text-sm">
                                {index + 1}
                              </div>
                              <h4 className="font-semibold text-gray-800">Item #{index + 1}</h4>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => remove(index)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="lg:col-span-2">
                              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <Package className="h-4 w-4 text-gray-400" />
                                Producto
                                <span className="text-red-500">*</span>
                              </label>
                              <div className="flex gap-2">
                                <Input
                                  {...register(`items.${index}.product`)}
                                  placeholder="Nombre del producto"
                                  className="flex-1 transition-all duration-200 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setCurrentItemIndex(index);
                                    setIsProductModalOpen(true);
                                  }}
                                  className="border-indigo-300 text-indigo-600 hover:bg-indigo-50"
                                >
                                  <Search className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <div>
                              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <Hash className="h-4 w-4 text-gray-400" />
                                Cantidad
                                <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <Input
                                  type="number"
                                  step="0.01"
                                  {...register(`items.${index}.quantity`)}
                                  placeholder="1"
                                  className="transition-all duration-200 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                />
                                <div className="absolute right-2 top-1 flex gap-1">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 hover:bg-indigo-50"
                                    onClick={() => {
                                      const currentValue = parseFloat(watch(`items.${index}.quantity`) || 0);
                                      setValue(`items.${index}.quantity`, currentValue + 1);
                                    }}
                                  >
                                    <PlusCircle className="h-4 w-4 text-indigo-600" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 hover:bg-indigo-50"
                                    onClick={() => {
                                      const currentValue = parseFloat(watch(`items.${index}.quantity`) || 0);
                                      if (currentValue > 0) {
                                        setValue(`items.${index}.quantity`, currentValue - 1);
                                      }
                                    }}
                                  >
                                    <MinusCircle className="h-4 w-4 text-indigo-600" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Unidad
                              </label>
                              <Select
                                value={watch(`items.${index}.unit`)}
                                onValueChange={(value) => setValue(`items.${index}.unit`, value)}
                              >
                                <SelectTrigger className="transition-all duration-200 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
                                  <SelectValue placeholder="Unidad" />
                                </SelectTrigger>
                                <SelectContent>
                                  {unidades.map((unidad) => (
                                    <SelectItem key={unidad.id} value={unidad.id.toString()}>
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium">{unidad.codigo}</span>
                                        <span className="text-sm text-gray-500">{unidad.nombre}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <FileText className="h-4 w-4 text-gray-400" />
                                Especificaciones
                              </label>
                              <Textarea
                                {...register(`items.${index}.specifications`)}
                                placeholder="Detalles técnicos, medidas, colores, etc."
                                rows={2}
                                className="resize-none transition-all duration-200 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                              />
                            </div>
                            <div>
                              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <DollarSign className="h-4 w-4 text-gray-400" />
                                Precio Estimado
                              </label>
                              <div className="relative">
                                <Input
                                  type="number"
                                  step="0.01"
                                  {...register(`items.${index}.precio_estimado`)}
                                  placeholder="0.00"
                                  className="pl-8 transition-all duration-200 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                />
                                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                {watch(`items.${index}.precio_estimado`) && watch(`items.${index}.quantity`) && (
                                  <div className="absolute right-3 top-3 text-xs text-gray-500">
                                    Total: {formatPrice(parseFloat(watch(`items.${index}.precio_estimado`)) * parseFloat(watch(`items.${index}.quantity`)))}
                                  </div>
                                )}
                              </div>
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

            {/* Enhanced Sidebar */}
            <div className="space-y-6">
              {/* Actions Card */}
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm sticky top-6">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Save className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="text-lg font-semibold text-gray-800">Acciones</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 p-6">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                    )}
                    Guardar como Borrador
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSubmit(handleSaveActive)}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                    )}
                    Guardar y Activar
                  </Button>
                  
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500 text-center">
                      {isEdit ? 'Los cambios se guardarán inmediatamente' : 'Podrás editar el brief después de crearlo'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Summary Card */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
                <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100 border-b border-purple-200">
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 bg-purple-200 rounded-lg">
                      <Info className="h-5 w-5 text-purple-700" />
                    </div>
                    <span className="text-lg font-semibold text-gray-800">Resumen</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-indigo-600" />
                      <span className="text-sm font-medium text-gray-700">Total de Items:</span>
                    </div>
                    <Badge className="bg-indigo-100 text-indigo-700 px-3 py-1">
                      {fields.length} {fields.length === 1 ? 'item' : 'items'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-gray-700">Estado:</span>
                    </div>
                    <Badge className={`px-3 py-1 ${watch('estado') === 'draft' ? 'bg-gray-100 text-gray-700' : 'bg-green-100 text-green-700'}`}>
                      {watch('estado') === 'draft' ? 'Borrador' : 'Activo'}
                    </Badge>
                  </div>
                  
                  {watch('presupuesto') && (
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-gray-700">Presupuesto:</span>
                      </div>
                      <span className="font-bold text-green-700">
                        {formatPrice(watch('presupuesto'))}
                      </span>
                    </div>
                  )}
                  
                  <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div className="text-xs text-blue-700">
                        <p className="font-medium mb-1">Recordatorio:</p>
                        <ul className="space-y-1">
                          <li>• Verifique todos los datos antes de activar</li>
                          <li>• Los items pueden modificarse después</li>
                          <li>• El cliente recibirá notificación al activar</li>
                        </ul>
                      </div>
                    </div>
                  </div>
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