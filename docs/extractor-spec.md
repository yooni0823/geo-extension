# extractor-spec.md

## 1. Purpose

This document defines how the extension extracts page data from the currently open webpage.

The extractor is responsible for collecting structured input data that will later be used for:

- GEO / AEO analysis
- issue detection
- JSON-LD generation
- UI display in the side panel

Extraction should be performed by the **content script**.

---

## 2. Extraction Principles

### 2.1 General Rules

- Prefer deterministic DOM-based extraction
- Do not guess unknown factual data
- Keep extraction logic simple and explainable
- Return raw extracted values whenever possible
- Normalize whitespace where needed
- Ignore empty strings
- Avoid extracting duplicate values unless duplicates are meaningful

### 2.2 Output Goal

The extractor should return a single structured payload that can be passed to validators, schema generators, and the side panel UI.

---

## 3. Extraction Targets

The content script should extract the following categories of data.

### 3.1 Page URL

Extract:

- current page URL

Source:

- `window.location.href`

---

### 3.2 Basic Metadata

Extract:

- page title
- meta description
- canonical URL
- document language

Sources:

- `document.title`
- `meta[name="description"]`
- `link[rel="canonical"]`
- `document.documentElement.lang`

Fallbacks:

- if canonical URL is missing, use current page URL
- if language is missing, allow empty string or use optional fallback logic

---

### 3.3 Open Graph Metadata

Extract:

- `og:title`
- `og:description`
- `og:image`
- `og:url`

Source selectors:

```html
<meta property="og:title" content="..." />
<meta property="og:description" content="..." />
<meta property="og:image" content="..." />
<meta property="og:url" content="..." />
```

Return empty strings or undefined values when fields do not exist.

---

### 3.4 Headings

Extract:

- all `h1` text values
- all `h2` text values

Rules:

- trim text content
- remove empty values
- preserve document order

Example output:

```json
{
  "h1": ["Main Title"],
  "h2": ["Section A", "Section B"]
}
```

---

### 3.5 Existing JSON-LD

Extract all existing structured data blocks from:

```html
<script type="application/ld+json"></script>
```

Rules:

- collect all matching script tags
- read raw text content
- trim whitespace
- ignore empty blocks
- preserve original order

For MVP, it is acceptable to return raw string arrays.

Optional future enhancement:

- attempt JSON parsing
- detect schema types
- surface parse errors

Example output:

```json
[
  "{ \"@context\": \"https://schema.org\", \"@type\": \"WebPage\" }",
  "{ \"@context\": \"https://schema.org\", \"@type\": \"BreadcrumbList\" }"
]
```

---

### 3.6 Breadcrumb Candidates

The extractor may optionally attempt to detect breadcrumb navigation.

Possible selectors include:

```css
nav[aria-label="breadcrumb"]
.breadcrumb
[role="navigation"]
```

Rules:

- only extract breadcrumb items if the structure is reasonably clear
- preserve item order
- trim text content
- try to extract URLs when available
- do not guess missing breadcrumb labels

Example output:

```json
[
  { "name": "Home", "url": "https://example.com/" },
  { "name": "News", "url": "https://example.com/news" },
  { "name": "Article", "url": "https://example.com/news/article" }
]
```

If breadcrumb detection is unreliable, return an empty array.

---

## 4. Extraction Helpers

The extractor implementation should use small reusable helper functions.

Recommended helper responsibilities:

- get meta tag content by `name`
- get meta tag content by `property`
- get canonical URL
- collect heading text
- collect JSON-LD blocks
- normalize text
- remove duplicates if needed

Example helper ideas:

```ts
getMetaByName(name: string): string
getMetaByProperty(property: string): string
getCanonicalUrl(): string
getTextList(selector: string): string[]
getJsonLdBlocks(): string[]
normalizeText(value: string): string
```

---

## 5. Normalization Rules

### 5.1 Text Normalization

When extracting text:

- trim leading and trailing whitespace
- collapse repeated whitespace where helpful
- remove line breaks if they do not add meaning
- ignore fully empty results

### 5.2 URL Handling

When extracting URLs:

- keep original values as they appear in the document
- do not rewrite or transform URLs in the extractor
- leave canonical fallback handling to extraction or later processing, depending on implementation choice

---

## 6. Expected Output Shape

The content script should return a payload similar to the following:

```ts
export type PageAnalysisResult = {
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
  breadcrumbs?: Array<{
    name: string;
    url?: string;
  }>;
};
```

Example JSON output:

```json
{
  "url": "https://example.com/page",
  "title": "Example Page",
  "description": "This is an example description.",
  "canonical": "https://example.com/page",
  "lang": "ko-KR",
  "og": {
    "title": "Example Page",
    "description": "This is an example description.",
    "image": "https://example.com/image.jpg",
    "url": "https://example.com/page"
  },
  "headings": {
    "h1": ["Example Page"],
    "h2": ["Overview", "Details"]
  },
  "jsonLd": [],
  "breadcrumbs": []
}
```

---

## 7. Extraction Order

Recommended extraction flow:

1. collect current page URL
2. collect basic metadata
3. collect Open Graph metadata
4. collect headings
5. collect JSON-LD blocks
6. optionally collect breadcrumb candidates
7. assemble final structured payload
8. send payload to extension UI or background logic

---

## 8. Messaging Behavior

After extraction, the content script should send the structured payload to the extension.

Recommended approach:

```ts
chrome.runtime.sendMessage({
  type: "PAGE_ANALYSIS_RESULT",
  payload
});
```

Alternative architecture is acceptable if the side panel requests data explicitly.

---

## 9. Non-Goals for MVP

The extractor should **not** do these in the first MVP unless required:

- full article body extraction
- publish date inference
- author inference
- AI summarization
- advanced semantic content scoring
- external API calls
- schema generation directly inside extractor logic

Keep extraction focused on collecting reliable page data.

---

## 10. Future Extensions

Possible later improvements:

- article detection signals
- publish date extraction
- author extraction
- main content paragraph extraction
- FAQ block detection
- table/list answer candidate extraction
- JSON-LD parse error reporting
- SSR vs client-side injection detection

These are future enhancements and should not complicate the MVP.

---

## 11. Implementation Notes

Suggested implementation split:

- `src/shared/extractors.ts`
    - shared DOM extraction utilities
- `src/content/content-script.ts`
    - page execution and message sending
- `src/shared/types.ts`
    - output payload types

The extractor should remain independent from UI rendering.

---

## 12. Final Rule

The extractor must prioritize:

1. reliability
2. simplicity
3. deterministic behavior
4. clean structured output

If a value cannot be confidently extracted, return an empty value instead of guessing.