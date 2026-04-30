import { FolioGenerator } from '@/core/domain/services/FolioGenerator';
import { IntegrationType } from '@/core/domain/value-objects/IntegrationType';
import nomenclatures from '@/config/folio-nomenclatures.json';

describe('FolioGenerator', () => {
  const gen = new FolioGenerator(nomenclatures as never);

  describe('Ecommerce Tradicional — variantes por capa activa', () => {
    it('CE-####### cuando no hay 3DS ni Cybersource', () => {
      const r = gen.generate({
        integrationType: IntegrationType.ECOMMERCE_TRADICIONAL,
        has3DS: false,
        hasCybersource: false,
        sequential: 42,
      });
      expect(r.folio).toBe('CE-0000042');
      expect(r.prefix).toBe('CE');
      expect(r.pendingFromTeam).toBe(false);
    });

    it('CE3DS-####### con 3DS sin Cybersource', () => {
      const r = gen.generate({
        integrationType: IntegrationType.ECOMMERCE_TRADICIONAL,
        has3DS: true,
        hasCybersource: false,
        sequential: 3652,
      });
      expect(r.folio).toBe('CE3DS-0003652');
    });

    it('CYB3D-####### con 3DS y Cybersource', () => {
      const r = gen.generate({
        integrationType: IntegrationType.ECOMMERCE_TRADICIONAL,
        has3DS: true,
        hasCybersource: true,
        sequential: 100,
      });
      expect(r.folio).toBe('CYB3D-0000100');
    });

    it('preserva _idAfiliacion en el sufijo cuando se pasa', () => {
      const r = gen.generate({
        integrationType: IntegrationType.ECOMMERCE_TRADICIONAL,
        has3DS: true,
        sequential: 3652,
        idAfiliacion: '9885405',
      });
      expect(r.folio).toBe('CE3DS-0003652_9885405');
    });
  });

  describe('Recertificación — prefijo R', () => {
    it('RCE3DS-####### para recerts de Tradicional+3DS', () => {
      const r = gen.generate({
        integrationType: IntegrationType.ECOMMERCE_TRADICIONAL,
        has3DS: true,
        isRecertification: true,
        sequential: 7,
      });
      expect(r.folio).toBe('RCE3DS-0000007');
    });

    it('RCPP-####### para recerts de Cargos Periódicos Post', () => {
      const r = gen.generate({
        integrationType: IntegrationType.CARGOS_PERIODICOS_POST,
        isRecertification: true,
        sequential: 99,
      });
      expect(r.folio).toBe('RCPP-0000099');
    });
  });

  describe('Productos sin variantes 3DS/CS', () => {
    it('CPP-####### para Cargos Periódicos Post', () => {
      const r = gen.generate({
        integrationType: IntegrationType.CARGOS_PERIODICOS_POST,
        sequential: 1,
      });
      expect(r.folio).toBe('CPP-0000001');
    });

    it('M-####### para MOTO', () => {
      const r = gen.generate({
        integrationType: IntegrationType.MOTO,
        sequential: 50,
      });
      expect(r.folio).toBe('M-0000050');
    });
  });

  describe('VCE — padding de 6 dígitos', () => {
    it('VC3DS-###### (6 dígitos) para VCE Cifrado 3DS', () => {
      const r = gen.generate({
        integrationType: IntegrationType.VENTANA_COMERCIO_ELECTRONICO,
        has3DS: true,
        hasCybersource: false,
        sequential: 123,
      });
      expect(r.folio).toBe('VC3DS-000123');
    });

    it('VCCYB-####### (7 dígitos) para VCE Cifrado Cybersource', () => {
      const r = gen.generate({
        integrationType: IntegrationType.VENTANA_COMERCIO_ELECTRONICO,
        has3DS: false,
        hasCybersource: true,
        sequential: 456,
      });
      expect(r.folio).toBe('VCCYB-0000456');
    });
  });

  describe('VIP — Comercios Alto Valor', () => {
    it('VIP-A-CE-###### para VIP Agregador Comercio Electrónico', () => {
      const r = gen.generate({
        integrationType: IntegrationType.AGREGADORES_COMERCIO_ELECTRONICO,
        isVIP: true,
        sequential: 5,
      });
      expect(r.folio).toBe('VIP-A-CE-000005');
    });

    it('VIPR-A-CE-###### para recerts VIP', () => {
      const r = gen.generate({
        integrationType: IntegrationType.AGREGADORES_COMERCIO_ELECTRONICO,
        isVIP: true,
        isRecertification: true,
        sequential: 5,
      });
      expect(r.folio).toBe('VIPR-A-CE-000005');
    });
  });

  describe('Productos sin nomenclatura — pendingFromTeam', () => {
    it('API_PW2_SEGURO devuelve placeholder PENDIENTE-...', () => {
      const r = gen.generate({
        integrationType: IntegrationType.API_PW2_SEGURO,
        sequential: 1,
      });
      expect(r.pendingFromTeam).toBe(true);
      expect(r.folio).toMatch(/^PENDIENTE-API_PW2_SEGURO-/);
    });

    it('INTERREDES_REMOTO devuelve placeholder PENDIENTE-...', () => {
      const r = gen.generate({
        integrationType: IntegrationType.INTERREDES_REMOTO,
        sequential: 1,
      });
      expect(r.pendingFromTeam).toBe(true);
    });
  });

  describe('Especificidad de match — 3DS+CS gana sobre solo 3DS', () => {
    it('Tradicional con 3DS y CS prefiere CYB3D sobre CE3DS', () => {
      const r = gen.generate({
        integrationType: IntegrationType.ECOMMERCE_TRADICIONAL,
        has3DS: true,
        hasCybersource: true,
        sequential: 1,
      });
      expect(r.prefix).toBe('CYB3D');
    });
  });
});
