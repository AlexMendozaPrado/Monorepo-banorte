import type { ReactNode } from 'react';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  /** Contenido textual o JSX a mostrar dentro del tooltip. */
  content: ReactNode;
  /** Elemento o nodo que activa el tooltip al hover/focus. */
  children: ReactNode;
  /** Posición del tooltip respecto al trigger. Default: 'top'. */
  placement?: TooltipPlacement;
  /** Retraso en ms antes de mostrar al hover. Default: 200. */
  delayMs?: number;
  /** Si es true, no muestra el tooltip (útil para deshabilitar condicionalmente). */
  disabled?: boolean;
  /** Clases extra para el wrapper trigger. */
  className?: string;
  /** Clases extra para el bubble del tooltip. */
  contentClassName?: string;
}
