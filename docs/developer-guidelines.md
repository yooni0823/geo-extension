# developer-guidelines.md

## 1. Purpose

This document defines development guidelines for the **GEO / AEO Inspector Chrome Extension**.

The goal is to ensure:

- consistent code style
- predictable architecture
- maintainable code
- compatibility with AI-assisted development tools

These guidelines should be followed by both human developers and AI code generators.

---

# 2. Technology Stack

The project uses the following technologies:

- Chrome Extension **Manifest V3**
- **TypeScript**
- **React**
- **Vite**

Preferred architecture:

- content script for page extraction
- background service worker for lifecycle management
- side panel UI for developer interaction
- shared modules for reusable logic

---

# 3. Code Organization

All source code should be placed inside the `src/` directory.

Recommended structure:

```
src/
 ├─ background/
 │   └─ service-worker.ts
 │
 ├─ content/
 │   └─ content-script.ts
 │
 ├─ sidepanel/
 │   ├─ main.tsx
 │   ├─ App.tsx
 │   └─ components/
 │
 ├─ shared/
 │   ├─ extractors.ts
 │   ├─ schema-generator.ts
 │   ├─ validators.ts
 │   └─ types.ts
 │
 └─ options/
     ├─ options.html
     └─ options.tsx
```

Rules:

- UI logic belongs in `sidepanel/`
- page extraction belongs in `content/`
- extension lifecycle logic belongs in `background/`
- reusable logic belongs in `shared/`

---

# 4. Naming Conventions

### Files

Use **kebab-case** or **camelCase** depending on context.

Examples:

```
schema-generator.ts
content-script.ts
validators.ts
```

React components should use **PascalCase**.

Examples:

```
PageOverviewSection.tsx
IssuesSection.tsx
GeneratedSchemaSection.tsx
```

---

### Variables

Use **camelCase**.

Example:

```ts
pageData
jsonLdBlocks
schemaRecommendations
```

---

### Types

Use **PascalCase**.

Example:

```ts
PageAnalysisResult
Issue
SchemaRecommendation
```

---

# 5. TypeScript Rules

TypeScript should be used consistently.

Guidelines:

- define types in `shared/types.ts`
- avoid `any`
- prefer explicit types
- use interfaces or type aliases

Example:

```ts
export type Issue = {
  code: string;
  severity: "info" | "warning" | "error";
  message: string;
};
```

---

# 6. Function Design

Functions should follow these rules:

- small and focused
- single responsibility
- deterministic behavior
- minimal side effects

Example:

Good:

```ts
function getMetaDescription(): string
```

Avoid:

```
function analyzeEntirePageStructureAndReturnEverything()
```

---

# 7. Separation of Concerns

Keep responsibilities separated.

| Layer | Responsibility |
|------|---------------|
| Content Script | DOM extraction |
| Shared Modules | validation + schema generation |
| Background | extension lifecycle |
| UI | display and interaction |

Avoid mixing layers.

Example:

❌ Bad

```
React component performing DOM extraction
```

✅ Good

```
content script extracts DOM
UI receives structured data
```

---

# 8. UI Guidelines

The side panel UI should be:

- minimal
- readable
- developer-focused

Avoid:

- complex design systems
- heavy UI frameworks
- excessive styling

Use simple layout and clear sections.

---

# 9. Logging

Logging should be minimal.

Allowed cases:

- debugging extraction
- error handling

Example:

```ts
console.warn("JSON-LD parsing failed");
```

Avoid excessive logging.

---

# 10. Error Handling

Prefer graceful fallback behavior.

Example:

If meta description is missing:

- return empty string
- validator will report warning

Avoid throwing runtime errors for missing page metadata.

---

# 11. Chrome API Usage

Chrome APIs should be used only where necessary.

Examples:

Allowed:

```
chrome.runtime.sendMessage
chrome.sidePanel.open
chrome.storage.local
```

Avoid using Chrome APIs inside shared logic modules.

Shared modules should remain pure JavaScript/TypeScript logic.

---

# 12. Performance Guidelines

The extension should remain lightweight.

Rules:

- avoid heavy DOM queries
- avoid scanning entire document repeatedly
- avoid large external libraries

Prefer simple DOM selectors.

Example:

```
document.querySelector("meta[name='description']")
```

---

# 13. AI Development Compatibility

This project is designed for **AI-assisted development**.

AI tools such as:

- Codex
- Cursor
- ChatGPT

should be able to generate code using the documentation inside the `docs/` directory.

Guidelines:

- keep documentation clear
- avoid hidden assumptions
- maintain deterministic logic
- avoid ambiguous rules

---

# 14. Pull Request Guidelines

When contributing code:

- keep commits focused
- follow file structure rules
- update documentation when necessary
- avoid unrelated refactors

---

# 15. Future Improvements

Possible future additions:

- ESLint configuration
- Prettier configuration
- automated tests
- CI pipeline

These are outside the MVP scope.