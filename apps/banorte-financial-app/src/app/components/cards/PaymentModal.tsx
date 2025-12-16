import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Calendar, CreditCard, ArrowRight } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardName: string;
  noInterestAmount: number;
  minAmount: number;
}

export function PaymentModal({
  isOpen,
  onClose,
  cardName,
  noInterestAmount,
  minAmount,
}: PaymentModalProps) {
  const [amountType, setAmountType] = useState<'total' | 'min' | 'other'>('total');
  const [customAmount, setCustomAmount] = useState('');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Programar Pago">
      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-between border border-gray-100">
          <div className="flex items-center gap-3">
            <CreditCard className="text-banorte-red" />
            <div>
              <p className="text-xs text-gray-500">Tarjeta destino</p>
              <p className="font-bold text-banorte-dark">{cardName}</p>
            </div>
          </div>
          <ArrowRight className="text-gray-300" />
          <div className="text-right">
            <p className="text-xs text-gray-500">Cuenta origen</p>
            <p className="font-bold text-banorte-dark">Nómina ****3194</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-banorte-dark mb-3">Monto a pagar</label>
          <div className="space-y-3">
            <button
              onClick={() => setAmountType('total')}
              className={`w-full p-3 rounded-lg border flex justify-between items-center transition-all ${amountType === 'total' ? 'border-banorte-red bg-red-50 ring-1 ring-banorte-red' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <span className="text-sm font-medium">Para no generar intereses</span>
              <span className="font-bold text-banorte-dark">${noInterestAmount.toLocaleString()}</span>
            </button>

            <button
              onClick={() => setAmountType('min')}
              className={`w-full p-3 rounded-lg border flex justify-between items-center transition-all ${amountType === 'min' ? 'border-banorte-red bg-red-50 ring-1 ring-banorte-red' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <span className="text-sm font-medium">Pago mínimo</span>
              <span className="font-bold text-banorte-dark">${minAmount.toLocaleString()}</span>
            </button>

            <button
              onClick={() => setAmountType('other')}
              className={`w-full p-3 rounded-lg border flex justify-between items-center transition-all ${amountType === 'other' ? 'border-banorte-red bg-red-50 ring-1 ring-banorte-red' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <span className="text-sm font-medium">Otro monto</span>
              {amountType === 'other' ? (
                <input
                  type="number"
                  autoFocus
                  placeholder="0.00"
                  className="w-32 text-right bg-transparent border-b border-banorte-red focus:outline-none font-bold"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                />
              ) : (
                <span className="text-gray-400">Ingresar cantidad</span>
              )}
            </button>
          </div>
        </div>

        <Input
          label="Fecha de pago"
          type="date"
          defaultValue="2024-11-15"
          icon={<Calendar size={18} />}
        />

        <div className="flex items-center justify-between pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded text-banorte-red focus:ring-banorte-red" />
            <span className="text-sm text-banorte-dark">Hacer pago recurrente cada mes</span>
          </label>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-800">
          <p><strong>Impacto en presupuesto:</strong> Este pago representa el 41% de tu ingreso disponible actual.</p>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" fullWidth onClick={onClose}>Cancelar</Button>
          <Button fullWidth onClick={onClose}>Confirmar Pago</Button>
        </div>
      </div>
    </Modal>
  );
}

