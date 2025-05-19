import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ClipboardCopy, Building, List, Grid3X3, Database } from "lucide-react";
import { getEmpresas, createEmpresa } from "@/services/empresaService";
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
  const [selectedEmpresa, setSelectedEmpresa] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState("card");
  const [entidadSeleccionada, setEntidadSeleccionada] = useState("sri");
  const { toast } = useToast();
  const { isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  
  // Función para copiar texto al portapapeles
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado", description: "Texto copiado al portapapeles" });
  };
  
  // Cargar datos al montar el componente o cuando cambie la entidad seleccionada
  useEffect(() => {
    console.log("EmpresaInfo - Cargando datos para:", entidadSeleccionada);
    fetchData(entidadSeleccionada);
  }, [isAuthenticated, entidadSeleccionada]); 
  
  // Función para cargar datos
  const fetchData = async (entityType = entidadSeleccionada) => {
    try {
      setLoading(true);
      setError(null);
      
      // Verificar autenticación
      if (!isAuthenticated) {
        console.log("No autenticado, redirigiendo a login");
        navigate('/auth/login');
        return;
      }
      
      console.log(`Iniciando petición para entidad "${entityType}"...`);
      
      try {
        // Usar el servicio para obtener los datos
        console.log("Llamando a getEmpresas con:", entityType);
        const jsonData = await getEmpresas(entityType);
        console.log(`Respuesta de API (${entityType}):`, jsonData);
        
        // Procesar la respuesta
        let resultados = jsonData;
        
        // Si la respuesta tiene un campo 'results', usar ese
        if (jsonData && jsonData.results) {
          resultados = jsonData.results;
        }
        
        // Si no es un array, convertirlo
        if (!Array.isArray(resultados)) {
          resultados = resultados ? [resultados] : [];
        }
        
        console.log("Datos procesados:", resultados);
        
        // Actualizar estado
        setEmpresas(resultados);
      } catch (serviceError) {
        console.error("Error del servicio:", serviceError);
        
        if (serviceError.response?.status === 401) {
          console.log("Token inválido o expirado");
          logout();
          navigate('/auth/login');
          return;
        }
        
        throw serviceError;
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Error general:", err);
      
      // Mensaje de error más descriptivo
      let errorMessage = "No se pudieron cargar los datos";
      
      if (err.response?.data?.detail) {
        errorMessage = `Error del servidor: ${err.response.data.detail}`;
      } else if (err.message) {
        errorMessage = `Error: ${err.message}`;
      }
      
      setError(errorMessage);
      setLoading(false);
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
    console.log("Manejando empresa agregada:", { entityType, newData });
    
    try {
      // Si se especifica un tipo de entidad, actualizar la selección
      if (entityType) {
        setEntidadSeleccionada(entityType);
      }
      
      const currentEntityType = entityType || entidadSeleccionada;
      
      if (newData) {
        // Eliminar campos que no deben enviarse a la API
        delete newData.id;
        delete newData.fecha_creacion;
        delete newData.fecha_actualizacion;
        
        console.log("Creando nueva empresa:", newData);
        
        // Usar el servicio para crear la nueva empresa en la API
        const response = await createEmpresa(newData, currentEntityType);
        console.log("Empresa creada exitosamente:", response);
        
        // Recargar los datos desde la API
        await fetchData(currentEntityType);
        
        toast({
          title: "Éxito",
          description: "Se ha agregado un nuevo registro",
          variant: "success"
        });
      }
    } catch (error) {
      console.error("Error al agregar empresa:", error);
      toast({
        title: "Error",
        description: "No se pudo agregar el registro: " + (error.message || "Error desconocido"),
        variant: "destructive"
      });
    }
  };
  
  // Manejar cambio de entidad seleccionada
  const handleEntidadChange = (value) => {
    console.log("Cambiando entidad a:", value);
    setEntidadSeleccionada(value);
    // Los datos se cargarán gracias al useEffect
  };
  
  // Crear registro demo
  const createDemoRecord = async () => {
    try {
      console.log("Creando registro demo para:", entidadSeleccionada);
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
      
      console.log("Datos a enviar a la API:", nuevoRegistro);
      const respuesta = await createEmpresa(nuevoRegistro, entidadSeleccionada);
      console.log("Respuesta de API al crear:", respuesta);
      
      // Recargar datos
      await fetchData(entidadSeleccionada);
      
      toast({
        title: "Éxito",
        description: "Registro demo creado correctamente",
        variant: "success"
      });
    } catch (error) {
      console.error("Error al crear registro demo:", error);
      toast({
        title: "Error", 
        description: `No se pudo crear: ${error.message || "Error desconocido"}`,
        variant: "destructive"
      });
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-8">
          <div className="text-red-500 mb-4">Error: {error}</div>
          <Button onClick={() => fetchData(entidadSeleccionada)}>Reintentar</Button>
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
                  <Select value={entidadSeleccionada} onValueChange={handleEntidadChange}>
                    <SelectTrigger className="bg-white">
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
                  onClick={() => fetchData(entidadSeleccionada)}
                  className="bg-white"
                >
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