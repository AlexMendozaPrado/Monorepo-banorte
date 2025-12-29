import type React from 'react';

export interface ModalProps {
  /** Estado de apertura del modal */
  isOpen: boolean;
  /** Callback al cerrar */
  onClose: () => void;
  /** Título del modal */
  title: string;
  /** Contenido del modal */
  children: React.ReactNode;
  /** Ancho máximo del modal */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}
