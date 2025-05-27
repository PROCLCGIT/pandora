import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Package, 
  AlertTriangle, 
  TrendingDown, 
  DollarSign,
  Warehouse,
  PackageX
} from 'lucide-react';
import { formatCurrency, formatNumber } from '../utils/formatters';

const StockOverview = ({ resumen }) => {
  if (!resumen) return null;

  const cards = [
    {
      title: "Total Productos",
      value: formatNumber(resumen.total_productos),
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Valor Total",
      value: formatCurrency(resumen.valor_total),
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Stock Crítico",
      value: formatNumber(resumen.alertas.criticos),
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Productos Agotados",
      value: formatNumber(resumen.alertas.agotados),
      icon: PackageX,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StockOverview;
