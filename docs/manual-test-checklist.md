# Manual Test Checklist

This checklist is for practical QA and regression testing of the GEO / AEO Inspector Chrome Extension MVP.

---

## 1. Page With No JSON-LD

Test steps:

1. Open a webpage that does not contain any `<script type="application/ld+json">` block.
2. Open the extension side panel.

Expected results:

- Page metadata is shown in `Page Overview`
- `Existing JSON-LD` shows no detected blocks
- `Issues` includes a missing JSON-LD warning
- `Generated JSON-LD` shows a WebPage draft
- Copy button for the generated draft works

---

## 2. Page With Existing JSON-LD

Test steps:

1. Open a webpage that already contains one or more JSON-LD blocks.
2. Open the extension side panel.

Expected results:

- `Existing JSON-LD` lists all detected blocks
- Each block is labeled separately
- Each block can be expanded or collapsed
- Each block shows schema type labels when parsing succeeds
- Each block has its own copy button
- `Generated JSON-LD` does not create a new WebPage draft

---

## 3. Page With Malformed JSON-LD

Test steps:

1. Open a page that includes malformed JSON-LD.
2. Open the extension side panel.

Expected results:

- The side panel still renders normally
- The malformed block appears in `Existing JSON-LD`
- The malformed block shows a `parse failed` status badge
- The malformed block shows the parse error message
- `Issues` includes a block-specific invalid JSON-LD warning

---

## 4. Page With Breadcrumb-Like Navigation

Test steps:

1. Open a page with visible breadcrumb navigation.
2. Open the extension side panel.

Expected results:

- `Page Overview` still renders normally
- `Schema Recommendations` can include `BreadcrumbList`
- If the page already has JSON-LD, no generated draft is created
- If the page has no JSON-LD, the generated draft remains limited to supported MVP behavior

---

## 5. Settings Save, Load, And Reset

Test steps:

1. Open the side panel and click `Open Settings`
2. Enter values for organization name, organization url, organization logo, sameAs, website name, website url, and default language
3. Save settings
4. Return to the side panel
5. Reopen the extension or reload the page
6. Open settings again and click `Reset`

Expected results:

- Saved values persist via `chrome.storage.local`
- The side panel `Site-Wide Defaults` summary reflects saved values
- The saved settings reload correctly after reopening
- After reset, fields return to defaults
- The side panel summary updates to show no saved defaults

---

## 6. Generated Draft Behavior With Settings

Test steps:

1. Save valid WebSite and Organization defaults in the options page
2. Open a page with no JSON-LD
3. Open the side panel
4. Repeat on a page that already contains JSON-LD

Expected results:

- On pages with no JSON-LD, `Generated JSON-LD` shows a WebPage draft
- That WebPage draft can include `isPartOf -> WebSite`
- That WebPage draft can include `publisher -> Organization`
- On pages with existing JSON-LD, no new draft is generated

---

## 7. Side Panel Summary Verification

Test steps:

1. Save some settings in the options page
2. Open the side panel
3. Reset the settings
4. Open the side panel again

Expected results:

- The top summary shows saved Organization, WebSite, logo, sameAs, and default language values when present
- The top summary shows an empty-state message when no settings are saved

