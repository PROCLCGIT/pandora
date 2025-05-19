import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ClipboardCopy, Building, List, Grid3X3, Database, RefreshCcw, AlertCircle } from "lucide-react";
import { getEmpresas, createEmpresa, reloadEmpresas } from "@/services/empresaService";
import useAuthStore from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EmpresaDetailModal from "./Components/EmpresaDetailModal";
import EmpresaCard from "./Components/EmpresaCard";
import EmpresaForm from "./Components/EmpresaForm";

// Componente principal
export default function EmpresaInfo() {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [selectedEmpresa, setSelectedEmpresa] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState("card");
  const [entidadSeleccionada, setEntidadSeleccionada] = useState("sri");
  const { toast } = useToast();
  const { isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  
  // Useref para trackear cambios y prevenir peticiones innecesarias
  const prevEntityRef = useRef(entidadSeleccionada);
  const refreshTimerRef = useRef(null);
  const refreshButtonRef = useRef(null);
  
  // Función para copiar texto al portapapeles
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado", description: "Texto copiado al portapapeles" });
  };
  
  // Control del montaje inicial para evitar solicitudes innecesarias
  const isMountedRef = useRef(false);
  
  // Cargar datos solo al montar inicialmente
  useEffect(() => {
    // Solo realizar una carga inicial si no hay datos
    if (!isMountedRef.current) {
      console.log("EmpresaInfo - Montaje inicial para:", entidadSeleccionada);
      isMountedRef.current = true;
      
      // En el montaje inicial, intentar obtener datos
      if (empresas.length === 0) {
        fetchData(entidadSeleccionada);
      }
    }
    
    // Cleanup function
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, []);
  
  // Manejar cambios de autenticación o entidad
  useEffect(() => {
    // No hacer nada en el montaje inicial (ya manejado por el efecto anterior)
    if (!isMountedRef.current) return;
    
    console.log("EmpresaInfo - Cambio de entidad a:", entidadSeleccionada);
    
    // Evitar recargas innecesarias si la entidad no ha cambiado realmente
    if (prevEntityRef.current !== entidadSeleccionada) {
      fetchData(entidadSeleccionada);
      prevEntityRef.current = entidadSeleccionada;
    }
  }, [isAuthenticated, entidadSeleccionada]);
  
  // Función para cargar datos con manejo de errores mejorado
  const fetchData = async (entityType = entidadSeleccionada, forceReload = false) => {
    // Desactivar botón de refresh mientras se carga
    if (refreshButtonRef.current) {
      refreshButtonRef.current.disabled = true;
    }
    
    try {
      setLoading(true);
      setError(null);
      setIsRateLimited(false);
      
      // Verificar autenticación
      if (!isAuthenticated) {
        navigate('/auth/login');
        return;
      }
      
      try {
        // Usar el servicio para obtener los datos (forzar recarga si se solicita)
        const jsonData = forceReload 
          ? await reloadEmpresas(entityType)
          : await getEmpresas(entityType);
        
        // Actualizar estado directamente (el procesamiento está en el servicio)
        setEmpresas(Array.isArray(jsonData) ? jsonData : []);
        
        // Notificar si se forzó una recarga
        if (forceReload) {
          toast({
            title: "Datos actualizados",
            description: "Se han refrescado los datos correctamente",
            variant: "success"
          });
        }
      } catch (serviceError) {
        // Manejar error de autenticación
        if (serviceError.response?.status === 401) {
          logout();
          navigate('/auth/login');
          return;
        }
        
        // Detectar error de rate limiting
        if (serviceError.response?.status === 429) {
          setIsRateLimited(true);
          throw new Error("Demasiadas solicitudes. Por favor, espere unos momentos antes de intentar nuevamente.");
        }
        
        throw serviceError;
      }
    } catch (err) {
      // Mensaje de error más descriptivo
      let errorMessage = "No se pudieron cargar los datos";
      
      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
      // Mostrar toast solo para errores graves, no de rate limiting
      if (!isRateLimited) {
        toast({
          title: "Error al cargar datos",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
      
      // Reactivar botón de refresh después de un tiempo
      if (refreshButtonRef.current) {
        refreshTimerRef.current = setTimeout(() => {
          if (refreshButtonRef.current) {
            refreshButtonRef.current.disabled = false;
          }
        }, 2000); // 2 segundos de cooldown
      }
    }
  };

  // Manejar el click en una empresa para mostrar el modal
  const handleEmpresaClick = (empresa) => {
    console.log("Empresa seleccionada para modal:", empresa);
    setSelectedEmpresa(empresa);
    setModalOpen(true);
  };
  
  // Manejar cuando se agrega una nueva empresa
  const handleEmpresaAdded = async (entityType, newData) => {
    try {
      // Si se especifica un tipo de entidad, actualizar la selección
      if (entityType) {
        setEntidadSeleccionada(entityType);
      }
      
      const currentEntityType = entityType || entidadSeleccionada;
      
      if (newData) {
        // Eliminar campos que no deben enviarse a la API
        const cleanedData = { ...newData };
        delete cleanedData.id;
        delete cleanedData.fecha_creacion;
        delete cleanedData.fecha_actualizacion;
        
        // Usar el servicio para crear la nueva empresa en la API
        const response = await createEmpresa(cleanedData, currentEntityType);
        
        // Recargar los datos desde la API (siempre forzar recarga)
        await fetchData(currentEntityType, true);
        
        toast({
          title: "Éxito",
          description: "Se ha agregado un nuevo registro",
          variant: "success"
        });
      }
    } catch (error) {
      console.error("Error al agregar empresa:", error);
      
      // Mensaje más amigable para errores de rate limiting
      let errorMessage = "No se pudo agregar el registro";
      
      if (error.response?.status === 429) {
        errorMessage = "Demasiadas solicitudes. Por favor, espere unos momentos antes de intentar nuevamente.";
      } else if (error.message) {
        errorMessage += ": " + error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };
  
  // Manejar cambio de entidad seleccionada con throttling para prevenir rate limiting
  const handleEntidadChange = (value) => {
    // Solo actualizar si realmente cambió (prevenir recargas innecesarias)
    if (value !== entidadSeleccionada) {
      setEntidadSeleccionada(value);
    }
  };
  
  // Función para recargar con delay configurable para manejar rate limiting
  const retryWithDelay = (delay = 5000) => {
    toast({
      title: "Reintentando",
      description: `Esperando ${delay/1000} segundos antes de reintentar...`,
      variant: "default"
    });
    
    setTimeout(() => {
      fetchData(entidadSeleccionada, true);
    }, delay);
  };
  
  // Crear registro demo
  const createDemoRecord = async () => {
    try {
      const nuevoRegistro = {
        empresa: `Nueva Empresa ${entidadSeleccionada.toUpperCase()}`,
        ruc: `${Math.floor(Math.random() * 10000000000)}001`,
        usuario: `usuario_${entidadSeleccionada}_demo`,
        contrasena: "clave123",
        correo: `contacto@${entidadSeleccionada}empresa.com`,
        telefono: `098${Math.floor(Math.random() * 10000000)}`,
        representante: "Usuario Demo"
      };
      
      // Si es otrasinstituciones, agregar campos adicionales
      if (entidadSeleccionada === "otrasinstituciones") {
        nuevoRegistro.institucion = "Institución Demo";
        nuevoRegistro.url = "https://www.ejemplo.com";
      }
      
      // Crear empresa
      await createEmpresa(nuevoRegistro, entidadSeleccionada);
      
      // Recargar datos forzando actualización
      await fetchData(entidadSeleccionada, true);
      
      toast({
        title: "Éxito",
        description: "Registro demo creado correctamente",
        variant: "success"
      });
    } catch (error) {
      let errorMessage = "No se pudo crear el registro";
      
      // Mensaje especial para rate limiting
      if (error.response?.status === 429) {
        errorMessage = "Demasiadas solicitudes. Por favor, espere unos momentos antes de intentar nuevamente.";
      } else if (error.message) {
        errorMessage += `: ${error.message}`;
      }
      
      toast({
        title: "Error", 
        description: errorMessage,
        variant: "destructive"
      });
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-blue-500 font-medium">Cargando datos...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-8">
          <div className="flex items-center justify-center mb-4">
            <AlertCircle className="h-10 w-10 text-red-500 mr-2" />
            <h2 className="text-xl font-bold text-gray-800">Error al cargar datos</h2>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
          
          {isRateLimited ? (
            <div className="space-y-4">
              <p className="text-gray-600">
                Se ha detectado un límite de peticiones. Por favor, espere unos momentos antes de reintentar.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={() => fetchData(entidadSeleccionada)}
                  variant="outline"
                >
                  Reintentar ahora
                </Button>
                <Button 
                  onClick={() => retryWithDelay(5000)}
                  variant="default"
                >
                  Reintentar en 5 segundos
                </Button>
                <Button 
                  onClick={() => retryWithDelay(30000)}
                  variant="secondary"
                >
                  Reintentar en 30 segundos
                </Button>
              </div>
            </div>
          ) : (
            <Button 
              onClick={() => fetchData(entidadSeleccionada)}
              className="w-full"
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold flex items-center">
              <Building className="h-6 w-6 mr-2 text-blue-500" />
              Gestión de Credenciales - {entidadSeleccionada.toUpperCase()}
            </h1>
            <div className="flex items-center space-x-2">
              <span className="text-sm px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                {empresas.length} {empresas.length === 1 ? 'registro' : 'registros'}
              </span>
            </div>
          </div>
          
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h2 className="text-lg font-medium mb-3 text-gray-800">Filtros y Acciones</h2>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center">
                <Database className="h-5 w-5 mr-2 text-blue-600" />
                <span className="font-medium">Tipo de entidad:</span>
                <div className="w-64 ml-3">
                  <Select 
                    value={entidadSeleccionada} 
                    onValueChange={handleEntidadChange}
                    disabled={loading || isRateLimited} // Deshabilitar durante la carga o rate limiting
                  >
                    <SelectTrigger className={`bg-white ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                      <SelectValue placeholder="Seleccione una entidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sri">SRI</SelectItem>
                      <SelectItem value="sercop">SERCOP</SelectItem>
                      <SelectItem value="supercom">SUPERCOM</SelectItem>
                      <SelectItem value="otrasinstituciones">Otras Instituciones</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => fetchData(entidadSeleccionada, true)}
                  className="bg-white flex items-center"
                  ref={refreshButtonRef}
                >
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Refrescar
                </Button>
                <EmpresaForm 
                  onEmpresaAdded={handleEmpresaAdded} 
                  initialEntityType={entidadSeleccionada} 
                />
              </div>
            </div>
          </div>

          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="card" className="flex items-center">
                <Grid3X3 className="h-4 w-4 mr-2" />
                Tarjetas
              </TabsTrigger>
              <TabsTrigger value="table" className="flex items-center">
                <List className="h-4 w-4 mr-2" />
                Tabla
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="card">
              {empresas.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {empresas.map((empresa, index) => {
                    // Validar que la empresa tenga los campos necesarios
                    if (!empresa || typeof empresa !== 'object') {
                      console.log("Elemento no válido en el array de empresas para tarjeta:", empresa);
                      return null;
                    }
                    
                    return (
                      <div key={index} onClick={() => handleEmpresaClick(empresa)}>
                        <EmpresaCard 
                          empresa={empresa} 
                          onCopy={(text, e) => {
                            e?.stopPropagation();
                            copyToClipboard(text);
                          }} 
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center p-12 bg-gray-50 rounded-lg">
                  <div className="flex flex-col items-center">
                    <Database className="h-12 w-12 text-gray-300 mb-4" />
                    <p className="text-gray-500 mb-4">No hay registros disponibles para mostrar.</p>
                    <Button 
                      onClick={createDemoRecord}
                      variant="outline"
                    >
                      Crear Registro Demo
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="table">
              {empresas.length > 0 ? (
                <div className="overflow-x-auto border rounded-lg">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="font-bold">Empresa</TableHead>
                        <TableHead className="font-bold">RUC</TableHead>
                        <TableHead className="font-bold">Usuario</TableHead>
                        <TableHead className="font-bold">Contraseña</TableHead>
                        <TableHead className="font-bold">Correo</TableHead>
                        <TableHead className="font-bold">Teléfono</TableHead>
                        <TableHead className="font-bold">Representante</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {empresas.map((empresa, index) => {
                        // Validar que la empresa tenga los campos necesarios
                        if (!empresa || typeof empresa !== 'object') {
                          console.log("Elemento no válido en el array de empresas:", empresa);
                          return null;
                        }
                        
                        return (
                          <TableRow 
                            key={index}
                            className="cursor-pointer hover:bg-blue-50/50"
                            onClick={() => handleEmpresaClick(empresa)}
                          >
                            <TableCell className="font-medium">{empresa.empresa || 'Sin nombre'}</TableCell>
                            <TableCell className="font-mono text-sm">{empresa.ruc || 'Sin RUC'}</TableCell>
                            <TableCell>{empresa.usuario || 'Sin usuario'}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">••••••••</span>
                                {empresa.contrasena && (
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      copyToClipboard(String(empresa.contrasena));
                                    }}
                                    className="ml-2 p-1 hover:bg-gray-200 rounded-full"
                                    title="Copiar contraseña"
                                  >
                                    <ClipboardCopy className="h-4 w-4 text-gray-500" />
                                  </button>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-blue-600 underline">{empresa.correo || 'Sin correo'}</TableCell>
                            <TableCell>{empresa.telefono || 'Sin teléfono'}</TableCell>
                            <TableCell>{empresa.representante || 'Sin representante'}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center p-12 bg-gray-50 rounded-lg">
                  <div className="flex flex-col items-center">
                    <Database className="h-12 w-12 text-gray-300 mb-4" />
                    <p className="text-gray-500 mb-4">No hay registros disponibles para mostrar.</p>
                    <Button 
                      onClick={createDemoRecord}
                      variant="outline"
                    >
                      Crear Registro Demo
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Modal de detalle */}
      <EmpresaDetailModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        empresa={selectedEmpresa}
        onCopy={copyToClipboard}
        entityType={entidadSeleccionada}
      />
    </div>
  );
}