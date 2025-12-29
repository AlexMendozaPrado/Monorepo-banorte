import type React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Etiqueta del input */
  label?: string;
  /** Mensaje de error */
  error?: string;
  /** Icono a mostrar dentro del input */
  icon?: React.ReactNode;
}
