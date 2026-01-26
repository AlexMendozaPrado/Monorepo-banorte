/**
 * Tipo de canal de Banorte
 */
export type ChannelType =
  | 'banorte-movil'
  | 'banorte-contrata'
  | 'casa-de-bolsa'
  | 'sgv1-up-tdc'
  | 'autoservicio-persona-moral'
  | 'mbio-web'
  | 'banortec'
  | 'auto-en-linea'
  | 'banorte-movil-jovenes-sigma';

/**
 * Estado del canal
 */
export type ChannelStatus = 'productivo' | 'piloto' | 'desarrollo';

/**
 * Todos los canales disponibles
 */
export const ALL_CHANNELS: ChannelType[] = [
  'banorte-movil',
  'banorte-contrata',
  'casa-de-bolsa',
  'sgv1-up-tdc',
  'autoservicio-persona-moral',
  'mbio-web',
  'banortec',
  'auto-en-linea',
  'banorte-movil-jovenes-sigma',
];

/**
 * Labels para mostrar los canales
 */
export const CHANNEL_LABELS: Record<ChannelType, string> = {
  'banorte-movil': 'Banorte Móvil',
  'banorte-contrata': 'Banorte Contrata',
  'casa-de-bolsa': 'Casa de Bolsa',
  'sgv1-up-tdc': 'SGV-1 UP TDC',
  'autoservicio-persona-moral': 'Autoservicio Persona Moral',
  'mbio-web': 'MBIO Web',
  'banortec': 'Banortec',
  'auto-en-linea': 'Auto en Línea',
  'banorte-movil-jovenes-sigma': 'Banorte Móvil Jóvenes Sigma',
};

/**
 * Abreviaciones cortas para los canales
 */
export const CHANNEL_SHORT_LABELS: Record<ChannelType, string> = {
  'banorte-movil': 'BM',
  'banorte-contrata': 'BC',
  'casa-de-bolsa': 'CdB',
  'sgv1-up-tdc': 'SGV1',
  'autoservicio-persona-moral': 'APM',
  'mbio-web': 'MBIO',
  'banortec': 'BTEC',
  'auto-en-linea': 'AEL',
  'banorte-movil-jovenes-sigma': 'BMJS',
};

/**
 * Labels para estado del canal
 */
export const CHANNEL_STATUS_LABELS: Record<ChannelStatus, string> = {
  productivo: 'Productivo',
  piloto: 'Piloto',
  desarrollo: 'Desarrollo',
};

/**
 * Colores para estado del canal
 */
export const CHANNEL_STATUS_COLORS: Record<ChannelStatus, string> = {
  productivo: '#6CC04A',
  piloto: '#FFA400',
  desarrollo: '#3B82F6',
};

/**
 * Interfaz para un canal con su versión
 */
export interface ChannelVersion {
  channel: ChannelType;
  version: string;
  status: ChannelStatus;
}

/**
 * Obtiene el label de un canal
 */
export function getChannelLabel(channel: ChannelType): string {
  return CHANNEL_LABELS[channel] || channel;
}

/**
 * Obtiene el label corto de un canal
 */
export function getChannelShortLabel(channel: ChannelType): string {
  return CHANNEL_SHORT_LABELS[channel] || channel.substring(0, 3).toUpperCase();
}

/**
 * Obtiene el label del estado del canal
 */
export function getChannelStatusLabel(status: ChannelStatus): string {
  return CHANNEL_STATUS_LABELS[status] || status;
}

/**
 * Obtiene el color del estado del canal
 */
export function getChannelStatusColor(status: ChannelStatus): string {
  return CHANNEL_STATUS_COLORS[status] || '#9CA3AF';
}
