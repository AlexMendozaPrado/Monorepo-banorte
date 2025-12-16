import React from 'react';
import { Card } from '../ui/Card';
import { Sparkles, ArrowRight } from 'lucide-react';

export function NormaRecommendations() {
  return (
    <Card className="bg-gradient-to-br from-banorte-red/5 to-red-50 border-banorte-red/20">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-banorte-red text-white rounded-full">
          <Sparkles size={20} />
        </div>
        <div>
          <h3 className="font-bold text-banorte-dark">Norma sugiere</h3>
          <p className="text-xs text-gray-500">Recomendaciones personalizadas</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="p-3 bg-white rounded-lg border border-gray-100 hover:border-banorte-red/30 transition-colors cursor-pointer group">
          <p className="text-sm text-banorte-dark mb-1">
            <strong>Consolida tus tarjetas</strong> en un préstamo personal al 18% y ahorra $8,500 en intereses.
          </p>
          <span className="text-xs text-banorte-red font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
            Ver opciones <ArrowRight size={12} />
          </span>
        </div>

        <div className="p-3 bg-white rounded-lg border border-gray-100 hover:border-banorte-red/30 transition-colors cursor-pointer group">
          <p className="text-sm text-banorte-dark mb-1">
            <strong>Paga $200 extra</strong> a Banorte Oro este mes y reduce 2 meses tu plazo.
          </p>
          <span className="text-xs text-banorte-red font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
            Aplicar ahora <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </Card>
  );
}

