/**
 * Ejemplo para demostrar la corrección del cálculo de orden de imágenes
 * Muestra cómo el orden se mantiene correctamente después de eliminar elementos
 */

import React, { useState } from 'react';
import { useOptimizedImageManager } from '../hooks/useImageMemoryManagement.js';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const ImageOrderTestExample = () => {
  const { toast } = useToast();
  const imageManager = useOptimizedImageManager(toast);
  const [testLog, setTestLog] = useState([]);

  // Función para añadir log de operaciones
  const addLog = (operation, details) => {
    const logEntry = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      operation,
      details,
      imageCount: imageManager.imagenes.length,
      orders: imageManager.imagenes.map(img => img.orden)
    };
    setTestLog(prev => [logEntry, ...prev.slice(0, 9)]); // Mantener últimas 10 operaciones
  };

  // Crear archivos de prueba
  const createTestFile = (name, size = 1024) => {
    const content = new Array(size).fill(0).map(() => String.fromCharCode(Math.floor(Math.random() * 26) + 97)).join('');
    return new File([content], name, { type: 'image/jpeg' });
  };

  // Añadir imagen de prueba
  const addTestImage = () => {
    const fileName = `test-image-${Date.now()}.jpg`;
    const file = createTestFile(fileName);
    
    const success = imageManager.addImage({
      file,
      descripcion: `Imagen de prueba ${imageManager.imagenes.length + 1}`,
      isPrimary: false
    });

    if (success) {
      addLog('ADD_IMAGE', `Añadida: ${fileName}`);
    }
  };

  // Eliminar imagen específica
  const removeTestImage = (index) => {
    const imageToRemove = imageManager.imagenes[index];
    imageManager.removeImage(index);
    addLog('REMOVE_IMAGE', `Eliminada en índice ${index}: ${imageToRemove?.file?.name || 'desconocida'}`);
  };

  // Reordenar imágenes
  const reorderTestImages = (startIndex, endIndex) => {
    const startImage = imageManager.imagenes[startIndex];
    const endImage = imageManager.imagenes[endIndex];
    
    imageManager.reorderImages(startIndex, endIndex);
    addLog('REORDER_IMAGES', `Movida "${startImage?.file?.name}" de posición ${startIndex} a ${endIndex}`);
  };

  // Test automatizado
  const runAutomatedTest = () => {
    setTestLog([]);
    addLog('TEST_START', 'Iniciando test automatizado');

    // Paso 1: Añadir 5 imágenes
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        addTestImage();
        if (i === 4) {
          // Paso 2: Eliminar imagen del medio
          setTimeout(() => {
            removeTestImage(2); // Eliminar la 3ra imagen
            
            // Paso 3: Añadir otra imagen
            setTimeout(() => {
              addTestImage();
              
              // Paso 4: Eliminar primera imagen
              setTimeout(() => {
                removeTestImage(0);
                addLog('TEST_COMPLETE', 'Test completado - verificar órdenes consecutivos');
              }, 500);
            }, 500);
          }, 500);
        }
      }, i * 200);
    }
  };

  // Verificar si los órdenes son consecutivos
  const areOrdersValid = () => {
    const orders = imageManager.imagenes.map(img => img.orden).sort((a, b) => a - b);
    for (let i = 0; i < orders.length; i++) {
      if (orders[i] !== i) return false;
    }
    return true;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Test de Orden de Imágenes</CardTitle>
          <p className="text-sm text-muted-foreground">
            Demonstración de la corrección: orden debe ser secuencial (0, 1, 2, 3...) incluso después de eliminar elementos
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Controles */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={addTestImage}>
              Añadir Imagen
            </Button>
            <Button 
              onClick={runAutomatedTest}
              variant="outline"
            >
              Test Automatizado
            </Button>
            <Button 
              onClick={() => {
                imageManager.clearAllImages();
                setTestLog([]);
                addLog('CLEAR_ALL', 'Todas las imágenes eliminadas');
              }}
              variant="destructive"
            >
              Limpiar Todo
            </Button>
          </div>

          {/* Estado actual */}
          <div className="flex items-center space-x-4">
            <Badge variant={areOrdersValid() ? "default" : "destructive"}>
              {areOrdersValid() ? '✅ Órdenes válidos' : '❌ Órdenes inválidos'}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Total imágenes: {imageManager.imagenes.length}
            </span>
            <span className="text-sm text-muted-foreground">
              Órdenes: [{imageManager.imagenes.map(img => img.orden).join(', ')}]
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de imágenes */}
        <Card>
          <CardHeader>
            <CardTitle>Imágenes Actuales</CardTitle>
          </CardHeader>
          <CardContent>
            {imageManager.imagenes.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No hay imágenes. Añade algunas para probar.
              </p>
            ) : (
              <div className="space-y-2">
                {imageManager.imagenes.map((imagen, index) => (
                  <div 
                    key={imagen.id} 
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="font-mono">
                        #{imagen.orden}
                      </Badge>
                      <div>
                        <p className="text-sm font-medium">
                          {imagen.file?.name || 'Sin nombre'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Índice en array: {index}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-1">
                      {/* Botones de reordenamiento */}
                      {index > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => reorderTestImages(index, index - 1)}
                        >
                          ↑
                        </Button>
                      )}
                      
                      {index < imageManager.imagenes.length - 1 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => reorderTestImages(index, index + 1)}
                        >
                          ↓
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeTestImage(index)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Log de operaciones */}
        <Card>
          <CardHeader>
            <CardTitle>Log de Operaciones</CardTitle>
          </CardHeader>
          <CardContent>
            {testLog.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No hay operaciones registradas.
              </p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {testLog.map((log) => (
                  <div 
                    key={log.id} 
                    className="p-2 border rounded text-xs font-mono"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">
                        {log.operation}
                      </span>
                      <span className="text-muted-foreground">
                        {log.timestamp}
                      </span>
                    </div>
                    <p className="mt-1">{log.details}</p>
                    <div className="flex justify-between mt-1 text-muted-foreground">
                      <span>Imágenes: {log.imageCount}</span>
                      <span>Órdenes: [{log.orders.join(', ')}]</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Explicación del problema y solución */}
      <Card>
        <CardHeader>
          <CardTitle>Problema y Solución</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
              <h4 className="font-semibold text-red-800 mb-2">❌ Problema Anterior</h4>
              <code className="text-sm">
                orden: imagenes.length
              </code>
              <p className="text-sm mt-2 text-red-700">
                Cuando eliminas imágenes intermedias, el orden se vuelve inconsistente:
                <br />
                Ejemplo: [0, 1, 2, 3] → eliminar #1 → [0, 2, 3] → añadir nueva → [0, 2, 3, 4]
                <br />
                ❌ Falta el orden #1
              </p>
            </div>

            <div className="p-4 border border-green-200 rounded-lg bg-green-50">
              <h4 className="font-semibold text-green-800 mb-2">✅ Solución Actual</h4>
              <code className="text-sm">
                {`// Recalcular TODOS los órdenes\nfinalImages.map((img, index) => ({\n  ...img,\n  orden: index\n}))`}
              </code>
              <p className="text-sm mt-2 text-green-700">
                Siempre mantiene secuencia consecutiva:
                <br />
                Ejemplo: [0, 1, 2, 3] → eliminar #1 → [0, 1, 2] → añadir nueva → [0, 1, 2, 3]
                <br />
                ✅ Siempre consecutivo
              </p>
            </div>
          </div>

          <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
            <h4 className="font-semibold text-blue-800 mb-2">🧪 Cómo Probar</h4>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Haz clic en "Test Automatizado" para ver el comportamiento</li>
              <li>2. Observa que los órdenes siempre permanecen consecutivos: 0, 1, 2, 3...</li>
              <li>3. Prueba eliminando imágenes del medio manualmente</li>
              <li>4. Añade nuevas imágenes y verifica que el orden es correcto</li>
              <li>5. El badge debe mostrar "✅ Órdenes válidos" siempre</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageOrderTestExample;