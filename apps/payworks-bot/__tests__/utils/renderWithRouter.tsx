/**
 * Helper para renderizar componentes que dependen de `next/navigation`
 * en tests RTL. Centraliza el setup de mocks para router/params/searchParams.
 *
 * IMPORTANTE: el `jest.mock('next/navigation', ...)` debe declararse en el
 * archivo de test (no aquí), porque jest hoisting requiere que la llamada
 * a mock viva en el módulo de test.
 *
 * Uso típico:
 *
 * ```tsx
 * jest.mock('next/navigation', () => mockNextNavigation());
 *
 * import { renderWithRouter } from '@/__tests__/utils/renderWithRouter';
 * import { getMockRouter, resetNextNavigationMocks } from '@/__tests__/utils/mockNextNavigation';
 *
 * beforeEach(() => resetNextNavigationMocks());
 *
 * it('navega a /resultados/:id en éxito', () => {
 *   renderWithRouter(<MyComponent />);
 *   // ... interacciones
 *   expect(getMockRouter().push).toHaveBeenCalledWith('/resultados/abc');
 * });
 * ```
 */

import React from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import {
  setMockParams,
  setMockSearchParams,
} from './mockNextNavigation';

export interface RenderWithRouterOptions extends RenderOptions {
  /** Params dinámicos (ej. `{ id: 'abc-123' }` para `/resultados/[id]`). */
  params?: Record<string, string>;
  /** Query string (ej. `'?notas=foo'`). */
  searchParams?: string | URLSearchParams;
}

export function renderWithRouter(
  ui: React.ReactElement,
  options: RenderWithRouterOptions = {},
): RenderResult {
  const { params, searchParams, ...rtlOptions } = options;
  if (params) setMockParams(params);
  if (searchParams) setMockSearchParams(searchParams);
  return render(ui, rtlOptions);
}
