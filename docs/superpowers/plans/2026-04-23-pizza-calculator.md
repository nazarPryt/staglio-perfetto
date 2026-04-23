# Pizza Dough Calculator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a two-tab React Native app where users manage dough recipes and calculate exact ingredient amounts by ball count or available flour.

**Architecture:** DAL → BLL → UI. `dal/storage.ts` wraps AsyncStorage. `bll/calculations.ts` contains pure scaling functions. `store/recipeStore.ts` is a Zustand store that bridges DAL and UI. UI components never touch storage directly.

**Tech Stack:** Expo SDK 54, expo-router v6, Zustand, @react-native-async-storage/async-storage, jest-expo, @testing-library/react-native

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `types/recipe.ts` | Create | Shared TypeScript types |
| `dal/storage.ts` | Create | AsyncStorage read/write |
| `bll/calculations.ts` | Create | Pure scaling math |
| `store/recipeStore.ts` | Create | Zustand store + persistence |
| `app/_layout.tsx` | Modify | Remove default content, keep Stack |
| `app/index.tsx` | Modify | Redirect to `/recipes` |
| `app/(tabs)/_layout.tsx` | Create | Tab navigator |
| `app/(tabs)/recipes.tsx` | Create | Recipes tab screen |
| `app/(tabs)/calculator.tsx` | Create | Calculator tab screen |
| `components/IngredientRow.tsx` | Create | Single ingredient row (name + grams + %) |
| `components/RecipeForm.tsx` | Create | Create/edit recipe modal |
| `components/RecipeCard.tsx` | Create | Recipe list card with Edit/Delete |
| `components/CalculatorForm.tsx` | Create | Recipe picker, mode toggle, result |
| `__tests__/dal/storage.test.ts` | Create | DAL unit tests |
| `__tests__/bll/calculations.test.ts` | Create | BLL unit tests |
| `jest.config.js` | Create | Jest configuration |
| `jest-setup.ts` | Create | AsyncStorage mock setup |

---

## Task 1: Install dependencies and configure Jest

**Files:**
- Modify: `package.json`
- Create: `jest.config.js`
- Create: `jest-setup.ts`

- [ ] **Step 1: Install runtime dependencies**

```bash
bun add zustand @react-native-async-storage/async-storage
```

- [ ] **Step 2: Install test dependencies**

```bash
bun add -d jest-expo @testing-library/react-native @types/jest
```

- [ ] **Step 3: Create `jest.config.js`**

```js
// jest.config.js
module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["./jest-setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)",
  ],
}
```

- [ ] **Step 4: Create `jest-setup.ts`**

```ts
// jest-setup.ts
import { jest } from "@jest/globals"
import mockAsyncStorage from "@react-native-async-storage/async-storage/jest"

jest.mock("@react-native-async-storage/async-storage", () => mockAsyncStorage)
```

- [ ] **Step 5: Add test script to `package.json`**

In `package.json`, add to `"scripts"`:
```json
"test": "jest"
```

- [ ] **Step 6: Verify Jest runs**

```bash
bun test --passWithNoTests
```

Expected: `Test Suites: 0 passed` with no errors.

- [ ] **Step 7: Commit**

```bash
git add package.json jest.config.js jest-setup.ts bun.lock
git commit -m "chore: add zustand, async-storage, and jest-expo test setup"
```

---

## Task 2: Shared types

**Files:**
- Create: `types/recipe.ts`

- [ ] **Step 1: Create `types/recipe.ts`**

```ts
// types/recipe.ts
export type Ingredient = {
  id: string
  name: string
  grams: number
}

export type Recipe = {
  id: string
  name: string
  ballWeight: number
  ingredients: Ingredient[]
  createdAt: number
}

export type IngredientResult = {
  name: string
  grams: number
  percentage: number
}

export type CalcByCountResult = {
  flourGrams: number
  totalDoughGrams: number
  ingredients: IngredientResult[]
}

export type CalcByFlourResult = {
  ballCount: number
  totalDoughGrams: number
  ingredients: IngredientResult[]
}
```

- [ ] **Step 2: Commit**

```bash
git add types/recipe.ts
git commit -m "feat: add shared recipe types"
```

---

## Task 3: DAL — storage.ts (TDD)

**Files:**
- Create: `dal/storage.ts`
- Create: `__tests__/dal/storage.test.ts`

- [ ] **Step 1: Write failing tests**

```bash
mkdir -p __tests__/dal
```

```ts
// __tests__/dal/storage.test.ts
import AsyncStorage from "@react-native-async-storage/async-storage"
import { loadRecipes, saveRecipes } from "@/dal/storage"
import type { Recipe } from "@/types/recipe"

const mockRecipe: Recipe = {
  id: "1",
  name: "Neapolitan",
  ballWeight: 280,
  ingredients: [
    { id: "1", name: "Water", grams: 650 },
    { id: "2", name: "Salt", grams: 25 },
    { id: "3", name: "Yeast", grams: 3 },
  ],
  createdAt: 1000000,
}

beforeEach(() => {
  jest.clearAllMocks()
})

test("loadRecipes returns empty array when nothing stored", async () => {
  ;(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null)
  const result = await loadRecipes()
  expect(result).toEqual([])
})

test("loadRecipes returns parsed recipes from storage", async () => {
  ;(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
    JSON.stringify([mockRecipe])
  )
  const result = await loadRecipes()
  expect(result).toEqual([mockRecipe])
})

test("saveRecipes writes JSON string to AsyncStorage", async () => {
  await saveRecipes([mockRecipe])
  expect(AsyncStorage.setItem).toHaveBeenCalledWith(
    "recipes",
    JSON.stringify([mockRecipe])
  )
})

test("saveRecipes with empty array clears storage", async () => {
  await saveRecipes([])
  expect(AsyncStorage.setItem).toHaveBeenCalledWith("recipes", "[]")
})
```

- [ ] **Step 2: Run tests — expect failure**

```bash
bun test __tests__/dal/storage.test.ts
```

Expected: `Cannot find module '@/dal/storage'`

- [ ] **Step 3: Create `dal/storage.ts`**

```bash
mkdir -p dal
```

```ts
// dal/storage.ts
import AsyncStorage from "@react-native-async-storage/async-storage"
import type { Recipe } from "@/types/recipe"

const STORAGE_KEY = "recipes"

export async function loadRecipes(): Promise<Recipe[]> {
  const json = await AsyncStorage.getItem(STORAGE_KEY)
  if (!json) return []
  return JSON.parse(json) as Recipe[]
}

export async function saveRecipes(recipes: Recipe[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(recipes))
}
```

- [ ] **Step 4: Run tests — expect pass**

```bash
bun test __tests__/dal/storage.test.ts
```

Expected: `4 passed`

- [ ] **Step 5: Commit**

```bash
git add dal/storage.ts __tests__/dal/storage.test.ts
git commit -m "feat: add DAL storage adapter with tests"
```

---

## Task 4: BLL — calculations.ts (TDD)

**Files:**
- Create: `bll/calculations.ts`
- Create: `__tests__/bll/calculations.test.ts`

Math reference for Neapolitan recipe (water 650g, salt 25g, yeast 3g, ball 280g):
- `totalDoughRatio = (1000 + 650 + 25 + 3) / 1000 = 1.678`
- 8 balls: `totalDough = 2240g`, `flour = 2240 / 1.678 ≈ 1334.9g`, `water = 1334.9 × 0.65 ≈ 867.7g`
- 1 kg flour: `totalDough = 1678g`, `ballCount = floor(1678 / 280) = 5`
- 10 kg flour: `totalDough = 16780g`, `ballCount = floor(16780 / 280) = 59`

- [ ] **Step 1: Write failing tests**

```bash
mkdir -p __tests__/bll
```

```ts
// __tests__/bll/calculations.test.ts
import { calcByCount, calcByFlour } from "@/bll/calculations"
import type { Recipe } from "@/types/recipe"

const recipe: Recipe = {
  id: "1",
  name: "Neapolitan",
  ballWeight: 280,
  ingredients: [
    { id: "1", name: "Water", grams: 650 },
    { id: "2", name: "Salt", grams: 25 },
    { id: "3", name: "Yeast", grams: 3 },
  ],
  createdAt: 0,
}

describe("calcByCount", () => {
  test("total dough grams equals ballCount × ballWeight", () => {
    const result = calcByCount(recipe, 8)
    expect(result.totalDoughGrams).toBe(2240)
  })

  test("flour grams is back-calculated from total dough", () => {
    const result = calcByCount(recipe, 8)
    expect(result.flourGrams).toBeCloseTo(1334.9, 0)
  })

  test("water grams is flour × water ratio", () => {
    const result = calcByCount(recipe, 8)
    const water = result.ingredients.find((i) => i.name === "Water")!
    expect(water.grams).toBeCloseTo(867.7, 0)
    expect(water.percentage).toBe(65)
  })

  test("salt percentage is correct", () => {
    const result = calcByCount(recipe, 8)
    const salt = result.ingredients.find((i) => i.name === "Salt")!
    expect(salt.percentage).toBe(2.5)
  })

  test("returns zero values for 0 balls", () => {
    const result = calcByCount(recipe, 0)
    expect(result.flourGrams).toBe(0)
    expect(result.totalDoughGrams).toBe(0)
    result.ingredients.forEach((i) => expect(i.grams).toBe(0))
  })
})

describe("calcByFlour", () => {
  test("ball count is floored for 1 kg flour", () => {
    const result = calcByFlour(recipe, 1)
    expect(result.ballCount).toBe(5)
  })

  test("water grams equals recipe water for 1 kg flour", () => {
    const result = calcByFlour(recipe, 1)
    const water = result.ingredients.find((i) => i.name === "Water")!
    expect(water.grams).toBe(650)
    expect(water.percentage).toBe(65)
  })

  test("ball count for 10 kg flour", () => {
    const result = calcByFlour(recipe, 10)
    expect(result.ballCount).toBe(59)
  })

  test("total dough grams for 1 kg flour", () => {
    const result = calcByFlour(recipe, 1)
    expect(result.totalDoughGrams).toBe(1678)
  })
})
```

- [ ] **Step 2: Run tests — expect failure**

```bash
bun test __tests__/bll/calculations.test.ts
```

Expected: `Cannot find module '@/bll/calculations'`

- [ ] **Step 3: Create `bll/calculations.ts`**

```bash
mkdir -p bll
```

```ts
// bll/calculations.ts
import type {
  Recipe,
  CalcByCountResult,
  CalcByFlourResult,
  IngredientResult,
} from "@/types/recipe"

function round1(n: number): number {
  return Math.round(n * 10) / 10
}

function ingredientRatio(recipe: Recipe): number {
  return recipe.ingredients.reduce((sum, i) => sum + i.grams, 0) / 1000
}

export function calcByCount(recipe: Recipe, ballCount: number): CalcByCountResult {
  const totalDoughGrams = ballCount * recipe.ballWeight
  const flourGrams = totalDoughGrams / (1 + ingredientRatio(recipe))
  const ingredients: IngredientResult[] = recipe.ingredients.map((i) => ({
    name: i.name,
    grams: round1((flourGrams * i.grams) / 1000),
    percentage: i.grams / 10,
  }))
  return {
    flourGrams: round1(flourGrams),
    totalDoughGrams,
    ingredients,
  }
}

export function calcByFlour(recipe: Recipe, flourKg: number): CalcByFlourResult {
  const flourGrams = flourKg * 1000
  const totalDoughGrams = round1(flourGrams * (1 + ingredientRatio(recipe)))
  const ballCount = Math.floor(totalDoughGrams / recipe.ballWeight)
  const ingredients: IngredientResult[] = recipe.ingredients.map((i) => ({
    name: i.name,
    grams: round1((flourGrams * i.grams) / 1000),
    percentage: i.grams / 10,
  }))
  return {
    ballCount,
    totalDoughGrams,
    ingredients,
  }
}
```

- [ ] **Step 4: Run tests — expect pass**

```bash
bun test __tests__/bll/calculations.test.ts
```

Expected: `9 passed`

- [ ] **Step 5: Commit**

```bash
git add bll/calculations.ts __tests__/bll/calculations.test.ts
git commit -m "feat: add BLL calculation functions with tests"
```

---

## Task 5: Zustand store

**Files:**
- Create: `store/recipeStore.ts`

- [ ] **Step 1: Create `store/recipeStore.ts`**

```bash
mkdir -p store
```

```ts
// store/recipeStore.ts
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { loadRecipes, saveRecipes } from "@/dal/storage"
import type { Recipe } from "@/types/recipe"

type RecipeStore = {
  recipes: Recipe[]
  addRecipe: (recipe: Recipe) => void
  updateRecipe: (recipe: Recipe) => void
  deleteRecipe: (id: string) => void
}

const dalStorage = {
  getItem: async (_key: string): Promise<string | null> => {
    const recipes = await loadRecipes()
    return JSON.stringify({ state: { recipes }, version: 0 })
  },
  setItem: async (_key: string, value: string): Promise<void> => {
    const parsed = JSON.parse(value) as { state: { recipes: Recipe[] } }
    await saveRecipes(parsed.state.recipes)
  },
  removeItem: async (_key: string): Promise<void> => {
    await saveRecipes([])
  },
}

export const useRecipeStore = create<RecipeStore>()(
  persist(
    (set) => ({
      recipes: [],
      addRecipe: (recipe) =>
        set((state) => ({ recipes: [...state.recipes, recipe] })),
      updateRecipe: (recipe) =>
        set((state) => ({
          recipes: state.recipes.map((r) => (r.id === recipe.id ? recipe : r)),
        })),
      deleteRecipe: (id) =>
        set((state) => ({
          recipes: state.recipes.filter((r) => r.id !== id),
        })),
    }),
    {
      name: "recipes",
      storage: dalStorage,
    }
  )
)
```

- [ ] **Step 2: Commit**

```bash
git add store/recipeStore.ts
git commit -m "feat: add Zustand recipe store with DAL persistence"
```

---

## Task 6: Navigation setup

**Files:**
- Modify: `app/_layout.tsx`
- Modify: `app/index.tsx`
- Create: `app/(tabs)/_layout.tsx`

- [ ] **Step 1: Update `app/_layout.tsx`**

```tsx
// app/_layout.tsx
import { Stack } from "expo-router"

export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />
}
```

- [ ] **Step 2: Update `app/index.tsx` to redirect**

```tsx
// app/index.tsx
import { Redirect } from "expo-router"

export default function Index() {
  return <Redirect href="/recipes" />
}
```

- [ ] **Step 3: Create `app/(tabs)/_layout.tsx`**

```bash
mkdir -p "app/(tabs)"
```

```tsx
// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router"

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: "#7c9fff",
      }}
    >
      <Tabs.Screen
        name="recipes"
        options={{ title: "Recipes", tabBarLabel: "Recipes" }}
      />
      <Tabs.Screen
        name="calculator"
        options={{ title: "Calculator", tabBarLabel: "Calculator" }}
      />
    </Tabs>
  )
}
```

- [ ] **Step 4: Create placeholder `app/(tabs)/recipes.tsx`**

```tsx
// app/(tabs)/recipes.tsx
import { View, Text } from "react-native"

export default function RecipesScreen() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Recipes</Text>
    </View>
  )
}
```

- [ ] **Step 5: Create placeholder `app/(tabs)/calculator.tsx`**

```tsx
// app/(tabs)/calculator.tsx
import { View, Text } from "react-native"

export default function CalculatorScreen() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Calculator</Text>
    </View>
  )
}
```

- [ ] **Step 6: Run the app and verify two tabs appear**

```bash
bun run web
```

Expected: browser opens, two tabs visible — "Recipes" and "Calculator". Tapping each switches screens.

- [ ] **Step 7: Commit**

```bash
git add app/_layout.tsx app/index.tsx "app/(tabs)/_layout.tsx" "app/(tabs)/recipes.tsx" "app/(tabs)/calculator.tsx"
git commit -m "feat: add tab navigation with Recipes and Calculator tabs"
```

---

## Task 7: IngredientRow component

**Files:**
- Create: `components/IngredientRow.tsx`

- [ ] **Step 1: Create `components/IngredientRow.tsx`**

```bash
mkdir -p components
```

```tsx
// components/IngredientRow.tsx
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native"

type Props = {
  name: string
  grams: string
  onNameChange?: (value: string) => void
  onGramsChange: (value: string) => void
  onPercentageChange: (value: string) => void
  onDelete?: () => void
  locked?: boolean
}

export default function IngredientRow({
  name,
  grams,
  onNameChange,
  onGramsChange,
  onPercentageChange,
  onDelete,
  locked = false,
}: Props) {
  const gramsNum = parseFloat(grams) || 0
  const percentage = (gramsNum / 10).toFixed(1)

  return (
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
        editable={!locked}
        placeholder="0"
        placeholderTextColor="#555"
      />
      <TextInput
        style={[styles.cell, styles.input, styles.numericCell]}
        value={percentage}
        onChangeText={onPercentageChange}
        keyboardType="decimal-pad"
        editable={!locked}
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
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  cell: {
    flex: 2,
  },
  numericCell: {
    flex: 1,
    textAlign: "right",
  },
  nameText: {
    color: "#666",
    fontSize: 13,
    paddingVertical: 8,
    paddingHorizontal: 10,
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
    fontSize: 13,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  deleteCell: {
    width: 24,
    alignItems: "center",
  },
  deleteBtn: {
    color: "#ff7c7c",
    fontSize: 16,
  },
  lockIcon: {
    fontSize: 12,
  },
})
```

- [ ] **Step 2: Commit**

```bash
git add components/IngredientRow.tsx
git commit -m "feat: add IngredientRow component"
```

---

## Task 8: RecipeForm component

**Files:**
- Create: `components/RecipeForm.tsx`

- [ ] **Step 1: Create `components/RecipeForm.tsx`**

```tsx
// components/RecipeForm.tsx
import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
  Alert,
} from "react-native"
import "react-native-get-random-values"
import { v4 as uuidv4 } from "uuid"
import IngredientRow from "@/components/IngredientRow"
import type { Recipe, Ingredient } from "@/types/recipe"

type Props = {
  visible: boolean
  initial?: Recipe
  onSave: (recipe: Recipe) => void
  onClose: () => void
}

const DEFAULT_INGREDIENTS: Ingredient[] = [
  { id: "water", name: "Water", grams: 650 },
  { id: "salt", name: "Salt", grams: 25 },
  { id: "yeast", name: "Yeast", grams: 3 },
]

const REQUIRED_IDS = new Set(["water", "salt", "yeast"])

export default function RecipeForm({ visible, initial, onSave, onClose }: Props) {
  const [name, setName] = useState(initial?.name ?? "")
  const [ballWeight, setBallWeight] = useState(
    initial?.ballWeight?.toString() ?? "280"
  )
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    initial?.ingredients ?? DEFAULT_INGREDIENTS
  )

  function updateGrams(id: string, rawGrams: string) {
    setIngredients((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, grams: parseFloat(rawGrams) || 0 } : i
      )
    )
  }

  function updatePercentage(id: string, rawPct: string) {
    const pct = parseFloat(rawPct) || 0
    setIngredients((prev) =>
      prev.map((i) => (i.id === id ? { ...i, grams: pct * 10 } : i))
    )
  }

  function updateName(id: string, value: string) {
    setIngredients((prev) =>
      prev.map((i) => (i.id === id ? { ...i, name: value } : i))
    )
  }

  function addIngredient() {
    setIngredients((prev) => [
      ...prev,
      { id: uuidv4(), name: "", grams: 0 },
    ])
  }

  function removeIngredient(id: string) {
    setIngredients((prev) => prev.filter((i) => i.id !== id))
  }

  function totalDough(): number {
    return 1000 + ingredients.reduce((sum, i) => sum + i.grams, 0)
  }

  function handleSave() {
    if (!name.trim()) {
      Alert.alert("Validation", "Recipe name is required.")
      return
    }
    const weight = parseFloat(ballWeight)
    if (!weight || weight <= 0) {
      Alert.alert("Validation", "Ball weight must be a positive number.")
      return
    }
    const invalidIngredient = ingredients.find((i) => !i.name.trim() || i.grams <= 0)
    if (invalidIngredient) {
      Alert.alert("Validation", "All ingredients must have a name and grams greater than 0.")
      return
    }
    const recipe: Recipe = {
      id: initial?.id ?? uuidv4(),
      name: name.trim(),
      ballWeight: weight,
      ingredients,
      createdAt: initial?.createdAt ?? Date.now(),
    }
    onSave(recipe)
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{initial ? "Edit Recipe" : "New Recipe"}</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeBtn}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <View style={{ flex: 2 }}>
            <Text style={styles.label}>Recipe name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Neapolitan"
              placeholderTextColor="#555"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Ball weight (g)</Text>
            <TextInput
              style={styles.input}
              value={ballWeight}
              onChangeText={setBallWeight}
              keyboardType="decimal-pad"
              placeholder="280"
              placeholderTextColor="#555"
            />
          </View>
        </View>

        <Text style={styles.label}>Ingredients for 1 kg of flour</Text>

        <View style={styles.tableHeader}>
          <Text style={[styles.headerCell, { flex: 2 }]}>Ingredient</Text>
          <Text style={[styles.headerCell, { flex: 1, textAlign: "right" }]}>Grams</Text>
          <Text style={[styles.headerCell, { flex: 1, textAlign: "right" }]}>%</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.flourRow}>
          <Text style={[styles.lockedName, { flex: 2 }]}>Flour</Text>
          <Text style={[styles.lockedValue, { flex: 1, textAlign: "right" }]}>1000</Text>
          <Text style={[styles.lockedValue, { flex: 1, textAlign: "right" }]}>100%</Text>
          <View style={{ width: 24 }} />
        </View>

        {ingredients.map((ing) => (
          <IngredientRow
            key={ing.id}
            name={ing.name}
            grams={ing.grams.toString()}
            locked={REQUIRED_IDS.has(ing.id)}
            onNameChange={
              REQUIRED_IDS.has(ing.id) ? undefined : (v) => updateName(ing.id, v)
            }
            onGramsChange={(v) => updateGrams(ing.id, v)}
            onPercentageChange={(v) => updatePercentage(ing.id, v)}
            onDelete={REQUIRED_IDS.has(ing.id) ? undefined : () => removeIngredient(ing.id)}
          />
        ))}

        <TouchableOpacity onPress={addIngredient}>
          <Text style={styles.addBtn}>+ Add ingredient</Text>
        </TouchableOpacity>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total dough per 1 kg flour</Text>
          <Text style={styles.totalValue}>{totalDough().toFixed(0)} g</Text>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save Recipe</Text>
        </TouchableOpacity>
      </ScrollView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f1a" },
  content: { padding: 16, paddingBottom: 40 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: { color: "#e0e0e0", fontSize: 18, fontWeight: "bold" },
  closeBtn: { color: "#888", fontSize: 20, padding: 4 },
  row: { flexDirection: "row", gap: 12, marginBottom: 16 },
  label: {
    color: "#888",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#1a1a2e",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2a2a4a",
    color: "#e0e0e0",
    fontSize: 13,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  tableHeader: {
    flexDirection: "row",
    paddingHorizontal: 4,
    marginBottom: 4,
    marginTop: 8,
  },
  headerCell: {
    color: "#555",
    fontSize: 10,
    textTransform: "uppercase",
  },
  flourRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  lockedName: {
    color: "#666",
    fontSize: 13,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: "#1a1a2e",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#222",
  },
  lockedValue: {
    color: "#666",
    fontSize: 13,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: "#1a1a2e",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#222",
  },
  addBtn: { color: "#7c9fff", fontSize: 13, marginTop: 8, marginBottom: 16 },
  totalRow: {
    backgroundColor: "#1a1a2e",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2a2a4a",
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  totalLabel: { color: "#888", fontSize: 13 },
  totalValue: { color: "#7cffb2", fontSize: 14, fontWeight: "bold" },
  saveBtn: {
    backgroundColor: "#7c9fff",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
  },
  saveBtnText: { color: "#000", fontWeight: "bold", fontSize: 15 },
})
```

- [ ] **Step 2: Install uuid package**

```bash
bun add uuid react-native-get-random-values
bun add -d @types/uuid
```

- [ ] **Step 3: Commit**

```bash
git add components/RecipeForm.tsx bun.lock
git commit -m "feat: add RecipeForm component with live grams/% sync"
```

---

## Task 9: RecipeCard component

**Files:**
- Create: `components/RecipeCard.tsx`

- [ ] **Step 1: Create `components/RecipeCard.tsx`**

```tsx
// components/RecipeCard.tsx
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native"
import type { Recipe } from "@/types/recipe"

type Props = {
  recipe: Recipe
  onEdit: () => void
  onDelete: () => void
}

function ingredientSummary(recipe: Recipe): string {
  return recipe.ingredients
    .map((i) => `${i.name} ${(i.grams / 10).toFixed(1)}%`)
    .join(" · ")
}

export default function RecipeCard({ recipe, onEdit, onDelete }: Props) {
  function handleDelete() {
    Alert.alert(
      "Delete Recipe",
      `Delete "${recipe.name}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: onDelete },
      ]
    )
  }

  return (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.name}>{recipe.name}</Text>
        <Text style={styles.summary}>
          Ball: {recipe.ballWeight}g · {ingredientSummary(recipe)}
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={onEdit}>
          <Text style={styles.editBtn}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete}>
          <Text style={styles.deleteBtn}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1a1a2e",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2a2a4a",
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  info: { flex: 1, marginRight: 8 },
  name: { color: "#e0e0e0", fontWeight: "bold", fontSize: 14 },
  summary: { color: "#888", fontSize: 11, marginTop: 2 },
  actions: { flexDirection: "row", gap: 12 },
  editBtn: { color: "#7c9fff", fontSize: 13 },
  deleteBtn: { color: "#ff7c7c", fontSize: 13 },
})
```

- [ ] **Step 2: Commit**

```bash
git add components/RecipeCard.tsx
git commit -m "feat: add RecipeCard component with delete confirmation"
```

---

## Task 10: Recipes tab screen

**Files:**
- Modify: `app/(tabs)/recipes.tsx`

- [ ] **Step 1: Replace placeholder with full screen**

```tsx
// app/(tabs)/recipes.tsx
import { useState } from "react"
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native"
import { useRecipeStore } from "@/store/recipeStore"
import RecipeCard from "@/components/RecipeCard"
import RecipeForm from "@/components/RecipeForm"
import type { Recipe } from "@/types/recipe"

export default function RecipesScreen() {
  const recipes = useRecipeStore((s) => s.recipes)
  const addRecipe = useRecipeStore((s) => s.addRecipe)
  const updateRecipe = useRecipeStore((s) => s.updateRecipe)
  const deleteRecipe = useRecipeStore((s) => s.deleteRecipe)

  const [formVisible, setFormVisible] = useState(false)
  const [editing, setEditing] = useState<Recipe | undefined>()

  function openNew() {
    setEditing(undefined)
    setFormVisible(true)
  }

  function openEdit(recipe: Recipe) {
    setEditing(recipe)
    setFormVisible(true)
  }

  function handleSave(recipe: Recipe) {
    if (editing) {
      updateRecipe(recipe)
    } else {
      addRecipe(recipe)
    }
    setFormVisible(false)
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.newBtn} onPress={openNew}>
          <Text style={styles.newBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {recipes.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No recipes yet. Tap + New to add one.</Text>
        </View>
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(r) => r.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <RecipeCard
              recipe={item}
              onEdit={() => openEdit(item)}
              onDelete={() => deleteRecipe(item.id)}
            />
          )}
        />
      )}

      <RecipeForm
        visible={formVisible}
        initial={editing}
        onSave={handleSave}
        onClose={() => setFormVisible(false)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f1a" },
  headerBar: {
    padding: 12,
    alignItems: "flex-end",
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a4a",
  },
  newBtn: {
    backgroundColor: "#7c9fff",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  newBtnText: { color: "#000", fontWeight: "bold", fontSize: 13 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { color: "#555", fontSize: 14 },
  list: { padding: 12 },
})
```

- [ ] **Step 2: Run the app and test recipes tab end-to-end**

```bash
bun run web
```

Verify:
- Empty state shows "No recipes yet" message.
- Tapping "+ New" opens the form modal.
- Filling in name + ball weight + ingredients and tapping "Save Recipe" adds a card to the list.
- Tapping "Edit" on a card reopens the form pre-filled.
- Tapping "Delete" shows a confirmation alert; confirming removes the card.
- Closing the app and reloading preserves recipes (Zustand persistence).

- [ ] **Step 3: Commit**

```bash
git add "app/(tabs)/recipes.tsx"
git commit -m "feat: implement Recipes tab screen"
```

---

## Task 11: CalculatorForm component

**Files:**
- Create: `components/CalculatorForm.tsx`

- [ ] **Step 1: Create `components/CalculatorForm.tsx`**

```tsx
// components/CalculatorForm.tsx
import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native"
import { calcByCount, calcByFlour } from "@/bll/calculations"
import type { Recipe, CalcByCountResult, CalcByFlourResult } from "@/types/recipe"

type Mode = "by-count" | "by-flour"

type Props = {
  recipes: Recipe[]
}

export default function CalculatorForm({ recipes }: Props) {
  const [selectedId, setSelectedId] = useState<string>(recipes[0]?.id ?? "")
  const [mode, setMode] = useState<Mode>("by-count")
  const [inputValue, setInputValue] = useState("")
  const [pickerOpen, setPickerOpen] = useState(false)

  const recipe = recipes.find((r) => r.id === selectedId)

  const totalDoughPerKg = recipe
    ? (1000 + recipe.ingredients.reduce((s, i) => s + i.grams, 0)).toFixed(0)
    : "—"

  type Result = CalcByCountResult | CalcByFlourResult | null
  let result: Result = null

  if (recipe) {
    const val = parseFloat(inputValue)
    if (val > 0) {
      result =
        mode === "by-count"
          ? calcByCount(recipe, val)
          : calcByFlour(recipe, val)
    }
  }

  function resultHeader(): string {
    if (!result || !recipe) return ""
    if (mode === "by-count") {
      const r = result as CalcByCountResult
      return `${inputValue} balls × ${recipe.ballWeight}g = ${r.totalDoughGrams}g total dough`
    }
    const r = result as CalcByFlourResult
    return `${r.ballCount} balls · ${r.totalDoughGrams}g total dough`
  }

  if (recipes.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Add a recipe in the Recipes tab first.</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Recipe picker */}
      <View style={styles.section}>
        <Text style={styles.label}>Recipe</Text>
        <TouchableOpacity
          style={styles.picker}
          onPress={() => setPickerOpen((v) => !v)}
        >
          <Text style={styles.pickerText}>{recipe?.name ?? "Select…"}</Text>
          <Text style={styles.pickerChevron}>▾</Text>
        </TouchableOpacity>
        {pickerOpen && (
          <View style={styles.pickerDropdown}>
            {recipes.map((r) => (
              <TouchableOpacity
                key={r.id}
                style={styles.pickerOption}
                onPress={() => {
                  setSelectedId(r.id)
                  setPickerOpen(false)
                  setInputValue("")
                }}
              >
                <Text style={styles.pickerOptionText}>{r.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {recipe && (
          <Text style={styles.hint}>
            Ball weight: {recipe.ballWeight}g · Dough per 1kg flour: {totalDoughPerKg}g
          </Text>
        )}
      </View>

      {/* Mode toggle */}
      <View style={styles.section}>
        <Text style={styles.label}>Mode</Text>
        <View style={styles.toggle}>
          <TouchableOpacity
            style={[styles.toggleOption, mode === "by-count" && styles.toggleActive]}
            onPress={() => { setMode("by-count"); setInputValue("") }}
          >
            <Text style={[styles.toggleText, mode === "by-count" && styles.toggleTextActive]}>
              How many balls?
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleOption, mode === "by-flour" && styles.toggleActive]}
            onPress={() => { setMode("by-flour"); setInputValue("") }}
          >
            <Text style={[styles.toggleText, mode === "by-flour" && styles.toggleTextActive]}>
              Flour available
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Input */}
      <View style={styles.section}>
        <Text style={styles.label}>
          {mode === "by-count" ? "Number of dough balls" : "Flour available (kg)"}
        </Text>
        <TextInput
          style={styles.input}
          value={inputValue}
          onChangeText={setInputValue}
          keyboardType="decimal-pad"
          placeholder={mode === "by-count" ? "e.g. 8" : "e.g. 2.5"}
          placeholderTextColor="#555"
        />
      </View>

      {/* Result */}
      {result && (
        <View style={styles.result}>
          <Text style={styles.resultHeader}>{resultHeader()}</Text>

          <View style={styles.resultTableHeader}>
            <Text style={[styles.resultHeaderCell, { flex: 2 }]}>Ingredient</Text>
            <Text style={[styles.resultHeaderCell, { flex: 1, textAlign: "right" }]}>Grams</Text>
            <Text style={[styles.resultHeaderCell, { flex: 1, textAlign: "right" }]}>%</Text>
          </View>

          {/* Flour row */}
          <View style={styles.resultRow}>
            <Text style={[styles.resultName, { flex: 2 }]}>Flour</Text>
            <Text style={[styles.resultGrams, { flex: 1, textAlign: "right" }]}>
              {mode === "by-count"
                ? `${(result as CalcByCountResult).flourGrams}g`
                : `${parseFloat(inputValue) * 1000}g`}
            </Text>
            <Text style={[styles.resultPct, { flex: 1, textAlign: "right" }]}>100%</Text>
          </View>

          {result.ingredients.map((ing) => (
            <View key={ing.name} style={styles.resultRow}>
              <Text style={[styles.resultName, { flex: 2 }]}>{ing.name}</Text>
              <Text style={[styles.resultGrams, { flex: 1, textAlign: "right" }]}>
                {ing.grams}g
              </Text>
              <Text style={[styles.resultPct, { flex: 1, textAlign: "right" }]}>
                {ing.percentage}%
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { color: "#555", fontSize: 14 },
  section: { marginBottom: 16 },
  label: {
    color: "#888",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  hint: { color: "#555", fontSize: 11, marginTop: 4 },
  picker: {
    backgroundColor: "#1a1a2e",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2a2a4a",
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  pickerText: { color: "#e0e0e0", fontSize: 13 },
  pickerChevron: { color: "#888" },
  pickerDropdown: {
    backgroundColor: "#1a1a2e",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2a2a4a",
    marginTop: 4,
  },
  pickerOption: { padding: 10, borderBottomWidth: 1, borderBottomColor: "#2a2a4a" },
  pickerOptionText: { color: "#e0e0e0", fontSize: 13 },
  toggle: {
    flexDirection: "row",
    backgroundColor: "#1a1a2e",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2a2a4a",
    padding: 3,
  },
  toggleOption: { flex: 1, borderRadius: 6, padding: 8, alignItems: "center" },
  toggleActive: { backgroundColor: "#7c9fff" },
  toggleText: { color: "#666", fontSize: 12 },
  toggleTextActive: { color: "#000", fontWeight: "bold" },
  input: {
    backgroundColor: "#1a1a2e",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#7c9fff",
    color: "#e0e0e0",
    fontSize: 22,
    fontWeight: "bold",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  result: {
    backgroundColor: "#1a1a2e",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2a2a4a",
    padding: 12,
  },
  resultHeader: {
    color: "#7cffb2",
    fontSize: 11,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  resultTableHeader: { flexDirection: "row", marginBottom: 6 },
  resultHeaderCell: { color: "#555", fontSize: 10, textTransform: "uppercase" },
  resultRow: { flexDirection: "row", marginBottom: 5 },
  resultName: { color: "#aaa", fontSize: 13 },
  resultGrams: { color: "#e0e0e0", fontSize: 13, fontWeight: "bold" },
  resultPct: { color: "#666", fontSize: 12 },
})
```

- [ ] **Step 2: Commit**

```bash
git add components/CalculatorForm.tsx
git commit -m "feat: add CalculatorForm component"
```

---

## Task 12: Calculator tab screen

**Files:**
- Modify: `app/(tabs)/calculator.tsx`

- [ ] **Step 1: Replace placeholder with full screen**

```tsx
// app/(tabs)/calculator.tsx
import { View, ScrollView, StyleSheet } from "react-native"
import { useRecipeStore } from "@/store/recipeStore"
import CalculatorForm from "@/components/CalculatorForm"

export default function CalculatorScreen() {
  const recipes = useRecipeStore((s) => s.recipes)

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <CalculatorForm recipes={recipes} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f1a" },
  content: { padding: 16, paddingBottom: 40 },
})
```

- [ ] **Step 2: Run the app and test calculator tab end-to-end**

```bash
bun run web
```

Verify:
- With no recipes: shows "Add a recipe in the Recipes tab first."
- After adding a recipe: recipe appears in the picker.
- "How many balls?" mode: enter a number, result table appears live with flour + ingredient grams and percentages.
- "Flour available" mode: enter kg, result shows ball count + ingredient grams.
- Switching modes clears the input.
- Switching recipes clears the input.

- [ ] **Step 3: Run all tests**

```bash
bun test
```

Expected: all tests pass.

- [ ] **Step 4: Run Biome check**

```bash
bun run check
```

Fix any lint/format issues reported.

- [ ] **Step 5: Commit**

```bash
git add "app/(tabs)/calculator.tsx"
git commit -m "feat: implement Calculator tab screen"
```

---

## Done

All 12 tasks complete. The app has:
- Persistent recipe management (create, edit, delete with confirmation)
- Baker's %-style recipes anchored to 1 kg flour, with grams ↔ % live sync
- Calculator with two modes: by ball count and by flour available
- DAL → BLL → UI layering throughout