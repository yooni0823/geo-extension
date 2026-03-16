# Codex Build Prompt

You are building a **Chrome Extension (Manifest V3)** called **GEO / AEO Inspector**.

Your job is to implement the first working version of the extension based on the spec documents in this repository.

Read and follow these files first:

- `GEO-AEO-extension-spec.md`
- `tasks.md`
- `schema-rules.md`
- `extractor-spec.md`

Do not ignore those documents. Use them as the primary source of truth.

---

## 1. Product Goal

Build a browser extension that:

- analyzes the currently open webpage
- extracts metadata, headings, and existing JSON-LD
- detects missing GEO / AEO related structured data
- generates a **draft JSON-LD** when structured data is missing
- shows the results in a **Chrome Side Panel UI**
- allows the user to **copy generated JSON-LD**

This extension is a **developer tool** for frontend engineers and publishers.

---

## 2. Technical Requirements

Use the following stack:

- Chrome Extension **Manifest V3**
- **TypeScript**
- **React**
- **Vite**

Preferred architecture:

- `content_script` for page extraction
- `background service worker` for messaging / side panel behavior
- `side panel UI` for displaying results
- shared utilities for extractors, schema generation, and validation

---

## 3. Build Scope

Implement the **MVP only**.

### MVP features

1. Open the side panel from the extension action button
2. Read the current webpage
3. Extract:
    - page title
    - meta description
    - canonical URL
    - html lang
    - Open Graph basic fields
    - H1 / H2
    - existing JSON-LD scripts
4. Display extracted data in the side panel
5. If no JSON-LD exists, generate a **WebPage JSON-LD draft**
6. Display the generated JSON-LD in formatted code
7. Add a **copy button**
8. Show simple warnings:
    - missing meta description
    - missing canonical
    - missing JSON-LD
    - multiple H1

Do not build advanced AI features yet.

---

## 4. Development Rules

### Core rules

- Never guess unknown factual data
- Prefer rule-based extraction
- Generated JSON-LD must be treated as a **draft**
- Keep the implementation simple and maintainable
- Do not add unnecessary libraries

### JSON-LD generation rules

If no JSON-LD exists, generate a basic `WebPage` schema using:

- `document.title` → `name`
- meta description → `description`
- canonical URL or current page URL → `url`
- page URL + `#webpage` → `@id`
- `html[lang]` → `inLanguage`

If extension settings later exist, `WebSite` and `Organization` can be added.
For the first MVP, keep that part optional and minimal.

---

## 5. Required Project Structure

Use this file structure:

```txt
geo-aeo-extension/
├─ src/
│  ├─ background/
│  │  └─ service-worker.ts
│  ├─ content/
│  │  └─ content-script.ts
│  ├─ sidepanel/
│  │  ├─ sidepanel.html
│  │  ├─ main.tsx
│  │  ├─ App.tsx
│  │  └─ components/
│  ├─ shared/
│  │  ├─ extractors.ts
│  │  ├─ schema-generator.ts
│  │  ├─ validators.ts
│  │  └─ types.ts
│  └─ options/
│     ├─ options.html
│     └─ options.tsx
├─ public/
│  └─ icons/
├─ manifest.json
├─ vite.config.ts
├─ package.json
├─ tsconfig.json
└─ README.md
```

If some files are unnecessary for the MVP, keep them minimal but preserve the structure.

---

## 6. Functional Expectations

### 6.1 Background service worker

Implement:

- extension install setup
- side panel open behavior when clicking the extension action
- message routing if needed

Use Chrome Side Panel API.

---

### 6.2 Content script

Extract these values from the current page:

#### Basic metadata

- `document.title`
- `meta[name="description"]`
- `link[rel="canonical"]`
- `document.documentElement.lang`

#### Open Graph

- `meta[property="og:title"]`
- `meta[property="og:description"]`
- `meta[property="og:image"]`
- `meta[property="og:url"]`

#### Headings

- all `h1`
- all `h2`

#### Structured data

- all `script[type="application/ld+json"]`

The content script should return a structured payload.

Example shape:

```ts
type PageAnalysisResult = {
  url: string;
  title: string;
  description: string;
  canonical: string;
  lang: string;
  og: {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
  };
  headings: {
    h1: string[];
    h2: string[];
  };
  jsonLd: string[];
};
```

---

### 6.3 Schema generator

Create a module that generates a `WebPage` schema draft.

Example:

```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://example.com/page#webpage",
  "url": "https://example.com/page",
  "name": "Page Title",
  "description": "Meta description",
  "inLanguage": "ko-KR"
}
```

Do not generate unsupported schema types automatically in the MVP.

---

### 6.4 Validators

Implement simple validators for:

- missing description
- missing canonical
- missing JSON-LD
- multiple H1

Return warnings in a structured format.

Example:

```ts
type Issue = {
  code: string;
  severity: "info" | "warning" | "error";
  message: string;
};
```

---

### 6.5 Side Panel UI

Build a simple React UI with these sections:

#### Section 1 — Detected Data
Show:

- URL
- title
- description
- canonical
- lang
- og fields
- H1 list
- H2 list
- existing JSON-LD count

#### Section 2 — Issues
Show warnings from validators.

#### Section 3 — Generated JSON-LD
If no JSON-LD exists:
- generate and display `WebPage` JSON-LD

If JSON-LD already exists:
- display a message that structured data is already present

#### Section 4 — Copy
Add a button to copy the generated JSON-LD.

Keep the UI minimal, readable, and developer-focused.

---

## 7. Manifest Requirements

Use Manifest V3.

Include permissions only as needed for the MVP.

Expected permissions likely include:

- `activeTab`
- `scripting`
- `storage`
- `sidePanel`

Include host permissions as needed.

---

## 8. Coding Style

- Use TypeScript types properly
- Keep functions small and focused
- Avoid overengineering
- Separate extraction, generation, validation, and UI logic
- Use readable names
- Add lightweight comments where helpful
- Prefer deterministic logic

---

## 9. Deliverables

Generate all required source files for the MVP.

At minimum, provide:

- `manifest.json`
- `package.json`
- `vite.config.ts`
- `tsconfig.json`
- `src/background/service-worker.ts`
- `src/content/content-script.ts`
- `src/shared/types.ts`
- `src/shared/extractors.ts`
- `src/shared/schema-generator.ts`
- `src/shared/validators.ts`
- `src/sidepanel/sidepanel.html`
- `src/sidepanel/main.tsx`
- `src/sidepanel/App.tsx`

Also include:

- minimal README instructions for local development
- how to build
- how to load the unpacked extension in Chrome

---

## 10. Output Format

When generating code:

1. First summarize the implementation plan briefly
2. Then generate the files one by one
3. Use clear file separators like:

```txt
=== FILE: manifest.json ===
```

4. Output complete file contents
5. Ensure the code is internally consistent

---

## 11. Non-Goals for MVP

Do **not** implement these yet unless clearly needed:

- AI summarization
- FAQ schema generation
- Article auto-detection
- CMS integration
- external schema validation APIs
- GEO/AEO scoring engine
- advanced design system
- complex settings UI

---

## 12. Final Instruction

Build a clean, working MVP of the GEO / AEO Inspector Chrome Extension.

Prioritize:

1. correctness
2. simplicity
3. maintainability
4. clear file structure

Use the repository spec files as the source of truth.
If something is unspecified, choose the simplest reasonable implementation that supports the MVP.