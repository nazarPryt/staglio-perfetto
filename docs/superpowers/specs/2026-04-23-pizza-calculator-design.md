# Pizza Dough Calculator — Design Spec

**Date:** 2026-04-23  
**App:** staglio-perfetto (React Native / Expo)

---

## Overview

A pizza dough calculator with two tabs: **Recipes** (manage saved recipes) and **Calculator** (scale a recipe for a given job). Recipes define ingredient proportions anchored to 1 kg of flour. The calculator derives exact gram amounts from ball count or available flour.

---

## Architecture

Three-layer architecture: **DAL → BLL → UI**. UI never touches storage directly.

```
DAL  — AsyncStorage adapter (raw JSON read/write)
BLL  — Zustand store (CRUD actions) + pure calculation functions
UI   — React Native screens and components
```

**State management:** Zustand with AsyncStorage persistence middleware. Recipes load automatically on app start — no manual hydration needed.

---

## File Structure

```
app/
  _layout.tsx                  # root Stack
  (tabs)/
    _layout.tsx                # Tab navigator (Recipes | Calculator)
    recipes.tsx                # Recipes tab screen
    calculator.tsx             # Calculator tab screen

store/
  recipeStore.ts               # Zustand store: recipe state + CRUD actions

bll/
  calculations.ts              # Pure functions: calcByCount, calcByFlour

dal/
  storage.ts                   # AsyncStorage adapter (read/write raw JSON)

components/
  RecipeCard.tsx               # Recipe list row (name, summary, Edit/Delete)
  RecipeForm.tsx               # Create/edit form
  IngredientRow.tsx            # One ingredient row (name + grams + %)
  CalculatorForm.tsx           # Recipe picker, mode toggle, input, result
```

---

## Data Model

```typescript
type Ingredient = {
  id: string
  name: string
  grams: number        // grams per 1 kg of flour (source of truth)
}

type Recipe = {
  id: string
  name: string
  ballWeight: number   // grams per dough ball
  ingredients: Ingredient[]  // water, salt, yeast + optional extras (flour excluded)
  createdAt: number
}
```

**Flour** is implicit — always 1000 g / 100%. Never stored in `ingredients`.  
**Percentage** is always derived: `ingredient.grams / 10` (e.g. 650 g → 65%).  
**Total dough per 1 kg flour** = `1000 + sum(ingredients.grams)`.

Required ingredients (water, salt, yeast) are non-deletable in the form. Custom ingredients can be added and deleted freely.

---

## BLL — Calculation Functions

```typescript
type IngredientResult = { name: string; grams: number; percentage: number }

// Mode 1: I need N dough balls
// flourNeeded = (ballCount × ballWeight) / (1 + sum(ingredient.grams) / 1000)
// each ingredient = flourNeeded × (ingredient.grams / 1000)
function calcByCount(recipe: Recipe, ballCount: number): {
  flourGrams: number
  totalDoughGrams: number
  ingredients: IngredientResult[]
}

// Mode 2: I have X kg of flour
// ballCount = floor((flourKg × 1000 × totalDoughRatio) / ballWeight)
// each ingredient = flourKg × 1000 × (ingredient.grams / 1000)
function calcByFlour(recipe: Recipe, flourKg: number): {
  ballCount: number
  totalDoughGrams: number
  ingredients: IngredientResult[]
}
```

---

## Screens

### Tab 1 — Recipes

- Scrollable list of `RecipeCard` components.
- Each card shows: recipe name, ball weight, one-line ingredient summary (e.g. "Water 65% · Salt 2.5% · Yeast 0.3%").
- **Edit** and **Delete** buttons on each card. Delete shows a confirmation alert before proceeding.
- **"+ New"** button in the header opens the Recipe Form.
- Empty state message when no recipes exist.

### Recipe Form (create / edit)

- Fields: recipe name (text), ball weight (number, grams).
- Ingredient table with columns: **Ingredient name | Grams | %**.
  - Flour row is locked: always 1000 g / 100%, not editable.
  - Water, salt, yeast rows: name locked, grams editable — percentage updates live.
  - Custom ingredient rows: name editable, grams editable, deletable via ✕ button.
  - Entering grams updates % live; entering % updates grams live.
- **"+ Add ingredient"** appends a new blank custom row.
- **Total dough per 1 kg flour** shown as a read-only summary at the bottom.
- **Save** button persists via BLL → DAL.

### Tab 2 — Calculator

- **Recipe picker** (dropdown/modal): shows recipe name. Below it: ball weight + total dough hint from selected recipe.
- **Mode toggle** (segmented control):
  - *How many balls?* — enter ball count → result shows flour + all ingredient grams.
  - *Flour available* — enter flour in kg → result shows ball count + all ingredient grams.
- **Number input** for the selected mode value.
- **Result table**: columns Ingredient | Grams | %. Header row shows total dough summary (e.g. "8 balls × 280g = 2240g total dough").
- Result updates live as the input changes.

---

## Storage

`dal/storage.ts` wraps AsyncStorage with two functions:

```typescript
loadRecipes(): Promise<Recipe[]>
saveRecipes(recipes: Recipe[]): Promise<void>
```

Zustand's persist middleware calls these on hydration and on every store mutation. No manual save calls needed in UI code.

---

## Error Handling & Validation

- Recipe name: required, non-empty.
- Ball weight: required, positive number.
- Ingredient grams: required, positive number.
- Calculator input: positive number, no calculation shown until a value > 0 is entered.
- AsyncStorage errors: logged silently; app continues with in-memory state.

---

## Out of Scope

- Cloud sync or cross-device sharing.
- Recipe duplication / export.
- Fermentation timers, hydration notes, or other metadata.
- Unit switching (grams only).