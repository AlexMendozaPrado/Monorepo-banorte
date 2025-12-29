'use client';

import React, { useState } from 'react';
import { Card, Button } from '@banorte/ui';
import { CheckCircle, XCircle } from 'lucide-react';

export function Quiz() {
  const [selected, setSelected] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const question = {
    text: '¿Cuál es la regla básica recomendada para dividir tu presupuesto?',
    options: [
      '80% Gastos / 20% Ahorro',
      '50% Necesidades / 30% Deseos / 20% Ahorro',
      '33% Vivienda / 33% Comida / 33% Ahorro',
      'Gastarlo todo y ahorrar lo que sobre',
    ],
    correct: 1,
  };

  const handleSubmit = () => {
    if (selected !== null) setIsSubmitted(true);
  };

  return (
    <Card className="bg-blue-50 border-blue-100">
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
          Quiz Rápido
        </span>
        <span className="text-xs text-blue-400">Pregunta 1 de 3</span>
      </div>

      <h4 className="font-bold text-banorte-dark mb-4">{question.text}</h4>

      <div className="space-y-2 mb-4">
        {question.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => !isSubmitted && setSelected(idx)}
            className={`
              w-full text-left p-3 rounded-lg text-sm transition-all border
              ${selected === idx && !isSubmitted ? 'bg-blue-100 border-blue-300 text-blue-800' : 'bg-white border-transparent hover:bg-white/80'}
              ${isSubmitted && idx === question.correct ? 'bg-green-100 border-green-300 text-green-800' : ''}
              ${isSubmitted && selected === idx && idx !== question.correct ? 'bg-red-100 border-red-300 text-red-800' : ''}
            `}
            disabled={isSubmitted}
          >
            <div className="flex justify-between items-center">
              <span>{opt}</span>
              {isSubmitted && idx === question.correct && (
                <CheckCircle size={16} />
              )}
              {isSubmitted && selected === idx && idx !== question.correct && (
                <XCircle size={16} />
              )}
            </div>
          </button>
        ))}
      </div>

      {!isSubmitted ? (
        <Button
          size="sm"
          fullWidth
          onClick={handleSubmit}
          disabled={selected === null}
        >
          Verificar Respuesta
        </Button>
      ) : (
        <div className="text-center">
          <p className="text-sm font-bold mb-2">
            {selected === question.correct ? '¡Correcto! 🎉' : 'Incorrecto 😅'}
          </p>
          <p className="text-xs text-gray-500">
            La regla 50/30/20 es un estándar financiero para equilibrar tus
            gastos.
          </p>
        </div>
      )}
    </Card>
  );
}
