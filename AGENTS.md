# AGENTS.md

## Build/Lint/Test Commands

**Frontend:**
- `bun run dev` - Start development server
- `bun run build` - Production build
- `bun run lint` - Run ESLint

**Backend:**
- `bun run dev` - Start backend server
- `bun run build` - Build backend
- `bun run test` - Run all tests
- `bun run test:watch` - Watch mode tests
- `bun test <file>` - Run single test file

## Code Style Guidelines

**Imports:** Use path aliases (`@/components`, `@/lib`, `@/api`, `@/hooks`)
**File Extensions:** Use `.jsx` (not `.tsx`)
**Package Manager:** Always use `bun` (never npm/yarn/pnpm)
**State:** Zustand stores with selective subscriptions `(state) => state.field`
**UI:** shadcn/ui components (New York style, no prefix)
**Animations:** Import `motion` from `@/components/config/motion`
**Error Handling:** Use try/catch with descriptive error messages
**Naming:** camelCase for variables/functions, PascalCase for components
**Types:** Prefer explicit typing, use TypeScript features when available

## Cursor Rules

Always use Bun instead of Node.js, npm, pnpm, or vite. Bun automatically loads .env files.