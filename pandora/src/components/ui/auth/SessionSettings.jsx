// /Users/clc/Ws/Appclc/pandora/src/components/ui/auth/SessionSettings.jsx

import React, { useState, useEffect } from 'react';
import { Settings, Clock, Bell, Shield, Save, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { getAuthConfig, TIME_UTILS } from '@/config/auth';

/**
 * Componente para configuración de sesión del usuario
 */
export const SessionSettings = ({ className = '' }) => {
  const { toast } = useToast();
  const defaultConfig = getAuthConfig();
  
  // Estado de configuración
  const [settings, setSettings] = useState({
    // Tiempos de sesión (en minutos)
    autoLogoutTime: 30,
    sessionWarningTime: 2,
    tokenRefreshInterval: 5,
    
    // Comportamiento
    showSessionWarnings: true,
    showActivityIndicator: true,
    autoSaveForms: true,
    rememberLastPage: true,
    logoutConfirmation: true,
    
    // UI
    sessionTimerVisible: false,
    indicatorPosition: 'bottom-right',
    indicatorVariant: 'compact'
  });

  // Cargar configuración guardada
  useEffect(() => {
    const savedSettings = localStorage.getItem('session_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error cargando configuración de sesión:', error);
      }
    }
  }, []);

  // Guardar configuración
  const saveSettings = () => {
    try {
      localStorage.setItem('session_settings', JSON.stringify(settings));
      toast({
        title: 'Configuración guardada',
        description: 'Los cambios se aplicarán en la próxima sesión.',
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar la configuración.',
        variant: 'destructive'
      });
    }
  };

  // Restaurar configuración por defecto
  const resetToDefaults = () => {
    setSettings({
      autoLogoutTime: 30,
      sessionWarningTime: 2,
      tokenRefreshInterval: 5,
      showSessionWarnings: true,
      showActivityIndicator: true,
      autoSaveForms: true,
      rememberLastPage: true,
      logoutConfirmation: true,
      sessionTimerVisible: false,
      indicatorPosition: 'bottom-right',
      indicatorVariant: 'compact'
    });
    
    toast({
      title: 'Configuración restaurada',
      description: 'Se han restaurado los valores por defecto.',
      variant: 'default'
    });
  };

  // Actualizar configuración
  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-800">
            Configuración de Sesión
          </h2>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={resetToDefaults}
            className="text-gray-600"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Restaurar
          </Button>
          <Button
            size="sm"
            onClick={saveSettings}
          >
            <Save className="h-4 w-4 mr-2" />
            Guardar
          </Button>
        </div>
      </div>

      {/* Tiempos de sesión */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Tiempos de Sesión
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Auto logout */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Tiempo de logout automático: {settings.autoLogoutTime} minutos
            </Label>
            <Slider
              value={[settings.autoLogoutTime]}
              onValueChange={([value]) => updateSetting('autoLogoutTime', value)}
              max={120}
              min={5}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>5 min</span>
              <span>2 horas</span>
            </div>
          </div>

          {/* Session warning */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Advertencia antes del logout: {settings.sessionWarningTime} minutos
            </Label>
            <Slider
              value={[settings.sessionWarningTime]}
              onValueChange={([value]) => updateSetting('sessionWarningTime', value)}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>1 min</span>
              <span>10 min</span>
            </div>
          </div>

          {/* Token refresh */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Intervalo de renovación de token: {settings.tokenRefreshInterval} minutos
            </Label>
            <Slider
              value={[settings.tokenRefreshInterval]}
              onValueChange={([value]) => updateSetting('tokenRefreshInterval', value)}
              max={15}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>1 min</span>
              <span>15 min</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comportamiento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Comportamiento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Mostrar advertencias de sesión</Label>
              <p className="text-xs text-gray-500">
                Notificar antes de que expire la sesión
              </p>
            </div>
            <Switch
              checked={settings.showSessionWarnings}
              onCheckedChange={(checked) => updateSetting('showSessionWarnings', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Auto-guardar formularios</Label>
              <p className="text-xs text-gray-500">
                Guardar automáticamente borradores de formularios
              </p>
            </div>
            <Switch
              checked={settings.autoSaveForms}
              onCheckedChange={(checked) => updateSetting('autoSaveForms', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Recordar última página</Label>
              <p className="text-xs text-gray-500">
                Volver a la última página visitada después del login
              </p>
            </div>
            <Switch
              checked={settings.rememberLastPage}
              onCheckedChange={(checked) => updateSetting('rememberLastPage', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Confirmar logout</Label>
              <p className="text-xs text-gray-500">
                Pedir confirmación antes de cerrar sesión
              </p>
            </div>
            <Switch
              checked={settings.logoutConfirmation}
              onCheckedChange={(checked) => updateSetting('logoutConfirmation', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Interfaz */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-purple-600" />
            Interfaz de Usuario
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Mostrar indicador de sesión</Label>
              <p className="text-xs text-gray-500">
                Mostrar estado de la sesión en la interfaz
              </p>
            </div>
            <Switch
              checked={settings.showActivityIndicator}
              onCheckedChange={(checked) => updateSetting('showActivityIndicator', checked)}
            />
          </div>

          {settings.showActivityIndicator && (
            <>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Posición del indicador</Label>
                <Select
                  value={settings.indicatorPosition}
                  onValueChange={(value) => updateSetting('indicatorPosition', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top-left">Superior izquierda</SelectItem>
                    <SelectItem value="top-right">Superior derecha</SelectItem>
                    <SelectItem value="bottom-left">Inferior izquierda</SelectItem>
                    <SelectItem value="bottom-right">Inferior derecha</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Estilo del indicador</Label>
                <Select
                  value={settings.indicatorVariant}
                  onValueChange={(value) => updateSetting('indicatorVariant', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minimal">Minimal</SelectItem>
                    <SelectItem value="compact">Compacto</SelectItem>
                    <SelectItem value="detailed">Detallado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Mostrar timer de sesión</Label>
              <p className="text-xs text-gray-500">
                Mostrar tiempo restante visible en la interfaz
              </p>
            </div>
            <Switch
              checked={settings.sessionTimerVisible}
              onCheckedChange={(checked) => updateSetting('sessionTimerVisible', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Información actual */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">Configuración Actual</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium text-blue-700">Logout automático:</span>
              <p className="text-blue-600">{TIME_UTILS.msToReadable(settings.autoLogoutTime * 60 * 1000)}</p>
            </div>
            <div>
              <span className="font-medium text-blue-700">Advertencia:</span>
              <p className="text-blue-600">{TIME_UTILS.msToReadable(settings.sessionWarningTime * 60 * 1000)}</p>
            </div>
            <div>
              <span className="font-medium text-blue-700">Renovación:</span>
              <p className="text-blue-600">{TIME_UTILS.msToReadable(settings.tokenRefreshInterval * 60 * 1000)}</p>
            </div>
            <div>
              <span className="font-medium text-blue-700">Indicador:</span>
              <p className="text-blue-600">
                {settings.showActivityIndicator ? `${settings.indicatorVariant} - ${settings.indicatorPosition}` : 'Deshabilitado'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionSettings;