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
```

No test suite is configured yet.

## Architecture

React Native / Expo app using **expo-router** for file-based routing. Entry point is `expo-router/entry` (`package.json#main`).

### Routing (`app/`)

- `app/_layout.tsx` — root layout, renders a bare `<Stack />`.
- `app/index.tsx` — home screen (the only screen so far).

### Tooling

- **Biome** (`biome.json`) handles linting, formatting, and import sorting. Tabs for indentation, double quotes for JS/TSX. VCS integration is on — Biome respects `.gitignore`.

### Path aliases

`@/` maps to the repo root (`tsconfig.json`). Prefer `@/...` over relative imports.

### Platform splits

Files ending in `.ios.tsx`, `.web.ts`, etc. are auto-selected by Metro/expo-router. Add platform-specific variants alongside the default file when behavior differs.