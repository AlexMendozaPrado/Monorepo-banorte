export interface StepperProps {
  /** Lista de pasos */
  steps: string[];
  /** Paso actual (índice basado en 0) */
  currentStep: number;
}
