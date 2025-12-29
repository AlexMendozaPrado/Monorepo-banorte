export interface ProgressBarProps {
  /** Valor actual */
  value: number;
  /** Valor máximo */
  max?: number;
  /** Color de la barra */
  color?: 'primary' | 'success' | 'warning' | 'alert' | 'secondary';
  /** Altura de la barra */
  height?: 'sm' | 'md' | 'lg';
  /** Mostrar etiqueta */
  showLabel?: boolean;
  /** Texto de la etiqueta */
  label?: string;
  className?: string;
}
