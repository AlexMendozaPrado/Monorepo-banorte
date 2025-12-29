/**
 * Banorte Design System - Color Tokens
 * Paleta de colores oficial de Banorte
 */

export const banorteColors = {
  /** Colores de marca Banorte */
  banorte: {
    /** Color principal de marca - Rojo Banorte */
    red: '#EB0029',
    /** Texto secundario */
    gray: '#5B6670',
    /** Texto principal */
    dark: '#323E48',
    /** Background principal */
    bg: '#EBF0F2',
    /** Background alternativo */
    light: '#F4F7F8',
    /** Blanco personalizado */
    white: '#FCFCFC',
  },
  /** Colores de estado */
  status: {
    /** Verde - Éxito */
    success: '#6CC04A',
    /** Naranja - Advertencia */
    warning: '#FFA400',
    /** Rojo - Error/Alerta */
    alert: '#FF671B',
  },
} as const;

export type BanorteColors = typeof banorteColors;
