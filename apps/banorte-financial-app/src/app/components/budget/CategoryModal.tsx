'use client';

import React, { useState, useEffect } from 'react';
import { Modal, ModalFooter } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export interface Category {
  id: string;
  name: string;
  budgeted: { amount: number; currency: string };
  icon?: string;
  color?: string;
}

export interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null;
  onSave?: (data: { name: string; budgeted: number; icon?: string; color?: string }) => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  category,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [budgeted, setBudgeted] = useState('');
  const [icon, setIcon] = useState('');
  const [color, setColor] = useState('#EB0029');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditMode = !!category;

  useEffect(() => {
    if (category) {
      setName(category.name);
      setBudgeted(category.budgeted.amount.toString());
      setIcon(category.icon || '');
      setColor(category.color || '#EB0029');
    } else {
      setName('');
      setBudgeted('');
      setIcon('');
      setColor('#EB0029');
    }
    setErrors({});
  }, [category, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    const budgetAmount = parseFloat(budgeted);
    if (!budgeted || isNaN(budgetAmount) || budgetAmount <= 0) {
      newErrors.budgeted = 'El presupuesto debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    if (onSave) {
      onSave({
        name: name.trim(),
        budgeted: parseFloat(budgeted),
        icon: icon.trim() || undefined,
        color: color || undefined,
      });
    }

    onClose();
  };

  const predefinedIcons = ['🍔', '🚗', '🏠', '⚡', '🎬', '💊', '🎓', '✈️', '🛒', '☕'];
  const predefinedColors = [
    '#EB0029', // Banorte Red
    '#323E48', // Banorte Dark Gray
    '#6CC04A', // Green
    '#FFA400', // Orange
    '#5B6670', // Gray
    '#9B59B6', // Purple
    '#3498DB', // Blue
    '#E74C3C', // Red
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Editar Categoría' : 'Nueva Categoría'}
      size="md"
    >
      <div className="space-y-4">
        {/* Name Input */}
        <div>
          <label className="block text-sm font-medium text-banorte-dark mb-2">
            Nombre de la categoría
          </label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Alimentación, Transporte..."
            error={errors.name}
          />
        </div>

        {/* Budget Input */}
        <div>
          <label className="block text-sm font-medium text-banorte-dark mb-2">
            Presupuesto mensual
          </label>
          <Input
            type="number"
            value={budgeted}
            onChange={(e) => setBudgeted(e.target.value)}
            placeholder="0.00"
            error={errors.budgeted}
          />
        </div>

        {/* Icon Selector */}
        <div>
          <label className="block text-sm font-medium text-banorte-dark mb-2">
            Icono (opcional)
          </label>
          <div className="grid grid-cols-5 gap-2 mb-2">
            {predefinedIcons.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setIcon(emoji)}
                className={`p-3 text-2xl rounded-lg border-2 transition-all ${
                  icon === emoji
                    ? 'border-banorte-red bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
          <Input
            type="text"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="O escribe tu propio emoji"
            maxLength={2}
          />
        </div>

        {/* Color Selector */}
        <div>
          <label className="block text-sm font-medium text-banorte-dark mb-2">
            Color (opcional)
          </label>
          <div className="grid grid-cols-4 gap-2">
            {predefinedColors.map((colorOption) => (
              <button
                key={colorOption}
                type="button"
                onClick={() => setColor(colorOption)}
                className={`h-10 rounded-lg border-2 transition-all ${
                  color === colorOption
                    ? 'border-banorte-dark scale-110'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                style={{ backgroundColor: colorOption }}
              />
            ))}
          </div>
        </div>
      </div>

      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSave}>
          {isEditMode ? 'Guardar Cambios' : 'Crear Categoría'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

