import { GlossaryService } from '@/core/application/services/GlossaryService';

describe('GlossaryService', () => {
  const service = new GlossaryService();

  describe('getEntry', () => {
    it('resuelve ID_AFILIACION a MERCHANT_ID', () => {
      const entry = service.getEntry('servlet', 'ID_AFILIACION');
      expect(entry?.logName).toBe('MERCHANT_ID');
      expect(entry?.ambiguous).toBe(false);
    });

    it('resuelve USUARIO a USER', () => {
      expect(service.getLogName('servlet', 'USUARIO')).toBe('USER');
    });

    it('retorna undefined para manualName inexistente', () => {
      expect(service.getEntry('servlet', 'FAKE_VAR')).toBeUndefined();
    });

    it('CLAVE_USR tiene logName null (no se logea)', () => {
      expect(service.getLogName('servlet', 'CLAVE_USR')).toBeNull();
    });
  });

  describe('agregadores', () => {
    it('SUB_AFILIACION mapea a SUB_MERCHANT', () => {
      expect(service.getLogName('agregadores', 'SUB_AFILIACION')).toBe('SUB_MERCHANT');
    });

    it('CODIGO_POSTAL mapea a ZIP_CODE', () => {
      expect(service.getLogName('agregadores', 'CODIGO_POSTAL')).toBe('ZIP_CODE');
    });
  });

  describe('threeds', () => {
    it('ESTATUS_3D marcado como ambiguo (P1.3 conflicto 200 vs 03)', () => {
      const entry = service.getEntry('threeds', 'ESTATUS_3D');
      expect(entry?.ambiguous).toBe(true);
    });

    it('MARCA_TARJETA mapea a CardType', () => {
      expect(service.getLogName('threeds', 'MARCA_TARJETA')).toBe('CardType');
    });
  });

  describe('findByLogName (búsqueda inversa)', () => {
    it('encuentra MERCHANT_ID como ID_AFILIACION en servlet', () => {
      const found = service.findByLogName('servlet', 'MERCHANT_ID');
      expect(found?.manualName).toBe('ID_AFILIACION');
    });

    it('no encuentra logName inexistente', () => {
      expect(service.findByLogName('servlet', 'NO_EXISTE')).toBeUndefined();
    });
  });

  describe('getAmbiguousEntries', () => {
    it('lista al menos los campos marcados como ambiguos', () => {
      const ambiguous = service.getAmbiguousEntries();
      expect(ambiguous.length).toBeGreaterThan(0);
      const manualNames = ambiguous.map(a => a.manualName);
      expect(manualNames).toContain('FECHA_EXP');
      expect(manualNames).toContain('ESTATUS_3D');
    });
  });

  describe('listSection', () => {
    it('excluye claves _meta/_note', () => {
      const servlet = service.listSection('servlet');
      const keys = Object.keys(servlet);
      expect(keys.every(k => !k.startsWith('_'))).toBe(true);
    });

    it('servlet tiene las variables base del manual', () => {
      const servlet = service.listSection('servlet');
      expect(servlet).toHaveProperty('ID_AFILIACION');
      expect(servlet).toHaveProperty('CMD_TRANS');
      expect(servlet).toHaveProperty('MONTO');
    });
  });

  describe('getVersion', () => {
    it('expone version del glosario', () => {
      expect(service.getVersion()).toBe('1.0.0');
    });
  });
});
