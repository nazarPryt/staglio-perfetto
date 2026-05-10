# CLAUDE.md

## Commands

```bash
bun install
bun run start        # Expo dev server
bun run android      # Android emulator
bun run ios          # iOS simulator
bun run web
bun run check        # Biome lint + format check (run before committing)
bun run format       # Biome auto-format
bun run test
bun run test -- --testPathPattern=bll   # single file/folder
maestro test e2e/flows/calc_direct.yaml # e2e (requires running emulator)
```

## Layout

All source lives under `src/`. The `@/` alias resolves to `src/` (not the repo root — the old config pointed to root; it was corrected).

Layers: `types/` → `bll/` → `dal/` → `store/` → `components/` → `app/`

Tests mirror source under `src/__tests__/`. E2E flows are in `e2e/flows/` (happy paths), `e2e/flows/edge/` (boundary/error cases), `e2e/helpers/` (setup helpers).

## Non-obvious domain rules

**Baker's percentages:** `Ingredient.grams` is stored per 1000g flour. 65% hydration = `{ grams: 650 }`. The UI converts to/from % using `pct × 10 = grams`.

**Rounding:** All calc results use `Math.round(n * 10) / 10`. Never introduce more decimal places.

**Biga returns errors:** `calcBiga` returns `CalcError` (not throws) when preferment water exceeds total water or preferment yeast exceeds total yeast. `CalculatorForm` renders errors inline.

**Locked ingredients:** `REQUIRED_IDS = Set(["water", "salt", "yeast"])` — these rows cannot be removed or renamed.

**Preferment source:** `IngredientResult.source === "preferment"` marks mixed-in preferment ingredients; `ResultTable` / `TwoStepResult` render them in green (`bg-preferment` / `accent-green` tokens).

## Non-obvious implementation details

**`formReducer` stores numerics as strings** — all form fields (ballWeight, preferment percentages, etc.) are kept as raw strings so TextInput stays controlled. Parse on save, not in the reducer.

**`calculatorReducer` clears input on recipe/mode change** — `SELECT_RECIPE` and `SET_MODE` both reset `inputValue` to `""`.

**Custom Zustand storage adapter** — `recipeStore` uses a hand-rolled `dalStorage` adapter (not the built-in localStorage shim) to bridge Zustand `persist` middleware with the DAL's async `loadRecipes`/`saveRecipes`. Only `{ recipes }` is serialized.

**Metro forces Zustand CJS on web** — Zustand's ESM build uses `import.meta`, which Metro doesn't support. `metro.config.js` explicitly resolves the CJS version for the web platform. Don't remove this without testing web.

**`ResultModal` keeps the screen awake** via `expo-keep-awake` — intentional so the recipe stays visible while baking.

## Tooling

- **Biome** (`biome.json`): tabs, double quotes, VCS-aware. Single tool for lint + format + import sort.
- **NativeWind 4 + Tailwind 3**: custom dark theme tokens in `tailwind.config.js`. Use existing tokens (`bg-surface`, `accent-blue`, `text-muted`, etc.) rather than raw hex values.
- **jest-expo** preset; AsyncStorage mocked in `jest-setup.ts`.