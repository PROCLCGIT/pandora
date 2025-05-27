import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  Clock, 
  Package, 
  X,
  CheckCircle2
} from 'lucide-react';
import { inventoryApi } from '../api/inventoryApi';
import { formatDate } from '../utils/formatters';
import { toast } from 'sonner';

const StockAlerts = () => {
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAlertas = async () => {
    setLoading(true);
    try {
      const response = await inventoryApi.getAlertas({ leida: false });
      setAlertas(response.data);
    } catch (error) {
      toast.error('Error al cargar alertas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlertas();
  }, []);

  const marcarComoLeida = async (alertaId) => {
    try {
      await inventoryApi.marcarAlertaLeida(alertaId);
      setAlertas(alertas.filter(a => a.id !== alertaId));
      toast.success('Alerta marcada como leída');
    } catch (error) {
      toast.error('Error al marcar alerta');
    }
  };

  const marcarTodasLeidas = async () => {
    try {
      await inventoryApi.marcarTodasLeidas();
      setAlertas([]);
      toast.success('Todas las alertas marcadas como leídas');
    } catch (error) {
      toast.error('Error al marcar alertas');
    }
  };

  const getAlertIcon = (tipo) => {
    switch (tipo) {
      case 'minimo':
      case 'agotado':
        return <AlertTriangle className="h-4 w-4" />;
      case 'vencimiento':
        return <Clock className="h-4 w-4" />;
      case 'maximo':
        return <Package className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getAlertVariant = (tipo) => {
    switch (tipo) {
      case 'agotado':
        return 'destructive';
      case 'minimo':
      case 'vencimiento':
        return 'warning';
      case 'maximo':
        return 'default';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Alertas de Stock</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">Cargando alertas...</p>
        </CardContent>
      </Card>
    );
  }

  if (alertas.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Alertas de Stock</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <CheckCircle2 className="mr-2 h-5 w-5" />
            <p>No hay alertas pendientes</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Alertas de Stock ({alertas.length})</CardTitle>
        <Button 
          variant="outline" 
          size="sm"
          onClick={marcarTodasLeidas}
        >
          Marcar todas como leídas
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {alertas.map((alerta) => (
            <Alert key={alerta.id} variant={getAlertVariant(alerta.tipo_alerta)}>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2">
                  {getAlertIcon(alerta.tipo_alerta)}
                  <div className="flex-1">
                    <AlertTitle className="text-sm font-medium">
                      {alerta.tipo_alerta === 'minimo' && 'Stock Mínimo'}
                      {alerta.tipo_alerta === 'agotado' && 'Stock Agotado'}
                      {alerta.tipo_alerta === 'vencimiento' && 'Próximo a Vencer'}
                      {alerta.tipo_alerta === 'maximo' && 'Stock Máximo Excedido'}
                    </AlertTitle>
                    <AlertDescription className="text-sm">
                      {alerta.mensaje}
                    </AlertDescription>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(alerta.created_at)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => marcarComoLeida(alerta.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </Alert>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StockAlerts;
