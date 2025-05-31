// /Users/clc/Ws/Appclc/pandora/src/components/ui/auth/SessionIndicator.jsx

import React from 'react';
import { Clock, Wifi, WifiOff, RefreshCw, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useSessionManager } from '@/hooks/custom/useSessionManager';

/**
 * Componente indicador de estado de sesión
 */
export const SessionIndicator = ({ 
  variant = 'compact', // 'compact', 'detailed', 'minimal'
  position = 'bottom-right', // 'top-left', 'top-right', 'bottom-left', 'bottom-right'
  showTimeLeft = true,
  showActions = true,
  className = ''
}) => {
  const {
    sessionState,
    timeLeft,
    timeLeftReadable,
    isActive,
    isRefreshing,
    extendSession,
    logout,
    config
  } = useSessionManager();

  // No mostrar si la sesión no está activa o si está configurado para no mostrar
  if (!isActive || !config.UI_CONFIG.SHOW_ACTIVITY_INDICATOR) {
    return null;
  }

  // Calcular porcentaje de tiempo restante
  const timePercentage = (timeLeft / config.AUTO_LOGOUT_TIME) * 100;
  
  // Determinar estado visual
  const getStatusVariant = () => {
    if (isRefreshing) return 'refreshing';
    if (timePercentage < 10) return 'critical';
    if (timePercentage < 25) return 'warning';
    return 'active';
  };

  const statusVariant = getStatusVariant();

  // Estilos según posición
  const positionClasses = {
    'top-left': 'fixed top-4 left-4 z-50',
    'top-right': 'fixed top-4 right-4 z-50',
    'bottom-left': 'fixed bottom-4 left-4 z-50',
    'bottom-right': 'fixed bottom-4 right-4 z-50'
  };

  // Variante minimal
  if (variant === 'minimal') {
    return (
      <div className={`${positionClasses[position]} ${className}`}>
        <Badge 
          variant={statusVariant === 'critical' ? 'destructive' : 'secondary'}
          className="flex items-center gap-1"
        >
          {isRefreshing ? (
            <RefreshCw className="h-3 w-3 animate-spin" />
          ) : statusVariant === 'critical' ? (
            <AlertTriangle className="h-3 w-3" />
          ) : (
            <Wifi className="h-3 w-3" />
          )}
          {showTimeLeft && timeLeftReadable}
        </Badge>
      </div>
    );
  }

  // Variante compact
  if (variant === 'compact') {
    return (
      <div className={`${positionClasses[position]} ${className}`}>
        <Card className="w-64 shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {isRefreshing ? (
                  <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
                ) : (
                  <Wifi className={`h-4 w-4 ${
                    statusVariant === 'critical' ? 'text-red-500' :
                    statusVariant === 'warning' ? 'text-yellow-500' :
                    'text-green-500'
                  }`} />
                )}
                <span className="text-sm font-medium">
                  {isRefreshing ? 'Renovando...' : 'Sesión activa'}
                </span>
              </div>
              
              {statusVariant === 'critical' && (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
            </div>
            
            {showTimeLeft && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Tiempo restante:</span>
                  <span className={`font-mono ${
                    statusVariant === 'critical' ? 'text-red-600' :
                    statusVariant === 'warning' ? 'text-yellow-600' :
                    'text-gray-600'
                  }`}>
                    {timeLeftReadable}
                  </span>
                </div>
                
                <Progress 
                  value={timePercentage} 
                  className="h-1"
                  color={
                    statusVariant === 'critical' ? 'red' :
                    statusVariant === 'warning' ? 'yellow' :
                    'green'
                  }
                />
              </div>
            )}
            
            {showActions && statusVariant !== 'active' && (
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={extendSession}
                  className="flex-1 h-7 text-xs"
                  disabled={isRefreshing}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Extender
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={logout}
                  className="h-7 text-xs text-gray-500"
                >
                  Salir
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Variante detailed
  return (
    <div className={`${positionClasses[position]} ${className}`}>
      <Card className="w-80 shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isRefreshing ? (
                  <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
                ) : (
                  <Wifi className={`h-5 w-5 ${
                    statusVariant === 'critical' ? 'text-red-500' :
                    statusVariant === 'warning' ? 'text-yellow-500' :
                    'text-green-500'
                  }`} />
                )}
                <h3 className="font-semibold text-gray-800">
                  Estado de Sesión
                </h3>
              </div>
              
              <Badge variant={
                statusVariant === 'critical' ? 'destructive' :
                statusVariant === 'warning' ? 'secondary' :
                'default'
              }>
                {isRefreshing ? 'Renovando' :
                 statusVariant === 'critical' ? 'Crítico' :
                 statusVariant === 'warning' ? 'Advertencia' :
                 'Activa'}
              </Badge>
            </div>
            
            {/* Session info */}
            <div className="space-y-3">
              {showTimeLeft && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Tiempo restante:</span>
                    <span className={`font-mono font-medium ${
                      statusVariant === 'critical' ? 'text-red-600' :
                      statusVariant === 'warning' ? 'text-yellow-600' :
                      'text-gray-800'
                    }`}>
                      {timeLeftReadable}
                    </span>
                  </div>
                  
                  <Progress 
                    value={timePercentage} 
                    className="h-2"
                  />
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                <div>
                  <span className="block font-medium">Última actividad:</span>
                  <span className="font-mono">
                    {new Date(sessionState.lastActivity).toLocaleTimeString()}
                  </span>
                </div>
                <div>
                  <span className="block font-medium">Auto-logout:</span>
                  <span className="font-mono">
                    {Math.floor(config.AUTO_LOGOUT_TIME / 60000)}min
                  </span>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            {showActions && (
              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <Button
                  size="sm"
                  onClick={extendSession}
                  disabled={isRefreshing}
                  className="flex-1"
                >
                  {isRefreshing ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Clock className="h-4 w-4 mr-2" />
                  )}
                  Extender sesión
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={logout}
                  className="text-gray-600"
                >
                  Cerrar sesión
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionIndicator;