/**
 * Banorte Design System - Spacing Tokens
 * borderRadius, boxShadow y otros valores de espaciado
 */

export const spacing = {
  borderRadius: {
    /** Border radius para botones */
    btn: '4px',
    /** Border radius para inputs */
    input: '6px',
    /** Border radius para cards */
    card: '8px',
  },
  boxShadow: {
    /** Sombra para cards */
    card: '0 3px 6px rgba(0,0,0,0.16)',
    /** Sombra en hover */
    hover: '0 6px 12px rgba(0,0,0,0.20)',
  },
} as const;

export type Spacing = typeof spacing;
