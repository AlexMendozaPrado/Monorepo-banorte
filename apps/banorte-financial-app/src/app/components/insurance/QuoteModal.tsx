'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Check } from 'lucide-react';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuoteModal({ isOpen, onClose }: QuoteModalProps) {
  const [step, setStep] = useState(1);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cotizar Seguro de Auto">
      <div className="space-y-6">
        {/* Progress */}
        <div className="flex items-center justify-between mb-6 px-4">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-banorte-red text-white' : 'bg-gray-100 text-gray-400'}`}
            >
              1
            </div>
            <span className="text-xs mt-1">Datos</span>
          </div>
          <div
            className={`flex-1 h-0.5 mx-2 ${step >= 2 ? 'bg-banorte-red' : 'bg-gray-200'}`}
          />
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-banorte-red text-white' : 'bg-gray-100 text-gray-400'}`}
            >
              2
            </div>
            <span className="text-xs mt-1">Vehículo</span>
          </div>
          <div
            className={`flex-1 h-0.5 mx-2 ${step >= 3 ? 'bg-banorte-red' : 'bg-gray-200'}`}
          />
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 3 ? 'bg-banorte-red text-white' : 'bg-gray-100 text-gray-400'}`}
            >
              3
            </div>
            <span className="text-xs mt-1">Cotización</span>
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <Input label="Código Postal" placeholder="00000" />
            <Input label="Edad del conductor" type="number" placeholder="30" />
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  className="text-banorte-red"
                  defaultChecked
                />
                <span>Masculino</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  className="text-banorte-red"
                />
                <span>Femenino</span>
              </label>
            </div>
            <Button fullWidth onClick={() => setStep(2)}>
              Siguiente
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <Input label="Marca" placeholder="Ej. Nissan" />
            <Input label="Modelo" placeholder="Ej. Versa" />
            <Input label="Año" type="number" placeholder="2020" />
            <div className="flex gap-3">
              <Button variant="secondary" fullWidth onClick={() => setStep(1)}>
                Atrás
              </Button>
              <Button fullWidth onClick={() => setStep(3)}>
                Cotizar Ahora
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <Check size={32} />
            </div>
            <h3 className="font-bold text-xl text-banorte-dark">
              ¡Cotización Lista!
            </h3>
            <p className="text-gray-500 text-sm">
              Hemos encontrado 3 opciones para ti desde $850/mes.
            </p>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-left mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-banorte-dark">
                  Banorte Amplia
                </span>
                <span className="text-banorte-red font-bold">$1,200/mes</span>
              </div>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Daños materiales (Deducible 5%)</li>
                <li>• Robo total (Deducible 10%)</li>
                <li>• Responsabilidad Civil 3M</li>
              </ul>
            </div>

            <Button fullWidth onClick={onClose}>
              Ver todas las opciones
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}

