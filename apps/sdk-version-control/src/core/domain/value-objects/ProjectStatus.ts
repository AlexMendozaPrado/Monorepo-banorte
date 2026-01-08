/**
 * Estado del proyecto de implementación
 */
export type ProjectStatus = 'productivo' | 'piloto' | 'desarrollo' | 'iniciativa';

export const ALL_PROJECT_STATUSES: ProjectStatus[] = [
  'productivo',
  'piloto',
  'desarrollo',
  'iniciativa',
];

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  productivo: 'Productivo',
  piloto: 'Piloto',
  desarrollo: 'Desarrollo',
  iniciativa: 'Iniciativa',
};

export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  productivo: '#6CC04A',
  piloto: '#FFA400',
  desarrollo: '#3B82F6',
  iniciativa: '#9CA3AF',
};

export function getProjectStatusLabel(status: ProjectStatus): string {
  return PROJECT_STATUS_LABELS[status] || status;
}

export function getProjectStatusColor(status: ProjectStatus): string {
  return PROJECT_STATUS_COLORS[status] || '#9CA3AF';
}
