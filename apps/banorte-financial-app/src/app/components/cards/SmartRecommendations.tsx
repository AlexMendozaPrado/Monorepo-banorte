import React from 'react';
import { Card } from '../ui/Card';
import { Sparkles, Fuel, AlertTriangle, PiggyBank, ShoppingBag } from 'lucide-react';

interface Recommendation {
  id: string;
  type: 'opportunity' | 'warning' | 'saving' | 'promo';
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export function SmartRecommendations() {
  const recommendations: Recommendation[] = [
    {
      id: '1',
      type: 'opportunity',
      title: 'Cashback en Gasolina',
      description: 'Usa esta tarjeta hoy para obtener 5% de cashback en gasolineras.',
      icon: <Fuel size={20} />,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      id: '2',
      type: 'warning',
      title: 'Uso Elevado',
      description: 'Evita compras grandes, ya has usado el 85% de tu crédito.',
      icon: <AlertTriangle size={20} />,
      color: 'bg-orange-100 text-orange-600',
    },
    {
      id: '3',
      type: 'saving',
      title: 'Ahorra Intereses',
      description: 'Puedes ahorrar $450 pagando el total antes del día 15.',
      icon: <PiggyBank size={20} />,
      color: 'bg-green-100 text-green-600',
    },
    {
      id: '4',
      type: 'promo',
      title: 'Meses Sin Intereses',
      description: 'Aprovecha hasta 12 MSI en Amazon con esta tarjeta.',
      icon: <ShoppingBag size={20} />,
      color: 'bg-purple-100 text-purple-600',
    },
  ];

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="text-banorte-red" size={20} />
        <h3 className="font-bold text-banorte-dark">Recomendaciones Inteligentes</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {recommendations.map((rec) => (
          <Card key={rec.id} hoverEffect className="h-full">
            <div className={`w-10 h-10 rounded-lg ${rec.color} flex items-center justify-center mb-3`}>
              {rec.icon}
            </div>
            <h4 className="font-bold text-sm text-banorte-dark mb-1">{rec.title}</h4>
            <p className="text-xs text-banorte-gray leading-relaxed">{rec.description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

