# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun install          # install dependencies
bun run start        # start Expo dev server (opens QR + platform options)
bun run android      # start targeting Android emulator
bun run ios          # start targeting iOS simulator
bun run web          # start targeting web browser
bun run check        # Biome: lint + format check + import sorting
bun run format       # Biome: auto-format all files
bun run test         # run all Jest tests
bun run test -- --testPathPattern=bll  # run a single test file/folder
```

## Architecture

Pizza dough recipe calculator — React Native / Expo app using **expo-router** for file-based routing. Entry point is `expo-router/entry` (`package.json#main`).

The codebase follows a layered architecture:

- **`types/`** — shared TypeScript types (`Recipe`, `Ingredient`, `CalcByCountResult`, `CalcByFlourResult`, etc.). Import from here everywhere.
- **`bll/`** — pure business logic with no side effects. `calculations.ts` computes ingredient quantities either from ball count or from flour weight. All math lives here; this is the only layer covered by unit tests.
- **`dal/`** — data access layer. `storage.ts` wraps `@react-native-async-storage/async-storage` behind `loadRecipes`/`saveRecipes`.
- **`store/`** — Zustand store (`recipeStore.ts`) wires the DAL into a `persist` middleware adapter, exposing `addRecipe`, `updateRecipe`, `deleteRecipe`. Components read state via `useRecipeStore`.
- **`components/`** — presentational components (`RecipeCard`, `RecipeForm`, `IngredientRow`, `CalculatorForm`). They receive props or call `useRecipeStore` directly.
- **`lib/`** — tiny stateless utilities (`generateId.ts`).

### Routing (`app/`)

- `app/_layout.tsx` — root layout, renders a `<Stack />`.
- `app/(tabs)/_layout.tsx` — tab navigator with two tabs: **Recipes** and **Calculator**.
- `app/(tabs)/recipes.tsx` — recipe list and management.
- `app/(tabs)/calculator.tsx` — calculator screen; pulls recipes from the store and renders `<CalculatorForm>`.

### Testing

Jest via `jest-expo` preset. Tests live in `__tests__/` mirroring the source structure (`__tests__/bll/`, `__tests__/dal/`). The `@/` alias is resolved by `moduleNameMapper` in `jest.config.js`. AsyncStorage is mocked via `jest-setup.ts`.

### Tooling

- **Biome** (`biome.json`) handles linting, formatting, and import sorting. Tabs for indentation, double quotes for JS/TSX. VCS integration is on — Biome respects `.gitignore`.

### Path aliases

`@/` maps to the repo root (`tsconfig.json`). Prefer `@/...` over relative imports.

### Platform splits

Files ending in `.ios.tsx`, `.web.ts`, etc. are auto-selected by Metro/expo-router. Add platform-specific variants alongside the default file when behavior differs.