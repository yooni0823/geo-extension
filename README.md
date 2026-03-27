# GEO / AEO Inspector

**GEO / AEO Inspector** is a Chrome Extension that analyzes webpages from a **GEO (Generative Engine Optimization)** and **AEO (Answer Engine Optimization)** perspective.

The extension helps developers inspect webpage structure, metadata, and structured data readiness for modern search engines and AI-driven answer systems.
It also provides practical GEO-focused recommendations about content structure, answer readiness, trust signals, and internal linking.
The UI now supports manual English and Korean switching in both the side panel and the options page.
The extension also supports bilingual UI (English / Korean) to improve usability in different environments.
GEO recommendation content is also localized, so both the interface and recommendation copy support English and Korean.

---

## What This Tool Does

The extension analyzes the currently open webpage and extracts:

- page metadata
- Open Graph tags
- heading structure (H1 / H2)
- existing JSON-LD structured data
- breadcrumb candidates
- GEO-oriented content quality signals

If structured data is missing, the extension can generate a **draft JSON-LD schema**.

This tool is intended for:

- frontend developers
- publishers
- SEO / GEO / AEO practitioners

---

## Key Features (MVP)

### Page Analysis

Extracts important SEO/AEO signals:

- title
- meta description
- canonical URL
- Open Graph metadata
- heading structure
- existing JSON-LD blocks

### Bilingual UI (EN / KO)

The extension supports a bilingual interface with a manual language toggle.

- Switch between English and Korean using the EN / KO toggle
- Language preference is stored in `chrome.storage.local`
- Both the side panel and options page reflect the selected language

The current implementation includes:

- section titles
- buttons and labels
- status indicators (warning, info)
- fixed UI strings such as "Why this matters"
- localized GEO recommendation content in English and Korean
- localized issue messages
- localized schema recommendation content

Future improvements may include broader translation coverage for additional extension outputs.

### Issue Detection

Detects common page issues:

- missing title
- missing meta description
- missing canonical URL
- missing JSON-LD structured data
- missing or multiple H1 tags
- missing document language
- optional Open Graph warnings

### GEO Recommendations

Provides rule-based GEO suggestions beyond structured data, including:

- content structure analysis
- answer-ready formatting suggestions
- trust signal checks
- heading alignment and hierarchy improvements
- a localized reason, suggested fix, and "Why this matters" explanation for each recommendation

### JSON-LD Draft Generation

If no structured data is present, the extension generates a **WebPage JSON-LD draft**.

Example:

```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://example.com/page#webpage",
  "url": "https://example.com/page",
  "name": "Example Page",
  "description": "Example description",
  "inLanguage": "ko-KR"
}
```

Generated schemas are **developer drafts** and should be reviewed before production use.

### Current MVP Data Flow

The current implementation follows this flow:

1. The content script extracts page metadata, Open Graph tags, headings, JSON-LD, and GEO content signals from the active page.
2. The side panel requests that page analysis when opened.
3. Shared JSON-LD utilities safely parse each detected block, detect schema types, and preserve per-block parse failures.
4. Shared validators produce rule-based issues from the extracted payload, including block-specific invalid JSON-LD warnings.
5. The GEO recommendation layer evaluates page structure, trust signals, and answer-ready patterns without using AI.
6. The shared schema generator produces a WebPage JSON-LD draft only when the page has no JSON-LD.
7. The side panel renders extracted data, issues, GEO recommendations, schema recommendations, existing JSON-LD blocks, and the generated JSON-LD with copy buttons.

### Site-Wide Settings

The options page stores site-wide defaults in `chrome.storage.local`.

Supported fields:

- organization name
- organization url
- organization logo
- sameAs
- website name
- website url
- default language
- ui language (`en` or `ko`)

When no JSON-LD exists on the current page, the generated `WebPage` draft can optionally include `isPartOf` and `publisher` using these saved settings.

The options page also supports resetting stored defaults, and the side panel shows a compact summary of the currently loaded site-wide settings.

### Schema Recommendation

The extension can recommend relevant schema types based on page structure, including:

- WebPage
- BreadcrumbList
- Article
- FAQPage
- Product
- LocalBusiness

Recommendations are rule-based and should be reviewed by the developer.

---

## Documentation

Project documentation is located in the **docs/** directory.

| Document | Description |
|--------|--------|
| `docs/GEO-AEO-extension-spec.md` | Main product specification |
| `docs/tasks.md` | Development roadmap |
| `docs/schema-rules.md` | JSON-LD generation rules |
| `docs/extractor-spec.md` | Page extraction specification |
| `docs/schema-detection-rules.md` | Schema recommendation rules |
| `docs/geo-recommendation-rules.md` | GEO recommendation rules |
| `docs/i18n-guidelines.md` | Internationalization (i18n) guidelines |
| `docs/geo-aeo-validator-rules.md` | Page validation and issue detection rules |
| `docs/ui-panel-spec.md` | Side panel UI specification |
| `docs/architecture.md` | Extension architecture and data flow |
| `docs/developer-guidelines.md` | Code style and development guidelines |
| `docs/codex-build-prompt.md` | Codex implementation instructions |
| `docs/manual-test-checklist.md` | Manual QA and regression checklist |

These documents define how the extension should analyze pages, generate schemas, validate issues, structure the UI, and organize implementation.

---

## Project Structure

```txt
geo-aeo-extension/
├─ docs/
│  ├─ GEO-AEO-extension-spec.md
│  ├─ tasks.md
│  ├─ schema-rules.md
│  ├─ extractor-spec.md
│  ├─ schema-detection-rules.md
│  ├─ geo-recommendation-rules.md
│  ├─ i18n-guidelines.md
│  ├─ geo-aeo-validator-rules.md
│  ├─ ui-panel-spec.md
│  ├─ architecture.md
│  ├─ developer-guidelines.md
│  ├─ codex-build-prompt.md
│  └─ manual-test-checklist.md
├─ src/
│  ├─ background/
│  ├─ content/
│  ├─ sidepanel/
│  ├─ shared/
│  └─ options/
├─ public/
├─ manifest.json
├─ package.json
├─ vite.config.ts
├─ tsconfig.json
└─ README.md
```

---

## Development Setup

Install dependencies:

```bash
npm install
```

Run development build:

```bash
npm run dev
```

Build extension:

```bash
npm run build
```

Run shared logic tests:

```bash
npm test
```

---

## Load Extension in Chrome

1. Open Chrome
2. Navigate to:

```txt
chrome://extensions
```

3. Enable **Developer Mode**
4. Click **Load unpacked**
5. Select the `dist/` directory

The extension should now appear in your browser.

---

## AI Workflow

When Codex solves problems in this repository, append a short summary of the work to `docs/ai-log.md`.

---

## Using Codex

This project is structured to work well with AI coding tools such as Codex.

To start implementation with Codex:

```txt
Read all files inside docs/ and implement the MVP described in those documents.
```

Or more explicitly:

```txt
Read docs/GEO-AEO-extension-spec.md, docs/tasks.md, docs/schema-rules.md, docs/extractor-spec.md, docs/schema-detection-rules.md, docs/geo-aeo-validator-rules.md, docs/ui-panel-spec.md, docs/architecture.md, docs/developer-guidelines.md, and docs/codex-build-prompt.md, then implement the extension MVP.
```

---

## MVP Scope

The first version focuses on:

- page metadata extraction
- JSON-LD detection
- basic issue warnings
- WebPage schema generation
- rule-based schema recommendations
- developer-focused side panel UI

Advanced features such as AI summarization, FAQ schema generation, CMS integration, and scoring systems will be added later.

---

## Development Principles

- Prefer rule-based extraction
- Never guess factual data
- Generated schemas are drafts
- Keep architecture simple and maintainable
- Separate extraction, validation, schema generation, and UI logic
- Keep shared logic independent from Chrome APIs where possible

---

## Long Term Vision

The GEO / AEO Inspector aims to become a **developer assistant for AI-ready websites**.

Future features may include:

- AI answer extraction analysis
- automatic schema recommendations
- GEO readiness scoring
- structured data validation
- report export
- CMS integration
- schema completeness checks
- advanced content-type detection

---

## Notes

This repository is intentionally documentation-driven so that both human developers and AI coding tools can understand the project clearly before implementation.
