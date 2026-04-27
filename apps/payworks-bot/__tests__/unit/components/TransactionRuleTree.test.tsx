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
});
