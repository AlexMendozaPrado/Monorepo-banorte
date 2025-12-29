import type { Config } from 'tailwindcss';
import { banorteColors } from '../tokens/colors';
import { typography } from '../tokens/typography';
import { spacing } from '../tokens/spacing';

/**
 * Banorte Design System - Tailwind Preset
 * Preset compartido para todas las aplicaciones del monorepo
 */
export const banortePreset: Partial<Config> = {
  theme: {
    extend: {
      colors: banorteColors,
      fontFamily: typography.fontFamily,
      borderRadius: spacing.borderRadius,
      boxShadow: spacing.boxShadow,
    },
  },
};

export default banortePreset;
