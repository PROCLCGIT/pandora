import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Card,
  CardContent, 
  CardHeader,
  CardTitle, 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  DownloadCloud, 
  Upload, 
  CheckCircle, 
  XCircle, 
  AlertCircle 
} from 'lucide-react';
import { importExportService } from '../services/importExportService';

// Componente Alert personalizado (ya que no está disponible en tu instalación de shadcn)
const Alert = ({ children, variant = "default" }) => {
  const bgColor = variant === "destructive" ? "bg-red-100 border-red-500" : "bg-blue-100 border-blue-500";
  const textColor = variant === "destructive" ? "text-red-800" : "text-blue-800";
  
  return (
    <div className={`p-4 mb-4 border-l-4 ${bgColor} ${textColor} rounded-md`}>
      {children}
    </div>
  );
};

// Título de alerta personalizado
const AlertTitle = ({ children }) => {
  return <h4 className="font-medium mb-1">{children}</h4>;
};

// Descripción de alerta personalizada
const AlertDescription = ({ children }) => {
  return <div className="text-sm">{children}</div>;
};

// Componente Progress personalizado (ya que no está disponible en tu instalación de shadcn)
const Progress = ({ value }) => {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className="bg-blue-600 h-2 rounded-full" 
        style={{ width: `${value}%` }}
      ></div>
    </div>
  );
};

const ImportPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('import');
  const [importType, setImportType] = useState('');
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);
  const [processingStatus, setProcessingStatus] = useState(null);
  const [importTasks, setImportTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Cargar tareas de importación anteriores
    fetchImportTasks();
  }, []);

  const fetchImportTasks = async () => {
    setIsLoading(true);
    try {
      const response = await importExportService.getImportTasks();
      console.log('Respuesta de tareas de importación:', response);
      
      // Asegurarnos de que importTasks siempre sea un array
      if (response.data && Array.isArray(response.data)) {
        setImportTasks(response.data);
      } else if (response.data && Array.isArray(response.data.results)) {
        // Si la respuesta tiene formato paginado
        setImportTasks(response.data.results);
      } else if (response.data && typeof response.data === 'object') {
        // Si es un único objeto, lo convertimos en array
        setImportTasks([response.data]);
      } else {
        // En el peor caso, inicializamos como array vacío
        console.warn('Formato de respuesta no reconocido:', response.data);
        setImportTasks([]);
      }
    } catch (error) {
      console.error('Error al cargar tareas de importación:', error);
      setImportTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleDownloadTemplate = async () => {
    if (!importType) {
      alert('Por favor seleccione un tipo de importación');
      return;
    }
    
    try {
      await importExportService.downloadTemplate(importType);
    } catch (error) {
      console.error('Error al descargar plantilla:', error);
    }
  };

  const handleUpload = async () => {
    if (!file || !importType) {
      alert('Por favor seleccione un archivo y un tipo de importación');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Subir archivo
      const response = await importExportService.uploadFile(file, importType, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      });

      setUploadResult({
        success: true,
        id: response.data.id,
        message: 'Archivo subido correctamente'
      });

      // Iniciar procesamiento
      await handleProcessFile(response.data.id);
      
      // Recargar lista de tareas
      fetchImportTasks();
    } catch (error) {
      console.error('Error al subir archivo:', error);
      setUploadResult({
        success: false,
        message: error.response?.data?.error || 'Error al subir archivo'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleProcessFile = async (taskId) => {
    setProcessingStatus({
      status: 'processing',
      message: 'Procesando archivo...'
    });

    try {
      const response = await importExportService.processFile(taskId);
      
      setProcessingStatus({
        status: response.data.estado === 'completado' ? 'success' : 'error',
        message: response.data.mensaje,
        stats: {
          total: response.data.registros_procesados,
          success: response.data.registros_exitosos,
          error: response.data.registros_fallidos
        }
      });
    } catch (error) {
      console.error('Error al procesar archivo:', error);
      setProcessingStatus({
        status: 'error',
        message: error.response?.data?.error || 'Error al procesar archivo'
      });
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completado':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'procesando':
        return <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Importación y Exportación de Productos</h1>
      
      <Tabs defaultValue="import" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="import">Importar Datos</TabsTrigger>
          <TabsTrigger value="export">Exportar Datos</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>
        
        <TabsContent value="import">
          <Card>
            <CardHeader>
              <CardTitle>Importar Datos</CardTitle>
              <p className="text-sm text-gray-500">
                Importe datos de productos desde un archivo Excel (.xlsx) o CSV (.csv)
              </p>
            </CardHeader>
            <CardContent>
              <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="shadow-sm border p-4">
                  <CardTitle className="text-md mb-3">Importaciones Avanzadas</CardTitle>
                  <div className="flex flex-col space-y-2">
                    <Link to="/importexport/productos-ofertados" className="text-blue-600 hover:underline flex items-center">
                      <Upload className="h-4 w-4 mr-2" />
                      Importar Productos Ofertados (Avanzado)
                    </Link>
                  </div>
                  <p className="mt-3 text-sm text-gray-500">
                    Esta opción ofrece herramientas avanzadas para importar datos con mapeo de columnas y validación detallada.
                  </p>
                </Card>
              </div>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="importType">Tipo de Importación</Label>
                  <Select value={importType} onValueChange={setImportType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione tipo de importación" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="producto_ofertado">Productos Ofertados</SelectItem>
                      <SelectItem value="producto_disponible">Productos Disponibles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Button 
                    variant="outline" 
                    onClick={handleDownloadTemplate}
                    disabled={!importType}
                  >
                    <DownloadCloud className="mr-2 h-4 w-4" />
                    Descargar Plantilla
                  </Button>
                </div>
                
                <div className="grid gap-4">
                  <Label htmlFor="file">Archivo a Importar</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".xlsx,.csv"
                    onChange={handleFileChange}
                    disabled={isUploading}
                  />
                </div>
                
                <Button 
                  onClick={handleUpload} 
                  disabled={!file || !importType || isUploading}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {isUploading ? 'Subiendo...' : 'Importar Datos'}
                </Button>
                
                {isUploading && (
                  <div className="mt-4">
                    <Label>Progreso de Carga</Label>
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-sm text-gray-500 mt-1">{uploadProgress}%</p>
                  </div>
                )}
                
                {uploadResult && (
                  <Alert variant={uploadResult.success ? "default" : "destructive"}>
                    <AlertCircle className="h-4 w-4 inline-block mr-2" />
                    <AlertTitle>
                      {uploadResult.success ? 'Carga exitosa' : 'Error en la carga'}
                    </AlertTitle>
                    <AlertDescription>
                      {uploadResult.message}
                    </AlertDescription>
                  </Alert>
                )}
                
                {processingStatus && (
                  <Alert variant={processingStatus.status === 'success' ? "default" : "destructive"}>
                    {processingStatus.status === 'processing' ? (
                      <div className="animate-spin h-4 w-4 inline-block mr-2 border-2 border-blue-500 rounded-full border-t-transparent" />
                    ) : processingStatus.status === 'success' ? (
                      <CheckCircle className="h-4 w-4 inline-block mr-2" />
                    ) : (
                      <XCircle className="h-4 w-4 inline-block mr-2" />
                    )}
                    <AlertTitle>
                      {processingStatus.status === 'processing' 
                        ? 'Procesando' 
                        : processingStatus.status === 'success' 
                          ? 'Procesamiento exitoso' 
                          : 'Error en el procesamiento'}
                    </AlertTitle>
                    <AlertDescription>
                      {processingStatus.message}
                      
                      {processingStatus.stats && (
                        <div className="mt-2">
                          <p>Registros procesados: {processingStatus.stats.total}</p>
                          <p>Registros exitosos: {processingStatus.stats.success}</p>
                          <p>Registros con error: {processingStatus.stats.error}</p>
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="export">
          <Card>
            <CardHeader>
              <CardTitle>Exportar Datos</CardTitle>
              <p className="text-sm text-gray-500">
                Exporte datos de productos a archivos Excel (.xlsx)
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4">
                  <Button onClick={() => importExportService.exportProductosOfertados()}>
                    <DownloadCloud className="mr-2 h-4 w-4" />
                    Exportar Productos Ofertados
                  </Button>
                </div>
                
                <div className="grid gap-4">
                  <Button onClick={() => importExportService.exportProductosDisponibles()}>
                    <DownloadCloud className="mr-2 h-4 w-4" />
                    Exportar Productos Disponibles
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Importaciones</CardTitle>
              <p className="text-sm text-gray-500">
                Historial de tareas de importación
              </p>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-6">
                  <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
                </div>
              ) : !Array.isArray(importTasks) || importTasks.length === 0 ? (
                <p className="text-center py-6 text-gray-500">No hay tareas de importación</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Procesados</TableHead>
                      <TableHead>Exitosos</TableHead>
                      <TableHead>Fallidos</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.isArray(importTasks) && importTasks.map((task) => (
                      <TableRow key={task.id || 'task-' + Math.random()}>
                        <TableCell>{task.creado_en ? new Date(task.creado_en).toLocaleString() : 'N/A'}</TableCell>
                        <TableCell>{task.get_tipo_display || task.tipo || 'N/A'}</TableCell>
                        <TableCell className="flex items-center">
                          {getStatusIcon(task.estado || 'pendiente')}
                          <span className="ml-2">{task.estado || 'N/A'}</span>
                        </TableCell>
                        <TableCell>{task.registros_procesados || 0}</TableCell>
                        <TableCell>{task.registros_exitosos || 0}</TableCell>
                        <TableCell>{task.registros_fallidos || 0}</TableCell>
                        <TableCell>
                          {(task.estado === 'pendiente') && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleProcessFile(task.id)}
                            >
                              Procesar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ImportPage;