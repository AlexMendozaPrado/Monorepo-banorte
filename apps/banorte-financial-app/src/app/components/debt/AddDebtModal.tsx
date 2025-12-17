'use client';

import React from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface AddDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddDebtModal({ isOpen, onClose }: AddDebtModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar Nueva Deuda">
      <div className="space-y-4">
        <Input label="Acreedor / Institución" placeholder="Ej. Banco, Tienda..." />

        <div>
          <label className="block text-sm font-medium text-banorte-dark mb-1">
            Tipo de Deuda
          </label>
          <select className="w-full p-3 rounded-lg border border-gray-300 bg-white text-sm focus:ring-2 focus:ring-banorte-red focus:outline-none">
            <option>Tarjeta de Crédito</option>
            <option>Préstamo Personal</option>
            <option>Crédito Automotriz</option>
            <option>Hipoteca</option>
            <option>Otro</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Monto actual" type="number" placeholder="$0.00" />
          <Input label="Tasa de interés (Anual)" type="number" placeholder="%" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Pago mínimo mensual" type="number" placeholder="$0.00" />
          <Input label="Día de pago" type="number" placeholder="Ej. 15" />
        </div>

        <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-800">
          <p>
            Al registrar esta deuda, Norma generará automáticamente un plan de amortización y sugerencias de pago.
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="secondary" fullWidth onClick={onClose}>
            Cancelar
          </Button>
          <Button fullWidth onClick={onClose}>
            Registrar Deuda
          </Button>
        </div>
      </div>
    </Modal>
  );
}

