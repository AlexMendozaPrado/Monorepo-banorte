import React from 'react';
import { Modal, Input, Button } from '@banorte/ui';
import { Image, Calculator } from 'lucide-react';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GoalModal({ isOpen, onClose }: GoalModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nueva Meta de Ahorro">
      <div className="space-y-4">
        <Input
          label="Nombre de la meta"
          placeholder="Ej. Vacaciones, Auto, Casa"
        />
        <Input label="Monto objetivo" type="number" placeholder="$0.00" />
        <Input label="¿Para cuándo?" type="date" />

        <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center text-gray-400 hover:border-banorte-red hover:text-banorte-red hover:bg-red-50 transition-all cursor-pointer">
          <Image size={32} className="mb-2" />
          <span className="text-sm font-medium">
            Subir imagen inspiracional
          </span>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start gap-3">
          <Calculator className="text-blue-600 mt-1" size={20} />
          <div>
            <p className="text-sm font-bold text-blue-800">
              Calculadora de Ahorro
            </p>
            <p className="text-sm text-blue-600">
              Para lograr tu meta en la fecha seleccionada, necesitas ahorrar{' '}
              <strong className="text-blue-800">$2,500 mensualmente</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="rounded text-banorte-red focus:ring-banorte-red"
            />
            <span className="text-sm text-banorte-dark">
              Vincular con regla automática
            </span>
          </label>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="secondary" fullWidth onClick={onClose}>
            Cancelar
          </Button>
          <Button fullWidth onClick={onClose}>
            Crear Meta
          </Button>
        </div>
      </div>
    </Modal>
  );
}
