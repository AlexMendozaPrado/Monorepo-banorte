'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Stepper } from '../ui/Stepper';
import { Input } from '../ui/Input';
import { User, Home, Shield, PieChart } from 'lucide-react';

interface NeedsEvaluatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NeedsEvaluator({ isOpen, onClose }: NeedsEvaluatorProps) {
  const [step, setStep] = useState(0);
  const steps = ['Perfil', 'Situación', 'Objetivos', 'Reporte'];

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4 text-banorte-dark font-bold">
              <User size={20} />
              <h3>Perfil Personal</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Edad" type="number" placeholder="30" />
              <Input label="Estado Civil" placeholder="Soltero/a" />
            </div>
            <Input
              label="Dependientes Económicos"
              type="number"
              placeholder="0"
            />
            <Input
              label="Ingresos Mensuales"
              type="number"
              placeholder="$0.00"
            />
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4 text-banorte-dark font-bold">
              <Home size={20} />
              <h3>Situación Actual</h3>
            </div>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input type="checkbox" className="rounded text-banorte-red" />
                <span>¿Eres propietario de vivienda?</span>
              </label>
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input type="checkbox" className="rounded text-banorte-red" />
                <span>¿Tienes auto propio?</span>
              </label>
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input type="checkbox" className="rounded text-banorte-red" />
                <span>¿Tienes deudas significativas?</span>
              </label>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4 text-banorte-dark font-bold">
              <Shield size={20} />
              <h3>Objetivos de Protección</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Selecciona lo que más te preocupa proteger:
            </p>
            <div className="grid grid-cols-1 gap-3">
              {[
                'Proteger ingresos familiares',
                'Cubrir deudas en caso de fallecimiento',
                'Proteger patrimonio (casa/auto)',
                'Gastos médicos mayores',
              ].map((goal) => (
                <button
                  key={goal}
                  className="p-3 text-left border rounded-lg hover:border-banorte-red hover:bg-red-50 transition-colors"
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4 text-banorte-dark font-bold">
              <PieChart size={20} />
              <h3>Tu Reporte de Necesidades</h3>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h4 className="font-bold text-blue-800 mb-2">
                Recomendación Principal
              </h4>
              <p className="text-sm text-blue-600">
                Basado en tu perfil, tu prioridad #1 debería ser un{' '}
                <strong>Seguro de Gastos Médicos Mayores</strong>.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-sm text-gray-500 uppercase">
                Seguros Sugeridos
              </h4>
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <span className="font-medium">Gastos Médicos</span>
                <span className="text-banorte-red font-bold">
                  Alta Prioridad
                </span>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <span className="font-medium">Seguro de Vida</span>
                <span className="text-yellow-600 font-bold">
                  Media Prioridad
                </span>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Evaluador de Necesidades"
      maxWidth="lg"
    >
      <div className="py-2">
        <Stepper steps={steps} currentStep={step} />

        <div className="min-h-[300px] py-4">{renderStepContent()}</div>

        <div className="flex justify-between pt-4 border-t border-gray-100 mt-4">
          <Button
            variant="secondary"
            onClick={step === 0 ? onClose : handleBack}
          >
            {step === 0 ? 'Cancelar' : 'Atrás'}
          </Button>
          <Button onClick={step === 3 ? onClose : handleNext}>
            {step === 3 ? 'Ver Cotizaciones' : 'Continuar'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

