// /Users/clc/Ws/Appclc/pandora/src/modulos/importexport/pages/ProductosOfertadosImportPage.jsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { importExportService } from '../services/importExportService';
import { ArrowLeft, Upload, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useCategories } from '../../basic/api/categoriaService';

// Adaptamos el componente Alert como en tu implementación existente
const Alert = ({ children, variant = "default" }) => {
  const bgColor = variant === "destructive" ? "bg-red-100 border-red-500" : "bg-blue-100 border-blue-500";
  const textColor = variant === "destructive" ? "text-red-800" : "text-blue-800";
  
  return (
    <div className={`p-4 mb-4 border-l-4 ${bgColor} ${textColor} rounded-md`}>
      {children}
    </div>
  );
};

// Componentes auxiliares
const AlertTitle = ({ children }) => {
  return <h4 className="font-medium mb-1">{children}</h4>;
};

const AlertDescription = ({ children }) => {
  return <div className="text-sm">{children}</div>;
};

// Componente Progress personalizado
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

const ProductosOfertadosImportPage = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [columnMapping, setColumnMapping] = useState({
    code: '',
    cudim: '',
    nombre: '',
    descripcion: '',
    referencias: '',
    especialidad: '',
    id_categoria: '',
    is_active: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    valid: 0,
    invalid: 0,
    imported: 0
  });

  // Cargar categorías al montar el componente
  const { 
    data: categoriasData, 
    isLoading: isLoadingCategorias, 
    isError: isErrorCategorias, 
    error: errorCategorias 
  } = useCategories({}, {
    staleTime: 10 * 60 * 1000,
  });

  const categorias = useMemo(() => categoriasData?.results || [], [categoriasData]);

  useEffect(() => {
    if (isErrorCategorias) {
      setError(`Error al cargar las categorías: ${errorCategorias?.message || 'Desconocido'}`);
      console.error('Error loading categories:', errorCategorias);
    } else {
      // Clear previous category error if categories load successfully
      if (error && error.startsWith('Error al cargar las categorías')) {
        setError(null);
      }
    }
  }, [isErrorCategorias, errorCategorias, error]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setError(null);
    setSuccess(null);
    
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Asumimos que queremos la primera hoja
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Convertir a JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          // Extraer columnas (primera fila)
          if (jsonData.length > 0) {
            const headers = jsonData[0];
            setColumns(headers);
            
            // Inicio de mapeo automático si los nombres coinciden
            const defaultMapping = {};
            
            headers.forEach((header, index) => {
              const lowerHeader = String(header).toLowerCase().trim();
              
              // Mapeo automático basado en coincidencias
              if (lowerHeader === 'codigo' || lowerHeader === 'code') {
                defaultMapping.code = index;
              } else if (lowerHeader === 'cudim') {
                defaultMapping.cudim = index;
              } else if (lowerHeader === 'nombre') {
                defaultMapping.nombre = index;
              } else if (lowerHeader === 'descripcion' || lowerHeader === 'descripción') {
                defaultMapping.descripcion = index;
              } else if (lowerHeader === 'referencias' || lowerHeader === 'refs') {
                defaultMapping.referencias = index;
              } else if (lowerHeader === 'especialidad') {
                defaultMapping.especialidad = index;
              } else if (lowerHeader === 'categoria' || lowerHeader === 'categoría' || lowerHeader === 'id_categoria') {
                defaultMapping.id_categoria = index;
              } else if (lowerHeader === 'activo' || lowerHeader === 'is_active' || lowerHeader === 'estado') {
                defaultMapping.is_active = index;
              }
            });
            
            setColumnMapping(defaultMapping);
            
            // Extraer datos para vista previa (primeras 5 filas después de los encabezados)
            const dataPreview = jsonData.slice(1, 6);
            setPreviewData(dataPreview);
            
            // Establecer estadísticas iniciales
            setStats({
              ...stats,
              total: jsonData.length - 1 // Restamos 1 por la fila de encabezados
            });
          } else {
            setError('El archivo parece estar vacío');
          }
        } catch (err) {
          console.error('Error al procesar archivo Excel:', err);
          setError('No se pudo procesar el archivo Excel. Verifique el formato.');
        }
      };
      
      reader.onerror = () => {
        setError('Error al leer el archivo');
      };
      
      reader.readAsArrayBuffer(selectedFile);
      setStep(2);
    }
  };

  const handleColumnMappingChange = (field, value) => {
    setColumnMapping({
      ...columnMapping,
      [field]: value
    });
  };

  const validateMapping = () => {
    // Verificar que al menos los campos obligatorios estén mapeados
    if (!columnMapping.code || !columnMapping.nombre) {
      setError('Los campos Código y Nombre son obligatorios para la importación');
      return false;
    }
    
    setError(null);
    return true;
  };

  const processFile = async () => {
    if (!validateMapping()) return;
    
    setLoading(true);
    setStep(3);
    setError(null);
    setSuccess(null);
    
    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Obtener los datos
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          // Saltamos la fila de encabezados
          const rows = jsonData.slice(1);
          
          // Categorías para mapeo por nombre
          const categoriasByName = {};
          categorias.forEach(cat => {
            categoriasByName[cat.nombre.toLowerCase().trim()] = cat.id;
          });
          
          // Procesar los datos
          const productosValidos = [];
          const productosInvalidos = [];
          const erroresPorFila = {};
          
          rows.forEach((row, index) => {
            if (row.length === 0) return; // Saltar filas vacías
            
            const producto = {};
            let isValid = true;
            const erroresFila = [];
            
            // Mapear campos
            if (columnMapping.code && row[columnMapping.code] !== undefined) {
              producto.code = String(row[columnMapping.code]).trim();
            } else {
              isValid = false;
              erroresFila.push('Código es obligatorio');
            }
            
            if (columnMapping.nombre && row[columnMapping.nombre] !== undefined) {
              producto.nombre = String(row[columnMapping.nombre]).trim();
            } else {
              isValid = false;
              erroresFila.push('Nombre es obligatorio');
            }
            
            // Campos opcionales
            if (columnMapping.cudim && row[columnMapping.cudim] !== undefined) {
              producto.cudim = String(row[columnMapping.cudim]).trim();
            }
            
            if (columnMapping.descripcion && row[columnMapping.descripcion] !== undefined) {
              producto.descripcion = String(row[columnMapping.descripcion]).trim();
            }
            
            if (columnMapping.referencias && row[columnMapping.referencias] !== undefined) {
              producto.referencias = String(row[columnMapping.referencias]).trim();
            }
            
            if (columnMapping.especialidad && row[columnMapping.especialidad] !== undefined) {
              producto.especialidad = String(row[columnMapping.especialidad]).trim();
            }
            
            // Manejar categoría (puede ser ID o nombre)
            if (columnMapping.id_categoria && row[columnMapping.id_categoria] !== undefined) {
              const catValue = String(row[columnMapping.id_categoria]).trim().toLowerCase();
              
              // Intentar encontrar por ID primero
              if (categorias.some(cat => String(cat.id) === catValue)) {
                producto.id_categoria = catValue;
              } 
              // Luego intentar por nombre
              else if (categoriasByName[catValue]) {
                producto.id_categoria = categoriasByName[catValue];
              }
              // Si no se encuentra, marcar como inválido
              else if (catValue !== '') {
                isValid = false;
                erroresFila.push(`Categoría no encontrada: "${row[columnMapping.id_categoria]}"`);
              }
            }
            
            // Manejar estado
            if (columnMapping.is_active && row[columnMapping.is_active] !== undefined) {
              const activeValue = String(row[columnMapping.is_active]).toLowerCase().trim();
              
              if (['true', '1', 'si', 'sí', 'activo', 'yes', 'y'].includes(activeValue)) {
                producto.is_active = true;
              } else if (['false', '0', 'no', 'inactivo', 'n'].includes(activeValue)) {
                producto.is_active = false;
              } else {
                producto.is_active = true; // Valor por defecto
              }
            } else {
              producto.is_active = true; // Valor por defecto
            }
            
            // Agregar a la lista correspondiente
            if (isValid) {
              productosValidos.push(producto);
            } else {
              productosInvalidos.push({
                rowIndex: index + 2,
                data: row,
                errores: erroresFila
              });
              erroresPorFila[index + 2] = erroresFila;
            }
          });
          
          // Actualizar estadísticas
          setStats({
            total: rows.length,
            valid: productosValidos.length,
            invalid: productosInvalidos.length,
            imported: 0
          });
          
          // Verificar si hay productos para importar
          if (productosValidos.length === 0) {
            setError('No hay productos válidos para importar. Revise el mapeo de columnas y los datos del archivo.');
            setLoading(false);
            return;
          }
          
          // Importar productos válidos
          let importados = 0;
          let fallos = 0;
          const erroresImportacion = [];
          
          // Usar el método de importación de lotes
          try {
            // Adaptamos para usar tu servicio de importación existente
            const formData = new FormData();
            const excelFile = new Blob([XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })], {
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
            formData.append('archivo', excelFile, 'productos_importacion.xlsx');
            formData.append('tipo', 'producto_ofertado');
            formData.append('column_mapping', JSON.stringify(columnMapping));
            
            // Subir archivo
            const response = await importExportService.uploadFile(
              excelFile, 
              'producto_ofertado',
              (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                // Actualizar progreso si es necesario
              }
            );
            
            // Procesar el archivo
            const processResponse = await importExportService.processFile(response.data.id);
            
            importados = processResponse.data.registros_exitosos;
            fallos = processResponse.data.registros_fallidos;
            
            // Actualizar estadísticas
            setStats(prev => ({
              ...prev,
              imported: importados
            }));
            
            if (fallos > 0) {
              let errorMsg = `Se importaron ${importados} de ${productosValidos.length} productos. `;
              errorMsg += `Hubo ${fallos} productos que no pudieron ser importados.`;
              
              setError(errorMsg);
              setSuccess(null);
            } else {
              setSuccess(`Se importaron ${importados} productos exitosamente.`);
              setError(null);
            }
          } catch (err) {
            console.error('Error en la importación por lotes:', err);
            setError('Error al importar productos: ' + (err.response?.data?.error || err.message || 'Error desconocido'));
          }
        } catch (err) {
          console.error('Error en el procesamiento del archivo:', err);
          setError('Error al procesar el archivo: ' + (err.message || 'Error desconocido'));
        } finally {
          setLoading(false);
        }
      };
      
      reader.onerror = (err) => {
        console.error('Error al leer el archivo:', err);
        setError('Error al leer el archivo: ' + (err?.target?.error?.message || 'Error desconocido'));
        setLoading(false);
      };
      
      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error('Error general en processFile:', err);
      setError('Error al procesar el archivo: ' + (err.message || 'Error desconocido'));
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreviewData([]);
    setColumns([]);
    setColumnMapping({
      code: '',
      cudim: '',
      nombre: '',
      descripcion: '',
      referencias: '',
      especialidad: '',
      id_categoria: '',
      is_active: ''
    });
    setError(null);
    setSuccess(null);
    setStep(1);
    setStats({
      total: 0,
      valid: 0,
      invalid: 0,
      imported: 0
    });
  };

  const downloadTemplate = () => {
    // Crear un libro de trabajo
    const wb = XLSX.utils.book_new();
    
    // Datos de muestra
    const headers = ['Codigo', 'CUDIM', 'Nombre', 'Descripcion', 'Referencias', 'Especialidad', 'Categoria', 'Estado'];
    const sampleData = [
      ['PRD001', 'CUD001', 'Producto de ejemplo 1', 'Descripción del producto 1', 'Referencias adicionales', 'Cardiología', 'Medicamentos', 'Activo'],
      ['PRD002', 'CUD002', 'Producto de ejemplo 2', 'Descripción del producto 2', '', 'Pediatría', 'Dispositivos', 'Inactivo']
    ];
    
    // Combinar headers y data
    const wsData = [headers, ...sampleData];
    
    // Crear hoja de cálculo
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Añadir la hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, 'Productos');
    
    // Descargar el archivo
    XLSX.writeFile(wb, 'plantilla_productos_ofertados.xlsx');
  };

  const renderFileUpload = () => (
    <Card>
      <CardHeader>
        <CardTitle>Paso 1: Cargar Archivo Excel</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">
          Selecciona un archivo Excel (.xlsx o .xls) con los productos ofertados que deseas importar.
          Puedes <Button variant="link" onClick={downloadTemplate} className="p-0 h-auto">descargar una plantilla de ejemplo</Button>.
        </p>
        <div className="flex flex-col items-center space-y-4">
          <input 
            type="file" 
            accept=".xlsx, .xls" 
            onChange={handleFileChange} 
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
            disabled={isLoadingCategorias || loading}
          />
          {isLoadingCategorias && (
            <div className="flex items-center text-sm text-gray-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Cargando categorías...
            </div>
          )}
        </div>
        {error && <Alert variant="destructive" className="mt-4"><AlertDescription>{error}</AlertDescription></Alert>}
      </CardContent>
    </Card>
  );

  const renderColumnMapping = () => {
    if (step < 2 || isLoadingCategorias) return null;
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Mapeo de columnas</h3>
        
        {file && (
          <div className="flex items-center text-sm text-gray-600 mb-4">
            <CheckCircle className="w-5 h-5 mr-1 text-green-500" />
            Archivo seleccionado: <span className="font-medium ml-1">{file.name}</span>
          </div>
        )}
        
        <div className="bg-white border rounded-md overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h4 className="font-medium">Vista previa de datos</h4>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column, index) => (
                    <TableHead key={index}>
                      {column}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewData.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <TableCell key={cellIndex}>
                        {cell !== undefined && cell !== null ? String(cell) : '-'}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        
        <div className="bg-white border rounded-md overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h4 className="font-medium">Asignar campos</h4>
            <p className="text-sm text-gray-500 mt-1">
              Selecciona qué columna del archivo corresponde a cada campo en el sistema.
              Los campos marcados con * son obligatorios.
            </p>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="code-column" className="mb-1">Código *</Label>
              <Select 
                value={columnMapping.code || ''} 
                onValueChange={(value) => handleColumnMappingChange('code', value)}
              >
                <SelectTrigger id="code-column">
                  <SelectValue placeholder="Seleccionar columna" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Seleccionar columna</SelectItem>
                  {columns.map((column, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {column}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="cudim-column" className="mb-1">CUDIM</Label>
              <Select 
                value={columnMapping.cudim || ''} 
                onValueChange={(value) => handleColumnMappingChange('cudim', value)}
              >
                <SelectTrigger id="cudim-column">
                  <SelectValue placeholder="Seleccionar columna" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Seleccionar columna</SelectItem>
                  {columns.map((column, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {column}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="nombre-column" className="mb-1">Nombre *</Label>
              <Select 
                value={columnMapping.nombre || ''} 
                onValueChange={(value) => handleColumnMappingChange('nombre', value)}
              >
                <SelectTrigger id="nombre-column">
                  <SelectValue placeholder="Seleccionar columna" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Seleccionar columna</SelectItem>
                  {columns.map((column, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {column}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="descripcion-column" className="mb-1">Descripción</Label>
              <Select 
                value={columnMapping.descripcion || ''} 
                onValueChange={(value) => handleColumnMappingChange('descripcion', value)}
              >
                <SelectTrigger id="descripcion-column">
                  <SelectValue placeholder="Seleccionar columna" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Seleccionar columna</SelectItem>
                  {columns.map((column, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {column}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="referencias-column" className="mb-1">Referencias</Label>
              <Select 
                value={columnMapping.referencias || ''} 
                onValueChange={(value) => handleColumnMappingChange('referencias', value)}
              >
                <SelectTrigger id="referencias-column">
                  <SelectValue placeholder="Seleccionar columna" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Seleccionar columna</SelectItem>
                  {columns.map((column, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {column}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="especialidad-column" className="mb-1">Especialidad</Label>
              <Select 
                value={columnMapping.especialidad || ''} 
                onValueChange={(value) => handleColumnMappingChange('especialidad', value)}
              >
                <SelectTrigger id="especialidad-column">
                  <SelectValue placeholder="Seleccionar columna" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Seleccionar columna</SelectItem>
                  {columns.map((column, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {column}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="categoria-column" className="mb-1">Categoría</Label>
              <Select 
                value={columnMapping.id_categoria || ''} 
                onValueChange={(value) => handleColumnMappingChange('id_categoria', value)}
              >
                <SelectTrigger id="categoria-column">
                  <SelectValue placeholder="Seleccionar columna" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Seleccionar columna</SelectItem>
                  {columns.map((column, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {column}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="is-active-column" className="mb-1">Estado (Activo/Inactivo)</Label>
              <Select 
                value={columnMapping.is_active || ''} 
                onValueChange={(value) => handleColumnMappingChange('is_active', value)}
              >
                <SelectTrigger id="is-active-column">
                  <SelectValue placeholder="Seleccionar columna" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Seleccionar columna</SelectItem>
                  {columns.map((column, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {column}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderImportProcess = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Importando productos</h3>
      
      <div className="bg-white border rounded-md overflow-hidden">
        <div className="p-4">
          <h4 className="font-medium">Progreso de importación</h4>
          
          <div className="mt-4">
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                    Progreso
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-blue-600">
                    {stats.imported} de {stats.valid}
                  </span>
                </div>
              </div>
              <Progress value={stats.valid > 0 ? (stats.imported / stats.valid) * 100 : 0} />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm font-medium text-gray-500">Total de filas</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm font-medium text-gray-500">Productos válidos</p>
              <p className="text-2xl font-bold text-green-600">{stats.valid}</p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm font-medium text-gray-500">Productos inválidos</p>
              <p className="text-2xl font-bold text-red-600">{stats.invalid}</p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm font-medium text-gray-500">Importados</p>
              <p className="text-2xl font-bold text-blue-600">{stats.imported}</p>
            </div>
          </div>
          
          {success && (
            <Alert>
              <div className="flex">
                <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                <div>
                  <p className="text-sm">{success}</p>
                </div>
              </div>
            </Alert>
          )}
          
          {error && (
            <Alert variant="destructive">
              <div className="flex">
                <XCircle className="h-5 w-5 text-red-400 mr-2" />
                <div>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </Alert>
          )}
          
          {loading && (
            <div className="flex justify-center items-center mt-4">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
              <span>Importando productos...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl">Importar Productos Ofertados desde Excel</CardTitle>
            <Button
              variant="outline"
              onClick={() => navigate('/importexport')}
              className="flex items-center"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Volver
            </Button>
          </div>
        </CardHeader>
        
        <div className="border-b">
          <div className="flex px-6">
            <button
              className={`px-4 py-2 font-medium ${
                step === 1 
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500'
              }`}
            >
              1. Seleccionar archivo
            </button>
            <button
              className={`px-4 py-2 font-medium ${
                step === 2 
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500'
              }`}
            >
              2. Mapear columnas
            </button>
            <button
              className={`px-4 py-2 font-medium ${
                step === 3 
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500'
              }`}
            >
              3. Importar datos
            </button>
          </div>
        </div>
        
        <CardContent className="p-6">
          {error && step !== 3 && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-5 w-5 mr-2" />
              <p className="text-sm">{error}</p>
            </Alert>
          )}
          
          {step === 1 && renderFileUpload()}
          {step === 2 && !isLoadingCategorias && renderColumnMapping()}
          {step === 3 && renderImportProcess()}
          
          <div className="mt-6 flex justify-between">
            <div>
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  disabled={loading}
                >
                  Anterior
                </Button>
              )}
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={loading}
              >
                Reiniciar
              </Button>
              
              {step === 1 && file && (
                <Button
                  onClick={() => setStep(2)}
                >
                  Continuar
                </Button>
              )}
              
              {step === 2 && (
                <Button
                  onClick={processFile}
                >
                  Importar Datos
                </Button>
              )}
              
              {step === 3 && !loading && (
                <Button
                  onClick={() => navigate('/importexport')}
                >
                  Finalizar
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductosOfertadosImportPage;