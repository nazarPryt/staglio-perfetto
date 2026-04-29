# Dough Method Selector Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Direct / Biga / Autolyse dough method selection, with two-step output for Biga and Autolyse.

**Architecture:** Method and parameters are stored on the Recipe. `calcBiga` / `calcAutolyse` are pure functions in `bll/calculations.ts` returning `TwoStepDoughResult | CalcError`. `calcResult()` in `calculatorUtils.ts` dispatches by `recipe.doughMethod` and returns `DoughCalcResult` (discriminated union). The calculator UI switches on `result.kind` to render `ResultTable` (single) or `TwoStepResult` (two-step).

**Tech Stack:** React Native / Expo, TypeScript, Zustand, Jest via `jest-expo`, Biome lint/format, Bun.

---

## File Map

**Modified:**
- `src/types/recipe.ts` — add new types
- `src/bll/ingredientUtils.ts` — add `type` to defaults, add `setIngredientType`
- `src/bll/calculations.ts` — add `calcBiga`, `calcAutolyse`
- `src/bll/calculatorUtils.ts` — update `calcResult`, add `deriveTotalFlour`, update `calcResultHeader`
- `src/components/recipe-form/formReducer.ts` — add dough method + params to state/actions
- `src/components/recipe-form/RecipeBasicFields.tsx` — add method toggle + conditional param inputs
- `src/components/recipe-form/IngredientsTable.tsx` — add `onUpdateType` prop + type column header
- `src/components/IngredientRow.tsx` — add `type` prop + type picker chips
- `src/components/RecipeForm.tsx` — wire new fields, update `handleSave`
- `src/components/calculator/ResultTable.tsx` — update prop type, highlight preferment rows
- `src/components/calculator/ResultModal.tsx` — accept `DoughCalcResult`, render two-step
- `src/components/calculator/index.ts` — export `TwoStepResult`
- `src/components/CalculatorForm.tsx` — switch on `result.kind`, show error

**New:**
- `src/__tests__/bll/calcBiga.test.ts`
- `src/__tests__/bll/calcAutolyse.test.ts`
- `src/components/calculator/TwoStepResult.tsx`

---

## Task 1: Extend types

**Files:**
- Modify: `src/types/recipe.ts`

- [ ] **Step 1: Replace the full contents of `src/types/recipe.ts`**

```typescript
export type DoughMethod = "direct" | "biga" | "autolyse";
export type IngredientType = "water" | "yeast" | "salt" | "other";

export type Ingredient = {
	id: string;
	name: string;
	grams: number;
	type?: IngredientType;
};

export type Recipe = {
	id: string;
	name: string;
	ballWeight: number;
	ingredients: Ingredient[];
	createdAt: number;
	doughMethod?: DoughMethod;
	prefermentFlourPct?: number;
	prefermentHydration?: number;
	bigaYeastPercentOnBigaFlour?: number;
	autolyseWaterPct?: number;
};

export type IngredientResult = {
	name: string;
	grams: number;
	percentage: number;
	type?: IngredientType;
	source?: "base" | "preferment";
};

export type CalcByCountResult = {
	flourGrams: number;
	totalDoughGrams: number;
	ingredients: IngredientResult[];
};

export type CalcByFlourResult = {
	ballCount: number;
	flourGrams: number;
	totalDoughGrams: number;
	ingredients: IngredientResult[];
};

export type StepIngredients = {
	flourBase: number;
	flourGrams: number;
	totalFlourGrams: number;
	totalWaterGrams: number;
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
	step1Label: string;
	totalFlourGrams: number;
	totalDoughGrams: number;
	ballCount?: number;
	step1: StepIngredients;
	step2: StepIngredients;
};

export type CalcError = { kind: "error"; message: string };

export type DoughCalcResult = SingleDoughResult | TwoStepDoughResult | CalcError;

export type Mode = "by-count" | "by-flour";
```

- [ ] **Step 2: Verify existing tests still pass (types are additive / optional)**

```bash
bun run test
```

Expected: all existing tests pass (new fields are optional so no breakage).

- [ ] **Step 3: Commit**

```bash
git add src/types/recipe.ts
git commit -m "feat(types): add DoughMethod, IngredientType, two-step result types"
```

---

## Task 2: Update ingredientUtils defaults

**Files:**
- Modify: `src/bll/ingredientUtils.ts`
- Modify: `src/__tests__/bll/ingredientUtils.test.ts`

- [ ] **Step 1: Add failing test for `setIngredientType`**

Append to `src/__tests__/bll/ingredientUtils.test.ts`:

```typescript
import {
	addIngredient,
	calcTotalDough,
	removeIngredient,
	setIngredientGrams,
	setIngredientName,
	setIngredientPercentage,
	setIngredientType,
} from "@/bll/ingredientUtils";
import type { Ingredient } from "@/types/recipe";
```

*(Update the existing import to add `setIngredientType`)*

Append at the end of the file:

```typescript
describe("setIngredientType", () => {
	test("updates type for matching id", () => {
		const result = setIngredientType(base, "water", "water");
		expect(result.find((i) => i.id === "water")?.type).toBe("water");
	});

	test("leaves other ingredients unchanged", () => {
		const result = setIngredientType(base, "water", "water");
		expect(result.find((i) => i.id === "salt")?.type).toBeUndefined();
	});
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
bun run test -- --testPathPattern=ingredientUtils
```

Expected: FAIL — `setIngredientType is not a function`

- [ ] **Step 3: Update `src/bll/ingredientUtils.ts`**

```typescript
import { generateId } from "@/lib/generateId";
import type { Ingredient, IngredientType } from "@/types/recipe";

export const REQUIRED_IDS = new Set(["water", "salt", "yeast"]);

export const DEFAULT_INGREDIENTS: Ingredient[] = [
	{ id: "water", name: "Water", grams: 650, type: "water" },
	{ id: "salt", name: "Salt", grams: 25, type: "salt" },
	{ id: "yeast", name: "Yeast", grams: 3, type: "yeast" },
];

export const setIngredientGrams = (
	ingredients: Ingredient[],
	id: string,
	raw: string,
): Ingredient[] =>
	ingredients.map((i) =>
		i.id === id ? { ...i, grams: parseFloat(raw) || 0 } : i,
	);

export const setIngredientPercentage = (
	ingredients: Ingredient[],
	id: string,
	raw: string,
): Ingredient[] => {
	const pct = parseFloat(raw) || 0;
	return ingredients.map((i) => (i.id === id ? { ...i, grams: pct * 10 } : i));
};

export const setIngredientName = (
	ingredients: Ingredient[],
	id: string,
	value: string,
): Ingredient[] =>
	ingredients.map((i) => (i.id === id ? { ...i, name: value } : i));

export const setIngredientType = (
	ingredients: Ingredient[],
	id: string,
	type: IngredientType,
): Ingredient[] =>
	ingredients.map((i) => (i.id === id ? { ...i, type } : i));

export const addIngredient = (ingredients: Ingredient[]): Ingredient[] => [
	...ingredients,
	{ id: generateId(), name: "", grams: 0 },
];

export const removeIngredient = (
	ingredients: Ingredient[],
	id: string,
): Ingredient[] => ingredients.filter((i) => i.id !== id);

export const calcTotalDough = (ingredients: Ingredient[]): number =>
	1000 + ingredients.reduce((sum, i) => sum + i.grams, 0);
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
bun run test -- --testPathPattern=ingredientUtils
```

Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add src/bll/ingredientUtils.ts src/__tests__/bll/ingredientUtils.test.ts
git commit -m "feat(ingredientUtils): add type to defaults, add setIngredientType"
```

---

## Task 3: Implement calcBiga (TDD)

**Files:**
- Create: `src/__tests__/bll/calcBiga.test.ts`
- Modify: `src/bll/calculations.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/__tests__/bll/calcBiga.test.ts`:

```typescript
import { calcBiga } from "@/bll/calculations";
import type { CalcError, Recipe, TwoStepDoughResult } from "@/types/recipe";

const recipe: Recipe = {
	id: "r1",
	name: "Biga Pizza",
	ballWeight: 280,
	doughMethod: "biga",
	prefermentFlourPct: 40,
	prefermentHydration: 45,
	bigaYeastPercentOnBigaFlour: 0.2,
	ingredients: [
		{ id: "water", name: "Water", grams: 650, type: "water" },
		{ id: "salt", name: "Salt", grams: 25, type: "salt" },
		{ id: "yeast", name: "Yeast", grams: 3, type: "yeast" },
	],
	createdAt: 0,
};

// totalFlour = 1000g
// bigaFlour = 400, finalFlour = 600
// totalWater = 650, bigaWater = 180, finalWater = 470
// totalYeast = 3, bigaYeast = 0.8, finalYeast = 2.2
// saltGrams = 25, step1.totalGrams = 580.8

describe("calcBiga", () => {
	test("returns kind two-step", () => {
		const result = calcBiga(recipe, 1000);
		expect(result.kind).toBe("two-step");
	});

	test("step1Label is Biga", () => {
		const result = calcBiga(recipe, 1000) as TwoStepDoughResult;
		expect(result.step1Label).toBe("Biga");
	});

	test("step1 flourGrams is prefermentFlourPct of totalFlour", () => {
		const result = calcBiga(recipe, 1000) as TwoStepDoughResult;
		expect(result.step1.flourGrams).toBe(400);
	});

	test("step2 flourGrams is remaining flour", () => {
		const result = calcBiga(recipe, 1000) as TwoStepDoughResult;
		expect(result.step2.flourGrams).toBe(600);
	});

	test("flour closure: step1.flourGrams + step2.flourGrams = totalFlour", () => {
		const result = calcBiga(recipe, 1000) as TwoStepDoughResult;
		expect(result.step1.flourGrams + result.step2.flourGrams).toBeCloseTo(1000);
	});

	test("water closure: step1.totalWaterGrams + step2.totalWaterGrams = total water", () => {
		const result = calcBiga(recipe, 1000) as TwoStepDoughResult;
		expect(result.step1.totalWaterGrams + result.step2.totalWaterGrams).toBeCloseTo(650);
	});

	test("yeast closure: biga yeast + final yeast = total yeast", () => {
		const result = calcBiga(recipe, 1000) as TwoStepDoughResult;
		const bigaYeast = result.step1.ingredients.find((i) => i.type === "yeast")?.grams ?? 0;
		const finalYeast = result.step2.ingredients.find((i) => i.type === "yeast")?.grams ?? 0;
		expect(bigaYeast + finalYeast).toBeCloseTo(3);
	});

	test("step1 flourBase equals bigaFlour", () => {
		const result = calcBiga(recipe, 1000) as TwoStepDoughResult;
		expect(result.step1.flourBase).toBe(400);
	});

	test("step2 flourBase equals totalFlour", () => {
		const result = calcBiga(recipe, 1000) as TwoStepDoughResult;
		expect(result.step2.flourBase).toBe(1000);
	});

	test("step2 has Biga preferment ingredient", () => {
		const result = calcBiga(recipe, 1000) as TwoStepDoughResult;
		const biga = result.step2.ingredients.find((i) => i.source === "preferment");
		expect(biga).toBeDefined();
		expect(biga?.name).toBe("Biga");
		expect(biga?.grams).toBeCloseTo(580.8, 0);
	});

	test("totalDoughGrams equals flour + water + yeast + salt", () => {
		const result = calcBiga(recipe, 1000) as TwoStepDoughResult;
		expect(result.totalDoughGrams).toBeCloseTo(1678, 0);
	});

	test("returns error when bigaWater exceeds totalWater", () => {
		const r = { ...recipe, prefermentHydration: 200 };
		const result = calcBiga(r, 1000);
		expect(result.kind).toBe("error");
		expect((result as CalcError).message).toMatch(/hydration/i);
	});

	test("returns error when bigaYeast exceeds totalYeast", () => {
		const r = { ...recipe, bigaYeastPercentOnBigaFlour: 5 };
		const result = calcBiga(r, 1000);
		expect(result.kind).toBe("error");
		expect((result as CalcError).message).toMatch(/yeast/i);
	});
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
bun run test -- --testPathPattern=calcBiga
```

Expected: FAIL — `calcBiga is not a function`

- [ ] **Step 3: Implement `calcBiga` in `src/bll/calculations.ts`**

Update the import block at the top of the file:

```typescript
import type {
	CalcByCountResult,
	CalcByFlourResult,
	CalcError,
	IngredientResult,
	IngredientType,
	Recipe,
	StepIngredients,
	TwoStepDoughResult,
} from "@/types/recipe";
```

Append at the end of the file:

```typescript
export function calcBiga(
	recipe: Recipe,
	totalFlourGrams: number,
): TwoStepDoughResult | CalcError {
	const {
		prefermentFlourPct = 40,
		prefermentHydration = 45,
		bigaYeastPercentOnBigaFlour = 0.2,
		ingredients,
	} = recipe;

	const waterIng = ingredients.find((i) => i.type === "water");
	const yeastIng = ingredients.find((i) => i.type === "yeast");
	const saltIng = ingredients.find((i) => i.type === "salt");
	const otherIngs = ingredients.filter((i) => !i.type || i.type === "other");

	const hydrationPct = waterIng ? waterIng.grams / 10 : 0;
	const yeastPct = yeastIng ? yeastIng.grams / 10 : 0;
	const saltPct = saltIng ? saltIng.grams / 10 : 0;

	const bigaFlour = round1((totalFlourGrams * prefermentFlourPct) / 100);
	const finalFlour = round1(totalFlourGrams - bigaFlour);

	const totalWater = round1((totalFlourGrams * hydrationPct) / 100);
	const bigaWater = round1((bigaFlour * prefermentHydration) / 100);
	if (bigaWater > totalWater) {
		return {
			kind: "error",
			message:
				"Biga hydration exceeds recipe hydration — lower preferment hydration or increase recipe water",
		};
	}
	const finalWater = round1(totalWater - bigaWater);

	const totalYeast = round1((totalFlourGrams * yeastPct) / 100);
	const bigaYeast = round1((bigaFlour * bigaYeastPercentOnBigaFlour) / 100);
	if (bigaYeast > totalYeast) {
		return {
			kind: "error",
			message:
				"Biga yeast exceeds total yeast — lower biga yeast % or increase recipe yeast",
		};
	}
	const finalYeast = round1(totalYeast - bigaYeast);
	const saltGrams = round1((totalFlourGrams * saltPct) / 100);

	const step1Ingredients: IngredientResult[] = [
		{
			name: waterIng?.name ?? "Water",
			grams: bigaWater,
			percentage: round1(prefermentHydration),
			type: "water",
		},
		{
			name: yeastIng?.name ?? "Yeast",
			grams: bigaYeast,
			percentage: round1(bigaYeastPercentOnBigaFlour),
			type: "yeast",
		},
	];
	const step1TotalGrams = round1(bigaFlour + bigaWater + bigaYeast);

	const step2Ingredients: IngredientResult[] = [
		{
			name: waterIng?.name ?? "Water",
			grams: finalWater,
			percentage: round1((finalWater / totalFlourGrams) * 100),
			type: "water",
		},
		{
			name: yeastIng?.name ?? "Yeast",
			grams: finalYeast,
			percentage: round1((finalYeast / totalFlourGrams) * 100),
			type: "yeast",
		},
	];
	if (saltIng) {
		step2Ingredients.push({
			name: saltIng.name,
			grams: saltGrams,
			percentage: round1(saltPct),
			type: "salt",
		});
	}
	for (const ing of otherIngs) {
		const grams = round1((totalFlourGrams * (ing.grams / 10)) / 100);
		step2Ingredients.push({
			name: ing.name,
			grams,
			percentage: round1(ing.grams / 10),
			type: "other" as IngredientType,
		});
	}
	step2Ingredients.push({
		name: "Biga",
		grams: step1TotalGrams,
		percentage: round1((step1TotalGrams / totalFlourGrams) * 100),
		source: "preferment",
		type: "other" as IngredientType,
	});

	const step2TotalGrams = round1(
		finalFlour + step2Ingredients.reduce((s, i) => s + i.grams, 0),
	);
	const otherTotal = otherIngs.reduce(
		(s, i) => s + round1((totalFlourGrams * (i.grams / 10)) / 100),
		0,
	);
	const totalDoughGrams = round1(
		totalFlourGrams + totalWater + totalYeast + saltGrams + otherTotal,
	);

	return {
		kind: "two-step",
		step1Label: "Biga",
		totalFlourGrams,
		totalDoughGrams,
		step1: {
			flourBase: bigaFlour,
			flourGrams: bigaFlour,
			totalFlourGrams: bigaFlour,
			totalWaterGrams: bigaWater,
			totalGrams: step1TotalGrams,
			ingredients: step1Ingredients,
		},
		step2: {
			flourBase: totalFlourGrams,
			flourGrams: finalFlour,
			totalFlourGrams,
			totalWaterGrams: finalWater,
			totalGrams: step2TotalGrams,
			ingredients: step2Ingredients,
		},
	};
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
bun run test -- --testPathPattern=calcBiga
```

Expected: all 12 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/bll/calculations.ts src/__tests__/bll/calcBiga.test.ts
git commit -m "feat(bll): implement calcBiga with validation"
```

---

## Task 4: Implement calcAutolyse (TDD)

**Files:**
- Create: `src/__tests__/bll/calcAutolyse.test.ts`
- Modify: `src/bll/calculations.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/__tests__/bll/calcAutolyse.test.ts`:

```typescript
import { calcAutolyse } from "@/bll/calculations";
import type { Recipe, TwoStepDoughResult } from "@/types/recipe";

const recipe: Recipe = {
	id: "r2",
	name: "Autolyse Pizza",
	ballWeight: 280,
	doughMethod: "autolyse",
	autolyseWaterPct: 100,
	ingredients: [
		{ id: "water", name: "Water", grams: 650, type: "water" },
		{ id: "salt", name: "Salt", grams: 25, type: "salt" },
		{ id: "yeast", name: "Yeast", grams: 3, type: "yeast" },
	],
	createdAt: 0,
};

// totalFlour = 1000g, autolyseWaterPct = 100%
// totalWater = 650, autolyseWater = 650, finalWater = 0
// step1.totalGrams = 1650, totalDoughGrams = 1678

describe("calcAutolyse", () => {
	test("returns kind two-step", () => {
		const result = calcAutolyse(recipe, 1000);
		expect(result.kind).toBe("two-step");
	});

	test("step1Label is Autolyse", () => {
		const result = calcAutolyse(recipe, 1000) as TwoStepDoughResult;
		expect(result.step1Label).toBe("Autolyse");
	});

	test("step1 flourGrams equals totalFlour", () => {
		const result = calcAutolyse(recipe, 1000) as TwoStepDoughResult;
		expect(result.step1.flourGrams).toBe(1000);
	});

	test("step1 contains all water when autolyseWaterPct is 100", () => {
		const result = calcAutolyse(recipe, 1000) as TwoStepDoughResult;
		expect(result.step1.totalWaterGrams).toBe(650);
	});

	test("step2 flourGrams is 0 (all flour in step1)", () => {
		const result = calcAutolyse(recipe, 1000) as TwoStepDoughResult;
		expect(result.step2.flourGrams).toBe(0);
	});

	test("step2 flourBase is totalFlour", () => {
		const result = calcAutolyse(recipe, 1000) as TwoStepDoughResult;
		expect(result.step2.flourBase).toBe(1000);
	});

	test("step2 has no water ingredient when autolyseWaterPct is 100", () => {
		const result = calcAutolyse(recipe, 1000) as TwoStepDoughResult;
		const water = result.step2.ingredients.find((i) => i.type === "water");
		expect(water).toBeUndefined();
	});

	test("step2 has Autolyse preferment ingredient", () => {
		const result = calcAutolyse(recipe, 1000) as TwoStepDoughResult;
		const autolyse = result.step2.ingredients.find((i) => i.source === "preferment");
		expect(autolyse).toBeDefined();
		expect(autolyse?.name).toBe("Autolyse");
		expect(autolyse?.grams).toBeCloseTo(1650, 0);
	});

	test("partial water: step2 has remaining water when autolyseWaterPct is 80", () => {
		const r = { ...recipe, autolyseWaterPct: 80 };
		const result = calcAutolyse(r, 1000) as TwoStepDoughResult;
		// autolyseWater = 650×0.8 = 520, finalWater = 130
		const water = result.step2.ingredients.find((i) => i.type === "water");
		expect(water).toBeDefined();
		expect(water?.grams).toBeCloseTo(130, 0);
	});

	test("totalDoughGrams is consistent", () => {
		const result = calcAutolyse(recipe, 1000) as TwoStepDoughResult;
		expect(result.totalDoughGrams).toBeCloseTo(1678, 0);
	});
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
bun run test -- --testPathPattern=calcAutolyse
```

Expected: FAIL — `calcAutolyse is not a function`

- [ ] **Step 3: Implement `calcAutolyse` in `src/bll/calculations.ts`**

Append at the end of the file (after `calcBiga`):

```typescript
export function calcAutolyse(
	recipe: Recipe,
	totalFlourGrams: number,
): TwoStepDoughResult {
	const { autolyseWaterPct = 100, ingredients } = recipe;

	const waterIng = ingredients.find((i) => i.type === "water");
	const yeastIng = ingredients.find((i) => i.type === "yeast");
	const saltIng = ingredients.find((i) => i.type === "salt");
	const otherIngs = ingredients.filter((i) => !i.type || i.type === "other");

	const hydrationPct = waterIng ? waterIng.grams / 10 : 0;
	const totalWater = round1((totalFlourGrams * hydrationPct) / 100);
	const autolyseWater = round1((totalWater * autolyseWaterPct) / 100);
	const finalWater = round1(totalWater - autolyseWater);

	const step1Ingredients: IngredientResult[] = [
		{
			name: waterIng?.name ?? "Water",
			grams: autolyseWater,
			percentage: round1((autolyseWater / totalFlourGrams) * 100),
			type: "water",
		},
	];
	const step1TotalGrams = round1(totalFlourGrams + autolyseWater);

	const step2Ingredients: IngredientResult[] = [];

	if (finalWater > 0) {
		step2Ingredients.push({
			name: waterIng?.name ?? "Water",
			grams: finalWater,
			percentage: round1((finalWater / totalFlourGrams) * 100),
			type: "water",
		});
	}
	if (yeastIng) {
		const grams = round1((totalFlourGrams * (yeastIng.grams / 10)) / 100);
		step2Ingredients.push({
			name: yeastIng.name,
			grams,
			percentage: round1(yeastIng.grams / 10),
			type: "yeast",
		});
	}
	if (saltIng) {
		const grams = round1((totalFlourGrams * (saltIng.grams / 10)) / 100);
		step2Ingredients.push({
			name: saltIng.name,
			grams,
			percentage: round1(saltIng.grams / 10),
			type: "salt",
		});
	}
	for (const ing of otherIngs) {
		const grams = round1((totalFlourGrams * (ing.grams / 10)) / 100);
		step2Ingredients.push({
			name: ing.name,
			grams,
			percentage: round1(ing.grams / 10),
			type: "other" as IngredientType,
		});
	}
	step2Ingredients.push({
		name: "Autolyse",
		grams: step1TotalGrams,
		percentage: round1((step1TotalGrams / totalFlourGrams) * 100),
		source: "preferment",
		type: "other" as IngredientType,
	});

	const step2TotalGrams = round1(
		step2Ingredients.reduce((s, i) => s + i.grams, 0),
	);

	const yeastGrams = yeastIng
		? round1((totalFlourGrams * (yeastIng.grams / 10)) / 100)
		: 0;
	const saltGrams = saltIng
		? round1((totalFlourGrams * (saltIng.grams / 10)) / 100)
		: 0;
	const otherTotal = otherIngs.reduce(
		(s, i) => s + round1((totalFlourGrams * (i.grams / 10)) / 100),
		0,
	);
	const totalDoughGrams = round1(
		totalFlourGrams + totalWater + yeastGrams + saltGrams + otherTotal,
	);

	return {
		kind: "two-step",
		step1Label: "Autolyse",
		totalFlourGrams,
		totalDoughGrams,
		step1: {
			flourBase: totalFlourGrams,
			flourGrams: totalFlourGrams,
			totalFlourGrams,
			totalWaterGrams: autolyseWater,
			totalGrams: step1TotalGrams,
			ingredients: step1Ingredients,
		},
		step2: {
			flourBase: totalFlourGrams,
			flourGrams: 0,
			totalFlourGrams,
			totalWaterGrams: finalWater,
			totalGrams: step2TotalGrams,
			ingredients: step2Ingredients,
		},
	};
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
bun run test -- --testPathPattern=calcAutolyse
```

Expected: all 10 tests pass.

- [ ] **Step 5: Run full test suite**

```bash
bun run test
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/bll/calculations.ts src/__tests__/bll/calcAutolyse.test.ts
git commit -m "feat(bll): implement calcAutolyse"
```

---

## Task 5: Update calculatorUtils

**Files:**
- Modify: `src/bll/calculatorUtils.ts`

- [ ] **Step 1: Replace the full contents of `src/bll/calculatorUtils.ts`**

```typescript
import { calcAutolyse, calcBiga, calcByCount, calcByFlour } from "@/bll/calculations";
import type {
	DoughCalcResult,
	Mode,
	Recipe,
	SingleDoughResult,
} from "@/types/recipe";

function deriveTotalFlour(recipe: Recipe, mode: Mode, val: number): number {
	if (mode === "by-flour") return val * 1000;
	const ingredientRatio =
		recipe.ingredients.reduce((s, i) => s + i.grams, 0) / 1000;
	return (val * recipe.ballWeight) / (1 + ingredientRatio);
}

function wrapSingle(recipe: Recipe, mode: Mode, val: number): SingleDoughResult {
	if (mode === "by-count") {
		const raw = calcByCount(recipe, val);
		return {
			kind: "single",
			flourGrams: raw.flourGrams,
			totalDoughGrams: raw.totalDoughGrams,
			ingredients: raw.ingredients,
		};
	}
	const raw = calcByFlour(recipe, val);
	return {
		kind: "single",
		flourGrams: raw.flourGrams,
		totalDoughGrams: raw.totalDoughGrams,
		ballCount: raw.ballCount,
		ingredients: raw.ingredients,
	};
}

export const calcResult = (
	recipe: Recipe,
	mode: Mode,
	inputValue: string,
): DoughCalcResult | null => {
	const val = parseFloat(inputValue);
	if (!(val > 0)) return null;

	const method = recipe.doughMethod ?? "direct";
	const totalFlour = deriveTotalFlour(recipe, mode, val);

	if (method === "biga") {
		const res = calcBiga(recipe, totalFlour);
		if (res.kind === "two-step" && mode === "by-flour") {
			return {
				...res,
				ballCount: Math.floor(res.totalDoughGrams / recipe.ballWeight),
			};
		}
		return res;
	}
	if (method === "autolyse") {
		const res = calcAutolyse(recipe, totalFlour);
		if (mode === "by-flour") {
			return {
				...res,
				ballCount: Math.floor(res.totalDoughGrams / recipe.ballWeight),
			};
		}
		return res;
	}
	return wrapSingle(recipe, mode, val);
};

export const calcResultHeader = (
	result: DoughCalcResult,
	mode: Mode,
	recipe: Recipe,
	inputValue: string,
): string => {
	if (result.kind === "error") return "";
	if (mode === "by-count") {
		const totalDough =
			Math.round(parseFloat(inputValue)) * recipe.ballWeight;
		return `${inputValue} balls × ${recipe.ballWeight}g = ${totalDough}g total dough`;
	}
	const ballCount = result.ballCount ?? "?";
	return `${ballCount} balls · ${result.totalDoughGrams}g total dough`;
};
```

- [ ] **Step 2: Run full test suite**

```bash
bun run test
```

Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/bll/calculatorUtils.ts
git commit -m "feat(calculatorUtils): dispatch by doughMethod, return DoughCalcResult"
```

---

## Task 6: Update formReducer

**Files:**
- Modify: `src/components/recipe-form/formReducer.ts`
- Modify: `src/__tests__/components/recipe-form/formReducer.test.ts`

- [ ] **Step 1: Add failing tests for new state and actions**

Append to `src/__tests__/components/recipe-form/formReducer.test.ts`:

```typescript
describe("initialFormState — dough method defaults", () => {
	test("defaults doughMethod to direct", () => {
		expect(state.doughMethod).toBe("direct");
	});

	test("defaults prefermentFlourPct to 40", () => {
		expect(state.prefermentFlourPct).toBe("40");
	});

	test("defaults prefermentHydration to 45", () => {
		expect(state.prefermentHydration).toBe("45");
	});

	test("defaults bigaYeastPercentOnBigaFlour to 0.2", () => {
		expect(state.bigaYeastPercentOnBigaFlour).toBe("0.2");
	});

	test("defaults autolyseWaterPct to 100", () => {
		expect(state.autolyseWaterPct).toBe("100");
	});

	test("reads doughMethod and params from initial recipe", () => {
		const s = initialFormState({
			id: "1",
			name: "Biga Pizza",
			ballWeight: 300,
			ingredients: [],
			createdAt: 0,
			doughMethod: "biga",
			prefermentFlourPct: 35,
			prefermentHydration: 50,
		});
		expect(s.doughMethod).toBe("biga");
		expect(s.prefermentFlourPct).toBe("35");
		expect(s.prefermentHydration).toBe("50");
	});
});

describe("formReducer — dough method actions", () => {
	test("SET_DOUGH_METHOD updates doughMethod", () => {
		const next = formReducer(state, { type: "SET_DOUGH_METHOD", method: "biga" });
		expect(next.doughMethod).toBe("biga");
	});

	test("SET_PREFERMENT_FLOUR_PCT updates prefermentFlourPct", () => {
		const next = formReducer(state, { type: "SET_PREFERMENT_FLOUR_PCT", value: "50" });
		expect(next.prefermentFlourPct).toBe("50");
	});

	test("SET_PREFERMENT_HYDRATION updates prefermentHydration", () => {
		const next = formReducer(state, { type: "SET_PREFERMENT_HYDRATION", value: "50" });
		expect(next.prefermentHydration).toBe("50");
	});

	test("SET_BIGA_YEAST_PCT updates bigaYeastPercentOnBigaFlour", () => {
		const next = formReducer(state, { type: "SET_BIGA_YEAST_PCT", value: "0.3" });
		expect(next.bigaYeastPercentOnBigaFlour).toBe("0.3");
	});

	test("SET_AUTOLYSE_WATER_PCT updates autolyseWaterPct", () => {
		const next = formReducer(state, { type: "SET_AUTOLYSE_WATER_PCT", value: "80" });
		expect(next.autolyseWaterPct).toBe("80");
	});

	test("UPDATE_TYPE updates type on matching ingredient", () => {
		const withCustom = formReducer(state, { type: "ADD_INGREDIENT" });
		const customId = withCustom.ingredients[withCustom.ingredients.length - 1].id;
		const next = formReducer(withCustom, {
			type: "UPDATE_TYPE",
			id: customId,
			ingredientType: "water",
		});
		expect(next.ingredients.find((i) => i.id === customId)?.type).toBe("water");
	});
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
bun run test -- --testPathPattern=formReducer
```

Expected: FAIL — new state fields and action types missing.

- [ ] **Step 3: Replace the full contents of `src/components/recipe-form/formReducer.ts`**

```typescript
import {
	addIngredient,
	DEFAULT_INGREDIENTS,
	removeIngredient,
	setIngredientGrams,
	setIngredientName,
	setIngredientPercentage,
	setIngredientType,
} from "@/bll/ingredientUtils";
import type { DoughMethod, Ingredient, IngredientType, Recipe } from "@/types/recipe";

export type FormState = {
	name: string;
	ballWeight: string;
	ingredients: Ingredient[];
	doughMethod: DoughMethod;
	prefermentFlourPct: string;
	prefermentHydration: string;
	bigaYeastPercentOnBigaFlour: string;
	autolyseWaterPct: string;
};

export type FormAction =
	| { type: "SET_NAME"; value: string }
	| { type: "SET_BALL_WEIGHT"; value: string }
	| { type: "UPDATE_GRAMS"; id: string; raw: string }
	| { type: "UPDATE_PERCENTAGE"; id: string; raw: string }
	| { type: "UPDATE_NAME"; id: string; value: string }
	| { type: "UPDATE_TYPE"; id: string; ingredientType: IngredientType }
	| { type: "ADD_INGREDIENT" }
	| { type: "REMOVE_INGREDIENT"; id: string }
	| { type: "SET_DOUGH_METHOD"; method: DoughMethod }
	| { type: "SET_PREFERMENT_FLOUR_PCT"; value: string }
	| { type: "SET_PREFERMENT_HYDRATION"; value: string }
	| { type: "SET_BIGA_YEAST_PCT"; value: string }
	| { type: "SET_AUTOLYSE_WATER_PCT"; value: string };

export const initialFormState = (initial?: Recipe): FormState => ({
	name: initial?.name ?? "",
	ballWeight: initial?.ballWeight?.toString() ?? "280",
	ingredients: initial?.ingredients ?? DEFAULT_INGREDIENTS,
	doughMethod: initial?.doughMethod ?? "direct",
	prefermentFlourPct: (initial?.prefermentFlourPct ?? 40).toString(),
	prefermentHydration: (initial?.prefermentHydration ?? 45).toString(),
	bigaYeastPercentOnBigaFlour: (
		initial?.bigaYeastPercentOnBigaFlour ?? 0.2
	).toString(),
	autolyseWaterPct: (initial?.autolyseWaterPct ?? 100).toString(),
});

export const formReducer = (
	state: FormState,
	action: FormAction,
): FormState => {
	switch (action.type) {
		case "SET_NAME":
			return { ...state, name: action.value };
		case "SET_BALL_WEIGHT":
			return { ...state, ballWeight: action.value };
		case "UPDATE_GRAMS":
			return {
				...state,
				ingredients: setIngredientGrams(state.ingredients, action.id, action.raw),
			};
		case "UPDATE_PERCENTAGE":
			return {
				...state,
				ingredients: setIngredientPercentage(
					state.ingredients,
					action.id,
					action.raw,
				),
			};
		case "UPDATE_NAME":
			return {
				...state,
				ingredients: setIngredientName(
					state.ingredients,
					action.id,
					action.value,
				),
			};
		case "UPDATE_TYPE":
			return {
				...state,
				ingredients: setIngredientType(
					state.ingredients,
					action.id,
					action.ingredientType,
				),
			};
		case "ADD_INGREDIENT":
			return { ...state, ingredients: addIngredient(state.ingredients) };
		case "REMOVE_INGREDIENT":
			return {
				...state,
				ingredients: removeIngredient(state.ingredients, action.id),
			};
		case "SET_DOUGH_METHOD":
			return { ...state, doughMethod: action.method };
		case "SET_PREFERMENT_FLOUR_PCT":
			return { ...state, prefermentFlourPct: action.value };
		case "SET_PREFERMENT_HYDRATION":
			return { ...state, prefermentHydration: action.value };
		case "SET_BIGA_YEAST_PCT":
			return { ...state, bigaYeastPercentOnBigaFlour: action.value };
		case "SET_AUTOLYSE_WATER_PCT":
			return { ...state, autolyseWaterPct: action.value };
	}
};
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
bun run test -- --testPathPattern=formReducer
```

Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/recipe-form/formReducer.ts src/__tests__/components/recipe-form/formReducer.test.ts
git commit -m "feat(formReducer): add dough method, preferment params, ingredient type"
```

---

## Task 7: Update RecipeBasicFields

**Files:**
- Modify: `src/components/recipe-form/RecipeBasicFields.tsx`

- [ ] **Step 1: Replace the full contents of `src/components/recipe-form/RecipeBasicFields.tsx`**

```typescript
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import type { DoughMethod } from "@/types/recipe";

const METHODS: DoughMethod[] = ["direct", "biga", "autolyse"];

type Props = {
	name: string;
	ballWeight: string;
	doughMethod: DoughMethod;
	prefermentFlourPct: string;
	prefermentHydration: string;
	bigaYeastPercentOnBigaFlour: string;
	autolyseWaterPct: string;
	onNameChange: (v: string) => void;
	onBallWeightChange: (v: string) => void;
	onDoughMethodChange: (v: DoughMethod) => void;
	onPrefermentFlourPctChange: (v: string) => void;
	onPrefermentHydrationChange: (v: string) => void;
	onBigaYeastPctChange: (v: string) => void;
	onAutolyseWaterPctChange: (v: string) => void;
};

export const RecipeBasicFields = ({
	name,
	ballWeight,
	doughMethod,
	prefermentFlourPct,
	prefermentHydration,
	bigaYeastPercentOnBigaFlour,
	autolyseWaterPct,
	onNameChange,
	onBallWeightChange,
	onDoughMethodChange,
	onPrefermentFlourPctChange,
	onPrefermentHydrationChange,
	onBigaYeastPctChange,
	onAutolyseWaterPctChange,
}: Props) => {
	return (
		<View>
			<View style={styles.row}>
				<View style={{ flex: 2 }}>
					<Text style={styles.label}>Recipe name</Text>
					<TextInput
						style={styles.input}
						value={name}
						onChangeText={onNameChange}
						placeholder="e.g. Neapolitan"
						placeholderTextColor="#555"
					/>
				</View>
				<View style={{ flex: 1 }}>
					<Text style={styles.label}>Ball weight (g)</Text>
					<TextInput
						style={styles.input}
						value={ballWeight}
						onChangeText={onBallWeightChange}
						keyboardType="decimal-pad"
						placeholder="280"
						placeholderTextColor="#555"
					/>
				</View>
			</View>

			<View style={styles.methodSection}>
				<Text style={styles.label}>Dough Method</Text>
				<View style={styles.toggle}>
					{METHODS.map((m) => (
						<TouchableOpacity
							key={m}
							style={[styles.option, doughMethod === m && styles.optionActive]}
							onPress={() => onDoughMethodChange(m)}
						>
							<Text
								style={[
									styles.optionText,
									doughMethod === m && styles.optionTextActive,
								]}
							>
								{m.charAt(0).toUpperCase() + m.slice(1)}
							</Text>
						</TouchableOpacity>
					))}
				</View>
			</View>

			{doughMethod === "biga" && (
				<View style={styles.paramsBox}>
					<Text style={styles.paramsTitle}>Biga Parameters</Text>
					<View style={styles.paramRow}>
						<View style={styles.paramField}>
							<Text style={styles.label}>Preferment Flour %</Text>
							<TextInput
								style={styles.input}
								value={prefermentFlourPct}
								onChangeText={onPrefermentFlourPctChange}
								keyboardType="decimal-pad"
								placeholder="40"
								placeholderTextColor="#555"
							/>
						</View>
						<View style={styles.paramField}>
							<Text style={styles.label}>Preferment Hydration %</Text>
							<TextInput
								style={styles.input}
								value={prefermentHydration}
								onChangeText={onPrefermentHydrationChange}
								keyboardType="decimal-pad"
								placeholder="45"
								placeholderTextColor="#555"
							/>
						</View>
					</View>
					<View style={styles.paramField}>
						<Text style={styles.label}>Biga Yeast % on Biga Flour</Text>
						<TextInput
							style={styles.input}
							value={bigaYeastPercentOnBigaFlour}
							onChangeText={onBigaYeastPctChange}
							keyboardType="decimal-pad"
							placeholder="0.2"
							placeholderTextColor="#555"
						/>
						<Text style={styles.hint}>
							e.g. 0.2 means 0.2% of biga flour weight
						</Text>
					</View>
				</View>
			)}

			{doughMethod === "autolyse" && (
				<View style={styles.paramsBox}>
					<Text style={styles.paramsTitle}>Autolyse Parameters</Text>
					<View style={styles.paramField}>
						<Text style={styles.label}>Autolyse Water %</Text>
						<TextInput
							style={styles.input}
							value={autolyseWaterPct}
							onChangeText={onAutolyseWaterPctChange}
							keyboardType="decimal-pad"
							placeholder="100"
							placeholderTextColor="#555"
						/>
						<Text style={styles.hint}>
							% of total water used in the autolyse step (default 100%)
						</Text>
					</View>
				</View>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	row: { flexDirection: "row", gap: 14, marginBottom: 20 },
	methodSection: { marginBottom: 20 },
	paramsBox: {
		backgroundColor: "#1a1a2e",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#2a2a4a",
		padding: 14,
		marginBottom: 20,
	},
	paramsTitle: {
		color: "#7c9fff",
		fontSize: 11,
		textTransform: "uppercase",
		letterSpacing: 0.5,
		marginBottom: 12,
	},
	paramRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
	paramField: { flex: 1, marginBottom: 10 },
	hint: { color: "#555", fontSize: 11, marginTop: 4 },
	label: {
		color: "#888",
		fontSize: 13,
		textTransform: "uppercase",
		letterSpacing: 0.5,
		marginBottom: 6,
	},
	toggle: {
		flexDirection: "row",
		backgroundColor: "#1a1a2e",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#2a2a4a",
		padding: 4,
	},
	option: { flex: 1, borderRadius: 6, padding: 11, alignItems: "center" },
	optionActive: { backgroundColor: "#7c9fff" },
	optionText: { color: "#666", fontSize: 14 },
	optionTextActive: { color: "#000", fontWeight: "bold" },
	input: {
		backgroundColor: "#0d0d1a",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#2a2a4a",
		color: "#e0e0e0",
		fontSize: 15,
		paddingVertical: 12,
		paddingHorizontal: 14,
	},
});
```

- [ ] **Step 2: Run lint**

```bash
bun run check
```

Expected: passes (or fix any Biome complaints).

- [ ] **Step 3: Commit**

```bash
git add src/components/recipe-form/RecipeBasicFields.tsx
git commit -m "feat(RecipeBasicFields): add dough method toggle and conditional param inputs"
```

---

## Task 8: Add ingredient type picker

**Files:**
- Modify: `src/components/IngredientRow.tsx`
- Modify: `src/components/recipe-form/IngredientsTable.tsx`

- [ ] **Step 1: Update `src/components/IngredientRow.tsx`**

```typescript
import { useEffect, useState } from "react";
import {
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import type { IngredientType } from "@/types/recipe";

const TYPE_OPTIONS: IngredientType[] = ["water", "yeast", "salt", "other"];

type Props = {
	name: string;
	grams: string;
	type?: IngredientType;
	onNameChange?: (value: string) => void;
	onGramsChange: (value: string) => void;
	onPercentageChange: (value: string) => void;
	onTypeChange?: (type: IngredientType) => void;
	onDelete?: () => void;
	locked?: boolean;
};

export const IngredientRow = ({
	name,
	grams,
	type,
	onNameChange,
	onGramsChange,
	onPercentageChange,
	onTypeChange,
	onDelete,
	locked = false,
}: Props) => {
	const gramsNum = parseFloat(grams) || 0;
	const derivedPct = (gramsNum / 10).toFixed(1);
	const [pctDisplay, setPctDisplay] = useState(derivedPct);

	useEffect(() => {
		setPctDisplay(derivedPct);
	}, [derivedPct]);

	return (
		<View style={styles.wrapper}>
			<View style={styles.row}>
				{locked || !onNameChange ? (
					<Text style={[styles.cell, styles.nameText]}>{name}</Text>
				) : (
					<TextInput
						style={[styles.cell, styles.input]}
						value={name}
						onChangeText={onNameChange}
						placeholder="Ingredient"
						placeholderTextColor="#555"
					/>
				)}
				<TextInput
					style={[styles.cell, styles.input, styles.numericCell]}
					value={grams}
					onChangeText={onGramsChange}
					keyboardType="decimal-pad"
					placeholder="0"
					placeholderTextColor="#555"
				/>
				<TextInput
					style={[styles.cell, styles.input, styles.numericCell]}
					value={pctDisplay}
					onChangeText={setPctDisplay}
					onBlur={() => onPercentageChange(pctDisplay)}
					keyboardType="decimal-pad"
					placeholder="0"
					placeholderTextColor="#555"
				/>
				<View style={styles.deleteCell}>
					{onDelete ? (
						<TouchableOpacity onPress={onDelete}>
							<Text style={styles.deleteBtn}>✕</Text>
						</TouchableOpacity>
					) : (
						<Text style={styles.lockIcon}>🔒</Text>
					)}
				</View>
			</View>

			{!locked && onTypeChange && (
				<View style={styles.typeRow}>
					{TYPE_OPTIONS.map((t) => (
						<TouchableOpacity
							key={t}
							style={[styles.typeChip, type === t && styles.typeChipActive]}
							onPress={() => onTypeChange(t)}
						>
							<Text
								style={[
									styles.typeChipText,
									type === t && styles.typeChipTextActive,
								]}
							>
								{t}
							</Text>
						</TouchableOpacity>
					))}
				</View>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	wrapper: { marginBottom: 8 },
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	cell: { flex: 2 },
	numericCell: { flex: 1, textAlign: "right" },
	nameText: {
		color: "#666",
		fontSize: 15,
		paddingVertical: 10,
		paddingHorizontal: 12,
		backgroundColor: "#1a1a2e",
		borderRadius: 6,
		borderWidth: 1,
		borderColor: "#222",
	},
	input: {
		backgroundColor: "#1a1a2e",
		borderRadius: 6,
		borderWidth: 1,
		borderColor: "#2a2a4a",
		color: "#7c9fff",
		fontSize: 15,
		paddingVertical: 10,
		paddingHorizontal: 12,
	},
	deleteCell: { width: 28, alignItems: "center" },
	deleteBtn: { color: "#ff7c7c", fontSize: 18 },
	lockIcon: { fontSize: 14 },
	typeRow: {
		flexDirection: "row",
		gap: 6,
		marginTop: 4,
		paddingLeft: 4,
	},
	typeChip: {
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: "#2a2a4a",
		backgroundColor: "#1a1a2e",
	},
	typeChipActive: {
		borderColor: "#7c9fff",
		backgroundColor: "#1a1a40",
	},
	typeChipText: { color: "#555", fontSize: 11 },
	typeChipTextActive: { color: "#7c9fff", fontWeight: "bold" },
});
```

- [ ] **Step 2: Update `src/components/recipe-form/IngredientsTable.tsx`**

```typescript
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { REQUIRED_IDS } from "@/bll/ingredientUtils";
import { IngredientRow } from "@/components/IngredientRow";
import type { Ingredient, IngredientType } from "@/types/recipe";

type Props = {
	ingredients: Ingredient[];
	totalDough: number;
	onUpdateGrams: (id: string, value: string) => void;
	onUpdatePercentage: (id: string, value: string) => void;
	onUpdateName: (id: string, value: string) => void;
	onUpdateType: (id: string, type: IngredientType) => void;
	onAdd: () => void;
	onRemove: (id: string, name: string) => void;
};

export const IngredientsTable = ({
	ingredients,
	totalDough,
	onUpdateGrams,
	onUpdatePercentage,
	onUpdateName,
	onUpdateType,
	onAdd,
	onRemove,
}: Props) => {
	return (
		<>
			<Text style={styles.label}>Ingredients for 1 kg of flour</Text>

			<View style={styles.tableHeader}>
				<Text style={[styles.headerCell, { flex: 2 }]}>Ingredient</Text>
				<Text style={[styles.headerCell, { flex: 1, textAlign: "right" }]}>
					Grams
				</Text>
				<Text style={[styles.headerCell, { flex: 1, textAlign: "right" }]}>
					%
				</Text>
				<View style={{ width: 24 }} />
			</View>

			<View style={styles.flourRow}>
				<Text style={[styles.lockedCell, { flex: 2 }]}>Flour</Text>
				<Text style={[styles.lockedCell, { flex: 1, textAlign: "right" }]}>
					1000
				</Text>
				<Text style={[styles.lockedCell, { flex: 1, textAlign: "right" }]}>
					100%
				</Text>
				<View style={{ width: 24 }} />
			</View>

			{ingredients.map((ing) => {
				const isRequired = REQUIRED_IDS.has(ing.id);
				return (
					<IngredientRow
						key={ing.id}
						name={ing.name}
						grams={ing.grams.toString()}
						type={ing.type}
						locked={isRequired}
						onNameChange={
							isRequired ? undefined : (v) => onUpdateName(ing.id, v)
						}
						onGramsChange={(v) => onUpdateGrams(ing.id, v)}
						onPercentageChange={(v) => onUpdatePercentage(ing.id, v)}
						onTypeChange={
							isRequired ? undefined : (t) => onUpdateType(ing.id, t)
						}
						onDelete={isRequired ? undefined : () => onRemove(ing.id, ing.name)}
					/>
				);
			})}

			<TouchableOpacity onPress={onAdd}>
				<Text style={styles.addBtn}>+ Add ingredient</Text>
			</TouchableOpacity>

			<View style={styles.totalRow}>
				<Text style={styles.totalLabel}>Total dough per 1 kg flour</Text>
				<Text style={styles.totalValue}>{totalDough.toFixed(0)} g</Text>
			</View>
		</>
	);
};

const styles = StyleSheet.create({
	label: {
		color: "#888",
		fontSize: 13,
		textTransform: "uppercase",
		letterSpacing: 0.5,
		marginBottom: 6,
	},
	tableHeader: {
		flexDirection: "row",
		paddingHorizontal: 4,
		marginBottom: 6,
		marginTop: 10,
	},
	headerCell: { color: "#555", fontSize: 12, textTransform: "uppercase" },
	flourRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		marginBottom: 8,
		paddingHorizontal: 4,
	},
	lockedCell: {
		color: "#666",
		fontSize: 15,
		paddingVertical: 10,
		paddingHorizontal: 12,
		backgroundColor: "#1a1a2e",
		borderRadius: 6,
		borderWidth: 1,
		borderColor: "#222",
	},
	addBtn: { color: "#7c9fff", fontSize: 15, marginTop: 10, marginBottom: 18 },
	totalRow: {
		backgroundColor: "#1a1a2e",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#2a2a4a",
		padding: 16,
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 24,
	},
	totalLabel: { color: "#888", fontSize: 15 },
	totalValue: { color: "#7cffb2", fontSize: 16, fontWeight: "bold" },
});
```

- [ ] **Step 3: Run lint**

```bash
bun run check
```

Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add src/components/IngredientRow.tsx src/components/recipe-form/IngredientsTable.tsx
git commit -m "feat(IngredientRow): add type picker chips for custom ingredients"
```

---

## Task 9: Update RecipeForm

**Files:**
- Modify: `src/components/RecipeForm.tsx`

- [ ] **Step 1: Replace the full contents of `src/components/RecipeForm.tsx`**

```typescript
import { useReducer } from "react";
import {
	Alert,
	Modal,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { calcTotalDough, REQUIRED_IDS } from "@/bll/ingredientUtils";
import { generateId } from "@/lib/generateId";
import type { Recipe } from "@/types/recipe";
import { IngredientsTable, RecipeBasicFields } from "./recipe-form";
import { formReducer, initialFormState } from "./recipe-form/formReducer";

type Props = {
	visible: boolean;
	initial?: Recipe;
	onSave: (recipe: Recipe) => void;
	onClose: () => void;
};

export const RecipeForm = ({ visible, initial, onSave, onClose }: Props) => {
	const [state, dispatch] = useReducer(formReducer, initialFormState(initial));
	const {
		name,
		ballWeight,
		ingredients,
		doughMethod,
		prefermentFlourPct,
		prefermentHydration,
		bigaYeastPercentOnBigaFlour,
		autolyseWaterPct,
	} = state;

	function handleRemove(id: string, ingredientName: string) {
		Alert.alert(
			"Remove ingredient",
			`Remove "${ingredientName || "this ingredient"}"?`,
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Remove",
					style: "destructive",
					onPress: () => dispatch({ type: "REMOVE_INGREDIENT", id }),
				},
			],
		);
	}

	function handleSave() {
		if (!name.trim()) {
			Alert.alert("Validation", "Recipe name is required.");
			return;
		}
		const weight = parseFloat(ballWeight);
		if (!weight || weight <= 0) {
			Alert.alert("Validation", "Ball weight must be a positive number.");
			return;
		}
		const invalid = ingredients.find(
			(i) => (!REQUIRED_IDS.has(i.id) && !i.name.trim()) || i.grams <= 0,
		);
		if (invalid) {
			Alert.alert(
				"Validation",
				"All ingredients must have a name and grams greater than 0.",
			);
			return;
		}
		onSave({
			id: initial?.id ?? generateId(),
			name: name.trim(),
			ballWeight: weight,
			ingredients,
			createdAt: initial?.createdAt ?? Date.now(),
			doughMethod,
			prefermentFlourPct:
				doughMethod === "biga"
					? parseFloat(prefermentFlourPct) || 40
					: undefined,
			prefermentHydration:
				doughMethod === "biga"
					? parseFloat(prefermentHydration) || 45
					: undefined,
			bigaYeastPercentOnBigaFlour:
				doughMethod === "biga"
					? parseFloat(bigaYeastPercentOnBigaFlour) || 0.2
					: undefined,
			autolyseWaterPct:
				doughMethod === "autolyse"
					? parseFloat(autolyseWaterPct) || 100
					: undefined,
		});
	}

	return (
		<Modal visible={visible} animationType="slide" onRequestClose={onClose}>
			<ScrollView
				style={styles.container}
				contentContainerStyle={styles.content}
			>
				<View style={styles.header}>
					<Text style={styles.title}>
						{initial ? "Edit Recipe" : "New Recipe"}
					</Text>
					<TouchableOpacity onPress={onClose}>
						<Text style={styles.closeBtn}>✕</Text>
					</TouchableOpacity>
				</View>

				<RecipeBasicFields
					name={name}
					ballWeight={ballWeight}
					doughMethod={doughMethod}
					prefermentFlourPct={prefermentFlourPct}
					prefermentHydration={prefermentHydration}
					bigaYeastPercentOnBigaFlour={bigaYeastPercentOnBigaFlour}
					autolyseWaterPct={autolyseWaterPct}
					onNameChange={(value) => dispatch({ type: "SET_NAME", value })}
					onBallWeightChange={(value) =>
						dispatch({ type: "SET_BALL_WEIGHT", value })
					}
					onDoughMethodChange={(method) =>
						dispatch({ type: "SET_DOUGH_METHOD", method })
					}
					onPrefermentFlourPctChange={(value) =>
						dispatch({ type: "SET_PREFERMENT_FLOUR_PCT", value })
					}
					onPrefermentHydrationChange={(value) =>
						dispatch({ type: "SET_PREFERMENT_HYDRATION", value })
					}
					onBigaYeastPctChange={(value) =>
						dispatch({ type: "SET_BIGA_YEAST_PCT", value })
					}
					onAutolyseWaterPctChange={(value) =>
						dispatch({ type: "SET_AUTOLYSE_WATER_PCT", value })
					}
				/>

				<IngredientsTable
					ingredients={ingredients}
					totalDough={calcTotalDough(ingredients)}
					onUpdateGrams={(id, raw) =>
						dispatch({ type: "UPDATE_GRAMS", id, raw })
					}
					onUpdatePercentage={(id, raw) =>
						dispatch({ type: "UPDATE_PERCENTAGE", id, raw })
					}
					onUpdateName={(id, value) =>
						dispatch({ type: "UPDATE_NAME", id, value })
					}
					onUpdateType={(id, ingredientType) =>
						dispatch({ type: "UPDATE_TYPE", id, ingredientType })
					}
					onAdd={() => dispatch({ type: "ADD_INGREDIENT" })}
					onRemove={handleRemove}
				/>

				<TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
					<Text style={styles.saveBtnText}>Save Recipe</Text>
				</TouchableOpacity>
			</ScrollView>
		</Modal>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#0f0f1a" },
	content: { padding: 20, paddingBottom: 48 },
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 24,
	},
	title: { color: "#e0e0e0", fontSize: 22, fontWeight: "bold" },
	closeBtn: { color: "#888", fontSize: 24, padding: 4 },
	saveBtn: {
		backgroundColor: "#7c9fff",
		borderRadius: 8,
		padding: 18,
		alignItems: "center",
	},
	saveBtnText: { color: "#000", fontWeight: "bold", fontSize: 17 },
});
```

- [ ] **Step 2: Run full test suite and lint**

```bash
bun run test && bun run check
```

Expected: all pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/RecipeForm.tsx
git commit -m "feat(RecipeForm): wire dough method fields and ingredient type into handleSave"
```

---

## Task 10: Create TwoStepResult component

**Files:**
- Create: `src/components/calculator/TwoStepResult.tsx`
- Modify: `src/components/calculator/index.ts`

- [ ] **Step 1: Create `src/components/calculator/TwoStepResult.tsx`**

```typescript
import { StyleSheet, Text, View } from "react-native";
import type { StepIngredients, TwoStepDoughResult } from "@/types/recipe";

type StepBlockProps = {
	step: StepIngredients;
	title: string;
};

const StepBlock = ({ step, title }: StepBlockProps) => (
	<View style={styles.block}>
		<Text style={styles.stepLabel}>{title}</Text>
		<View style={styles.tableHeader}>
			<Text style={[styles.headerCell, { flex: 3 }]}>Ingredient</Text>
			<Text style={[styles.headerCell, { flex: 2, textAlign: "right" }]}>
				Grams
			</Text>
			<Text style={[styles.headerCell, { flex: 1, textAlign: "right" }]}>%</Text>
		</View>
		{step.flourGrams > 0 && (
			<View style={styles.row}>
				<Text style={[styles.name, { flex: 3 }]}>Flour</Text>
				<Text style={[styles.grams, { flex: 2, textAlign: "right" }]}>
					{Math.round(step.flourGrams)}g
				</Text>
				<Text style={[styles.pct, { flex: 1, textAlign: "right" }]}>100%</Text>
			</View>
		)}
		{step.ingredients.map((ing, idx) => (
			<View
				key={`${ing.name}-${idx}`}
				style={[styles.row, ing.source === "preferment" && styles.prefermentRow]}
			>
				<Text
					style={[
						styles.name,
						{ flex: 3 },
						ing.source === "preferment" && styles.prefermentText,
					]}
				>
					{ing.source === "preferment" ? `+ ${ing.name}` : ing.name}
				</Text>
				<Text
					style={[
						styles.grams,
						{ flex: 2, textAlign: "right" },
						ing.source === "preferment" && styles.prefermentText,
					]}
				>
					{Math.round(ing.grams)}g
				</Text>
				<Text style={[styles.pct, { flex: 1, textAlign: "right" }]}>
					{ing.percentage}%
				</Text>
			</View>
		))}
	</View>
);

type Props = {
	result: TwoStepDoughResult;
	header: string;
};

export const TwoStepResult = ({ result, header }: Props) => (
	<View>
		<Text style={styles.header}>{header}</Text>
		<StepBlock
			step={result.step1}
			title={`Step 1 — ${result.step1Label}`}
		/>
		<View style={styles.gap} />
		<StepBlock step={result.step2} title="Step 2 — Final Dough" />
		<View style={styles.totalsRow}>
			<View style={styles.totalsItem}>
				<Text style={styles.totalsLabel}>Total flour</Text>
				<Text style={styles.totalsValue}>
					{Math.round(result.totalFlourGrams)}g
				</Text>
			</View>
			<View style={styles.totalsItem}>
				<Text style={styles.totalsLabel}>Total dough</Text>
				<Text style={styles.totalsValue}>
					{Math.round(result.totalDoughGrams)}g
				</Text>
			</View>
		</View>
	</View>
);

const styles = StyleSheet.create({
	header: {
		color: "#7cffb2",
		fontSize: 17,
		fontWeight: "bold",
		textTransform: "uppercase",
		letterSpacing: 0.5,
		marginBottom: 18,
	},
	block: {
		backgroundColor: "#1a1a2e",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#2a2a4a",
		padding: 20,
	},
	stepLabel: {
		color: "#7cffb2",
		fontSize: 14,
		fontWeight: "bold",
		textTransform: "uppercase",
		letterSpacing: 0.5,
		marginBottom: 14,
	},
	gap: { height: 12 },
	tableHeader: {
		flexDirection: "row",
		paddingBottom: 12,
		borderBottomWidth: 1,
		borderBottomColor: "#2a2a4a",
	},
	headerCell: { color: "#555", fontSize: 13, textTransform: "uppercase" },
	row: {
		flexDirection: "row",
		paddingVertical: 14,
		borderBottomWidth: 1,
		borderBottomColor: "#2a2a4a",
	},
	prefermentRow: { backgroundColor: "#0d1f0d", marginHorizontal: -20, paddingHorizontal: 20 },
	name: { color: "#aaa", fontSize: 18 },
	grams: { color: "#e0e0e0", fontSize: 18, fontWeight: "bold" },
	pct: { color: "#666", fontSize: 16 },
	prefermentText: { color: "#7cffb2" },
	totalsRow: {
		flexDirection: "row",
		marginTop: 12,
		backgroundColor: "#1a1a2e",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#2a2a4a",
		padding: 14,
		gap: 16,
	},
	totalsItem: { flex: 1 },
	totalsLabel: { color: "#555", fontSize: 12, textTransform: "uppercase" },
	totalsValue: { color: "#888", fontSize: 14, marginTop: 4 },
});
```

- [ ] **Step 2: Export from `src/components/calculator/index.ts`**

```typescript
export { ModeToggle } from "./ModeToggle";
export { RecipePicker } from "./RecipePicker";
export { ResultModal } from "./ResultModal";
export { ResultTable } from "./ResultTable";
export { TwoStepResult } from "./TwoStepResult";
```

- [ ] **Step 3: Run lint**

```bash
bun run check
```

Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add src/components/calculator/TwoStepResult.tsx src/components/calculator/index.ts
git commit -m "feat(TwoStepResult): add two-step result component for biga/autolyse"
```

---

## Task 11: Update ResultTable

**Files:**
- Modify: `src/components/calculator/ResultTable.tsx`

- [ ] **Step 1: Update `src/components/calculator/ResultTable.tsx`**

The only changes: (1) accept any result with `flourGrams` + `ingredients`, (2) simplify the internal flour-grams extraction, (3) highlight preferment rows.

```typescript
import { StyleSheet, Text, View } from "react-native";
import type { IngredientResult, Mode } from "@/types/recipe";

type ResultLike = {
	flourGrams: number;
	ingredients: IngredientResult[];
};

type Props = {
	result: ResultLike;
	mode: Mode;
	header: string;
};

export const ResultTable = ({ result, header }: Props) => {
	const flourGrams = Math.round(result.flourGrams);

	return (
		<View style={styles.container}>
			<Text style={styles.header}>{header}</Text>

			<View style={styles.tableHeader}>
				<Text style={[styles.headerCell, { flex: 3 }]}>Ingredient</Text>
				<Text style={[styles.headerCell, { flex: 2, textAlign: "right" }]}>
					Grams
				</Text>
				<Text style={[styles.headerCell, { flex: 1, textAlign: "right" }]}>
					%
				</Text>
			</View>

			<View style={styles.row}>
				<Text style={[styles.name, { flex: 3 }]}>Flour</Text>
				<Text style={[styles.grams, { flex: 2, textAlign: "right" }]}>
					{flourGrams}g
				</Text>
				<Text style={[styles.pct, { flex: 1, textAlign: "right" }]}>100%</Text>
			</View>

			{result.ingredients.map((ing) => (
				<View
					key={ing.name}
					style={[styles.row, ing.source === "preferment" && styles.prefermentRow]}
				>
					<Text
						style={[
							styles.name,
							{ flex: 3 },
							ing.source === "preferment" && styles.prefermentText,
						]}
					>
						{ing.name}
					</Text>
					<Text
						style={[
							styles.grams,
							{ flex: 2, textAlign: "right" },
							ing.source === "preferment" && styles.prefermentText,
						]}
					>
						{Math.round(ing.grams)}g
					</Text>
					<Text style={[styles.pct, { flex: 1, textAlign: "right" }]}>
						{ing.percentage}%
					</Text>
				</View>
			))}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		backgroundColor: "#1a1a2e",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#2a2a4a",
		padding: 24,
	},
	header: {
		color: "#7cffb2",
		fontSize: 17,
		fontWeight: "bold",
		textTransform: "uppercase",
		letterSpacing: 0.5,
		marginBottom: 18,
	},
	tableHeader: {
		flexDirection: "row",
		paddingBottom: 12,
		borderBottomWidth: 1,
		borderBottomColor: "#2a2a4a",
	},
	headerCell: { color: "#555", fontSize: 13, textTransform: "uppercase" },
	row: {
		flexDirection: "row",
		paddingVertical: 16,
		borderBottomWidth: 1,
		borderBottomColor: "#2a2a4a",
	},
	prefermentRow: { backgroundColor: "#0d1f0d" },
	name: { color: "#aaa", fontSize: 20 },
	grams: { color: "#e0e0e0", fontSize: 20, fontWeight: "bold" },
	pct: { color: "#666", fontSize: 18 },
	prefermentText: { color: "#7cffb2" },
});
```

- [ ] **Step 2: Run full test suite**

```bash
bun run test
```

Expected: all pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/calculator/ResultTable.tsx
git commit -m "feat(ResultTable): accept flexible result shape, highlight preferment rows"
```

---

## Task 12: Update ResultModal

**Files:**
- Modify: `src/components/calculator/ResultModal.tsx`

- [ ] **Step 1: Replace the full contents of `src/components/calculator/ResultModal.tsx`**

```typescript
import { useKeepAwake } from "expo-keep-awake";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { DoughCalcResult, Mode } from "@/types/recipe";
import { ResultTable } from "./ResultTable";
import { TwoStepResult } from "./TwoStepResult";

type Props = {
	visible: boolean;
	result: DoughCalcResult;
	mode: Mode;
	header: string;
	onClose: () => void;
};

const KeepAwake = () => {
	useKeepAwake();
	return null;
};

export const ResultModal = ({
	visible,
	result,
	mode,
	header,
	onClose,
}: Props) => {
	return (
		<Modal visible={visible} animationType="slide" onRequestClose={onClose}>
			{visible && <KeepAwake />}
			<SafeAreaView style={styles.safeArea}>
				<View style={styles.container}>
					<View style={styles.topBar}>
						<Text style={styles.title}>Recipe Preview</Text>
						<Pressable onPress={onClose} style={styles.closeButton}>
							<Text style={styles.closeText}>✕ Close</Text>
						</Pressable>
					</View>
					{result.kind === "single" && (
						<ResultTable result={result} mode={mode} header={header} />
					)}
					{result.kind === "two-step" && (
						<TwoStepResult result={result} header={header} />
					)}
					<Text style={styles.hint}>Screen stays on while this is open.</Text>
				</View>
			</SafeAreaView>
		</Modal>
	);
};

const styles = StyleSheet.create({
	safeArea: { flex: 1, backgroundColor: "#0d0d1a" },
	container: { flex: 1, padding: 20 },
	topBar: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 24,
	},
	title: {
		color: "#7cffb2",
		fontSize: 20,
		fontWeight: "bold",
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
	closeButton: {
		backgroundColor: "#1a1a2e",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#2a2a4a",
		paddingVertical: 10,
		paddingHorizontal: 16,
	},
	closeText: { color: "#e0e0e0", fontSize: 16 },
	hint: {
		color: "#444",
		fontSize: 13,
		textAlign: "center",
		marginTop: 24,
	},
});
```

- [ ] **Step 2: Run lint**

```bash
bun run check
```

Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add src/components/calculator/ResultModal.tsx
git commit -m "feat(ResultModal): accept DoughCalcResult, render two-step for biga/autolyse"
```

---

## Task 13: Update CalculatorForm

**Files:**
- Modify: `src/components/CalculatorForm.tsx`

- [ ] **Step 1: Replace the full contents of `src/components/CalculatorForm.tsx`**

```typescript
import { useReducer, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { calcResult, calcResultHeader } from "@/bll/calculatorUtils";
import type { Recipe } from "@/types/recipe";
import {
	ModeToggle,
	RecipePicker,
	ResultModal,
	ResultTable,
	TwoStepResult,
} from "./calculator";
import {
	calculatorReducer,
	initialCalculatorState,
} from "./calculator/calculatorReducer";

type Props = {
	recipes: Recipe[];
};

export const CalculatorForm = ({ recipes }: Props) => {
	const [state, dispatch] = useReducer(
		calculatorReducer,
		initialCalculatorState(recipes),
	);
	const [modalVisible, setModalVisible] = useState(false);
	const { selectedId, mode, inputValue } = state;

	const recipe = recipes.find((r) => r.id === selectedId);
	const result = recipe ? calcResult(recipe, mode, inputValue) : null;
	const header =
		result && result.kind !== "error" && recipe
			? calcResultHeader(result, mode, recipe, inputValue)
			: "";

	if (recipes.length === 0) {
		return (
			<View style={styles.empty}>
				<Text style={styles.emptyText}>
					Add a recipe in the Recipes tab first.
				</Text>
			</View>
		);
	}

	const methodLabel = recipe?.doughMethod
		? recipe.doughMethod.toUpperCase()
		: "DIRECT";

	return (
		<View style={styles.container}>
			<RecipePicker
				recipes={recipes}
				selectedId={selectedId}
				onSelect={(id) => dispatch({ type: "SELECT_RECIPE", id })}
			/>

			<ModeToggle
				mode={mode}
				onChange={(m) => dispatch({ type: "SET_MODE", mode: m })}
			/>

			<View style={styles.section}>
				<Text style={styles.label}>
					{mode === "by-count"
						? "Number of dough balls"
						: "Flour available (kg)"}
				</Text>
				<TextInput
					style={styles.input}
					value={inputValue}
					onChangeText={(value) => dispatch({ type: "SET_INPUT", value })}
					keyboardType="decimal-pad"
					placeholder={mode === "by-count" ? "e.g. 8" : "e.g. 2.5"}
					placeholderTextColor="#555"
				/>
			</View>

			{result?.kind === "error" && (
				<View style={styles.errorBox}>
					<Text style={styles.errorText}>{result.message}</Text>
				</View>
			)}

			{result && result.kind === "single" && (
				<>
					<View style={styles.methodBadge}>
						<Text style={styles.methodBadgeText}>{methodLabel}</Text>
					</View>
					<ResultTable result={result} mode={mode} header={header} />
					<Pressable
						style={styles.previewButton}
						onPress={() => setModalVisible(true)}
					>
						<Text style={styles.previewButtonText}>Preview</Text>
					</Pressable>
					<ResultModal
						visible={modalVisible}
						result={result}
						mode={mode}
						header={header}
						onClose={() => setModalVisible(false)}
					/>
				</>
			)}

			{result && result.kind === "two-step" && (
				<>
					<View style={styles.methodBadge}>
						<Text style={styles.methodBadgeText}>{methodLabel}</Text>
					</View>
					<TwoStepResult result={result} header={header} />
					<Pressable
						style={styles.previewButton}
						onPress={() => setModalVisible(true)}
					>
						<Text style={styles.previewButtonText}>Preview</Text>
					</Pressable>
					<ResultModal
						visible={modalVisible}
						result={result}
						mode={mode}
						header={header}
						onClose={() => setModalVisible(false)}
					/>
				</>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1 },
	empty: { flex: 1, alignItems: "center", justifyContent: "center" },
	emptyText: { color: "#555", fontSize: 16 },
	section: { marginBottom: 20 },
	label: {
		color: "#888",
		fontSize: 13,
		textTransform: "uppercase",
		letterSpacing: 0.5,
		marginBottom: 6,
	},
	input: {
		backgroundColor: "#1a1a2e",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#7c9fff",
		color: "#e0e0e0",
		fontSize: 26,
		fontWeight: "bold",
		paddingVertical: 14,
		paddingHorizontal: 16,
	},
	methodBadge: {
		alignSelf: "flex-start",
		backgroundColor: "#1a1a2e",
		borderRadius: 5,
		borderWidth: 1,
		borderColor: "#7c9fff",
		paddingHorizontal: 10,
		paddingVertical: 3,
		marginBottom: 12,
	},
	methodBadgeText: {
		color: "#7c9fff",
		fontSize: 11,
		letterSpacing: 0.5,
	},
	errorBox: {
		backgroundColor: "#2a0d0d",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#ff7c7c",
		padding: 14,
		marginBottom: 12,
	},
	errorText: { color: "#ff7c7c", fontSize: 14 },
	previewButton: {
		marginTop: 16,
		backgroundColor: "#7cffb2",
		borderRadius: 8,
		paddingVertical: 14,
		alignItems: "center",
	},
	previewButtonText: {
		color: "#0d0d1a",
		fontSize: 17,
		fontWeight: "bold",
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
});
```

- [ ] **Step 2: Run full test suite and lint**

```bash
bun run test && bun run check
```

Expected: all pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/CalculatorForm.tsx
git commit -m "feat(CalculatorForm): switch on result.kind, show two-step and error states"
```

---

## Done

All 13 tasks complete. The feature is fully implemented:

- Recipes store dough method + parameters
- `calcBiga` / `calcAutolyse` produce validated two-step results
- Calculator dispatches by method and renders one or two result blocks
- Preview modal handles both layouts
- All existing tests still pass