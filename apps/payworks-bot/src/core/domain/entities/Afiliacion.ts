/**
 * Affiliation record loaded from a user-uploaded export of
 * `SELECT * FROM NPAYW.AFILIACIONES`.
 *
 * All fields are optional except `idAfiliacion` (the lookup key).
 * Missing columns in the source CSV/TXT simply leave the corresponding
 * field undefined; the certification letter renders `—` in their slot.
 */
export interface Afiliacion {
  idAfiliacion: string;
  nombreComercio?: string;
  razonSocial?: string;
  rfc?: string;
  numeroCliente?: string;
  giro?: string;
  mccDescripcion?: string;
  esquema?: string;
  tipoIntegracion?: string;
  direccion?: string;
  ciudad?: string;
  estado?: string;
  codigoPostal?: string;
  email?: string;
  telefono?: string;
  usuario?: string;
  status?: string;
  /**
   * Additional columns captured verbatim from the source file. Useful
   * when the user's export carries columns not modeled above.
   */
  extras?: Record<string, string>;
}

export class AfiliacionEntity implements Afiliacion {
  constructor(
    public readonly idAfiliacion: string,
    public readonly nombreComercio?: string,
    public readonly razonSocial?: string,
    public readonly rfc?: string,
    public readonly numeroCliente?: string,
    public readonly giro?: string,
    public readonly mccDescripcion?: string,
    public readonly esquema?: string,
    public readonly tipoIntegracion?: string,
    public readonly direccion?: string,
    public readonly ciudad?: string,
    public readonly estado?: string,
    public readonly codigoPostal?: string,
    public readonly email?: string,
    public readonly telefono?: string,
    public readonly usuario?: string,
    public readonly status?: string,
    public readonly extras?: Record<string, string>,
  ) {}

  /** Returns a display label: nombreComercio ?? razonSocial ?? idAfiliacion. */
  getDisplayLabel(): string {
    return this.nombreComercio ?? this.razonSocial ?? this.idAfiliacion;
  }
}
