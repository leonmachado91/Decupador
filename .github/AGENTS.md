# Copilot instructions for Decupador

This project is a Next.js (app router) TypeScript frontend scaffolded with a small design-system under `components/ui`.
Keep edits minimal, idiomatic, and focused — follow the project's existing patterns and file layout.

Key facts (read these first):
- Framework: Next.js 16 (app router) with React 19 and TypeScript.
- Package manager: pnpm (presence of `pnpm-lock.yaml`). Use `pnpm` commands in examples.
- Main entry points: `app/layout.tsx`, `app/page.tsx` (routing + top-level layout), `components/main-interface.tsx` (primary UI composition).
- Design system: reusable primitives live in `components/ui/*`. Feature components live in `components/`.

Developer workflows (exact commands):
- Install deps: `pnpm install`
- Dev server: `pnpm dev` (runs `next dev`)
- Build for prod: `pnpm build` (runs `next build`)
- Start production server: `pnpm start` (runs `next start`)
- Lint: `pnpm lint` (runs `eslint .`)

Project-specific conventions and patterns:
- app router + server/client split: files under `app/` follow Next's app-router. Add `"use client"` at the top of any file that must run on the client (see `app/page.tsx`).
- UI primitives vs features: put cross-project UI atoms (Button, Input, Toast, etc.) in `components/ui/`. Place composed feature views like `ImportScreen`, `ScriptView`, `TableView` in `components/`.
- ClassName helper: use the `cn` utility from `lib/utils.ts` to merge class strings (it wraps `clsx` + `tailwind-merge`).
- State & side-effect patterns: the `use-toast` hook uses an in-memory listeners approach (see `hooks/use-toast.ts`) — prefer calling the exported `toast()`/`useToast()` helpers rather than reimplementing.
- File exports: many components use named exports (e.g. `export function MainInterface(...)`). Keep that style unless adding a new local-only helper.

Important config notes (so suggestions don't break CI/runtime):
- `next.config.mjs` sets `typescript.ignoreBuildErrors = true`. The build may succeed even if there are TS errors — avoid introducing new type-only regressions.
- `images.unoptimized = true` is set; avoid suggesting aggressive image optimization config changes without confirming intent.
- Fonts are initialized in `app/layout.tsx` via `next/font/google`; prefer keeping font setup there.

Examples to reference when editing or adding features:
- Main view composition: `app/page.tsx` decides between `ImportScreen` and `MainInterface` based on local state.
- Header & actions: `components/main-interface.tsx` shows the canonical pattern for toggles, action buttons, and passing `scriptData` into `ScriptView` and `TableView`.
- Utility usage: use `cn(...)` from `lib/utils.ts` for conditional Tailwind classes.

When changing code, follow these practical rules:
- Keep changes small and local; prefer adding helpers under `lib/` or `hooks/` if re-used across components.
- For client interactions, ensure `"use client"` is present at file top and imports are compatible with client runtime.
- Update `package.json` and lockfile via `pnpm install` when adding new deps; do not commit `node_modules`.
- Preserve existing export styles and naming conventions for UI primitives.

What not to change without confirmation:
- Global Next.js config (`next.config.mjs`) and TypeScript strictness settings.
- Tailwind/Tailwind-merge utility behavior (`twMerge`) — existing class merging strategy is relied on across components.

Files to check for examples and cross-references:
- `package.json` (scripts & deps)
- `next.config.mjs` (Next settings)
- `app/layout.tsx`, `app/page.tsx` (layout + routing)
- `components/main-interface.tsx`, `components/import-screen.tsx`, `components/script-view.tsx`, `components/table-view.tsx`
- `components/ui/*` (design-system primitives)
- `hooks/use-toast.ts`, `hooks/use-mobile.ts`
- `lib/utils.ts` (cn helper)

If you need more context or want a different balance between verbosity and examples, tell me which area to expand (build/test, UI patterns, or state/data flow) and I'll refine this file.
