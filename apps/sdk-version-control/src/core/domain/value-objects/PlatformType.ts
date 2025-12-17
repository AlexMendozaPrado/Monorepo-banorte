/**
 * Tipo de plataforma soportada
 */
export type PlatformType = 'web' | 'ios' | 'android';

/**
 * Constantes para tipos de plataforma
 */
export const PlatformTypes = {
  WEB: 'web' as PlatformType,
  IOS: 'ios' as PlatformType,
  ANDROID: 'android' as PlatformType,
} as const;

/**
 * Lista de todas las plataformas
 */
export const ALL_PLATFORMS: PlatformType[] = ['web', 'ios', 'android'];

/**
 * Valida si un string es un tipo de plataforma válido
 */
export function isValidPlatform(platform: string): platform is PlatformType {
  return ALL_PLATFORMS.includes(platform as PlatformType);
}

/**
 * Obtiene el nombre de display para una plataforma
 */
export function getPlatformDisplayName(platform: PlatformType): string {
  const names: Record<PlatformType, string> = {
    web: 'Web',
    ios: 'iOS',
    android: 'Android',
  };
  return names[platform];
}

/**
 * Obtiene el ícono para una plataforma (nombre de lucide-react)
 */
export function getPlatformIcon(platform: PlatformType): string {
  const icons: Record<PlatformType, string> = {
    web: 'Globe',
    ios: 'Smartphone',
    android: 'TabletSmartphone',
  };
  return icons[platform];
}

/**
 * Información completa de una plataforma
 */
export interface PlatformInfo {
  type: PlatformType;
  displayName: string;
  icon: string;
}

/**
 * Obtiene información completa de una plataforma
 */
export function getPlatformInfo(platform: PlatformType): PlatformInfo {
  return {
    type: platform,
    displayName: getPlatformDisplayName(platform),
    icon: getPlatformIcon(platform),
  };
}
