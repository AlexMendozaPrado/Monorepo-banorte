export enum ValidationVerdict {
  APROBADO = 'APROBADO',
  RECHAZADO = 'RECHAZADO',
  PENDIENTE = 'PENDIENTE',
}

export class ValidationVerdictValueObject {
  constructor(private readonly value: ValidationVerdict) {}

  getValue(): ValidationVerdict {
    return this.value;
  }

  isApproved(): boolean {
    return this.value === ValidationVerdict.APROBADO;
  }

  isRejected(): boolean {
    return this.value === ValidationVerdict.RECHAZADO;
  }

  getDisplayName(): string {
    return this.value;
  }

  getColor(): string {
    switch (this.value) {
      case ValidationVerdict.APROBADO: return '#6CC04A';
      case ValidationVerdict.RECHAZADO: return '#EB0029';
      case ValidationVerdict.PENDIENTE: return '#FFA400';
    }
  }
}
