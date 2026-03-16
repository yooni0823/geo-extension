# GEO / AEO Browser Extension Spec

## 1. Project Goal

Create a **Chrome Browser Extension** that analyzes a webpage from a **GEO (Generative Engine Optimization)** and **AEO (Answer Engine Optimization)** perspective and helps developers improve structured data and content structure.

The extension should:

- Analyze the current webpage structure
- Detect missing SEO / AEO related metadata
- Detect missing **JSON-LD structured data**
- Generate **JSON-LD draft schemas** automatically when they do not exist
- Provide a **copyable code output** that developers can paste into CMS or HTML

The goal is to build a **developer tool for frontend engineers and publishers** to improve AI/search visibility.

---

# 2. Core Features

## 2.1 Page Analysis

The extension reads the currently open webpage and extracts the following data.

### Basic Metadata

- `document.title`
- `meta[name="description"]`
- `link[rel="canonical"]`
- `html[lang]`

### Open Graph

- `meta[property="og:title"]`
- `meta[property="og:description"]`
- `meta[property="og:image"]`
- `meta[property="og:url"]`

### Heading Structure

- `H1`
- `H2`
- heading hierarchy

### Existing Structured Data

Extract all existing structured data scripts.

```html
<script type="application/ld+json"></script>
```

If structured data exists:

- Parse JSON
- Validate structure
- Detect missing required properties

---

# 3. JSON-LD Generation Feature

If a webpage **does not contain JSON-LD**, the extension should generate a **draft structured data schema**.

Important rule:

> The system should never guess unknown factual data.

Unknown fields should remain empty or require user configuration.

---

## 3.1 Schema Types (Phase 1)

Phase 1 supports generating these schemas:

### WebPage

Default schema for any page.

### BreadcrumbList

If breadcrumb navigation exists in the DOM.

### Organization

Loaded from extension settings.

### WebSite

Loaded from extension settings.

---

## 3.2 Example Generated Schema

Example **WebPage JSON-LD draft**

```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://example.com/page#webpage",
  "url": "https://example.com/page",
  "name": "Page Title",
  "description": "Meta description",
  "inLanguage": "ko-KR",
  "isPartOf": {
    "@type": "WebSite",
    "@id": "https://example.com/#website"
  },
  "publisher": {
    "@type": "Organization",
    "@id": "https://example.com/#organization"
  }
}
```

---

# 4. Extension Architecture

The extension will use **Chrome Manifest V3**.

### Main Components

```
Browser
 ├─ Content Script
 │   → Reads DOM and extracts page data
 │
 ├─ Background Service Worker
 │   → Handles messaging and storage
 │
 └─ Side Panel UI
     → Displays analysis results
     → Generates JSON-LD
     → Allows copying code
```

---

# 5. Project Structure

Recommended project structure:

```
geo-aeo-extension/

src/
 ├─ background/
 │   └─ service-worker.ts
 │
 ├─ content/
 │   └─ content-script.ts
 │
 ├─ sidepanel/
 │   ├─ sidepanel.html
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

manifest.json
vite.config.ts
package.json
README.md
```

---

# 6. Technology Stack

Recommended stack:

- Chrome Extension **Manifest V3**
- **TypeScript**
- **React** (for UI)
- **Vite** (build tool)
- Zustand (optional state management)

---

# 7. Page Data Extraction Logic

Content script should extract:

### Basic Info

```
document.title
meta[name="description"]
link[rel="canonical"]
html[lang]
```

### Open Graph

```
meta[property="og:title"]
meta[property="og:description"]
meta[property="og:image"]
```

### Headings

```
h1
h2
```

### JSON-LD

```
script[type="application/ld+json"]
```

All extracted data should be sent to the extension UI using:

```
chrome.runtime.sendMessage()
```

---

# 8. UI Panel Layout

Side panel UI sections:

### 1. Detected Data

Shows extracted data from the webpage:

- title
- description
- canonical
- headings
- existing schemas

---

### 2. Issues / Warnings

Examples:

- Missing description
- Missing canonical
- Missing JSON-LD
- Multiple H1
- Heading hierarchy issues

---

### 3. Schema Recommendation

The extension suggests schema types.

Examples:

- WebPage
- Article
- BreadcrumbList

---

### 4. Generated JSON-LD

Display generated schema code.

Features:

- syntax formatted code
- **copy button**
- download option

---

# 9. Extension Settings

The extension should allow configuring **site-wide information**.

### Organization

```
name
url
logo
sameAs
```

### WebSite

```
name
url
searchAction
```

These values are reused when generating JSON-LD.

---

# 10. MVP Development Scope

First working version should include:

### Phase 1

- Load extension
- Open side panel
- Extract page metadata
- Extract existing JSON-LD
- Generate **WebPage schema**
- Display JSON-LD draft
- Copy button

### Phase 2

- BreadcrumbList detection
- Organization schema injection
- Article schema recommendation
- Schema validation

### Phase 3

- AI assisted content summary
- FAQ schema generator
- SEO/AEO scoring
- report export

---

# 11. Development Principles

1. Do **not guess factual data**
2. Prefer **rule-based extraction**
3. AI assistance is optional
4. Generated schema should be **draft only**
5. Developer must verify before production

---

# 12. Long Term Vision

This extension will become a **developer assistant tool for GEO / AEO optimization**.

Future possibilities:

- AI answer extraction analysis
- structured data auto suggestions
- schema validation
- integration with CMS
- automated GEO scoring