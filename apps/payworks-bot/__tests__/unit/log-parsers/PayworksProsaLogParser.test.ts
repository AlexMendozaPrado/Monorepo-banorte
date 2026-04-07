import { PayworksProsaLogParser } from '@/infrastructure/log-parsers/PayworksProsaLogParser';

const SAMPLE_PROSA_LOG = `
[11/03/2026 18:02:25] SE ENVIO MENSAJE HACIA EL AUTORIZADOR PROSA5 (/140.240.11.78:58701):
Campo 0: [0200]
Campo 2: [5101250000002396]
Campo 3: [000000]
Campo 4: [000000009839]
Campo 11: [022522]
Campo 22: [812]
Campo 37: [320146914713]
Campo 38: [      ]
Campo 41: [70494081]
Campo 43: [LIVERPOOL SA DE CV           CDMX         MX]
Campo 49: [484]

[11/03/2026 18:02:26] SE RECIBIO MENSAJE DESDE EL AUTORIZADOR PROSA5 (/140.240.11.78:58701):
Campo 0: [0210]
Campo 4: [000000009839]
Campo 11: [022522]
Campo 37: [320146914713]
Campo 38: [830125]
Campo 39: [00]
Campo 41: [70494081]

[11/03/2026 18:05:10] SE ENVIO MENSAJE HACIA EL AUTORIZADOR PROSA5 (/140.240.11.78:58701):
Campo 0: [0200]
Campo 2: [4111110000001111]
Campo 4: [000000015000]
Campo 37: [320146914714]
Campo 38: [      ]
Campo 41: [70494081]

[11/03/2026 18:05:11] SE RECIBIO MENSAJE DESDE EL AUTORIZADOR PROSA5 (/140.240.11.78:58701):
Campo 0: [0210]
Campo 4: [000000015000]
Campo 37: [320146914714]
Campo 38: [830126]
Campo 39: [00]
`;

describe('PayworksProsaLogParser', () => {
  let parser: PayworksProsaLogParser;

  beforeEach(() => {
    parser = new PayworksProsaLogParser();
  });

  describe('parseByReferencia - Venta (0200/0210)', () => {
    it('debe encontrar y parsear la transaccion por REFERENCIA (Campo 37)', () => {
      const result = parser.parseByReferencia(SAMPLE_PROSA_LOG, '320146914713', {
        request: '0200',
        response: '0210',
      });

      expect(result.request).toBeDefined();
      expect(result.response).toBeDefined();
      expect(result.request.type).toBe('REQUEST');
      expect(result.response.type).toBe('RESPONSE');
    });

    it('debe extraer Campo 0 (tipo de mensaje) correctamente', () => {
      const result = parser.parseByReferencia(SAMPLE_PROSA_LOG, '320146914713', {
        request: '0200',
        response: '0210',
      });

      expect(result.request.messageType).toBe('0200');
      expect(result.response.messageType).toBe('0210');
    });

    it('debe extraer referencia (Campo 37) correctamente', () => {
      const result = parser.parseByReferencia(SAMPLE_PROSA_LOG, '320146914713', {
        request: '0200',
        response: '0210',
      });

      expect(result.request.getReferencia()).toBe('320146914713');
      expect(result.response.getReferencia()).toBe('320146914713');
    });

    it('debe extraer auth code (Campo 38) de la respuesta', () => {
      const result = parser.parseByReferencia(SAMPLE_PROSA_LOG, '320146914713', {
        request: '0200',
        response: '0210',
      });

      expect(result.response.getAuthCode()).toBe('830125');
    });

    it('debe extraer result code (Campo 39) = 00 (aprobado)', () => {
      const result = parser.parseByReferencia(SAMPLE_PROSA_LOG, '320146914713', {
        request: '0200',
        response: '0210',
      });

      expect(result.response.getResultCode()).toBe('00');
    });

    it('debe extraer monto (Campo 4) correctamente', () => {
      const result = parser.parseByReferencia(SAMPLE_PROSA_LOG, '320146914713', {
        request: '0200',
        response: '0210',
      });

      expect(result.request.getMonto()).toBe('000000009839');
    });

    it('debe extraer terminal ID (Campo 41)', () => {
      const result = parser.parseByReferencia(SAMPLE_PROSA_LOG, '320146914713', {
        request: '0200',
        response: '0210',
      });

      expect(result.request.getTerminalId()).toBe('70494081');
    });

    it('debe extraer la direccion del autorizador', () => {
      const result = parser.parseByReferencia(SAMPLE_PROSA_LOG, '320146914713', {
        request: '0200',
        response: '0210',
      });

      expect(result.request.autorizadorAddress).toBe('140.240.11.78:58701');
    });

    it('debe extraer Campo 43 (nombre comercio) con espacios', () => {
      const result = parser.parseByReferencia(SAMPLE_PROSA_LOG, '320146914713', {
        request: '0200',
        response: '0210',
      });

      expect(result.request.getCampo(43)).toContain('LIVERPOOL SA DE CV');
    });
  });

  describe('multiples transacciones', () => {
    it('debe encontrar la segunda transaccion por su REFERENCIA', () => {
      const result = parser.parseByReferencia(SAMPLE_PROSA_LOG, '320146914714', {
        request: '0200',
        response: '0210',
      });

      expect(result.request.getMonto()).toBe('000000015000');
      expect(result.response.getAuthCode()).toBe('830126');
    });
  });

  describe('errores', () => {
    it('debe lanzar error si no encuentra la REFERENCIA', () => {
      expect(() => {
        parser.parseByReferencia(SAMPLE_PROSA_LOG, 'INEXISTENTE', {
          request: '0200',
          response: '0210',
        });
      }).toThrow('No se encontro LOG PROSA de envio');
    });

    it('debe lanzar error si el tipo de mensaje no coincide', () => {
      expect(() => {
        parser.parseByReferencia(SAMPLE_PROSA_LOG, '320146914713', {
          request: '0220',
          response: '0230',
        });
      }).toThrow('No se encontro LOG PROSA de envio');
    });
  });

  describe('conteo de campos', () => {
    it('debe reportar cantidad de campos parseados', () => {
      const result = parser.parseByReferencia(SAMPLE_PROSA_LOG, '320146914713', {
        request: '0200',
        response: '0210',
      });

      expect(result.request.getCampoCount()).toBeGreaterThanOrEqual(8);
      expect(result.response.getCampoCount()).toBeGreaterThanOrEqual(5);
    });
  });
});
