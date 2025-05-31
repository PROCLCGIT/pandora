// /pandora/src/modulos/productos/pages/ConfiguracionPage.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Save, Settings, Package, Code, RotateCcw, 
  CheckCircle, AlertCircle, Info, Wrench
} from 'lucide-react';

// Importaciones de componentes UI
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function ConfiguracionPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Estados para configuración de códigos
  const [codeSettings, setCodeSettings] = useState({
    // Configuración para productos disponibles
    disponibles: {
      prefix: 'PDIS',
      numberLength: 3,
      separator: '-',
      includeDate: false,
      customPrefix: ''
    },
    // Configuración para productos ofertados (para futuro uso)
    ofertados: {
      prefix: 'OFT',
      numberLength: 4,
      separator: '-',
      includeDate: false,
      customPrefix: ''
    }
  });

  // Estados para otras configuraciones del módulo
  const [moduleSettings, setModuleSettings] = useState({
    autoGenerateImages: true,
    compressImages: true,
    allowMultipleFormats: true,
    maxImageSize: 5, // MB
    defaultImageQuality: 85,
    enableNotifications: true,
    autoSave: false,
    autoSaveInterval: 30 // segundos
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Cargar configuraciones guardadas al montar el componente
  useEffect(() => {
    const savedCodeSettings = localStorage.getItem('productos_code_settings');
    const savedModuleSettings = localStorage.getItem('productos_module_settings');
    
    if (savedCodeSettings) {
      setCodeSettings(JSON.parse(savedCodeSettings));
    }
    
    if (savedModuleSettings) {
      setModuleSettings(JSON.parse(savedModuleSettings));
    }
  }, []);

  // Función para generar código de ejemplo
  const generateExampleCode = (type) => {
    const settings = codeSettings[type];
    const { prefix, numberLength, separator, includeDate, customPrefix } = settings;
    const finalPrefix = customPrefix || prefix;
    const sampleNumber = '1'.padStart(numberLength, '0');
    const dateStr = includeDate ? '241201' : '';
    
    return includeDate ? 
      `${finalPrefix}${separator}${dateStr}${separator}${sampleNumber}` :
      `${finalPrefix}${separator}${sampleNumber}`;
  };

  // Función para actualizar configuración de códigos
  const updateCodeSetting = (type, key, value) => {
    setCodeSettings(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  // Función para actualizar configuración del módulo
  const updateModuleSetting = (key, value) => {
    setModuleSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  // Función para guardar configuraciones
  const saveSettings = async () => {
    setIsSaving(true);
    
    try {
      // Simular guardado (en una implementación real sería una llamada al API)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Guardar en localStorage
      localStorage.setItem('productos_code_settings', JSON.stringify(codeSettings));
      localStorage.setItem('productos_module_settings', JSON.stringify(moduleSettings));
      
      setHasChanges(false);
      toast({
        title: "Configuraciones guardadas",
        description: "Las configuraciones han sido actualizadas correctamente",
      });
    } catch (error) {
      toast({
        title: "Error al guardar",
        description: "No se pudieron guardar las configuraciones",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Función para resetear configuraciones
  const resetSettings = () => {
    setCodeSettings({
      disponibles: {
        prefix: 'PDIS',
        numberLength: 3,
        separator: '-',
        includeDate: false,
        customPrefix: ''
      },
      ofertados: {
        prefix: 'OFT',
        numberLength: 4,
        separator: '-',
        includeDate: false,
        customPrefix: ''
      }
    });
    
    setModuleSettings({
      autoGenerateImages: true,
      compressImages: true,
      allowMultipleFormats: true,
      maxImageSize: 5,
      defaultImageQuality: 85,
      enableNotifications: true,
      autoSave: false,
      autoSaveInterval: 30
    });
    
    setHasChanges(true);
    toast({
      title: "Configuraciones restablecidas",
      description: "Se han restaurado las configuraciones por defecto",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 py-4 max-w-7xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                className="rounded-full bg-white shadow-sm hover:bg-gray-50" 
                onClick={() => navigate('/productos')}
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Button>
              
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center">
                  <Settings className="h-6 w-6 mr-2 text-gray-700" />
                  Configuración de Productos
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Personaliza el comportamiento del módulo de productos
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {hasChanges && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Cambios pendientes
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6 max-w-7xl">
        <Tabs defaultValue="codigo" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px] mx-auto">
            <TabsTrigger value="codigo" className="flex items-center">
              <Code className="h-4 w-4 mr-2" />
              Códigos
            </TabsTrigger>
            <TabsTrigger value="imagenes" className="flex items-center">
              <Package className="h-4 w-4 mr-2" />
              Productos
            </TabsTrigger>
            <TabsTrigger value="general" className="flex items-center">
              <Wrench className="h-4 w-4 mr-2" />
              General
            </TabsTrigger>
          </TabsList>

          {/* Tab de Configuración de Códigos */}
          <TabsContent value="codigo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Code className="h-5 w-5 mr-2 text-indigo-600" />
                  Configuración de Códigos Automáticos
                </CardTitle>
                <CardDescription>
                  Los códigos se generan automáticamente basándose en la categoría seleccionada.
                  <br />
                  <strong>Formato:</strong> CODIGO_CATEGORIA-LETRA-NUMERO (Ej: MED-A-001, ELC-B-005)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Productos Disponibles */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Productos Disponibles</h3>
                    <Badge variant="outline" className="bg-indigo-50 text-indigo-700">
                      CAT-A-001
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Prefijo personalizado</Label>
                      <Input
                        placeholder="Ej: PROD, ITEM, etc."
                        value={codeSettings.disponibles.customPrefix}
                        onChange={(e) => updateCodeSetting('disponibles', 'customPrefix', e.target.value.toUpperCase())}
                      />
                      <p className="text-xs text-gray-500">
                        Deja vacío para usar "PDIS"
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Separador</Label>
                      <Select
                        value={codeSettings.disponibles.separator}
                        onValueChange={(value) => updateCodeSetting('disponibles', 'separator', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="-">Guión (-)</SelectItem>
                          <SelectItem value="_">Guión bajo (_)</SelectItem>
                          <SelectItem value=".">Punto (.)</SelectItem>
                          <SelectItem value="none">(Sin separador)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Longitud del número</Label>
                      <Select
                        value={codeSettings.disponibles.numberLength.toString()}
                        onValueChange={(value) => updateCodeSetting('disponibles', 'numberLength', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">2 dígitos (01-99)</SelectItem>
                          <SelectItem value="3">3 dígitos (001-999)</SelectItem>
                          <SelectItem value="4">4 dígitos (0001-9999)</SelectItem>
                          <SelectItem value="5">5 dígitos (00001-99999)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Opciones</Label>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="includeDate-disponibles"
                          checked={codeSettings.disponibles.includeDate}
                          onCheckedChange={(checked) => updateCodeSetting('disponibles', 'includeDate', checked)}
                        />
                        <Label htmlFor="includeDate-disponibles" className="cursor-pointer">
                          Incluir fecha (YYMMDD)
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Productos Ofertados */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Productos Ofertados</h3>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700">
                      CAT-A-0001
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Prefijo personalizado</Label>
                      <Input
                        placeholder="Ej: OFT, OFFER, etc."
                        value={codeSettings.ofertados.customPrefix}
                        onChange={(e) => updateCodeSetting('ofertados', 'customPrefix', e.target.value.toUpperCase())}
                      />
                      <p className="text-xs text-gray-500">
                        Deja vacío para usar "OFT"
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Separador</Label>
                      <Select
                        value={codeSettings.ofertados.separator}
                        onValueChange={(value) => updateCodeSetting('ofertados', 'separator', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="-">Guión (-)</SelectItem>
                          <SelectItem value="_">Guión bajo (_)</SelectItem>
                          <SelectItem value=".">Punto (.)</SelectItem>
                          <SelectItem value="none">(Sin separador)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Longitud del número</Label>
                      <Select
                        value={codeSettings.ofertados.numberLength.toString()}
                        onValueChange={(value) => updateCodeSetting('ofertados', 'numberLength', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">2 dígitos (01-99)</SelectItem>
                          <SelectItem value="3">3 dígitos (001-999)</SelectItem>
                          <SelectItem value="4">4 dígitos (0001-9999)</SelectItem>
                          <SelectItem value="5">5 dígitos (00001-99999)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Opciones</Label>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="includeDate-ofertados"
                          checked={codeSettings.ofertados.includeDate}
                          onCheckedChange={(checked) => updateCodeSetting('ofertados', 'includeDate', checked)}
                        />
                        <Label htmlFor="includeDate-ofertados" className="cursor-pointer">
                          Incluir fecha (YYMMDD)
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Configuración de Productos */}
          <TabsContent value="imagenes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2 text-emerald-600" />
                  Configuración de Productos
                </CardTitle>
                <CardDescription>
                  Configuraciones relacionadas con el manejo de productos e imágenes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Imágenes</h3>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Generar miniaturas automáticamente</Label>
                        <p className="text-xs text-gray-500">Crear versiones optimizadas de las imágenes</p>
                      </div>
                      <Checkbox
                        checked={moduleSettings.autoGenerateImages}
                        onCheckedChange={(checked) => updateModuleSetting('autoGenerateImages', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Comprimir imágenes</Label>
                        <p className="text-xs text-gray-500">Optimizar el tamaño de las imágenes</p>
                      </div>
                      <Checkbox
                        checked={moduleSettings.compressImages}
                        onCheckedChange={(checked) => updateModuleSetting('compressImages', checked)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Tamaño máximo de imagen (MB)</Label>
                      <Select
                        value={moduleSettings.maxImageSize.toString()}
                        onValueChange={(value) => updateModuleSetting('maxImageSize', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 MB</SelectItem>
                          <SelectItem value="2">2 MB</SelectItem>
                          <SelectItem value="5">5 MB</SelectItem>
                          <SelectItem value="10">10 MB</SelectItem>
                          <SelectItem value="20">20 MB</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Calidad de imagen por defecto (%)</Label>
                      <Select
                        value={moduleSettings.defaultImageQuality.toString()}
                        onValueChange={(value) => updateModuleSetting('defaultImageQuality', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="60">60% (Más compresión)</SelectItem>
                          <SelectItem value="75">75% (Balanceado)</SelectItem>
                          <SelectItem value="85">85% (Recomendado)</SelectItem>
                          <SelectItem value="95">95% (Alta calidad)</SelectItem>
                          <SelectItem value="100">100% (Sin compresión)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Formatos</h3>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Permitir múltiples formatos</Label>
                        <p className="text-xs text-gray-500">JPG, PNG, WebP, etc.</p>
                      </div>
                      <Checkbox
                        checked={moduleSettings.allowMultipleFormats}
                        onCheckedChange={(checked) => updateModuleSetting('allowMultipleFormats', checked)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Configuración General */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wrench className="h-5 w-5 mr-2 text-gray-600" />
                  Configuración General
                </CardTitle>
                <CardDescription>
                  Configuraciones generales del módulo de productos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Habilitar notificaciones</Label>
                      <p className="text-xs text-gray-500">Mostrar notificaciones de acciones</p>
                    </div>
                    <Checkbox
                      checked={moduleSettings.enableNotifications}
                      onCheckedChange={(checked) => updateModuleSetting('enableNotifications', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Guardado automático</Label>
                      <p className="text-xs text-gray-500">Guardar cambios automáticamente</p>
                    </div>
                    <Checkbox
                      checked={moduleSettings.autoSave}
                      onCheckedChange={(checked) => updateModuleSetting('autoSave', checked)}
                    />
                  </div>
                  
                  {moduleSettings.autoSave && (
                    <div className="space-y-2">
                      <Label>Intervalo de guardado automático (segundos)</Label>
                      <Select
                        value={moduleSettings.autoSaveInterval.toString()}
                        onValueChange={(value) => updateModuleSetting('autoSaveInterval', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 segundos</SelectItem>
                          <SelectItem value="30">30 segundos</SelectItem>
                          <SelectItem value="60">1 minuto</SelectItem>
                          <SelectItem value="120">2 minutos</SelectItem>
                          <SelectItem value="300">5 minutos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Barra de acciones */}
        <div className="sticky bottom-4 py-4 z-10">
          <div className="bg-white backdrop-blur-md bg-opacity-95 p-4 rounded-xl shadow-lg border border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-500 hidden md:flex items-center">
              <Info className="h-4 w-4 mr-2" />
              <span>Las configuraciones se aplicarán a todos los productos nuevos</span>
            </div>
            
            <div className="flex gap-3 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                className="rounded-lg px-6 border-gray-300 text-gray-700 hover:bg-gray-50 w-full sm:w-auto"
                onClick={resetSettings}
                disabled={isSaving}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Restablecer
              </Button>
              
              <Button
                type="button"
                className="rounded-lg px-8 bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto shadow-md transition-all duration-300 hover:shadow-lg"
                onClick={saveSettings}
                disabled={!hasChanges || isSaving}
              >
                {isSaving ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Guardando...
                  </div>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Configuración
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}