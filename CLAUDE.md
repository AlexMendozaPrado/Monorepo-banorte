# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository overview

Banorte's official monorepo: a Turborepo + pnpm workspace containing several Next.js apps plus one Express backend, sharing a Banorte design system and config packages. Most user-facing copy is in Spanish (es-MX).

- Package manager: **pnpm 10.22.0** (see `packageManager` in root `package.json`). `.npmrc` enables `auto-install-peers=true` and `strict-peer-dependencies=false`.
- Build orchestration: **Turborepo 2.6.1** (`turbo.json`).
- Workspaces: `apps/*` and `packages/*` (`pnpm-workspace.yaml`).
- Node: `>=18.0.0`.
- Most apps: Next.js 14 App Router, React 18, TypeScript 5.4+, Tailwind 3.4. **Exception:** `apps/business-rules` uses React 19 + MUI v7 — keep changes there isolated; the React 18/19 peer-dep warnings across the monorepo are expected.

## Common commands

Run from the repo root unless otherwise noted.

```bash
pnpm install                    # install workspace deps
pnpm dev                        # turbo run dev (starts every app)
pnpm build                      # turbo run build
pnpm lint                       # turbo run lint
pnpm type-check                 # turbo run type-check
pnpm format                     # prettier --write
pnpm clean                      # clean turbo + delete node_modules + .turbo
```

Per-app dev/build helpers exist on the root `package.json`. Names match the app directory (filter target = the `name` in `package.json`):

```bash
pnpm dev:landing         # apps/landing            → port 3002
pnpm dev:documind        # apps/documind           → port 3000
pnpm dev:sentiment       # apps/sentiment-analysis → port 3001
pnpm dev:business        # apps/business-rules     → port 3003
pnpm dev:business-api    # apps/business-rules-api → port 5000 (Express, nodemon)
pnpm dev:business-full   # business-rules + business-rules-api together
pnpm dev:financial       # apps/banorte-financial-app → port 3004
pnpm dev:sdk-control     # apps/sdk-version-control  → port 3005
pnpm dev:bian-poc        # apps/bian-poc           → port 3006
pnpm dev:payworks        # apps/payworks-bot       → port 3006   ⚠ same port as bian-poc; never run both simultaneously
```

To filter Turbo manually: `turbo run <task> --filter=<package-name>` (e.g. `turbo run build --filter=documind`).

### Tests

Only **`apps/payworks-bot`** and **`apps/sentiment-analysis`** have configured tests. There is no root `pnpm test`.

```bash
# from the app dir (e.g. apps/payworks-bot)
pnpm test                                    # jest
pnpm test:watch
pnpm test:coverage
pnpm test:unit                               # jest --testPathPatterns=unit
pnpm test -- path/to/file.test.ts            # single file
pnpm test -- -t "describe or test name"      # by test name
pnpm cypress                                 # open Cypress UI
pnpm cypress:headless                        # headless run
pnpm test:e2e                                # boot dev server + headless cypress
```

Jest is configured via `next/jest` with the path aliases `@/*`, `@/core/*`, `@/infrastructure/*`, `@/shared/*` mapping into `src/`.

### `business-rules-api` specific

This is an Express CommonJS service, not a Next.js app, and is **not** wired into Turbo's `build`/`lint`/`type-check` pipelines. Use its own scripts:

```bash
# from apps/business-rules-api
pnpm dev                  # nodemon server.js
pnpm start                # node server.js
pnpm migrate              # node scripts/supabase-setup.js
pnpm export-data          # node scripts/export-data.js
pnpm generate-sql         # node scripts/sql-import.js
```

It exposes routes under `/api/{auth,rules,ai,reports,historial,simulation}` and a `/api/health` endpoint that pings Postgres. Pairs with `apps/business-rules` (Next.js frontend).

## High-level architecture

### Workspace layout

```
apps/
  documind/                 RAG over PDFs (OpenAI + Supabase pgvector + LangChain)
  sentiment-analysis/       Sentiment + PDF analysis UI
  landing/                  Public landing portal
  business-rules/           Business rules admin UI (Next 14 + React 19 + MUI v7)
  business-rules-api/       Express + Postgres/Supabase + Gemini backend for ↑
  banorte-financial-app/    Financial chat app (AI SDK + OpenAI)
  sdk-version-control/      SDK release tracking
  bian-poc/                 BIAN architecture POC (MUI tree view)
  payworks-bot/             Payworks certification bot (with Jest + Cypress)
packages/
  ui/                       @banorte/ui — design system (components + tokens + tailwind preset)
  landing-page/             @banorte/landing-page — shared landing-page React components
  eslint-config/            @banorte/eslint-config (base / next-js / react-internal)
  typescript-config/        @banorte/typescript-config (extended via "extends")
```

### Clean Architecture apps

`apps/documind`, `apps/payworks-bot`, and `apps/sentiment-analysis` follow a layered structure under `src/`:

- `core/domain/` – pure domain types & interfaces (no framework imports)
- `core/application/` – use cases that orchestrate domain via injected ports
- `infrastructure/` – adapters implementing those ports (OpenAI, Supabase, pdf-parse, etc.)
- `composition/` (documind) or `presentation/` + `shared/` (payworks-bot) – DI wiring + UI

In `apps/documind`, **wiring lives in two factories** that are the only place infrastructure is constructed:

- `src/composition/container.ts` → `makeAnalyzePdfUseCase()` (PDF keyword + sentiment extraction)
- `src/composition/rag-container.ts` → `makeStoreDocumentUseCase()` and the RAG chat use case (chunking → embeddings → pgvector → chat)

When extending these apps, add the port to `core/`, the adapter to `infrastructure/`, and wire it through the composition factory — do not instantiate infrastructure inside route handlers or React components.

### Design system (`@banorte/ui`)

Single source of truth for visuals. **Never hardcode brand colors/spacing**; consume tokens.

- Tokens live in `packages/ui/src/tokens/` (`colors.ts`, `typography.ts`, `spacing.ts`).
- Tailwind preset: `packages/ui/src/tailwind/preset.ts` — apps' `tailwind.config.js` should extend this so the `banorte-*` and `status-*` utility classes resolve.
- Components: `Button`, `Card` (+ `CardHeader/Title/Content/Footer`), `Input`, `TextInput`, `Select`, `DateInput`, `TextArea`, `SearchInput`, `Modal`, `Stepper`, `ProgressBar`, `Table` (+ subcomponents). Re-export through `@banorte/ui`.
- `cn()` utility (`@banorte/ui` → `clsx` + `tailwind-merge`) is the standard for className composition.
- Brand color tokens (use these names, not hex):
  `banorte-red` (#EB0029, primary), `banorte-red-hover` (#E30028), `banorte-dark` (#323E48, primary text), `banorte-gray` (#5B6670, secondary text), `banorte-bg` (#EBF0F2, page bg), `banorte-light` (#F4F7F8, cards/hover), `banorte-white` (#FCFCFC), `status-success` (#6CC04A), `status-warning` (#FFA400), `status-alert` (#FF671B).
- Typography: body = Roboto, headings = Gotham (fallback Montserrat).
- Standard radii: `rounded-btn` 4px, `rounded-input` 6px, `rounded-card` 8px. Card shadow token: `shadow-card`; hover: `shadow-hover`.
- Page background should default to `bg-banorte-bg`.
- Icons: **Lucide React only** (`lucide-react`). Do not introduce other icon packs.

### Shared landing components (`@banorte/landing-page`)

Used by `documind`, `sentiment-analysis` and the `landing` app. Exports `Header`, `LoginForm`, `ChatBubble` (Maya widget), `Promotion`, `SecondaryNav`, `SocialIcons`. Import from `@banorte/landing-page`; do not duplicate these per-app.

### Path aliases

Apps with a `src/` directory use the alias `@/*` → `./src/*` (configured in each `tsconfig.json` and mirrored in Jest config). Use absolute `@/...` imports instead of long relatives across layers.

### Environment variables

`turbo.json` declares the full set of `globalEnv` keys Turbo will hash into the cache (so set them locally before building/dev). Highlights:

- AI: `OPENAI_API_KEY`, `GEMINI_API_KEY`, `AI_PROVIDER`, `OLLAMA_BASE_URL`, `OLLAMA_MODEL`, `DEFAULT_MODEL`, `MAX_TOKENS`, `TEMPERATURE`
- Supabase: `SUPABASE_URL`, `SUPABASE_ANON_KEY`
- Postgres (business-rules-api): `DB_USER`, `DB_HOST`, `DB_NAME`, `DB_PASSWORD`, `DB_PORT`, `PORT`
- Oracle (used by some POCs): `ORACLE_HOST`, `ORACLE_PORT`, `ORACLE_SID`, `ORACLE_USER`, `ORACLE_PASSWORD`
- Files: `MAX_FILE_SIZE`, `ALLOWED_FILE_TYPES`, `OWNCLOUD_*`
- Per-app build env: `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_VERCEL_URL`

`turbo.json`'s `globalDependencies` includes `**/.env.*local`, so changing any local env file invalidates Turbo's cache as expected. App-specific env files live at `apps/<app>/.env.local`.

## Conventions to follow

- All UI text in Spanish (es-MX) unless the existing file is English.
- Reuse `@banorte/ui` components and `cn()` rather than building one-off styled components or inlining brand hex values.
- For Clean Architecture apps, route/handler/page code should call into `core/application` use cases obtained from the composition layer — never `new`-up infrastructure directly inside Next.js routes or React components.
- Don't introduce a second icon library, second state-management lib, or alternative className utility — match what the target app already uses.
- `apps/business-rules` deliberately runs on React 19 + MUI v7. Do not "upgrade" or "downgrade" it to align with the rest; instead, keep cross-package shared code free of React-version-specific APIs.
- TypeScript errors in `apps/documind` related to AI SDK version skew are pre-existing and tolerated by the project's README — don't chase them as part of unrelated work.

## Adding a new app

1. `mkdir -p apps/<name>` and scaffold a Next 14 App Router project (`pnpm dlx create-next-app@latest . --typescript --tailwind --app`).
2. In its `package.json`, depend on the workspace packages you need:
   - `"@banorte/ui": "workspace:*"` (or `@banorte/landing-page`) under `dependencies`.
   - `"@banorte/eslint-config": "workspace:*"` and `"@banorte/typescript-config": "workspace:*"` under `devDependencies`.
3. Pick a port that is **not already taken** (see the dev-script table above) and set it in the `dev`/`start` scripts.
4. Extend the Tailwind preset from `@banorte/ui/tailwind/preset` so brand tokens are available.
5. Run `pnpm install` from the repo root, then `pnpm dev:<name>` (after adding a corresponding script to root `package.json` if you want a shortcut).

## Deployment notes

`apps/documind` deploys to Vercel with `Root Directory = apps/documind` and `Build Command = turbo run build --filter=documind`. Vercel + Turborepo only rebuild affected apps. `apps/business-rules-api` deploys separately (see `apps/business-rules-api/railway.json`) since it isn't a Next.js project.
