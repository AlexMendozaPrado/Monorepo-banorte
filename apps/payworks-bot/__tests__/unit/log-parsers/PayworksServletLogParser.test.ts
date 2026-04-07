import { PayworksServletLogParser } from '@/infrastructure/log-parsers/PayworksServletLogParser';

const SAMPLE_LOG = `
********************************************************************************
[11/03/2026 18:02:25] SE RECIBIO POST HTTP DESDE LA IP: 99.80.99.245
ID_AFILIACION:   [7049408]
USUARIO:         [7049408]
CMD_TRANS:       [AUTH]
ID_TERMINAL:     [70494081]
MONTO:           [98.39]
MODO:            [PRD]
REFERENCIA:      []
NUMERO_CONTROL:  [140802786372026031200022522]
NUMERO_TARJETA:  [510125******2396]
MODO_ENTRADA:    [MANUAL]
IDIOMA_RESPUESTA:[01]
CUSTOMER_REF1:   [Pedido-84726]
********************************************************************************

********************************************************************************
[11/03/2026 18:02:26] SE ENVIO RESPUESTA HTTP HACIA LA IP: 99.80.99.245
RESULTADO_PAYW:  [A]
CODIGO_PAYW:     [000]
TEXTO:           [Approved]
REFERENCIA:      [320146914713]
NUMERO_CONTROL:  [140802786372026031200022522]
CODIGO_AUT:      [830125]
********************************************************************************

********************************************************************************
[11/03/2026 18:05:10] SE RECIBIO POST HTTP DESDE LA IP: 99.80.99.245
ID_AFILIACION:   [7049408]
CMD_TRANS:       [AUTH]
MONTO:           [150.00]
NUMERO_CONTROL:  [140802786372026031200022523]
NUMERO_TARJETA:  [411111******1111]
********************************************************************************

********************************************************************************
[11/03/2026 18:05:11] SE ENVIO RESPUESTA HTTP HACIA LA IP: 99.80.99.245
RESULTADO_PAYW:  [A]
CODIGO_PAYW:     [000]
TEXTO:           [Approved]
REFERENCIA:      [320146914714]
NUMERO_CONTROL:  [140802786372026031200022523]
CODIGO_AUT:      [830126]
********************************************************************************
`;

describe('PayworksServletLogParser', () => {
  let parser: PayworksServletLogParser;

  beforeEach(() => {
    parser = new PayworksServletLogParser();
  });

  describe('parseByControlNumber', () => {
    it('debe encontrar y parsear la transaccion por NUMERO_CONTROL', () => {
      const result = parser.parseByControlNumber(SAMPLE_LOG, '140802786372026031200022522');

      expect(result.request).toBeDefined();
      expect(result.response).toBeDefined();
      expect(result.request.type).toBe('REQUEST');
      expect(result.response.type).toBe('RESPONSE');
    });

    it('debe extraer campos del request correctamente', () => {
      const result = parser.parseByControlNumber(SAMPLE_LOG, '140802786372026031200022522');
      const req = result.request;

      expect(req.getField('ID_AFILIACION')).toBe('7049408');
      expect(req.getField('CMD_TRANS')).toBe('AUTH');
      expect(req.getField('MONTO')).toBe('98.39');
      expect(req.getField('NUMERO_TARJETA')).toBe('510125******2396');
      expect(req.getField('MODO_ENTRADA')).toBe('MANUAL');
      expect(req.getField('MODO')).toBe('PRD');
      expect(req.getField('IDIOMA_RESPUESTA')).toBe('01');
      expect(req.getField('CUSTOMER_REF1')).toBe('Pedido-84726');
    });

    it('debe extraer campos del response correctamente', () => {
      const result = parser.parseByControlNumber(SAMPLE_LOG, '140802786372026031200022522');
      const resp = result.response;

      expect(resp.getField('RESULTADO_PAYW')).toBe('A');
      expect(resp.getField('CODIGO_PAYW')).toBe('000');
      expect(resp.getField('TEXTO')).toBe('Approved');
      expect(resp.getField('REFERENCIA')).toBe('320146914713');
      expect(resp.getField('CODIGO_AUT')).toBe('830125');
    });

    it('debe extraer IP y timestamp correctamente', () => {
      const result = parser.parseByControlNumber(SAMPLE_LOG, '140802786372026031200022522');

      expect(result.request.ipAddress).toBe('99.80.99.245');
      expect(result.response.ipAddress).toBe('99.80.99.245');
    });

    it('debe detectar campo REFERENCIA vacio en request', () => {
      const result = parser.parseByControlNumber(SAMPLE_LOG, '140802786372026031200022522');

      expect(result.request.getField('REFERENCIA')).toBe('');
      expect(result.request.hasField('REFERENCIA')).toBe(false);
    });

    it('debe encontrar la segunda transaccion por su NUMERO_CONTROL', () => {
      const result = parser.parseByControlNumber(SAMPLE_LOG, '140802786372026031200022523');

      expect(result.request.getField('MONTO')).toBe('150.00');
      expect(result.request.getField('NUMERO_TARJETA')).toBe('411111******1111');
      expect(result.response.getField('REFERENCIA')).toBe('320146914714');
    });

    it('debe lanzar error si no encuentra el NUMERO_CONTROL', () => {
      expect(() => {
        parser.parseByControlNumber(SAMPLE_LOG, 'INEXISTENTE');
      }).toThrow('No se encontro LOG Servlet de envio');
    });

    it('debe reportar cantidad de campos correctamente', () => {
      const result = parser.parseByControlNumber(SAMPLE_LOG, '140802786372026031200022522');

      expect(result.request.getFieldCount()).toBeGreaterThanOrEqual(10);
      expect(result.response.getFieldCount()).toBeGreaterThanOrEqual(5);
    });

    it('debe listar todos los nombres de campos', () => {
      const result = parser.parseByControlNumber(SAMPLE_LOG, '140802786372026031200022522');
      const fieldNames = result.request.getAllFieldNames();

      expect(fieldNames).toContain('ID_AFILIACION');
      expect(fieldNames).toContain('CMD_TRANS');
      expect(fieldNames).toContain('MONTO');
      expect(fieldNames).toContain('NUMERO_TARJETA');
    });
  });
});
