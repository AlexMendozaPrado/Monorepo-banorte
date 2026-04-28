'use client';

import React, { useCallback, useRef, useState } from 'react';
import { cn } from '../../utils/cn';
import type { TooltipProps, TooltipPlacement } from './Tooltip.types';

const placementStyles: Record<TooltipPlacement, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

const arrowStyles: Record<TooltipPlacement, string> = {
  top: 'top-full left-1/2 -translate-x-1/2 border-t-banorte-dark border-x-transparent border-b-transparent',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-banorte-dark border-x-transparent border-t-transparent',
  left: 'left-full top-1/2 -translate-y-1/2 border-l-banorte-dark border-y-transparent border-r-transparent',
  right: 'right-full top-1/2 -translate-y-1/2 border-r-banorte-dark border-y-transparent border-l-transparent',
};

/**
 * Tooltip de Banorte. Aparece al hover o focus del elemento hijo.
 * Estilos del design system: fondo banorte-dark, texto white, rounded-card,
 * shadow-card, font Roboto. Soporta contenido multilínea.
 */
export function Tooltip({
  content,
  children,
  placement = 'top',
  delayMs = 200,
  disabled = false,
  className,
  contentClassName,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(() => {
    if (disabled) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(true), delayMs);
  }, [delayMs, disabled]);

  const hide = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
  }, []);

  return (
    <span
      className={cn('relative inline-flex', className)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && content && (
        <span
          role="tooltip"
          className={cn(
            'absolute z-50 max-w-[280px] whitespace-pre-line break-words',
            'bg-banorte-dark text-white text-[11px] font-sans leading-snug',
            'px-3 py-2 rounded-card shadow-card pointer-events-none',
            placementStyles[placement],
            contentClassName,
          )}
        >
          {content}
          <span
            aria-hidden="true"
            className={cn('absolute w-0 h-0 border-4', arrowStyles[placement])}
          />
        </span>
      )}
    </span>
  );
}
