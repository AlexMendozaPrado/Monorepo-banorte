import React, { useState } from 'react';
import { Modal, Button, Stepper, Input } from '@banorte/ui';
import {
  Coins,
  Percent,
  Calendar,
  Sparkles,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';

interface SavingRuleWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SavingRuleWizard({ isOpen, onClose }: SavingRuleWizardProps) {
  const [step, setStep] = useState(0);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const steps = ['Tipo', 'Detalles', 'Simulación', 'Confirmar'];

  const ruleTypes = [
    {
      id: 'roundup',
      title: 'Redondeo',
      desc: 'Ahorra el cambio en cada compra',
      icon: <Coins size={24} />,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      id: 'percentage',
      title: '% Ingresos',
      desc: 'Porcentaje de tu nómina',
      icon: <Percent size={24} />,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      id: 'fixed',
      title: 'Monto Fijo',
      desc: 'Ahorro recurrente programado',
      icon: <Calendar size={24} />,
      color: 'bg-green-100 text-green-600',
    },
    {
      id: 'smart',
      title: 'Inteligente',
      desc: 'IA analiza y ahorra por ti',
      icon: <Sparkles size={24} />,
      color: 'bg-orange-100 text-orange-600',
    },
  ];

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else onClose();
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ruleTypes.map((rule) => (
              <button
                key={rule.id}
                onClick={() => setSelectedType(rule.id)}
                className={`
                  p-4 rounded-xl border-2 text-left transition-all hover:shadow-md
                  ${selectedType === rule.id ? 'border-banorte-red bg-red-50' : 'border-gray-100 hover:border-gray-200'}
                `}
              >
                <div
                  className={`w-12 h-12 rounded-lg ${rule.color} flex items-center justify-center mb-3`}
                >
                  {rule.icon}
                </div>
                <h3 className="font-bold text-banorte-dark">{rule.title}</h3>
                <p className="text-sm text-banorte-gray">{rule.desc}</p>
              </button>
            ))}
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h4 className="font-bold text-blue-800 mb-2">
                Configuración de Porcentaje
              </h4>
              <p className="text-sm text-blue-600">
                Si ganas $15,000 quincenales, ahorrarás $1,500.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-banorte-dark mb-2">
                Porcentaje a ahorrar
              </label>
              <input
                type="range"
                min="1"
                max="30"
                defaultValue="10"
                className="w-full accent-banorte-red"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1%</span>
                <span className="font-bold text-banorte-red">10%</span>
                <span>30%</span>
              </div>
            </div>

            <Input label="Cuenta Destino" placeholder="Seleccionar cuenta..." />
            <Input label="Fecha de Inicio" type="date" />
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <p className="text-xs text-green-600 uppercase font-bold">
                  En 6 meses
                </p>
                <p className="text-2xl font-bold text-green-700">$9,000</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <p className="text-xs text-blue-600 uppercase font-bold">
                  En 1 año
                </p>
                <p className="text-2xl font-bold text-blue-700">$18,000</p>
              </div>
            </div>

            <div className="h-40 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100">
              <span className="text-gray-400 text-sm">
                Gráfica de proyección aquí
              </span>
            </div>

            <p className="text-sm text-center text-banorte-gray">
              Con esta regla, alcanzarás tu fondo de emergencia en{' '}
              <strong className="text-banorte-dark">5.2 meses</strong>.
            </p>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Percent size={32} />
              </div>
              <h3 className="text-xl font-bold text-banorte-dark mb-1">
                10% de Ingresos
              </h3>
              <p className="text-banorte-gray mb-4">
                Ahorro quincenal automático
              </p>

              <div className="flex items-center justify-center gap-2 text-sm text-gray-500 bg-white p-2 rounded-lg inline-block">
                <span>Cuenta Nómina</span>
                <ArrowRight size={14} />
                <span>Fondo Emergencia</span>
              </div>
            </div>

            <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                className="mt-1 rounded text-banorte-red focus:ring-banorte-red"
              />
              <span className="text-sm text-banorte-gray">
                Confirmo que deseo activar esta regla de ahorro automático.
                Podré pausarla o cancelarla en cualquier momento.
              </span>
            </label>
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
      title="Nueva Regla de Ahorro"
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
          <Button onClick={handleNext} disabled={step === 0 && !selectedType}>
            {step === 3 ? 'Activar Regla' : 'Continuar'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
