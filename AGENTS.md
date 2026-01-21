# AGENTS.md

## Build/Lint/Test Commands

**Frontend:** `vite dev`, `vite build`, `bun run lint`
**Backend:** `bun run dev`, `bun run build`, `bun run test`, `bun run test:watch`, `bun test <file>`
**Single Test:** `bun test tests/integration/specific-test.test.ts`
**Integration Tests:** `bun run test:integration`

## Code Style Guidelines

**Imports:** Path aliases (`@/components`, `@/lib`, `@/api`, `@/hooks`) - configured in vite.config.js
**File Extensions:** `.jsx` for React components (not `.tsx`), `.ts` for backend/services
**Package Manager:** Always use `bun` (never npm/yarn/pnpm) - Bun auto-loads .env files
**State Management:** Zustand with selective subscriptions `(state) => state.field`
**UI Framework:** shadcn/ui (New York style, no prefix), Framer Motion animations
**Error Handling:** try/catch with descriptive messages, `@typescript-eslint/no-explicit-any: warn`
**Naming:** camelCase variables/functions, PascalCase components, argsIgnorePattern: `^_`
**Types:** Explicit typing preferred, strict TypeScript in backend (strict: true)
**Linting:** ESLint with React/TypeScript rules, unused vars ignored with `^_` pattern

## Cursor Rules

Always use Bun instead of Node.js, npm, pnpm, or vite. Bun auto-loads .env files.
- Use `bun <file>` instead of `node <file>`, `bun test` instead of jest/vitest
- Prefer Bun APIs: `Bun.serve()`, `bun:sqlite`, `Bun.redis`, `Bun.sql`, `Bun.file`
- Frontend: HTML imports with `Bun.serve()`, no Vite/express needed
- Always use bun as the package manager. Extend the architecture to always be production ready.