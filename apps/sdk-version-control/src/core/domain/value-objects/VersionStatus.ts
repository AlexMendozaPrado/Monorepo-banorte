import { SemanticVersion } from './SemanticVersion';

/**
 * Estado de una versión comparada con la última disponible
 */
export type VersionStatus = 'current' | 'warning' | 'outdated' | 'critical' | 'unknown';

/**
 * Configuración visual para cada estado
 */
export const VersionStatusConfig: Record<VersionStatus, {
  label: string;
  labelEs: string;
  color: string;
  bgColor: string;
  priority: number;
}> = {
  current: {
    label: 'Up to date',
    labelEs: 'Al día',
    color: '#6CC04A',
    bgColor: 'rgba(108, 192, 74, 0.15)',
    priority: 0,
  },
  warning: {
    label: 'Minor update available',
    labelEs: 'Actualización menor',
    color: '#FFA400',
    bgColor: 'rgba(255, 164, 0, 0.15)',
    priority: 1,
  },
  outdated: {
    label: 'Outdated',
    labelEs: 'Desactualizado',
    color: '#FF671B',
    bgColor: 'rgba(255, 103, 27, 0.15)',
    priority: 2,
  },
  critical: {
    label: 'Critical update needed',
    labelEs: 'Actualización crítica',
    color: '#EB0029',
    bgColor: 'rgba(235, 0, 41, 0.15)',
    priority: 3,
  },
  unknown: {
    label: 'Unknown',
    labelEs: 'Desconocido',
    color: '#5B6670',
    bgColor: 'rgba(91, 102, 112, 0.15)',
    priority: 4,
  },
};

/**
 * Calcula el estado de una versión basado en la diferencia con la última
 *
 * Reglas:
 * - current: Versiones iguales
 * - warning: Diferencia de 1-4 versiones menores (mismo major)
 * - outdated: Diferencia de 1 major o 5+ minors
 * - critical: Diferencia de 2+ majors
 */
export function calculateVersionStatus(
  current: SemanticVersion,
  latest: SemanticVersion
): VersionStatus {
  if (current.equals(latest)) {
    return 'current';
  }

  // Si la versión actual es mayor (caso raro), está al día
  if (current.isGreaterThan(latest)) {
    return 'current';
  }

  const majorDiff = latest.major - current.major;
  const minorDiff = latest.minor - current.minor;

  // 2 o más versiones major de diferencia = crítico
  if (majorDiff >= 2) {
    return 'critical';
  }

  // 1 versión major de diferencia = desactualizado
  if (majorDiff === 1) {
    return 'outdated';
  }

  // Mismo major, verificar minor
  if (majorDiff === 0) {
    // 5 o más versiones minor = desactualizado
    if (minorDiff >= 5) {
      return 'outdated';
    }
    // 1-4 versiones minor = warning
    if (minorDiff >= 1) {
      return 'warning';
    }
  }

  // Solo diferencia de patch = al día (consideramos patches como actuales)
  return 'current';
}

/**
 * Obtiene el label en español para un estado
 */
export function getStatusLabel(status: VersionStatus, locale: 'en' | 'es' = 'es'): string {
  const config = VersionStatusConfig[status];
  return locale === 'es' ? config.labelEs : config.label;
}

/**
 * Obtiene el color para un estado
 */
export function getStatusColor(status: VersionStatus): string {
  return VersionStatusConfig[status].color;
}

/**
 * Obtiene el color de fondo para un estado
 */
export function getStatusBgColor(status: VersionStatus): string {
  return VersionStatusConfig[status].bgColor;
}

/**
 * Compara la prioridad de dos estados (mayor prioridad = más crítico)
 */
export function compareStatusPriority(a: VersionStatus, b: VersionStatus): number {
  return VersionStatusConfig[b].priority - VersionStatusConfig[a].priority;
}

/**
 * Obtiene el estado más crítico de una lista
 */
export function getMostCriticalStatus(statuses: VersionStatus[]): VersionStatus {
  if (statuses.length === 0) return 'unknown';

  return statuses.reduce((most, current) => {
    return VersionStatusConfig[current].priority > VersionStatusConfig[most].priority
      ? current
      : most;
  });
}
