import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { X, Settings, FileText, Eye, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

// Asumimos que tienes una forma de obtener las empresas, por ahora es un placeholder
// import { getEmpresas } from '@/api/empresas'; 

export default function ConfiguracionProformaForm({ onClose, onSave, initialData = {} }) {
  const [formData, setFormData] = useState({
    empresa_predeterminada: initialData.empresa_predeterminada || '', // Debería ser un ID o un objeto empresa
    dias_validez: initialData.dias_validez || 30,
    porcentaje_impuesto_default: initialData.porcentaje_impuesto_default || 15.00,
    texto_condiciones_pago: initialData.texto_condiciones_pago || 'Pago a 30 días de la fecha de emisión',
    texto_tiempo_entrega: initialData.texto_tiempo_entrega || 'Entrega inmediata después de aprobación',
    notas_predeterminadas: initialData.notas_predeterminadas || '',
    mostrar_logo: initialData.mostrar_logo === undefined ? true : initialData.mostrar_logo,
    mostrar_descuento: initialData.mostrar_descuento === undefined ? true : initialData.mostrar_descuento,
    mostrar_impuesto: initialData.mostrar_impuesto === undefined ? true : initialData.mostrar_impuesto,
    mostrar_codigos: initialData.mostrar_codigos === undefined ? true : initialData.mostrar_codigos,
    formato_moneda: initialData.formato_moneda || '$',
    decimales: initialData.decimales || 2,
  });

  // const [empresas, setEmpresas] = useState([]);

  // useEffect(() => {
  //   // Cargar empresas para el selector
  //   const fetchEmpresas = async () => {
  //     try {
  //       // const data = await getEmpresas(); 
  //       // setEmpresas(data);
  //       // if (data.length > 0 && !formData.empresa_predeterminada) {
  //       //   setFormData(prev => ({ ...prev, empresa_predeterminada: data[0].id }));
  //       // }
  //     } catch (error) {
  //       console.error('Error fetching empresas:', error);
  //     }
  //   };
  //   fetchEmpresas();
  // }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value,
    }));
  };

  const handleCheckboxChange = (name, checked) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí llamarías a tu API para guardar la configuración
    console.log('Datos del formulario a guardar:', formData);
    onSave(formData); 
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 overflow-y-auto" onClick={handleOverlayClick}>
      <div className="min-h-full flex items-center justify-center p-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-5xl my-4"
        >
          <Card className="w-full shadow-xl border border-slate-200/50 rounded-xl overflow-hidden bg-white/95 backdrop-blur-sm">
        <form onSubmit={handleSubmit}>
          <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-slate-50/90 z-10 border-b border-slate-200 backdrop-blur-sm">
            <div>
              <CardTitle className="text-xl text-slate-800 font-semibold">⚙️ Configuración de Proforma</CardTitle>
              <CardDescription className="text-slate-600">Personaliza los valores por defecto y cómo se muestran tus proformas.</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Cerrar" className="hover:bg-slate-100 transition-colors">
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {/* Sección: Configuración Principal */}
            <motion.div 
              className="space-y-3 p-3 border border-slate-200 rounded-lg shadow-sm bg-slate-50/30"
              whileHover={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)" }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between bg-slate-100/60 p-2 rounded-lg">
                <div className="flex items-center space-x-2 text-slate-700">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <Settings className="h-4 w-4 text-blue-600" />
                  </div>
                  <h3 className="text-base font-semibold">Valores Generales</h3>
                </div>
                <Badge variant="outline" className="bg-white text-slate-600 border-slate-300 text-xs">Paso 1</Badge>
              </div>
              <div className="p-3 rounded-lg hover:bg-white transition-all duration-200 border border-transparent hover:border-slate-200 hover:shadow-sm bg-white/60">
                <Label htmlFor="empresa_predeterminada" className="text-slate-700 font-medium text-sm">Empresa Predeterminada</Label>
                <Input 
                  id="empresa_predeterminada" 
                  name="empresa_predeterminada" 
                  value={formData.empresa_predeterminada} 
                  onChange={handleChange} 
                  placeholder="ID o Nombre de Empresa"
                  className="mt-1 border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 h-8 text-sm"
                />
                {/* <Select name="empresa_predeterminada" value={formData.empresa_predeterminada} onValueChange={(value) => setFormData(prev => ({...prev, empresa_predeterminada: value}))}> 
                  <SelectTrigger><SelectValue placeholder="Seleccione una empresa" /></SelectTrigger>
                  <SelectContent>
                    {empresas.map(empresa => (
                      <SelectItem key={empresa.id} value={empresa.id}>{empresa.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select> */}
                <p className="text-xs text-slate-500 mt-1">Define la empresa que aparecerá por defecto.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                <div className="p-2.5 rounded-lg hover:bg-white transition-all duration-200 border border-transparent hover:border-slate-200 hover:shadow-sm bg-white/60">
                  <Label htmlFor="dias_validez" className="flex items-center text-slate-700 font-medium">Días de Validez
                    <TooltipProvider>
                      <Tooltip delayDuration={100}>
                        <TooltipTrigger asChild>
                          <Info className="h-3 w-3 ml-1.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-foreground text-background text-xs">
                          <p>Tiempo por el cual la proforma será válida.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Input 
                    id="dias_validez" 
                    name="dias_validez" 
                    type="number" 
                    value={formData.dias_validez} 
                    onChange={handleChange}
                    className="mt-1 border-slate-300 h-8 text-sm focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200" 
                  />
                </div>
                <div className="p-2.5 rounded-lg hover:bg-white transition-all duration-200 border border-transparent hover:border-slate-200 hover:shadow-sm bg-white/60">
                  <Label htmlFor="porcentaje_impuesto_default" className="text-slate-700 font-medium">% Impuesto Predet.</Label>
                  <Input 
                    id="porcentaje_impuesto_default" 
                    name="porcentaje_impuesto_default" 
                    type="number" 
                    step="0.01" 
                    value={formData.porcentaje_impuesto_default} 
                    onChange={handleChange}
                    className="mt-1 border-slate-300 h-8 text-sm focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200" 
                  />
                </div>
                <div className="p-2.5 rounded-lg hover:bg-white transition-all duration-200 border border-transparent hover:border-slate-200 hover:shadow-sm bg-white/60">
                  <Label htmlFor="decimales" className="text-slate-700 font-medium">Nº Decimales</Label>
                  <Input 
                    id="decimales" 
                    name="decimales" 
                    type="number" 
                    value={formData.decimales} 
                    onChange={handleChange}
                    className="mt-1 border-slate-300 h-8 text-sm focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200" 
                  />
                </div>
              </div>
              
              <div className="pt-2 p-2.5 rounded-lg hover:bg-white transition-colors duration-150 bg-white/60 border border-transparent hover:border-slate-200 hover:shadow-sm">
                <Label htmlFor="formato_moneda" className="text-slate-700 font-medium">Símbolo de Moneda</Label>
                <Input 
                  id="formato_moneda" 
                  name="formato_moneda" 
                  value={formData.formato_moneda} 
                  onChange={handleChange} 
                  placeholder="Ej: $, €, S/"
                  className="mt-1 border-slate-300 h-8 text-sm focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200" 
                />
              </div>
            </motion.div>

            <Separator className="my-3" />

            {/* Sección: Textos Predeterminados */}
            <motion.div 
              className="space-y-3 p-3 border border-slate-200 rounded-lg shadow-sm bg-slate-50/30"
              whileHover={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)" }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between bg-slate-100/60 p-2 rounded-lg">
                <div className="flex items-center space-x-3 text-slate-700">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FileText className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="text-base font-semibold">Textos Predeterminados</h3>
                </div>
                <Badge variant="outline" className="bg-white text-slate-600 border-slate-300 text-xs">Paso 2</Badge>
              </div>
              <div className="p-2.5 rounded-lg hover:bg-white transition-all duration-200 border border-transparent hover:border-slate-200 hover:shadow-sm bg-white/60">
                <Label htmlFor="texto_condiciones_pago" className="text-slate-700 font-medium">Condiciones de Pago</Label>
                <Input 
                  id="texto_condiciones_pago" 
                  name="texto_condiciones_pago" 
                  value={formData.texto_condiciones_pago} 
                  onChange={handleChange} 
                  placeholder="Ej: Pago a 30 días de la fecha de emisión"
                  className="mt-1 border-slate-300 h-8 text-sm focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                />
                <p className="text-xs text-slate-500 mt-1">Se incluirá en todas las nuevas proformas.</p>
              </div>

              <div className="p-2.5 rounded-lg hover:bg-white transition-all duration-200 border border-transparent hover:border-slate-200 hover:shadow-sm bg-white/60">
                <Label htmlFor="texto_tiempo_entrega" className="text-slate-700 font-medium">Tiempo de Entrega</Label>
                <Input 
                  id="texto_tiempo_entrega" 
                  name="texto_tiempo_entrega" 
                  value={formData.texto_tiempo_entrega} 
                  onChange={handleChange} 
                  placeholder="Ej: Entrega inmediata después de aprobación"
                  className="mt-1 border-slate-300 h-8 text-sm focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                />
              </div>

              <div className="p-2.5 rounded-lg hover:bg-white transition-all duration-200 border border-transparent hover:border-slate-200 hover:shadow-sm bg-white/60">
                <Label htmlFor="notas_predeterminadas" className="text-slate-700 font-medium">Notas Adicionales</Label>
                <Textarea 
                  id="notas_predeterminadas" 
                  name="notas_predeterminadas" 
                  value={formData.notas_predeterminadas} 
                  onChange={handleChange} 
                  rows={3} 
                  placeholder="Información adicional, agradecimientos, etc."
                  className="mt-1 border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                />
              </div>
            </motion.div>

            <Separator className="my-3" />

            {/* Sección: Opciones de Visualización */}
            <motion.div 
              className="space-y-3 p-3 border border-slate-200 rounded-lg shadow-sm bg-slate-50/30"
              whileHover={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)" }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between bg-slate-100/60 p-2 rounded-lg">
                <div className="flex items-center space-x-3 text-slate-700">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Eye className="h-5 w-5 text-orange-600" />
                  </div>
                  <h3 className="text-base font-semibold">Opciones de Visualización en PDF</h3>
                </div>
                <Badge variant="outline" className="bg-white text-slate-600 border-slate-300 text-xs">Paso 3</Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 pt-1">
              <div className="flex items-center space-x-3 p-2.5 rounded-lg hover:bg-white transition-all duration-200 border border-transparent hover:border-slate-200 hover:shadow-sm bg-white/60">
                <Checkbox 
                  id="mostrar_logo" 
                  name="mostrar_logo" 
                  checked={formData.mostrar_logo} 
                  onCheckedChange={(checked) => handleCheckboxChange('mostrar_logo', checked)}
                  className="data-[state=checked]:bg-blue-500 data-[state=checked]:text-white border-slate-300 transition-all duration-200" 
                />
                <Label htmlFor="mostrar_logo" className="text-slate-700 font-medium cursor-pointer">Mostrar Logo</Label>
              </div>
              <div className="flex items-center space-x-3 p-2.5 rounded-lg hover:bg-white transition-all duration-200 border border-transparent hover:border-slate-200 hover:shadow-sm bg-white/60">
                <Checkbox 
                  id="mostrar_descuento" 
                  name="mostrar_descuento" 
                  checked={formData.mostrar_descuento} 
                  onCheckedChange={(checked) => handleCheckboxChange('mostrar_descuento', checked)}
                  className="data-[state=checked]:bg-blue-500 data-[state=checked]:text-white border-slate-300 transition-all duration-200" 
                />
                <Label htmlFor="mostrar_descuento" className="text-slate-700 font-medium cursor-pointer">Mostrar Descuento</Label>
              </div>
              <div className="flex items-center space-x-3 p-2.5 rounded-lg hover:bg-white transition-all duration-200 border border-transparent hover:border-slate-200 hover:shadow-sm bg-white/60">
                <Checkbox 
                  id="mostrar_impuesto" 
                  name="mostrar_impuesto" 
                  checked={formData.mostrar_impuesto} 
                  onCheckedChange={(checked) => handleCheckboxChange('mostrar_impuesto', checked)}
                  className="data-[state=checked]:bg-blue-500 data-[state=checked]:text-white border-slate-300 transition-all duration-200" 
                />
                <Label htmlFor="mostrar_impuesto" className="text-slate-700 font-medium cursor-pointer">Mostrar Impuesto</Label>
              </div>
              <div className="flex items-center space-x-3 p-2.5 rounded-lg hover:bg-white transition-all duration-200 border border-transparent hover:border-slate-200 hover:shadow-sm bg-white/60">
                <Checkbox 
                  id="mostrar_codigos" 
                  name="mostrar_codigos" 
                  checked={formData.mostrar_codigos} 
                  onCheckedChange={(checked) => handleCheckboxChange('mostrar_codigos', checked)}
                  className="data-[state=checked]:bg-blue-500 data-[state=checked]:text-white border-slate-300 transition-all duration-200" 
                />
                <Label htmlFor="mostrar_codigos" className="text-slate-700 font-medium cursor-pointer">Mostrar Códigos</Label>
              </div>
              </div> {/* Cierre del div.grid para checkboxes */}
            </motion.div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-3 bg-slate-50/80 border-t border-slate-200 pt-3 pb-3 backdrop-blur-sm">
            <Button type="button" variant="outline" onClick={onClose} className="border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200">
              Cancelar
            </Button>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all duration-200">
                Guardar Configuración
              </Button>
            </motion.div>
          </CardFooter>
        </form>
        </Card>
        </motion.div>
      </div>
    </div>
  );
}
