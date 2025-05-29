import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Palette, Check, Download } from 'lucide-react';

const TemplateSelector = ({ 
  isOpen, 
  onClose, 
  onSelect,
  availableTemplates = [],
  selectedTemplate = 'classic',
  isGenerating = false
}) => {
  const [hoveredTemplate, setHoveredTemplate] = useState(null);

  // Default templates if none provided
  const defaultTemplates = [
    {
      nombre: 'classic',
      descripcion: 'Plantilla clásica profesional con colores azules',
      preview: 'Diseño conservador y formal',
      color: 'blue',
      features: ['Encabezado profesional', 'Tabla estructurada', 'Pie de página completo']
    },
    {
      nombre: 'modern',
      descripcion: 'Plantilla moderna minimalista con colores verdes',
      preview: 'Diseño contemporáneo y limpio',
      color: 'green',
      features: ['Diseño minimalista', 'Tipografía moderna', 'Espaciado optimizado']
    }
  ];

  const templates = availableTemplates.length > 0 ? availableTemplates : defaultTemplates;

  const getColorClasses = (color) => {
    const colorMap = {
      blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-700',
        accent: 'bg-blue-500',
        hover: 'hover:border-blue-300'
      },
      green: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-700',
        accent: 'bg-green-500',
        hover: 'hover:border-green-300'
      }
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-blue-600" />
            Seleccionar Plantilla de PDF
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Elige el estilo de plantilla para generar tu PDF de proforma:
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {templates.map((template) => {
              const colors = getColorClasses(template.color);
              const isSelected = selectedTemplate === template.nombre;
              
              return (
                <motion.div
                  key={template.nombre}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? `${colors.border} border-2 ring-2 ring-offset-2 ring-${template.color}-500/20` 
                        : `border hover:shadow-md ${colors.hover}`
                    }`}
                    onClick={() => onSelect(template.nombre)}
                    onMouseEnter={() => setHoveredTemplate(template.nombre)}
                    onMouseLeave={() => setHoveredTemplate(null)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${colors.accent}`} />
                          {template.nombre.charAt(0).toUpperCase() + template.nombre.slice(1)}
                          {isSelected && (
                            <Check className="h-4 w-4 text-green-600" />
                          )}
                        </CardTitle>
                        <Badge 
                          variant="secondary" 
                          className={`${colors.bg} ${colors.text} border-0`}
                        >
                          {template.color === 'blue' ? 'Profesional' : 'Moderno'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {template.descripcion}
                      </p>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-3">
                        <div className={`p-3 rounded-lg ${colors.bg} border ${colors.border}`}>
                          <p className="text-sm font-medium text-gray-700 mb-2">Vista Previa:</p>
                          <p className="text-sm text-gray-600">{template.preview}</p>
                        </div>

                        {template.features && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Características:</p>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {template.features.map((feature, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <div className={`w-1.5 h-1.5 rounded-full ${colors.accent}`} />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <motion.div 
                          className="mt-3"
                          initial={{ opacity: 0 }}
                          animate={{ 
                            opacity: hoveredTemplate === template.nombre || isSelected ? 1 : 0 
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className={`h-20 rounded-md ${colors.bg} border-2 border-dashed ${colors.border} flex items-center justify-center`}>
                            <FileText className={`h-8 w-8 ${colors.text}`} />
                          </div>
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={isGenerating}
            >
              Cancelar
            </Button>
            <Button 
              onClick={() => onSelect(selectedTemplate)}
              disabled={isGenerating || !selectedTemplate}
              className="min-w-[140px]"
            >
              {isGenerating ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="mr-2"
                  >
                    <Download className="h-4 w-4" />
                  </motion.div>
                  Generando...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Generar PDF
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateSelector;