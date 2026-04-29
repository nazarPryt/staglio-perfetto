# Dough Method Selector — Design Spec

**Date:** 2026-04-29
**Status:** Approved

## Overview

Extend the pizza dough calculator to support three dough methods: Direct, Biga, and Autolyse. Direct is a single-step calculation (existing behaviour). Biga and Autolyse are two-step processes that produce two result blocks in the calculator.

---

## 1. Decisions

| Question | Decision |
|---|---|
| Where do biga/autolyse params live? | Saved in the recipe definition |
| How are ingredient roles identified? | New `type` field on `Ingredient` |
| Biga yeast in pre-dough? | Configurable via `bigaYeastPercentOnBigaFlour` (default 0.2%) |
| Calc result shape? | Discriminated union `kind: "single" \| "two-step"` |
| Baker's % base for biga Step 2? | `totalFlour` (not `finalFlour`) — percentages match real final dough |

---

## 2. Type Changes (`types/recipe.ts`)

### New enums

```typescript
export type DoughMethod = "direct" | "biga" | "autolyse";
export type IngredientType = "water" | "yeast" | "salt" | "other";
```

### `Ingredient` — add `type`

```typescript
export type Ingredient = {
  id: string;
  name: string;
  grams: number;           // baker's % × 10 (e.g. 65% hydration → 650)
  type: IngredientType;    // NEW — default "other"
};
```

### `Recipe` — add method + params

```typescript
export type Recipe = {
  id: string;
  name: string;
  ballWeight: number;
  ingredients: Ingredient[];
  createdAt: number;

  doughMethod: DoughMethod;                   // default "direct"
  prefermentFlourPct?: number;                // biga: e.g. 40
  prefermentHydration?: number;               // biga: e.g. 45
  bigaYeastPercentOnBigaFlour?: number;       // biga: e.g. 0.2 (default 0.2)
  autolyseWaterPct?: number;                  // autolyse: % of water in step 1 (default 100)
};
```

### `IngredientResult` — add `type` and `source`

```typescript
export type IngredientResult = {
  name: string;
  grams: number;
  percentage: number;
  type: IngredientType;
  source?: "base" | "preferment";  // "preferment" = Biga / Autolyse carry-over line
};
```

### New result types

```typescript
export type StepIngredients = {
  flourBase: number;         // explicit baker's % anchor for this step
  flourGrams: number;        // actual flour added in this step (0 for autolyse step 2)
  totalFlourGrams: number;   // aggregate including preferment flour (for display)
  totalWaterGrams: number;   // aggregate for hydration display
  totalGrams: number;
  ingredients: IngredientResult[];
};

export type SingleDoughResult = {
  kind: "single";
  flourGrams: number;
  totalDoughGrams: number;
  ballCount?: number;
  ingredients: IngredientResult[];
};

export type TwoStepDoughResult = {
  kind: "two-step";
  step1Label: string;          // "Biga" or "Autolyse"
  totalFlourGrams: number;
  totalDoughGrams: number;
  ballCount?: number;
  step1: StepIngredients;
  step2: StepIngredients;
};

export type DoughCalcResult = SingleDoughResult | TwoStepDoughResult;
```

Existing `CalcByCountResult` / `CalcByFlourResult` are retained. `calcByCount` / `calcByFlour` are unchanged; `calculatorUtils.calcResult()` wraps their output into `SingleDoughResult`.

`calcResultHeader()` in `calculatorUtils.ts` is updated to accept `DoughCalcResult` — for `kind: "two-step"` it generates the same header line (totals) as today; the step labels come from `step1Label` on the result.

---

## 3. BLL (`bll/calculations.ts`)

Two new pure functions. Both accept pre-computed `totalFlourGrams` (derived by the caller from ball count or flour kg).

### `calcBiga(recipe, totalFlourGrams): TwoStepDoughResult`

```
// Derived percentages (ingredient.grams = baker's % × 10)
hydrationPct = waterIngredient.grams / 10
yeastPct     = yeastIngredient.grams / 10
saltPct      = saltIngredient.grams  / 10

// Flour split
bigaFlour  = totalFlour × prefermentFlourPct / 100
finalFlour = totalFlour − bigaFlour

// Water split
totalWater = totalFlour × (hydrationPct / 100)
bigaWater  = bigaFlour  × (prefermentHydration / 100)
VALIDATE:  bigaWater ≤ totalWater  → else return error
finalWater = totalWater − bigaWater

// Yeast split
totalYeast = totalFlour × (yeastPct / 100)
bigaYeast  = bigaFlour  × (bigaYeastPercentOnBigaFlour / 100)
VALIDATE:  bigaYeast ≤ totalYeast  → else return error
finalYeast = totalYeast − bigaYeast

// Other ingredients (all go to step 2)
saltGrams  = totalFlour × (saltPct / 100)
otherGrams = totalFlour × (otherPct / 100)   // per "other" ingredient

Step 1 — flourBase = bigaFlour
  ingredients: [flour, bigaWater, bigaYeast]
  % relative to bigaFlour

Step 2 — flourBase = totalFlour
  ingredients: [finalFlour, finalWater, finalYeast, salt, other,
                { name:"Biga", grams:step1.totalGrams,
                  percentage: step1.totalGrams/totalFlour×100,
                  source:"preferment" }]
  % relative to totalFlour
  (Biga line may exceed 100% — expected and correct)
```

**Closure check:**
- `bigaWater + finalWater = totalWater` ✓
- `bigaYeast + finalYeast = totalYeast` ✓
- `bigaFlour + finalFlour = totalFlour` ✓

### `calcAutolyse(recipe, totalFlourGrams): TwoStepDoughResult`

```
totalWater    = totalFlour × (hydrationPct / 100)
autolyseWater = totalWater × (autolyseWaterPct / 100)   // default: 100%
finalWater    = totalWater − autolyseWater               // 0 when 100%

Step 1 — flourBase = totalFlour
  ingredients: [flour, autolyseWater]
  % relative to totalFlour

Step 2 — flourBase = totalFlour   ← explicit, not implicit
  ingredients: [salt, yeast, other,
                finalWater (only if > 0),
                { name:"Autolyse", grams:step1.totalGrams,
                  percentage: step1.totalGrams/totalFlour×100,
                  source:"preferment" }]
  % relative to totalFlour
```

### Dispatch in `calculatorUtils.calcResult()`

```typescript
// Returns DoughCalcResult | null
export const calcResult = (recipe, mode, inputValue): DoughCalcResult | null => {
  const val = parseFloat(inputValue);
  if (!(val > 0)) return null;
  const totalFlour = deriveTotalFlour(recipe, mode, val);  // extracted helper
  switch (recipe.doughMethod) {
    case "biga":      return calcBiga(recipe, totalFlour);
    case "autolyse":  return calcAutolyse(recipe, totalFlour);
    default:          return wrapSingle(calcByCount/calcByFlour ...);
  }
};
```

---

## 4. Recipe Form UI

**`RecipeBasicFields.tsx`** — add below ball weight:

- **Dough Method** — 3-option toggle: Direct / Biga / Autolyse
- **Biga params** (visible only when Biga selected):
  - Preferment Flour % (default 40)
  - Preferment Hydration % (default 45)
  - Biga Yeast % on Biga Flour (default 0.2)
- **Autolyse params** (visible only when Autolyse selected):
  - Autolyse Water % (default 100)

**`components/recipe-form/IngredientsTable.tsx`** — each ingredient row gains a `type` picker (water / yeast / salt / other), default "other". The `formReducer` state and actions are extended to carry `type` alongside the existing `name` / `grams` fields per ingredient.

---

## 5. Calculator UI

**`CalculatorForm.tsx`** — no method selector needed; method comes from the selected recipe.

- Show a small method badge (e.g. `[BIGA]`) next to the result header.
- Switch on `result.kind`:
  - `"single"` → existing `<ResultTable>` (unchanged)
  - `"two-step"` → two `<ResultTable>` blocks stacked, labelled "Step 1 — {step1Label}" and "Step 2 — Final Dough", plus a totals summary row.
- **Preview modal** — same switch: shows both steps when `kind === "two-step"`.

**Preferment ingredient line** styled differently (highlighted row, `source === "preferment"`).

---

## 6. Validation

Both `calcBiga` and `calcAutolyse` return a typed error when constraints are violated. A new `CalcError` type is added to `types/recipe.ts`:

```typescript
export type CalcError = { kind: "error"; message: string };
export type DoughCalcResult = SingleDoughResult | TwoStepDoughResult | CalcError;
```

`CalculatorForm` renders an inline error message when `result.kind === "error"`.

Validation conditions:

| Condition | Error message |
|---|---|
| `bigaWater > totalWater` | "Biga hydration exceeds recipe hydration — lower preferment hydration or increase recipe water" |
| `bigaYeast > totalYeast` | "Biga yeast exceeds total yeast — lower biga yeast % or increase recipe yeast" |

---

## 7. Testing

New test files in `__tests__/bll/`:
- `calcBiga.test.ts` — flour split, water split, yeast split, validation errors
- `calcAutolyse.test.ts` — full water, partial water, totals closure

Existing `calculations.test.ts` unchanged.

---

## 8. Out of Scope

- Poolish (future method, same pattern)
- Per-ingredient step assignment (ingredients are routed by `type`, not user choice)
- Multi-language ingredient name detection