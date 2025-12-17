import React from 'react';
import { Card } from '../ui/Card';
import {
  Sparkles,
  Fuel,
  AlertTriangle,
  PiggyBank,
  ShoppingBag,
  TrendingUp,
  Calendar,
  CreditCard,
  Loader2,
  Info
} from 'lucide-react';
import { useCardRecommendations } from '../../hooks/useCardRecommendations';

interface SmartRecommendationsProps {
  userId?: string;
  cardId?: string;
  cardName?: string;
}

const getIconForType = (type: string) => {
  switch (type) {
    case 'opportunity':
      return <TrendingUp size={20} />;
    case 'warning':
    case 'alert':
      return <AlertTriangle size={20} />;
    case 'saving':
      return <PiggyBank size={20} />;
    case 'promo':
      return <ShoppingBag size={20} />;
    default:
      return <Fuel size={20} />;
  }
};

const getColorForType = (type: string) => {
  switch (type) {
    case 'opportunity':
      return 'bg-blue-100 text-blue-600';
    case 'warning':
      return 'bg-orange-100 text-orange-600';
    case 'alert':
      return 'bg-red-100 text-red-600';
    case 'saving':
      return 'bg-green-100 text-green-600';
    case 'promo':
      return 'bg-purple-100 text-purple-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

export function SmartRecommendations({
  userId = 'user-demo',
  cardId,
  cardName = 'tu tarjeta'
}: SmartRecommendationsProps) {
  const { recommendations, loading, error, summary, totalPotentialSavings } = useCardRecommendations(userId, cardId);

  // Debug: log what we're receiving
  console.log('SmartRecommendations - recommendations:', recommendations, 'type:', typeof recommendations, 'isArray:', Array.isArray(recommendations));

  if (loading) {
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="text-banorte-red" size={20} />
          <h3 className="font-bold text-banorte-dark">Recomendaciones Inteligentes</h3>
        </div>
        <Card className="flex items-center justify-center p-8">
          <Loader2 size={24} className="animate-spin text-banorte-red" />
          <span className="ml-3 text-banorte-gray">Analizando {cardName}...</span>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="text-banorte-red" size={20} />
          <h3 className="font-bold text-banorte-dark">Recomendaciones Inteligentes</h3>
        </div>
        <Card className="bg-red-50 border border-red-100">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-red-600 mt-0.5" />
            <div>
              <p className="text-sm text-red-800 font-medium">Error al cargar recomendaciones</p>
              <p className="text-xs text-red-600 mt-1">{error}</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Ensure recommendations is an array
  const validRecommendations = Array.isArray(recommendations) ? recommendations : [];

  if (!validRecommendations || validRecommendations.length === 0) {
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="text-banorte-red" size={20} />
          <h3 className="font-bold text-banorte-dark">Recomendaciones Inteligentes</h3>
        </div>
        <Card className="bg-blue-50 border border-blue-100">
          <div className="flex items-start gap-3">
            <Info size={20} className="text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm text-blue-800 font-medium">¡Todo en orden!</p>
              <p className="text-xs text-blue-600 mt-1">
                No hay recomendaciones especiales para {cardName} en este momento. Sigue usando tu tarjeta de manera responsable.
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Show up to 4 recommendations
  const displayRecommendations = validRecommendations.slice(0, 4);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="text-banorte-red" size={20} />
          <h3 className="font-bold text-banorte-dark">Recomendaciones Inteligentes</h3>
        </div>
        {totalPotentialSavings > 0 && (
          <div className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full font-medium">
            Ahorro potencial: ${totalPotentialSavings.toLocaleString('es-MX')}
          </div>
        )}
      </div>

      {summary && (
        <Card className="mb-4 bg-blue-50 border border-blue-100">
          <p className="text-sm text-blue-800">
            <strong className="text-blue-900">Análisis de Norma:</strong> {summary}
          </p>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayRecommendations.map((rec) => (
          <Card key={rec.id} hoverEffect className="h-full">
            <div className={`w-10 h-10 rounded-lg ${getColorForType(rec.type)} flex items-center justify-center mb-3`}>
              {getIconForType(rec.type)}
            </div>
            <h4 className="font-bold text-sm text-banorte-dark mb-1">{rec.title}</h4>
            <p className="text-xs text-banorte-gray leading-relaxed">{rec.description}</p>
            {rec.potentialSavings && rec.potentialSavings > 0 && (
              <div className="mt-2 text-xs font-bold text-green-600">
                Ahorro: ${rec.potentialSavings.toLocaleString('es-MX')}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

