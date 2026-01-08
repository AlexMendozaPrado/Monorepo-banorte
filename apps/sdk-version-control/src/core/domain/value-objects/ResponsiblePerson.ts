/**
 * Rol de responsable
 */
export type ResponsibleRole = 'negocio' | 'ti' | 'ern';

export const ALL_RESPONSIBLE_ROLES: ResponsibleRole[] = ['negocio', 'ti', 'ern'];

export const RESPONSIBLE_ROLE_LABELS: Record<ResponsibleRole, string> = {
  negocio: 'Negocio',
  ti: 'TI',
  ern: 'ERN',
};

/**
 * Persona responsable de un servicio
 */
export interface ResponsiblePerson {
  name: string;
  role: ResponsibleRole;
  avatar?: string;
}

export function getResponsibleRoleLabel(role: ResponsibleRole): string {
  return RESPONSIBLE_ROLE_LABELS[role] || role;
}

/**
 * Crea un array de responsables desde campos individuales
 */
export function createResponsibleArray(
  businessName: string,
  itName: string,
  ernName: string
): ResponsiblePerson[] {
  const responsible: ResponsiblePerson[] = [];

  if (businessName) {
    responsible.push({ name: businessName, role: 'negocio' });
  }
  if (itName) {
    responsible.push({ name: itName, role: 'ti' });
  }
  if (ernName) {
    responsible.push({ name: ernName, role: 'ern' });
  }

  return responsible;
}
