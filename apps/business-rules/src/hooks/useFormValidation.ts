'use client';

import { useState } from 'react';

// Type definitions
export interface ValidationRule {
  required?: boolean;
  email?: boolean;
  password?: boolean;
  minLength?: number;
  fieldName?: string;
}

export interface UseFormValidationReturn<T> {
  formData: T;
  errors: Partial<Record<keyof T, string>>;
  isValid: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  validateForm: () => boolean;
  resetForm: () => void;
  setFormData: React.Dispatch<React.SetStateAction<T>>;
}

export const useFormValidation = <T extends Record<string, string | boolean>>(
  initialState: T,
  validationRules: Partial<Record<keyof T, ValidationRule>> = {}
): UseFormValidationReturn<T> => {
  const [formData, setFormData] = useState<T>(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isValid, setIsValid] = useState<boolean>(false);

  const validateField = (name: keyof T, value: string): string => {
    const rule = validationRules[name];
    if (rule) {
      // Required validation
      if (rule.required && !String(value).trim()) {
        return `${rule.fieldName || String(name)} es requerido`;
      }

      // Email validation
      if (rule.email && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return 'Por favor ingresa un email válido';
        }
      }

      // Password validation
      if (rule.password && value) {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(value)) {
          return 'La contraseña debe contener al menos 8 caracteres, incluir una letra mayúscula, una letra minúscula, un número y un carácter especial';
        }
      }

      // Minimum length validation
      if (rule.minLength && value.length < rule.minLength) {
        return `${rule.fieldName || String(name)} debe tener al menos ${rule.minLength} caracteres`;
      }
    }

    return '';
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ): void => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    const checked = 'checked' in target ? target.checked : false;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Validate field on change
    if (validationRules[name as keyof T]) {
      const error = validateField(name as keyof T, String(newValue));
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let formIsValid = true;

    (Object.keys(validationRules) as Array<keyof T>).forEach(fieldName => {
      const error = validateField(fieldName, String(formData[fieldName] || ''));
      if (error) {
        newErrors[fieldName] = error;
        formIsValid = false;
      }
    });

    setErrors(newErrors);
    setIsValid(formIsValid);
    return formIsValid;
  };

  const resetForm = (): void => {
    setFormData(initialState);
    setErrors({});
    setIsValid(false);
  };

  return {
    formData,
    errors,
    isValid,
    handleInputChange,
    validateForm,
    resetForm,
    setFormData
  };
};

export default useFormValidation;
