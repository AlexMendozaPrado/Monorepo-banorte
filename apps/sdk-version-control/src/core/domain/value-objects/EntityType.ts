/**
 * Tipo de entidad: Banco o Filial
 */
export type EntityType = 'banco' | 'filial';

export const ALL_ENTITY_TYPES: EntityType[] = ['banco', 'filial'];

export const ENTITY_TYPE_LABELS: Record<EntityType, string> = {
  banco: 'Banco',
  filial: 'Filial',
};

export const ENTITY_TYPE_COLORS: Record<EntityType, string> = {
  banco: '#EC0029',
  filial: '#3B82F6',
};

export function getEntityTypeLabel(entity: EntityType): string {
  return ENTITY_TYPE_LABELS[entity] || entity;
}

export function getEntityTypeColor(entity: EntityType): string {
  return ENTITY_TYPE_COLORS[entity] || '#9CA3AF';
}
