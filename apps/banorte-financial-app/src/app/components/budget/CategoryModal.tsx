import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Bell, Tag } from 'lucide-react';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: {
    id: string;
    name: string;
    budget: number;
  } | null;
}

export function CategoryModal({
  isOpen,
  onClose,
  category,
}: CategoryModalProps) {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    budget: category?.budget || '',
    alertThreshold: 80,
    notes: '',
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={category ? 'Editar Categoría' : 'Nueva Categoría'}
    >
      <div className="space-y-4">
        <Input
          label="Nombre de la categoría"
          placeholder="Ej. Alimentos, Transporte..."
          value={formData.name}
          onChange={(e) =>
            setFormData({
              ...formData,
              name: e.target.value,
            })
          }
          icon={<Tag size={18} />}
        />

        <Input
          label="Monto presupuestado"
          type="number"
          placeholder="0.00"
          value={formData.budget}
          onChange={(e) =>
            setFormData({
              ...formData,
              budget: e.target.value,
            })
          }
          icon={<span className="text-gray-400 font-bold">$</span>}
        />

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-banorte-dark flex items-center gap-2">
              <Bell size={16} className="text-banorte-gray" />
              Alerta de consumo
            </label>
            <span className="text-sm font-bold text-banorte-red">
              {formData.alertThreshold}%
            </span>
          </div>
          <input
            type="range"
            min="50"
            max="100"
            value={formData.alertThreshold}
            onChange={(e) =>
              setFormData({
                ...formData,
                alertThreshold: parseInt(e.target.value),
              })
            }
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-banorte-red"
          />
          <p className="text-xs text-gray-500 mt-2">
            Te avisaremos cuando llegues al {formData.alertThreshold}% de tu
            presupuesto.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-banorte-gray mb-1">
            Notas
          </label>
          <textarea
            className="w-full p-3 rounded-input border border-gray-300 focus:ring-2 focus:ring-banorte-red focus:border-transparent text-sm"
            rows={3}
            placeholder="Descripción opcional..."
            value={formData.notes}
            onChange={(e) =>
              setFormData({
                ...formData,
                notes: e.target.value,
              })
            }
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="secondary" fullWidth onClick={onClose}>
            Cancelar
          </Button>
          <Button fullWidth onClick={onClose}>
            Guardar Cambios
          </Button>
        </div>
      </div>
    </Modal>
  );
}

