// /Users/clc/Ws/Appclc/pandora/src/modulos/brief/pages/BriefDetailPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  FilePenLine, 
  FileText, 
  Filter, 
  Plus, 
  Trash2, 
  FileDown, 
  Printer, 
  Eye,
  Search,
  Clock,
  User,
  MapPin,
  Info,
  Clipboard,
  ArrowUpDown,
  Copy,
  RefreshCw,
  ChevronDown,
  Edit3,
  Save,
  X,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

// Import brief service
import * as briefService from '@/modulos/brief/api/briefService';

const BriefDetailPage = () => {
  const { briefId } = useParams();
  const navigate = useNavigate();
  
  // States
  const [loading, setLoading] = useState(true);
  const [brief, setBrief] = useState(null);
  const [items, setItems] = useState([]);
  const [history, setHistory] = useState([]);
  const [statusChoices, setStatusChoices] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState(null);
  const [addingItem, setAddingItem] = useState(false);
  const [editingBriefInfo, setEditingBriefInfo] = useState(false);
  const [briefEditData, setBriefEditData] = useState({});
  
  const [newItem, setNewItem] = useState({
    codigo: '',
    producto: '',
    descripcion: '',
    unidad: 'UND',
    cantidad: 1
  });

  // Fetch data on mount
  useEffect(() => {
    if (briefId) {
      fetchBriefData();
      fetchStatusChoices();
    }
  }, [briefId]);

  // Fetch brief data
  const fetchBriefData = async () => {
    setLoading(true);
    try {
      // Fetch brief details
      const briefData = await briefService.getBriefById(briefId);
      setBrief(briefData);
      setBriefEditData({
        observaciones: briefData.observaciones || '',
        cliente_info: briefData.cliente_info || {},
        fecha_emision: briefData.fecha_emision
      });
      
      // Fetch brief items
      const itemsData = await briefService.getBriefItems(briefId);
      setItems(itemsData);
      
      // Fetch brief history
      const historyData = await briefService.getBriefHistory(briefId);
      setHistory(historyData);
      
    } catch (error) {
      console.error('Error fetching brief data:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar la información del brief",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch status choices
  const fetchStatusChoices = async () => {
    try {
      const choices = await briefService.getBriefChoices();
      setStatusChoices(choices.status || []);
    } catch (error) {
      console.error('Error fetching status choices:', error);
    }
  };

  // Handle edit brief navigation
  const handleEditBrief = () => {
    navigate(`/brief/editar/${briefId}`);
  };

  // Handle duplicate brief
  const handleDuplicateBrief = async () => {
    try {
      const duplicatedBrief = await briefService.duplicateBrief(briefId, {
        include_items: true
      });
      
      toast({
        title: "Brief duplicado",
        description: `Se ha creado el brief ${duplicatedBrief.codigo}`,
      });
      
      // Navigate to new brief
      navigate(`/brief/${duplicatedBrief.id}`);
    } catch (error) {
      console.error('Error duplicating brief:', error);
      toast({
        title: "Error",
        description: "No se pudo duplicar el brief",
        variant: "destructive"
      });
    }
  };

  // Handle change status
  const handleChangeStatus = async () => {
    if (!newStatus) {
      toast({
        title: "Error",
        description: "Selecciona un estado",
        variant: "destructive"
      });
      return;
    }

    setSavingStatus(true);
    try {
      await briefService.changeBriefStatus(briefId, newStatus, statusNotes);
      
      // Update local state
      setBrief(prev => ({ ...prev, estado: newStatus }));
      
      // Refresh history
      const historyData = await briefService.getBriefHistory(briefId);
      setHistory(historyData);
      
      toast({
        title: "Estado actualizado",
        description: "El estado del brief ha sido actualizado correctamente",
      });
      
      setShowStatusDialog(false);
      setNewStatus('');
      setStatusNotes('');
    } catch (error) {
      console.error('Error changing status:', error);
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado del brief",
        variant: "destructive"
      });
    } finally {
      setSavingStatus(false);
    }
  };

  // Handle export PDF
  const handleExportPDF = async () => {
    try {
      // Por ahora mostrar mensaje de funcionalidad no disponible
      toast({
        title: "Funcionalidad no disponible",
        description: "La exportación a PDF estará disponible próximamente",
        variant: "default"
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: "Error",
        description: "No se pudo exportar el PDF",
        variant: "destructive"
      });
    }
  };

  // Handle add item
  const handleAddItem = async () => {
    if (!newItem.producto || newItem.cantidad <= 0) {
      toast({
        title: "Error",
        description: "Completa los campos requeridos",
        variant: "destructive"
      });
      return;
    }

    setAddingItem(true);
    try {
      const itemData = {
        brief: briefId,
        product: newItem.producto,
        quantity: parseFloat(newItem.cantidad),
        unit: 1, // Por defecto, debe obtenerse de una lista de unidades
        specifications: newItem.descripcion || '',
        notes: '',
        precio_estimado: null,
        orden: items.length + 1
      };
      const addedItem = await briefService.addBriefItem(itemData);
      setItems([...items, addedItem]);
      
      // Reset form
      setNewItem({
        codigo: '',
        producto: '',
        descripcion: '',
        unidad: 'UND',
        cantidad: 1
      });
      
      toast({
        title: "Item agregado",
        description: "El item se ha agregado correctamente",
      });
    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        title: "Error",
        description: "No se pudo agregar el item",
        variant: "destructive"
      });
    } finally {
      setAddingItem(false);
    }
  };

  // Handle edit item (inline)
  const handleEditItem = (item) => {
    setEditingItem({ ...item });
  };

  // Handle save edited item
  const handleSaveEditedItem = async () => {
    if (!editingItem.producto || editingItem.cantidad <= 0) {
      toast({
        title: "Error",
        description: "Completa los campos requeridos",
        variant: "destructive"
      });
      return;
    }

    try {
      const itemData = {
        product: editingItem.producto || editingItem.product,
        quantity: parseFloat(editingItem.cantidad || editingItem.quantity),
        unit: editingItem.unit || 1,
        specifications: editingItem.descripcion || editingItem.specifications || '',
        notes: editingItem.notes || '',
        precio_estimado: editingItem.precio_estimado || null
      };
      const updatedItem = await briefService.updateBriefItem(editingItem.id, itemData);
      setItems(items.map(item => item.id === updatedItem.id ? updatedItem : item));
      setEditingItem(null);
      
      toast({
        title: "Item actualizado",
        description: "El item se ha actualizado correctamente",
      });
    } catch (error) {
      console.error('Error updating item:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el item",
        variant: "destructive"
      });
    }
  };

  // Handle delete item
  const handleDeleteItem = async (itemId) => {
    setDeletingItemId(itemId);
    try {
      await briefService.deleteBriefItem(itemId);
      setItems(items.filter(item => item.id !== itemId));
      
      toast({
        title: "Item eliminado",
        description: "El item se ha eliminado correctamente",
      });
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el item",
        variant: "destructive"
      });
    } finally {
      setDeletingItemId(null);
    }
  };

  // Handle update brief info
  const handleUpdateBriefInfo = async () => {
    try {
      const updatedBrief = await briefService.patchBrief(briefId, briefEditData);
      setBrief(updatedBrief);
      setEditingBriefInfo(false);
      
      toast({
        title: "Brief actualizado",
        description: "La información del brief se ha actualizado correctamente",
      });
    } catch (error) {
      console.error('Error updating brief:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el brief",
        variant: "destructive"
      });
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    try {
      return format(parseISO(dateString), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
    } catch {
      return dateString;
    }
  };

  // Get status badge color
  const getStatusColor = (status) => {
    const colors = {
      'draft': 'bg-gray-100 text-gray-700',
      'pending': 'bg-yellow-100 text-yellow-700',
      'approved': 'bg-green-100 text-green-700',
      'processing': 'bg-blue-100 text-blue-700',
      'completed': 'bg-blue-200 text-blue-800',
      'cancelled': 'bg-red-100 text-red-700'
    };
    return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };

  // Calculate total items
  const totalItems = items.reduce((sum, item) => sum + Number(item.quantity || item.cantidad || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="text-lg text-gray-600">Cargando brief...</span>
        </div>
      </div>
    );
  }

  if (!brief) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Brief no encontrado</h2>
          <p className="text-gray-600 mb-4">El brief que buscas no existe o fue eliminado</p>
          <Button onClick={() => navigate('/brief')}>
            Volver al listado
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <Toaster />
      
      {/* Header with action buttons */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-sm p-6 mb-8 border border-blue-100">
        <div className="flex flex-col md:flex-row md:items-start gap-4">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-5 rounded-xl shadow-md flex items-center justify-center">
            <FileText size={40} strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-800">Brief</h1>
              <Badge className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 hover:from-blue-200 hover:to-indigo-200 px-3 py-1 text-sm rounded-md shadow-sm whitespace-nowrap">
                <span className="font-mono font-bold">{brief.code}</span>
              </Badge>
              <Badge className={`${getStatusColor(brief.estado)} px-3 py-1 text-sm shadow-sm`}>
                {brief.estado}
              </Badge>
            </div>
            <p className="text-gray-600 mt-2 font-medium">{brief.title || 'Formulario de requerimientos para clientes'}</p>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                <span>{formatDate(brief.fecha_emision || brief.created_at)}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-blue-500" />
                <span>Creado {brief.created_at_humanized || 'recientemente'}</span>
              </div>
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2 text-blue-500" />
                <span>Por: {brief.created_by?.username || 'Sistema'}</span>
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={handleEditBrief}>
                    <FilePenLine className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Editar brief completo</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={handleDuplicateBrief}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicar
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Crear copia del brief</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Más acciones
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowStatusDialog(true)}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Cambiar estado
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportPDF}>
                  <FileDown className="h-4 w-4 mr-2" />
                  Exportar PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.print()}>
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="bg-white shadow-md p-5 rounded-xl text-center min-w-[140px] border border-blue-100 flex flex-col justify-center">
            <p className="text-sm text-gray-500 mb-1">Total Items</p>
            <p className="text-3xl font-bold text-blue-700">{totalItems}</p>
            <div className="mt-2 text-xs text-gray-400">
              {items.length} {items.length === 1 ? 'producto' : 'productos'}
            </div>
          </div>
        </div>
      </div>

      {/* Client info and brief details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Client Info */}
        <Card className="border-blue-100">
          <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-t-lg">
            <CardTitle className="flex items-center text-lg font-semibold text-blue-900">
              <User className="mr-2 h-5 w-5 text-blue-600" />
              Información del Cliente
            </CardTitle>
            <CardDescription>Datos del solicitante y origen</CardDescription>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="space-y-4">
              <div className="flex items-center">
                <span className="font-medium w-28 text-gray-700">Código:</span>
                <span className="bg-blue-50 px-2 py-1 rounded-md font-mono text-blue-800">
                  {brief.code}
                </span>
              </div>
              <div className="flex items-center">
                <span className="font-medium w-28 text-gray-700">Cliente:</span>
                <span className={brief.client_display ? "text-gray-800" : "text-gray-500 italic"}>
                  {brief.client_display || 'No asignado'}
                </span>
              </div>
              <div className="flex items-center">
                <span className="font-medium w-28 text-gray-700">Contacto:</span>
                <span className="text-gray-500 italic">
                  No especificado
                </span>
              </div>
              <div className="flex items-center">
                <span className="font-medium w-28 text-gray-700">Dirección:</span>
                <span className={brief.client ? "text-gray-800 flex items-center" : "text-gray-500 italic flex items-center"}>
                  <MapPin className="h-3 w-3 mr-1 text-gray-400" /> 
                  {brief.client ? 'Ver en cliente' : 'No especificada'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Brief Details */}
        <Card className="border-blue-100">
          <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-t-lg">
            <CardTitle className="flex items-center justify-between text-lg font-semibold text-blue-900">
              <div className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-blue-600" />
                Detalles del Brief
              </div>
              {!editingBriefInfo && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingBriefInfo(true)}
                  className="h-8 w-8 p-0"
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              )}
            </CardTitle>
            <CardDescription>Información y configuración</CardDescription>
          </CardHeader>
          <CardContent className="pt-5">
            {editingBriefInfo ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fecha">Fecha emisión</Label>
                  <Input
                    id="fecha"
                    type="date"
                    value={briefEditData.fecha_emision}
                    onChange={(e) => setBriefEditData({...briefEditData, fecha_emision: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="observaciones">Observaciones</Label>
                  <Textarea
                    id="observaciones"
                    value={briefEditData.observaciones}
                    onChange={(e) => setBriefEditData({...briefEditData, observaciones: e.target.value})}
                    placeholder="Agregar observaciones..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleUpdateBriefInfo}>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      setEditingBriefInfo(false);
                      setBriefEditData({
                        observaciones: brief.observaciones || '',
                        cliente_info: brief.cliente_info || {},
                        fecha_emision: brief.fecha_emision
                      });
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center">
                  <span className="font-medium w-40 text-gray-700">Código Brief:</span>
                  <span className="bg-blue-50 px-2 py-1 rounded-md font-mono text-blue-800">
                    {brief.codigo}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium w-40 text-gray-700">Fecha emisión:</span>
                  <span className="text-gray-800">{brief.fecha_emision}</span>
                </div>
                <div className="flex items-start">
                  <span className="font-medium w-40 text-gray-700 pt-1">Estado:</span>
                  <Badge className={`${getStatusColor(brief.estado)} py-1`}>
                    {brief.estado}
                  </Badge>
                </div>
                <div className="flex items-start">
                  <span className="font-medium w-40 text-gray-700 pt-1.5">Observaciones:</span>
                  <span className={brief.observaciones ? "text-gray-800" : "text-gray-500 italic"}>
                    {brief.observaciones || 'No hay observaciones'}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
          {!editingBriefInfo && (
            <CardFooter className="bg-gray-50 border-t justify-end">
              <Badge variant="outline" className="text-blue-600 border-blue-300">
                <Clock className="h-3 w-3 mr-1" />
                <span className="text-xs">
                  Actualizado: {brief.updated_at_humanized || 'recientemente'}
                </span>
              </Badge>
            </CardFooter>
          )}
        </Card>
      </div>

      {/* Products table */}
      <Card className="border-blue-100 overflow-hidden mb-8">
        <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-t-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <CardTitle className="flex items-center text-lg font-semibold text-blue-900">
                <Clipboard className="mr-2 h-5 w-5 text-blue-600" />
                Listado de Items
              </CardTitle>
              <CardDescription>Productos y cantidades requeridas</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-blue-50 to-transparent border-y border-blue-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-blue-800 w-16">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-blue-800 w-32">CÓDIGO</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-blue-800">PRODUCTO</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-blue-800">DESCRIPCIÓN</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-blue-800 w-32">UNIDAD</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-blue-800 w-32">CANTIDAD</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-blue-800 w-24">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50/40 transition-colors border-b border-gray-100">
                    {editingItem?.id === item.id ? (
                      <>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-500">{item.id}</span>
                        </td>
                        <td className="py-3 px-4">
                          <Input
                            value={editingItem.codigo}
                            onChange={(e) => setEditingItem({...editingItem, codigo: e.target.value})}
                            className="h-8"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <Input
                            value={editingItem.producto}
                            onChange={(e) => setEditingItem({...editingItem, producto: e.target.value})}
                            className="h-8"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <Input
                            value={editingItem.descripcion}
                            onChange={(e) => setEditingItem({...editingItem, descripcion: e.target.value})}
                            className="h-8"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <Select
                            value={editingItem.unidad}
                            onValueChange={(value) => setEditingItem({...editingItem, unidad: value})}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="UND">UND</SelectItem>
                              <SelectItem value="KG">Kilogramo</SelectItem>
                              <SelectItem value="LT">Litro</SelectItem>
                              <SelectItem value="MT">Metro</SelectItem>
                              <SelectItem value="CJ">Caja</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-3 px-4">
                          <Input
                            type="number"
                            value={editingItem.cantidad}
                            onChange={(e) => setEditingItem({...editingItem, cantidad: parseInt(e.target.value) || 0})}
                            className="h-8"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleSaveEditedItem}
                              className="h-8 w-8 p-0 text-green-600 hover:bg-green-50"
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingItem(null)}
                              className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-500">{item.id}</span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="font-mono">
                            {item.product_reference || '-'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-800">{item.product}</td>
                        <td className="py-3 px-4 text-gray-600">{item.specifications || '-'}</td>
                        <td className="py-3 px-4">{item.unit_nombre || item.unit || '-'}</td>
                        <td className="py-3 px-4 font-medium text-blue-800">{item.quantity}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handleEditItem(item)}
                                    className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50"
                                  >
                                    <FilePenLine className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Editar item</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    onClick={() => handleDeleteItem(item.id)}
                                    variant="ghost" 
                                    size="sm" 
                                    disabled={deletingItemId === item.id}
                                    className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                                  >
                                    {deletingItemId === item.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-4 w-4" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Eliminar item</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
                
                {/* Add new item row */}
                <tr className="bg-gradient-to-r from-blue-50 to-blue-50/30 border-blue-100/60">
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-500">
                      <Plus className="h-4 w-4" />
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Input 
                      value={newItem.codigo} 
                      onChange={(e) => setNewItem({...newItem, codigo: e.target.value})}
                      placeholder="Código" 
                      className="h-9 border-blue-200 focus:border-blue-400"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <Input 
                      value={newItem.producto} 
                      onChange={(e) => setNewItem({...newItem, producto: e.target.value})}
                      placeholder="Nombre del producto" 
                      className="h-9 border-blue-200 focus:border-blue-400"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <Input 
                      value={newItem.descripcion} 
                      onChange={(e) => setNewItem({...newItem, descripcion: e.target.value})}
                      placeholder="Descripción" 
                      className="h-9 border-blue-200 focus:border-blue-400"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <Select
                      value={newItem.unidad}
                      onValueChange={(value) => setNewItem({...newItem, unidad: value})}
                    >
                      <SelectTrigger className="h-9 border-blue-200 focus:border-blue-400">
                        <SelectValue placeholder="Unidad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UND">UND</SelectItem>
                        <SelectItem value="KG">Kilogramo</SelectItem>
                        <SelectItem value="LT">Litro</SelectItem>
                        <SelectItem value="MT">Metro</SelectItem>
                        <SelectItem value="CJ">Caja</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="py-3 px-4">
                    <Input 
                      type="number"
                      value={newItem.cantidad} 
                      onChange={(e) => setNewItem({...newItem, cantidad: parseInt(e.target.value) || 0})}
                      placeholder="0" 
                      className="h-9 border-blue-200 focus:border-blue-400"
                    />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            onClick={handleAddItem}
                            size="sm" 
                            disabled={addingItem}
                            className="bg-blue-600 hover:bg-blue-700 h-8 w-8 p-0"
                          >
                            {addingItem ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Plus className="h-4 w-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Agregar item</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-blue-100/30 py-3 border-t border-blue-100">
          <div className="text-sm text-blue-700 font-medium">
            Mostrando {items.length} de {items.length} items
          </div>
          <Badge className="bg-blue-100 text-blue-800 border-none">
            <span className="font-semibold">Total Items: {totalItems}</span>
          </Badge>
        </CardFooter>
      </Card>

      {/* History */}
      <Card className="border-blue-100 overflow-hidden mb-8">
        <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-t-lg">
          <CardTitle className="flex items-center text-lg font-semibold text-blue-900">
            <Clock className="mr-2 h-5 w-5 text-blue-600" />
            Historial de cambios
          </CardTitle>
          <CardDescription>Registro cronológico de modificaciones realizadas</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            
            {/* History items */}
            <div className="space-y-6">
              {history.map((item, index) => (
                <div key={item.id || index} className="relative flex items-start gap-4">
                  {/* Timeline dot */}
                  <div className={`
                    relative z-10 flex items-center justify-center w-8 h-8 rounded-full shadow-sm
                    ${item.action === 'created' ? 'bg-blue-600' : ''}
                    ${item.action === 'updated' ? 'bg-amber-500' : ''}
                    ${item.action === 'status_changed' ? 'bg-green-600' : ''}
                    ${item.action === 'item_added' ? 'bg-indigo-600' : ''}
                    ${item.action === 'item_deleted' ? 'bg-red-600' : ''}
                    ${!['created', 'updated', 'status_changed', 'item_added', 'item_deleted'].includes(item.action) ? 'bg-gray-400' : ''}
                  `}>
                    {item.action === 'created' && <Plus className="h-4 w-4 text-white" />}
                    {item.action === 'updated' && <FilePenLine className="h-4 w-4 text-white" />}
                    {item.action === 'status_changed' && <RefreshCw className="h-4 w-4 text-white" />}
                    {item.action === 'item_added' && <Plus className="h-4 w-4 text-white" />}
                    {item.action === 'item_deleted' && <Trash2 className="h-4 w-4 text-white" />}
                    {!['created', 'updated', 'status_changed', 'item_added', 'item_deleted'].includes(item.action) && 
                      <Clock className="h-4 w-4 text-white" />
                    }
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-semibold text-gray-800">{item.description}</p>
                      <Badge variant="outline" className="text-xs">
                        {item.created_at_humanized || format(parseISO(item.created_at), "dd/MM/yyyy - HH:mm")}
                      </Badge>
                    </div>
                    {item.details && (
                      <p className="text-sm text-gray-600 mb-2">{item.details}</p>
                    )}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                          <User className="h-3 w-3 text-gray-600" />
                        </div>
                        <span className="text-xs text-gray-500">{item.user?.username || 'Sistema'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change status dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar estado del brief</DialogTitle>
            <DialogDescription>
              Selecciona el nuevo estado para el brief {brief.code}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status">Nuevo estado</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent>
                  {statusChoices.map((choice) => (
                    <SelectItem key={choice.value} value={choice.value}>
                      {choice.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea
                id="notes"
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder="Agregar notas sobre el cambio de estado..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleChangeStatus} disabled={savingStatus}>
              {savingStatus ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Cambiar estado'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BriefDetailPage;