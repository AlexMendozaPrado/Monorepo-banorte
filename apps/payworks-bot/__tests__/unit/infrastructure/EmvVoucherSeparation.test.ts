import { MandatoryFieldsConfig } from '@/infrastructure/mandatory-rules/MandatoryFieldsConfig';
import { ValidateTransactionFieldsUseCase } from '@/core/application/use-cases/ValidateTransactionFieldsUseCase';
import { ServletLogEntity } from '@/core/domain/entities/ServletLog';
import { IntegrationType } from '@/core/domain/value-objects/IntegrationType';
import { TransactionType } from '@/core/domain/value-objects/TransactionType';
import { CardBrand } from '@/core/domain/value-objects/CardBrand';
import { EmvVoucherSection } from '@/core/domain/value-objects/MandatoryFieldsMatrix';

// Invariante de Fase 3: TVR/TSI/AID/APN/AL son tags EMV de salida del SDK
// para imprimir en voucher — NO viajan al POST a Banorte y por lo tanto NO
// deben validarse contra el log servlet. Solo `EMV_TAGS` (TLV hex) es el
// campo EMV de envío real.
//
// Los JSONs v5 ya los separan entre `servlet` (validado) y `emvVoucher`
// (documental). Estos tests blindan esa separación para que ningún cambio
// futuro mueva TVR/TSI/etc. de vuelta a `servlet` sin que el CI lo grite.

describe('Fase 3 — Separación EMV envío vs voucher', () => {
  const config = new MandatoryFieldsConfig();

  const TP_PRODUCTS = [
    IntegrationType.API_PW2_SEGURO,
    IntegrationType.INTERREDES_REMOTO,
  ];
  const VOUCHER_TAGS = ['TVR', 'TSI', 'AID', 'APN', 'AL'];

  describe.each(TP_PRODUCTS)('%s', (product) => {
    const matrix = config.getMatrix(product);

    it.each(VOUCHER_TAGS)('servlet NO contiene %s', (tag) => {
      expect(matrix.servlet[tag]).toBeUndefined();
    });

    it.each(VOUCHER_TAGS)('getServletLogNames NO expone %s', (tag) => {
      const names = config.getServletLogNames(product);
      expect(names).not.toContain(tag);
    });

    it.each(VOUCHER_TAGS)('emvVoucher SÍ contiene %s', (tag) => {
      expect(matrix.emvVoucher).toBeDefined();
      const section = matrix.emvVoucher as EmvVoucherSection;
      expect(section[tag]).toBeDefined();
      expect(typeof section[tag]).toBe('object');
    });

    it('servlet mantiene EMV_TAGS (único campo EMV de envío real)', () => {
      expect(matrix.servlet.EMV_TAGS).toBeDefined();
    });

    it('emvVoucher conserva metadatos _description / _source (no se iteran)', () => {
      const section = matrix.emvVoucher as EmvVoucherSection;
      expect(section._description).toBeDefined();
      expect(section._source).toBeDefined();
    });
  });

  describe('Pipeline no falla por tags de voucher ausentes en el log', () => {
    // Construimos el UseCase sin servicios AN5822 para aislar: solo el
    // pipeline servlet. Una transacción CHIP que carece de TVR/TSI/AID/
    // APN/AL en el log debe PASAR para esos campos (no deben ni aparecer
    // en los resultados porque no viven en `servlet`).
    const useCase = new ValidateTransactionFieldsUseCase(config);

    function makeChipServlet(): ServletLogEntity {
      const fields = new Map<string, string>([
        ['MERCHANT_ID', '9607773'],
        ['USER', 'pw_user'],
        ['PASSWORD', '****'],
        ['TERMINAL_ID', '12345678'],
        ['CMD_TRANS', 'VENTA'],
        ['AMOUNT', '1500.00'],
        ['MODE', 'PRD'],
        ['CARD_NUMBER', '411111******1111'],
        ['EXP_DATE', '1227'],
        ['ENTRY_MODE', 'CHIP'],
        ['EMV_TAGS', '9F2608ABCDEF0123456789'],
        ['RESPONSE_LANGUAGE', 'ES'],
      ]);
      return new ServletLogEntity(new Date('2026-03-11T18:02:25Z'), 'REQUEST', '1.2.3.4', fields);
    }

    function makeResponse(): ServletLogEntity {
      return new ServletLogEntity(
        new Date('2026-03-11T18:02:26Z'),
        'RESPONSE',
        '1.2.3.4',
        new Map([['CODIGO_PAYW', '000']]),
      );
    }

    it.each(TP_PRODUCTS)('%s: CHIP AUTH no produce resultados para TVR/TSI/AID/APN/AL', (product) => {
      const result = useCase.execute({
        integrationType: product,
        transactionType: TransactionType.AUTH,
        cardBrand: CardBrand.VISA,
        transactionRef: 'REF-CHIP',
        servletRequest: makeChipServlet(),
        servletResponse: makeResponse(),
      });

      for (const tag of VOUCHER_TAGS) {
        const found = result.fieldResults.find(f => f.field === tag);
        expect(found).toBeUndefined();
      }
    });
  });
});
