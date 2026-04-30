import { IntegrationType } from '../value-objects/IntegrationType';

/**
 * Modificadores que afectan el sufijo del folio. Se derivan de las capas
 * activas detectadas en la sesión (3DS, Cybersource) y de banderas de la
 * solicitud (VIP, recertificación).
 */
export interface FolioModifiers {
  has3DS?: boolean;
  hasCybersource?: boolean;
  isVIP?: boolean;
  isRecertification?: boolean;
  /**
   * Modificador opcional de canal (`applePay`, `cybersourceEnterpriseManual`,
   * `cybersourceEnterprise3D`, `integrador`, `contactless`). Se compara
   * literal contra el campo `match.modifier` de la entrada en el config.
   */
  modifier?: string;
}

export interface FolioInput extends FolioModifiers {
  integrationType: IntegrationType;
  /** Secuencial entero — el caller decide la fuente (e.g. count del repo). */
  sequential: number;
  /** ID de afiliación opcional para el sufijo `_{idAfiliacion}` del folio. */
  idAfiliacion?: string;
}

/**
 * Resultado de la generación. Incluye el folio final, el `label` legible
 * (e.g. "VIP Agregador Comercio Electrónico") y un flag `pendingFromTeam`
 * cuando no hay match (caso TP no-agregador hoy).
 */
export interface FolioResult {
  folio: string;
  label: string;
  prefix: string;
  pendingFromTeam: boolean;
}

interface NomenclatureMatch {
  integrationType?: string;
  has3DS?: boolean;
  hasCybersource?: boolean;
  isVIP?: boolean;
  modifier?: string;
}

interface NomenclatureEntry {
  match: NomenclatureMatch;
  label: string;
  prefix: string;
  recertPrefix: string;
  padding: number;
}

interface NomenclaturesConfig {
  ecomm: NomenclatureEntry[];
  vip: NomenclatureEntry[];
  agregadores: { label: string; code: string }[];
  pendingFromTeam: string[];
}

/**
 * Genera folios oficiales de certificación Payworks aplicando las
 * nomenclaturas entregadas por el equipo Banorte (NOMENCLATURAS FOLIOS LABS).
 *
 * Cuando no hay match (típico en Tarjeta Presente estándar — pendiente del
 * equipo) devuelve un folio placeholder marcado `pendingFromTeam: true`
 * para que la UI/PDF puedan mostrar el estado claramente.
 */
export class FolioGenerator {
  constructor(private readonly config: NomenclaturesConfig) {}

  generate(input: FolioInput): FolioResult {
    const matched = this.findMatch(input);

    if (!matched) {
      return {
        folio: `PENDIENTE-${input.integrationType}-${this.padSequential(input.sequential, 7)}`,
        label: `Pendiente nomenclatura: ${input.integrationType}`,
        prefix: 'PENDIENTE',
        pendingFromTeam: true,
      };
    }

    const prefix = input.isRecertification ? matched.recertPrefix : matched.prefix;
    const padded = this.padSequential(input.sequential, matched.padding);
    const folio = input.idAfiliacion
      ? `${prefix}-${padded}_${input.idAfiliacion}`
      : `${prefix}-${padded}`;

    return {
      folio,
      label: matched.label,
      prefix,
      pendingFromTeam: false,
    };
  }

  /**
   * Selecciona la entrada más específica que coincide con el input. Las
   * entradas VIP se consultan primero (más específicas) y luego las ECOMM.
   * Match: cada campo declarado en `entry.match` debe coincidir con el
   * input; campos no declarados se ignoran (asumen "cualquier valor").
   */
  private findMatch(input: FolioInput): NomenclatureEntry | undefined {
    const sources: NomenclatureEntry[][] = input.isVIP
      ? [this.config.vip, this.config.ecomm]
      : [this.config.ecomm];

    for (const source of sources) {
      const candidates = source.filter(e => this.matchesEntry(e, input));
      if (candidates.length > 0) {
        // Preferir el match con más campos declarados en `match` (más
        // específico) — e.g. `has3DS=true + hasCybersource=true` gana
        // sobre solo `has3DS=true`.
        return candidates.sort((a, b) =>
          Object.keys(b.match).length - Object.keys(a.match).length,
        )[0];
      }
    }
    return undefined;
  }

  private matchesEntry(entry: NomenclatureEntry, input: FolioInput): boolean {
    const m = entry.match;
    if (m.integrationType && m.integrationType !== input.integrationType) return false;
    if (m.has3DS !== undefined && m.has3DS !== Boolean(input.has3DS)) return false;
    if (m.hasCybersource !== undefined && m.hasCybersource !== Boolean(input.hasCybersource)) return false;
    if (m.isVIP !== undefined && m.isVIP !== Boolean(input.isVIP)) return false;
    if (m.modifier && m.modifier !== input.modifier) return false;
    return true;
  }

  private padSequential(n: number, length: number): string {
    return Math.max(0, Math.floor(n)).toString().padStart(length, '0');
  }
}
