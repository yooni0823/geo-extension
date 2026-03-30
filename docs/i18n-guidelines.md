# i18n Guidelines

## 1. Purpose

This document defines the internationalization (i18n) approach for the GEO / AEO Inspector extension.

The goal is to:
- support multiple languages (English / Korean)
- allow manual language switching
- keep the implementation simple and maintainable
- ensure consistent UI text across the extension

---

## 2. Supported Languages

The extension currently supports:
- English (en)
- Korean (ko)

Additional languages may be added in the future.

---

## 3. Language Selection

The extension uses a manual language toggle.

- UI toggle: EN / KO
- Available in:
  - Side panel
  - Options page

The selected language is stored in chrome.storage.local.

Key:
uiLanguage

Allowed values:
"en" | "ko"

---

## 4. Default Behavior

When the extension loads:
1. If uiLanguage exists → use it
2. Otherwise → default to "en"

Future improvement:
- detect browser language (navigator.language)

---

## 5. i18n Structure

All UI strings are managed in:

src/shared/i18n.ts

Example structure:

export const messages = {
  en: { ... },
  ko: { ... }
};

---

## 6. Translation Scope

### Phase 1 (Current)
- section titles
- buttons
- labels (warning, info)
- fixed UI strings (e.g. "Why this matters")
- empty state messages
- GEO recommendation content
- issue messages
- schema recommendation content

### Phase 2 (Future)
- browser-language-based defaults
- more languages
- dynamic content translation for broader extension outputs

---

## 7. Design Principles

### Deterministic
- no AI translation
- no runtime translation

### Minimal
- avoid complex i18n frameworks

### Separation of Concerns
- i18n must not mix with:
  - validators
  - schema logic
  - GEO rules

The validators, schema recommendation rules, and GEO recommendation rules should emit stable codes or identifiers.
Localized text should be resolved at render time through `src/shared/i18n.ts`.

### Safe Fallback
- fallback to English if key is missing

---

## 8. Usage Pattern

Example:

const t = getMessages(language);

t.sections.issues
t.buttons.copy
t.labels.warning
t.geo.WEAK_SUMMARY.title
t.issues.MISSING_TITLE
t.schema.WebPage.reason

---

## 9. UI Guidelines

- keep text concise
- avoid long sentences
- ensure readability in EN and KO

---

## 10. Future Improvements

- browser language auto-detection
- more languages
- dynamic content translation

---

## 11. Summary

The i18n system is:
- simple
- predictable
- maintainable

and supports a bilingual workflow.
