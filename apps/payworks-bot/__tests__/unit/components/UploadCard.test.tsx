/**
 * @jest-environment jsdom
 *
 * Tests RTL para UploadCard — fase F2 del plan de cobertura pre-MVP.
 * Cubre los 2 bugs reportados en producción + regresiones de validación
 * y flujo principal:
 *
 *   Bug 1 — loading state (texto "Procesando..." + botón disabled +
 *   spinner Loader2 visible durante fetch).
 *   Bug 2 — un solo click dispara fetch una sola vez; foco previo en
 *   inputs de texto no debe impedir el primer click.
 */

import '@testing-library/jest-dom';
import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import {
  mockNextNavigation,
  getMockRouter,
  resetNextNavigationMocks,
} from '../../utils/mockNextNavigation';
import { renderWithRouter } from '../../utils/renderWithRouter';

jest.mock('next/navigation', () => mockNextNavigation());

import { UploadCard } from '@/presentation/components/UploadCard';

// ── Helpers ────────────────────────────────────────────────────────────────

function attach(testid: string, file: File): void {
  const input = screen.getByTestId(testid) as HTMLInputElement;
  fireEvent.change(input, { target: { files: [file] } });
}

function fillRequiredSemiAuto(): void {
  attach('upload-matriz', new File(['xlsx'], 'matriz.xlsx'));
  attach('upload-csv', new File(['csv'], 'vt.csv'));
  attach('upload-servlet', new File(['log'], 'servlet.log'));
  attach('upload-prosa', new File(['log'], 'prosa.log'));
}

function mockFetchSuccess(sessionId = 'fake-session-id'): jest.Mock {
  const fn = jest.fn().mockResolvedValue({
    json: async () => ({ success: true, data: { id: sessionId } }),
  });
  (global as unknown as { fetch: jest.Mock }).fetch = fn;
  return fn;
}

function mockFetchError(message = 'Error en el backend'): jest.Mock {
  const fn = jest.fn().mockResolvedValue({
    json: async () => ({ success: false, error: message }),
  });
  (global as unknown as { fetch: jest.Mock }).fetch = fn;
  return fn;
}

/**
 * Mock de fetch que devuelve una promise pendiente — útil para asertar
 * estados durante el fetch en vuelo. Devuelve la spy + el resolver.
 */
function mockFetchPending(): {
  fn: jest.Mock;
  resolve: (sessionId?: string) => void;
} {
  let resolveFn!: (value: { json: () => Promise<unknown> }) => void;
  const promise = new Promise<{ json: () => Promise<unknown> }>(resolve => {
    resolveFn = resolve;
  });
  const fn = jest.fn().mockReturnValue(promise);
  (global as unknown as { fetch: jest.Mock }).fetch = fn;
  return {
    fn,
    resolve: (sessionId = 'fake-session-id') =>
      resolveFn({
        json: async () => ({ success: true, data: { id: sessionId } }),
      }),
  };
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('UploadCard', () => {
  beforeEach(() => {
    resetNextNavigationMocks();
    jest.restoreAllMocks();
  });

  describe('Bug 1 — loading state', () => {
    it('cambia texto a "Procesando..." durante el fetch', async () => {
      const { resolve } = mockFetchPending();
      renderWithRouter(<UploadCard />);
      fillRequiredSemiAuto();
      const btn = screen.getByTestId('submit-certification');

      expect(btn).toHaveTextContent(/Iniciar Certificacion/i);
      fireEvent.click(btn);

      await waitFor(() => expect(btn).toHaveTextContent(/Procesando/i));

      resolve();
    });

    it('botón queda disabled durante el fetch', async () => {
      const { resolve } = mockFetchPending();
      renderWithRouter(<UploadCard />);
      fillRequiredSemiAuto();
      const btn = screen.getByTestId('submit-certification');

      expect(btn).not.toBeDisabled();
      fireEvent.click(btn);

      await waitFor(() => expect(btn).toBeDisabled());

      resolve();
    });

    it('muestra spinner Loader2 mientras la request está en vuelo (regresión Bug 1)', async () => {
      const { resolve } = mockFetchPending();
      renderWithRouter(<UploadCard />);
      fillRequiredSemiAuto();
      const btn = screen.getByTestId('submit-certification');

      fireEvent.click(btn);

      // Esperar a que el botón haga transición a estado de loading.
      await waitFor(() => expect(btn).toBeDisabled());

      // El componente Button de @banorte/ui renderiza <Loader2 className="...
      // animate-spin" /> cuando recibe la prop isLoading=true. El bug 1 era
      // que UploadCard solo pasa disabled={isLoading} sin la prop isLoading,
      // por lo que el spinner no aparecía.
      const spinner = btn.querySelector('svg.animate-spin');
      expect(spinner).not.toBeNull();

      resolve();
    });
  });

  describe('Bug 2 — idempotencia del primer click', () => {
    it('un solo click dispara fetch una sola vez (regresión Bug 2)', async () => {
      const fetchSpy = mockFetchSuccess();
      renderWithRouter(<UploadCard />);
      fillRequiredSemiAuto();
      const btn = screen.getByTestId('submit-certification');

      fireEvent.click(btn);

      await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
    });

    it('foco previo en input de coordinador no impide que primer click dispare submit', async () => {
      const fetchSpy = mockFetchSuccess();
      renderWithRouter(<UploadCard />);
      fillRequiredSemiAuto();

      const coordinadorInput = screen.getByPlaceholderText(
        /Fabio Serrano/i,
      ) as HTMLInputElement;
      fireEvent.focus(coordinadorInput);
      fireEvent.change(coordinadorInput, { target: { value: 'Test User' } });

      const btn = screen.getByTestId('submit-certification');
      fireEvent.click(btn);

      await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
    });
  });

  describe('Validación de campos requeridos', () => {
    it('muestra error si no se sube matriz', () => {
      const fetchSpy = mockFetchSuccess();
      renderWithRouter(<UploadCard />);

      const btn = screen.getByTestId('submit-certification');
      fireEvent.click(btn);

      expect(screen.getByText(/Sube la Matriz de Pruebas/i)).toBeInTheDocument();
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('muestra error en modo semi-auto si faltan CSV o LOGs', () => {
      const fetchSpy = mockFetchSuccess();
      renderWithRouter(<UploadCard />);
      attach('upload-matriz', new File(['xlsx'], 'matriz.xlsx'));

      const btn = screen.getByTestId('submit-certification');
      fireEvent.click(btn);

      expect(
        screen.getByText(/CSV de BD y ambos archivos de LOG/i),
      ).toBeInTheDocument();
      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });

  describe('Flujo completo', () => {
    it('navega a /resultados/:id en éxito', async () => {
      mockFetchSuccess('abc-123');
      renderWithRouter(<UploadCard />);
      fillRequiredSemiAuto();

      fireEvent.click(screen.getByTestId('submit-certification'));

      await waitFor(() =>
        expect(getMockRouter().push).toHaveBeenCalledWith(
          '/resultados/abc-123',
        ),
      );
    });

    it('muestra error en banner si backend responde {success: false}', async () => {
      mockFetchError('Bundle inválido: matriz no parseable');
      renderWithRouter(<UploadCard />);
      fillRequiredSemiAuto();

      fireEvent.click(screen.getByTestId('submit-certification'));

      await waitFor(() =>
        expect(
          screen.getByText(/Bundle inválido: matriz no parseable/i),
        ).toBeInTheDocument(),
      );
      expect(getMockRouter().push).not.toHaveBeenCalled();
    });
  });

  describe('Condicionalidad de logs por producto', () => {
    it('inputs 3DS y Cybersource aparecen para ECOMMERCE_TRADICIONAL (default)', () => {
      renderWithRouter(<UploadCard />);

      // ECOMMERCE_TRADICIONAL es el default; soporta 3DS y Cybersource.
      expect(screen.getByTestId('upload-3ds')).toBeInTheDocument();
      expect(screen.getByTestId('upload-cybersource')).toBeInTheDocument();
    });

    it('inputs 3DS y Cybersource NO aparecen para MOTO (no los soporta)', () => {
      renderWithRouter(<UploadCard />);

      // Cambiar a MOTO — no soporta 3DS ni Cybersource.
      fireEvent.click(screen.getByTestId('integration-MOTO'));

      expect(screen.queryByTestId('upload-3ds')).not.toBeInTheDocument();
      expect(screen.queryByTestId('upload-cybersource')).not.toBeInTheDocument();
    });
  });
});
