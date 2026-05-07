/**
 * Mock reusable de `next/navigation` para tests RTL de componentes
 * que usan `useRouter`, `useParams` o `useSearchParams`.
 *
 * Se aplica vía `jest.mock('next/navigation', () => mockNextNavigation())`
 * dentro del archivo de test, antes de importar el componente bajo test.
 */

export type MockRouter = {
  push: jest.Mock;
  replace: jest.Mock;
  refresh: jest.Mock;
  back: jest.Mock;
  forward: jest.Mock;
  prefetch: jest.Mock;
};

export function createMockRouter(): MockRouter {
  return {
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
  };
}

let _router: MockRouter = createMockRouter();
let _params: Record<string, string> = {};
let _searchParams = new URLSearchParams();

export function getMockRouter(): MockRouter {
  return _router;
}

export function setMockParams(params: Record<string, string>): void {
  _params = params;
}

export function setMockSearchParams(query: string | URLSearchParams): void {
  _searchParams =
    typeof query === 'string' ? new URLSearchParams(query) : query;
}

export function resetNextNavigationMocks(): void {
  _router = createMockRouter();
  _params = {};
  _searchParams = new URLSearchParams();
}

/**
 * Factory para `jest.mock('next/navigation', () => mockNextNavigation())`.
 * Devuelve los hooks de Next.js apuntando a singletons mutables que cada
 * test puede resetear con `resetNextNavigationMocks()`.
 */
export function mockNextNavigation() {
  return {
    useRouter: () => _router,
    useParams: () => _params,
    useSearchParams: () => _searchParams,
    usePathname: () => '/',
    redirect: jest.fn(),
    notFound: jest.fn(),
  };
}
