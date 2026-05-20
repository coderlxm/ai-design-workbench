# Repository Guidelines

## Project Structure & Module Organization
- Core app code lives in `src/`.
- Route views are in `src/views/`; shared UI is in `src/components/` (grouped by feature such as `layout/`, `prompt/`, `workflow/`).
- State management uses Pinia stores in `src/stores/`; reusable logic is in `src/composables/`.
- API/workflow logic and mock generation services are in `src/services/`.
- Global styles are in `src/assets/styles/`; static workflow images are under `image/` (`models/`, `scenes/`, `templates/`, `thumbnails/`).
- Product docs and plans are in `doc/` and `design/`.

## Build, Test, and Development Commands
- `pnpm dev`: start Vite dev server on `0.0.0.0:5173`.
- `pnpm build`: run strict type-check (`vue-tsc`) and production build.
- `pnpm preview`: serve the built app locally on `0.0.0.0:4173`.
- `pnpm test`: run Vitest in run mode.

## Coding Style & Naming Conventions
- Use TypeScript with Vue 3 SFCs and `<script setup lang="ts">`.
- Follow existing formatting: 2-space indentation, single quotes in TS, and trailing commas where present.
- Use PascalCase for component files (`HomeView.vue`, `BaseInput.vue`), camelCase for functions/variables, and lower-case route names (`home`, `records`).
- Prefer alias imports via `@/` for files under `src/`.
- Keep feature code co-located (component + related composable/store/service).

## Testing Guidelines
- Test stack: Vitest + `@vue/test-utils` + `jsdom`.
- Add unit tests as `*.test.ts` near the target module or under a local `__tests__/` folder.
- Prioritize coverage for composables, stores, and service logic in `src/services/`.
- Run `pnpm test` before opening a PR; run `pnpm build` for type-safety regression checks.

## Commit & Pull Request Guidelines
- Current history uses Conventional Commit style (example: `feat: implement ai design workbench mvp`); continue with `feat:`, `fix:`, `chore:`, etc.
- Keep commits focused and scoped to one concern.
- PRs should include: concise summary, affected paths, test/build evidence, and screenshots or short clips for UI changes.
- Link related issue/task IDs when available and note any follow-up TODOs (for example model API integration points in `src/services/`).
