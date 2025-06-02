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
  PlusSquare,
  MinusCircle,
  Edit2,
  Filter,
  ArrowUpDown,
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
import { testGetChoices } from '../api/testBriefService';
import clienteService from '@/modulos/directorio/api/clienteService';
import api from '@/config/axios';
import ClienteSection from '../components/form/ClienteSection';
import InformacionGeneralSection from '../components/form/InformacionGeneralSection';

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
  
  // Opciones temporales hardcodeadas mientras se resuelve el problema de la API
  const fallbackChoices = {
    origin: [
      { value: 'telefono', label: 'Telefónico' },
      { value: 'email', label: 'Correo Electrónico' },
      { value: 'presencial', label: 'Visita Presencial' },
      { value: 'whatsapp', label: 'WhatsApp' },
      { value: 'web', label: 'Sitio Web' },
      { value: 'referido', label: 'Referido' },
      { value: 'redes', label: 'Redes Sociales' }
    ],
    priority: [
      { value: 'baja', label: 'Baja' },
      { value: 'media', label: 'Media' },
      { value: 'alta', label: 'Alta' },
      { value: 'urgente', label: 'Urgente' },
      { value: 'critica', label: 'Crítica' }
    ],
    forma_pago: [
      { value: 'contado', label: 'Contado' },
      { value: 'credito_15', label: 'Crédito 15 días' },
      { value: 'credito_30', label: 'Crédito 30 días' },
      { value: 'credito_45', label: 'Crédito 45 días' },
      { value: 'credito_60', label: 'Crédito 60 días' },
      { value: 'credito_90', label: 'Crédito 90 días' },
      { value: 'transferencia', label: 'Transferencia' },
      { value: 'cheque', label: 'Cheque' }
    ],
    destino: [
      { value: 'cot_cliente', label: 'Cotización a Cliente' },
      { value: 'sol_proveedor', label: 'Solicitud a Proveedor' },
      { value: 'orden_compra', label: 'Orden de Compra' },
      { value: 'proforma', label: 'Proforma' },
      { value: 'analisis', label: 'Análisis de Precios' }
    ],
    status: [
      { value: 'draft', label: 'Borrador' },
      { value: 'pending', label: 'Pendiente' },
      { value: 'approved', label: 'Aprobado' },
      { value: 'processing', label: 'En Proceso' },
      { value: 'completed', label: 'Completado' },
      { value: 'cancelled', label: 'Cancelado' }
    ]
  };
  
  // Inicializar con las opciones hardcodeadas para que estén disponibles inmediatamente
  const [choices, setChoices] = useState(fallbackChoices);
  const [clientes, setClientes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [productos, setProductos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [currentItemIndex, setCurrentItemIndex] = useState(null);
  const [choicesLoaded, setChoicesLoaded] = useState(false);
  

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

  // Agregar item inicial al cargar la página (solo si no está en modo edición)
  useEffect(() => {
    if (!isEdit && fields.length === 0 && unidades.length > 0) {
      addItem();
    }
  }, [isEdit, fields.length, unidades]);

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
      console.log('=== INICIANDO CARGA DE DATOS ===');
      
      // Si ya se cargaron las opciones, no volver a cargarlas
      if (choicesLoaded) {
        console.log('Choices ya cargados, saltando...');
      } else {
        // Cargar choices desde la API
        try {
          setChoicesLoading(true);
          console.log('📡 Llamando a getBriefChoices()...');
          console.log('Service URL base:', '/api/brief');
          console.log('Endpoint completo:', '/api/brief/briefs/choices/');
          
          // Primero hacer una prueba directa
          console.log('🧪 Ejecutando test directo...');
          try {
            const testResult = await testGetChoices();
            console.log('🧪 Test directo exitoso:', testResult);
          } catch (testError) {
            console.error('🧪 Test directo falló:', testError);
          }
          
          const choicesRes = await briefService.getBriefChoices();
          
          console.log('✅ Respuesta recibida:', choicesRes);
          console.log('Tipo de respuesta:', typeof choicesRes);
          console.log('Es objeto?', choicesRes && typeof choicesRes === 'object');
          console.log('Claves del objeto:', choicesRes ? Object.keys(choicesRes) : 'null');
          
          if (choicesRes && typeof choicesRes === 'object') {
            // Verificar cada campo individualmente
            console.log('📊 Analizando campos de choices:');
            ['origin', 'priority', 'forma_pago', 'destino', 'status'].forEach(field => {
              const value = choicesRes[field];
              console.log(`- ${field}:`, {
                exists: field in choicesRes,
                value: value,
                isArray: Array.isArray(value),
                length: Array.isArray(value) ? value.length : 'N/A',
                firstItem: Array.isArray(value) && value.length > 0 ? value[0] : 'empty'
              });
            });
            
            // Usar las opciones de la API si están disponibles
            const newChoicesData = {
              origin: Array.isArray(choicesRes.origin) && choicesRes.origin.length > 0 
                ? choicesRes.origin 
                : fallbackChoices.origin,
              priority: Array.isArray(choicesRes.priority) && choicesRes.priority.length > 0 
                ? choicesRes.priority 
                : fallbackChoices.priority,
              forma_pago: Array.isArray(choicesRes.forma_pago) && choicesRes.forma_pago.length > 0 
                ? choicesRes.forma_pago 
                : fallbackChoices.forma_pago,
              destino: Array.isArray(choicesRes.destino) && choicesRes.destino.length > 0 
                ? choicesRes.destino 
                : fallbackChoices.destino,
              status: Array.isArray(choicesRes.status) && choicesRes.status.length > 0 
                ? choicesRes.status 
                : fallbackChoices.status,
            };
            
            console.log('💾 Guardando choices en estado:', newChoicesData);
            setChoices(newChoicesData);
            setChoicesLoaded(true);
            
            // Mostrar si se usó algún fallback
            const usedFallback = Object.keys(newChoicesData).some(
              key => newChoicesData[key] === fallbackChoices[key]
            );
            if (usedFallback) {
              console.warn('⚠️ Se usaron algunas opciones hardcodeadas como fallback');
            } else {
              console.log('✅ Todas las opciones cargadas desde la API exitosamente');
            }
          } else {
            throw new Error('Respuesta de choices inválida o vacía');
          }
          
          setChoicesLoading(false);
        } catch (error) {
          console.error('❌ ERROR CRÍTICO cargando choices:', error);
          console.error('Detalles del error:', {
            name: error.name,
            message: error.message,
            stack: error.stack,
            response: error.response,
            request: error.request,
            config: error.config
          });
          
          // Usar las opciones hardcodeadas como fallback
          console.log('🔄 Usando opciones hardcodeadas como fallback');
          setChoices(fallbackChoices);
          setChoicesLoading(false);
          setChoicesLoaded(true);
          
          // No mostrar toast de error para no molestar al usuario
          // ya que tenemos fallback
        }
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
      product_reference: producto?.codigo || '',
      quantity: 1,
      unit: unidades[0]?.id || '',
      specifications: '',
      notes: ''
    };
    append(newItem);
    setIsProductModalOpen(false);
  };

  const selectProduct = (producto) => {
    if (currentItemIndex !== null) {
      update(currentItemIndex, {
        product: producto.nombre,
        product_reference: producto.codigo,
        quantity: 1,
        unit: unidades[0]?.id || '',
        specifications: '',
        notes: ''
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
          {/* Cliente y Información General lado a lado */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Cliente Section */}
            <ClienteSection 
              cliente={watch('client')}
              clientes={clientes}
              onClienteChange={(value) => setValue('client', value)}
              hasError={!!errors.client}
              watch={watch}
              setValue={setValue}
            />

            {/* Información General */}
            <InformacionGeneralSection
              watch={watch}
              setValue={setValue}
              register={register}
              errors={errors}
              choices={choices}
              usuarios={usuarios}
            />
          </div>

          {/* Items Section with Enhanced Design */}
          <Card className="border shadow-sm bg-white">
                <CardHeader className="bg-blue-50/50 border-b px-6 py-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <span>Productos y Servicios</span>
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Input
                          placeholder="Buscar en la tabla..."
                          className="w-64 pr-10 text-sm"
                          disabled
                        />
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                      <Button variant="outline" size="sm" disabled>
                        <Filter className="h-4 w-4 mr-2" />
                        Filtrar
                      </Button>
                      <Button variant="outline" size="sm" disabled>
                        <ArrowUpDown className="h-4 w-4 mr-2" />
                        Ordenar
                      </Button>
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
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Descripción
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Unidad
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Cantidad
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {fields.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="text-center py-8 text-gray-500">
                              <div className="flex flex-col items-center gap-3">
                                <div className="text-sm">Complete la información del primer producto</div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  onClick={() => addItem()}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Agregar primer ítem
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          fields.map((field, index) => (
                            <tr key={field.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <div className="flex gap-2">
                                  <Input
                                    {...register(`items.${index}.product`)}
                                    placeholder="Descripción del producto"
                                    className="flex-1 text-sm"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setCurrentItemIndex(index);
                                      setIsProductModalOpen(true);
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                  >
                                    <Search className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Select
                                  value={watch(`items.${index}.unit`)}
                                  onValueChange={(value) => setValue(`items.${index}.unit`, value)}
                                >
                                  <SelectTrigger className="w-32 text-sm">
                                    <SelectValue placeholder="Unidad" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {unidades.map((unidad) => (
                                      <SelectItem key={unidad.id} value={unidad.id.toString()}>
                                        {unidad.codigo}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <Input
                                  type="number"
                                  step="0.01"
                                  {...register(`items.${index}.quantity`)}
                                  placeholder="1"
                                  className="w-24 text-sm text-right"
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="p-1 text-blue-600 hover:text-blue-800"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => remove(index)}
                                    className="p-1 text-red-500 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="px-6 py-4 border-t bg-gray-50 flex justify-between items-center">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => addItem()}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <PlusSquare className="h-4 w-4 mr-2" />
                      Agregar ítem en blanco
                    </Button>
                    
                    <Button
                      type="button"
                      variant="link"
                      className="text-blue-600"
                      onClick={() => setIsProductModalOpen(true)}
                    >
                      Ver catálogo completo →
                    </Button>
                  </div>
                  
                  {errors.items && (
                    <p className="text-sm text-red-500 px-6 pb-4">{errors.items.message}</p>
                  )}
                </CardContent>
              </Card>

          {/* Sección Resumen debajo del formulario */}
          <div className="mt-6">
            {/* Enhanced Summary Card */}
            <Card>
              <CardHeader className="py-3 px-4 bg-blue-300/20">
                <CardTitle className="flex items-center text-base font-bold">
                  <Info className="mr-2 h-4 w-4 text-blue-600" />
                  Resumen
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
        </form>

        {/* Barra de acciones flotante */}
        <div className="sticky bottom-4 py-4 z-10">
          <div className="bg-white backdrop-blur-md bg-opacity-95 p-4 rounded-xl shadow-lg border border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-500 hidden md:block">
              {isEdit ? (
                <div className="flex items-center">
                  <span>Actualice los campos necesarios y guarde los cambios.</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                  <span>Complete los campos requeridos para crear un nuevo brief.</span>
                </div>
              )}
            </div>
            
            <div className="flex gap-3 w-full sm:w-auto">
              {/* Guardar como Borrador */}
              <Button
                type="submit"
                disabled={loading}
                className="rounded-lg px-6 border-gray-300 text-gray-700 hover:bg-gray-50 w-full sm:w-auto"
                variant="outline"
                onClick={handleSubmit(handleSaveDraft)}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Borrador
                  </>
                )}
              </Button>

              {/* Guardar y Activar */}
              <Button
                type="button"
                onClick={handleSubmit(handleSaveActive)}
                disabled={loading}
                className="rounded-lg px-8 bg-blue-600 hover:bg-blue-700 w-full sm:w-auto shadow-md transition-all duration-300 hover:shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Guardando...
                  </div>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    {isEdit ? 'Actualizar Brief' : 'Guardar y Activar'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NuevoBriefPage;