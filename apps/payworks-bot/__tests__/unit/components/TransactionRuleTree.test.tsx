/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TransactionRuleTree } from '@/presentation/components/TransactionRuleTree';
import { FieldResultResponse } from '@/shared/types/api';

const fields: FieldResultResponse[] = [
  {
    field: 'CARD_NUMBER',
    displayName: 'Numero de Tarjeta',
    rule: 'R',
    found: true,
    value: '510125******2396',
    verdict: 'PASS',
    source: 'Anexo D §3.1',
    layer: 'SERVLET',
  },
  {
    field: 'CVV2',
    rule: 'R',
    found: false,
    value: undefined,
    verdict: 'FAIL',
    source: 'Anexo D §3.1',
    layer: 'SERVLET',
  },
  {
    field: 'XID',
    displayName: '3DS XID',
    rule: 'R',
    found: true,
    value: 'X',
    verdict: 'PASS',
    source: 'Boletin DS-2024',
    layer: 'THREEDS',
  },
  {
    field: 'AVS_CODE',
    rule: 'N/A',
    found: false,
    value: undefined,
    verdict: 'PASS',
    source: 'Boletin DM-2024',
    layer: 'CYBERSOURCE',
  },
];

describe('TransactionRuleTree', () => {
  it('agrupa fields por capa con su pill correspondiente', () => {
    render(<TransactionRuleTree fieldResults={fields} />);
    expect(screen.getByText('Servlet (TNP)')).toBeInTheDocument();
    expect(screen.getByText('3D Secure')).toBeInTheDocument();
    expect(screen.getByText('Cybersource')).toBeInTheDocument();
  });

  it('muestra resumen con conteos correctos', () => {
    render(<TransactionRuleTree fieldResults={fields} />);
    // 3 aplicables (1 N/A skip), 2 pass, 1 fail
    expect(screen.getByText(/3 de 4 validaciones aplicadas/)).toBeInTheDocument();
    expect(screen.getByText(/1 con observación/)).toBeInTheDocument();
  });

  it('auto-expande la capa con fallas y muestra el grupo', () => {
    render(<TransactionRuleTree fieldResults={fields} />);
    // SERVLET tiene fail -> debe estar abierta y mostrar el source
    expect(screen.getAllByText('Anexo D §3.1').length).toBeGreaterThan(0);
  });

  it('renderiza el detalle de un field fallido con el mensaje esperado', () => {
    render(<TransactionRuleTree fieldResults={fields} />);
    expect(screen.getByText('No encontrado en el log')).toBeInTheDocument();
  });

  it('al hacer click en una capa colapsa su contenido', () => {
    render(<TransactionRuleTree fieldResults={fields} />);
    const servletButton = screen.getByText('Servlet (TNP)').closest('button')!;
    fireEvent.click(servletButton);
    // Tras colapsar, el source ya no debe estar visible
    expect(screen.queryByText('Anexo D §3.1')).not.toBeInTheDocument();
  });

  it('muestra failDetail del dominio cuando esta disponible (PR#19)', () => {
    const fieldsWithDetail: FieldResultResponse[] = [
      {
        field: 'ENTRY_MODE',
        displayName: 'Modo de Entrada',
        rule: 'R',
        found: true,
        value: 'CONTACTLESSCHIP',
        verdict: 'FAIL',
        source: 'Anexo D §2.4',
        layer: 'SERVLET',
        failReason: 'invalid_value',
        failDetail: 'Valor "CONTACTLESSCHIP" no permitido. Valores válidos: MANUAL, CHIP, CONTACTLESS',
      },
    ];
    render(<TransactionRuleTree fieldResults={fieldsWithDetail} />);
    expect(screen.getByText(/no permitido. Valores válidos: MANUAL, CHIP, CONTACTLESS/)).toBeInTheDocument();
  });

  it('para field con found=true sin failDetail muestra "Valor invalido" con el valor (PR#19)', () => {
    const fields: FieldResultResponse[] = [
      {
        field: 'SUB_MERCHANT',
        rule: 'R',
        found: true,
        value: 'ESSENTIALMASSA',
        verdict: 'FAIL',
        source: 'Anexo D',
        layer: 'AGREGADOR',
      },
    ];
    render(<TransactionRuleTree fieldResults={fields} />);
    expect(screen.getByText(/Valor inválido: "ESSENTIALMASSA"/)).toBeInTheDocument();
  });

  it('para field con found=false muestra "No encontrado en el log" (PR#19)', () => {
    const fields: FieldResultResponse[] = [
      {
        field: 'CARD_NUMBER',
        rule: 'R',
        found: false,
        value: undefined,
        verdict: 'FAIL',
        source: 'SERVLET',
        layer: 'SERVLET',
      },
    ];
    render(<TransactionRuleTree fieldResults={fields} />);
    expect(screen.getByText('No encontrado en el log')).toBeInTheDocument();
  });

  describe('Fase F.2 — Click-to-expand RuleLine', () => {
    const failFields: FieldResultResponse[] = [
      {
        field: 'AUTH_CODE',
        displayName: 'Código de Autorización',
        rule: 'R',
        found: false,
        value: undefined,
        verdict: 'FAIL',
        failReason: 'cross_field',
        failDetail: 'POSTAUTH requiere AUTH_CODE de PREAUTH previo — No se encontró en respuestas previas',
        source: 'SERVLET',
        layer: 'SERVLET',
      },
    ];

    it('muestra panel expandible con failReason/failDetail/source para fields fallidos', () => {
      render(<TransactionRuleTree fieldResults={failFields} />);
      // Inicialmente colapsado: panel detalle no visible
      expect(screen.queryByText('Categoría')).not.toBeInTheDocument();

      // Click en la línea del field fallido
      const ruleLine = screen.getByText('Código de Autorización').closest('[role="button"]')!;
      fireEvent.click(ruleLine);

      // Panel expandido: aparecen los labels estructurados
      expect(screen.getByText('Categoría')).toBeInTheDocument();
      expect(screen.getByText('cross_field')).toBeInTheDocument();
      expect(screen.getByText('Detalle')).toBeInTheDocument();
      expect(screen.getAllByText(/POSTAUTH requiere AUTH_CODE/).length).toBeGreaterThan(0);
    });

    it('al re-clicar colapsa el panel', () => {
      render(<TransactionRuleTree fieldResults={failFields} />);
      const ruleLine = screen.getByText('Código de Autorización').closest('[role="button"]')!;
      fireEvent.click(ruleLine);
      expect(screen.getByText('Categoría')).toBeInTheDocument();

      fireEvent.click(ruleLine);
      expect(screen.queryByText('Categoría')).not.toBeInTheDocument();
    });

    it('NO renderiza role=button en pass/skip (no expandibles)', () => {
      const passField: FieldResultResponse[] = [{
        field: 'MERCHANT_ID', rule: 'R', found: true, value: '8619640',
        verdict: 'PASS', source: 'SERVLET', layer: 'SERVLET',
      }];
      render(<TransactionRuleTree fieldResults={passField} />);
      // El text del field existe, pero no debe ser un role=button
      expect(screen.queryByRole('button', { name: /MERCHANT_ID/ })).not.toBeInTheDocument();
    });
  });
});
