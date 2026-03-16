# geo-aeo-validator-rules.md

## 1. Purpose

This document defines validation rules for the GEO / AEO Inspector extension.

The validator is responsible for checking extracted page data and returning structured issues that can be displayed in the side panel UI.

Validation should focus on:

- missing metadata
- missing structured data
- heading structure issues
- basic GEO / AEO readiness warnings

The validator should remain simple, deterministic, and rule-based.

---

## 2. General Principles

### 2.1 Validation Rules

- Use only extracted page data
- Do not guess missing values
- Prefer clear and explainable rules
- Return structured issue objects
- Keep validation logic independent from UI rendering
- Support warnings first, errors only when clearly necessary

### 2.2 Severity Levels

Supported severity levels:

- `info`
- `warning`
- `error`

Recommended usage:

- `info`: helpful but not critical
- `warning`: important issue that should be reviewed
- `error`: clearly broken or invalid state

For MVP, most issues can use `warning`.

---

## 3. Issue Output Format

Validators should return a list of issue objects.

Recommended TypeScript shape:

```ts
export type IssueSeverity = "info" | "warning" | "error";

export type IssueCode =
  | "MISSING_TITLE"
  | "MISSING_DESCRIPTION"
  | "MISSING_CANONICAL"
  | "MISSING_JSON_LD"
  | "MULTIPLE_H1"
  | "MISSING_H1"
  | "EMPTY_LANG"
  | "MISSING_OG_TITLE"
  | "MISSING_OG_DESCRIPTION"
  | "INVALID_JSON_LD";

export type Issue = {
  code: IssueCode;
  severity: IssueSeverity;
  message: string;
};
```

Example output:

```json
[
  {
    "code": "MISSING_DESCRIPTION",
    "severity": "warning",
    "message": "Meta description is missing."
  },
  {
    "code": "MISSING_JSON_LD",
    "severity": "warning",
    "message": "No JSON-LD structured data was found on this page."
  }
]
```

---

## 4. Core Validation Rules for MVP

These rules should be implemented in the first working version.

### 4.1 Missing Title

Check whether page title exists.

Condition:

- `title` is empty after trimming

Issue:

- code: `MISSING_TITLE`
- severity: `warning`

Message:

- `Page title is missing.`

---

### 4.2 Missing Meta Description

Check whether meta description exists.

Condition:

- `description` is empty after trimming

Issue:

- code: `MISSING_DESCRIPTION`
- severity: `warning`

Message:

- `Meta description is missing.`

---

### 4.3 Missing Canonical

Check whether canonical URL exists.

Condition:

- `canonical` is empty after trimming

Issue:

- code: `MISSING_CANONICAL`
- severity: `warning`

Message:

- `Canonical URL is missing.`

Note:

- even if application logic later falls back to current URL, the missing canonical should still be reported as a warning

---

### 4.4 Missing JSON-LD

Check whether structured data exists.

Condition:

- `jsonLd.length === 0`

Issue:

- code: `MISSING_JSON_LD`
- severity: `warning`

Message:

- `No JSON-LD structured data was found on this page.`

---

### 4.5 Multiple H1

Check for multiple top-level headings.

Condition:

- `headings.h1.length > 1`

Issue:

- code: `MULTIPLE_H1`
- severity: `warning`

Message:

- `Multiple H1 elements were found on this page.`

---

### 4.6 Missing H1

Check whether a top-level heading exists.

Condition:

- `headings.h1.length === 0`

Issue:

- code: `MISSING_H1`
- severity: `warning`

Message:

- `No H1 element was found on this page.`

---

### 4.7 Empty Language

Check whether document language exists.

Condition:

- `lang` is empty after trimming

Issue:

- code: `EMPTY_LANG`
- severity: `info`

Message:

- `Document language is missing.`

---

## 5. Optional Validation Rules

These are useful but may be implemented after the basic MVP.

### 5.1 Missing Open Graph Title

Condition:

- `og.title` is empty after trimming

Issue:

- code: `MISSING_OG_TITLE`
- severity: `info`

Message:

- `Open Graph title is missing.`

---

### 5.2 Missing Open Graph Description

Condition:

- `og.description` is empty after trimming

Issue:

- code: `MISSING_OG_DESCRIPTION`
- severity: `info`

Message:

- `Open Graph description is missing.`

---

### 5.3 Invalid JSON-LD

Condition:

- at least one JSON-LD block cannot be parsed as valid JSON

Issue:

- code: `INVALID_JSON_LD`
- severity: `warning`

Message:

- `One or more JSON-LD blocks could not be parsed.`

Note:

- for the MVP, JSON-LD parsing can be optional
- if parsing is not implemented yet, this rule can be skipped temporarily

---

## 6. Validation Behavior

### 6.1 Input

Validators should consume extracted data from the page analysis result.

Example input shape:

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
};
```

### 6.2 Output

Return a flat array of issues.

Example:

```ts
Issue[]
```

### 6.3 Rule Execution

Each validator rule should be small and focused.

Recommended approach:

- one function per rule, or
- one grouped validator function with clearly separated checks

Example helper names:

```ts
validateTitle(data): Issue[]
validateDescription(data): Issue[]
validateCanonical(data): Issue[]
validateJsonLd(data): Issue[]
validateHeadings(data): Issue[]
validateOpenGraph(data): Issue[]
```

---

## 7. Rule Priority

When showing issues in UI, use this general priority order:

1. missing title
2. missing description
3. missing canonical
4. missing JSON-LD
5. missing H1
6. multiple H1
7. empty language
8. Open Graph warnings
9. JSON-LD parse warnings

This makes the UI more helpful for developers.

---

## 8. Suggested Validator Structure

Recommended file:

```txt
src/shared/validators.ts
```

Suggested implementation pattern:

```ts
export function validatePage(result: PageAnalysisResult): Issue[] {
  const issues: Issue[] = [];

  // title
  // description
  // canonical
  // jsonLd
  // headings
  // og
  // lang

  return issues;
}
```

Keep validation logic independent from:

- React components
- Chrome APIs
- schema generation logic

---

## 9. Non-Goals for MVP

The validator should not do the following in the first MVP:

- AI-based quality scoring
- semantic content evaluation
- article quality analysis
- readability scoring
- advanced heading outline reconstruction
- external API validation
- schema completeness scoring

These may be added later if needed.

---

## 10. Future Enhancements

Possible future validation improvements:

- title length checks
- meta description length checks
- canonical URL mismatch checks
- Open Graph completeness scoring
- duplicate schema detection
- schema type mismatch detection
- FAQ structure validation
- breadcrumb quality validation
- article metadata completeness checks
- SSR vs client-side structured data detection

These are outside the MVP scope.

---

## 11. Final Rule

Validators must prioritize:

1. simplicity
2. reliability
3. deterministic behavior
4. actionable developer feedback

If a rule is uncertain, it should not produce a strong error.
Prefer a simple warning or skip the rule entirely.