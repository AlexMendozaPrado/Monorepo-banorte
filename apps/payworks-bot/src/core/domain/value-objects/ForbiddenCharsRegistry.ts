/**
 * Listas de caracteres prohibidos por servicio. Atiende la observación
 * B4 del equipo Banorte (revisión abril 2026): "Manejar 3 listas
 * distintas ya que son servicios independientes y pudieran aceptarse
 * algunos caracteres en un servicio y en otros no."
 *
 * - `BASE`: aplica al log servlet de productos sin Ventana/3DS:
 *   Tradicional, MOTO, Cargos Periódicos Post, Agregadores CE/CP,
 *   API PW2 Seguro, Interredes Remoto. Manuales B2.
 *
 * - `VENTANA_3DS`: aplica al log servlet de Ventana CE y a la capa 3DS
 *   transversal. Manual VCE v1.8 §7 + 3DS Banorte V1.4 p.6. La lista
 *   es funcionalmente idéntica entre ambos.
 *
 * - `CYBERSOURCE`: aplica a la capa Cybersource transversal. Manual
 *   Cybersource Direct V1.10 p.10 enfatiza vocales acentuadas y ñ.
 *
 * Hoy el contenido de las 3 listas coincide con el regex histórico
 * (compatibilidad). Cuando el equipo confirme las diferencias reales
 * entre servicios, se pueden ajustar individualmente sin tocar
 * `FieldRequirement` ni los call sites.
 */
export type ForbiddenCharsListName = 'BASE' | 'VENTANA_3DS' | 'CYBERSOURCE';

const BASE_REGEX = /[<>|¡!¿?*+'\/\\{}[\]"¨;:,#$%&()=áéíóúÁÉÍÓÚñÑ]/;
const VENTANA_3DS_REGEX = /[<>|¡!¿?*+'\/\\{}[\]"¨;:,#$%&()=áéíóúÁÉÍÓÚñÑ]/;
const CYBERSOURCE_REGEX = /[áéíóúÁÉÍÓÚñÑ]/;

const REGISTRY: Record<ForbiddenCharsListName, RegExp> = {
  BASE: BASE_REGEX,
  VENTANA_3DS: VENTANA_3DS_REGEX,
  CYBERSOURCE: CYBERSOURCE_REGEX,
};

export function getForbiddenCharsRegex(list: ForbiddenCharsListName = 'BASE'): RegExp {
  return REGISTRY[list];
}
