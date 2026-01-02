# Noridoc: test

Path: @/src/test/

### Overview

Test configuration and setup files for the Vitest test runner. Contains the global setup that runs before all frontend tests.

### How it fits into the larger codebase

This directory is referenced by `@/vitest.config.ts` as the `setupFiles` location. The setup runs once before the test suite begins, establishing global testing utilities.

### Core Implementation

**setup.ts:**
- Imports `@testing-library/jest-dom` to extend Vitest's `expect` with DOM-specific matchers
- Enables assertions like `toBeInTheDocument()`, `toHaveClass()`, `toHaveStyle()`
- Provides Canvas 2D context mock for jsdom (needed for pixel diff feature testing)

**Test Configuration (`@/vitest.config.ts`):**
- Uses jsdom environment to simulate browser DOM
- Enables globals (no need to import `describe`, `it`, `expect`)
- Includes all `*.test.{ts,tsx}` files in `src/`

### Things to Know

Tests for components are colocated with their source files (e.g., `FileList.test.tsx` next to `FileList.tsx`) rather than in this directory. This directory only contains test infrastructure.

Created and maintained by Nori.
