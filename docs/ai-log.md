# AI Log

## Working Rule

- When solving problems, append a short summary of the work to this file.

## Entries

### 2026-03-16

- Added the `docs/ai-log.md` workflow note so future Codex work summaries can be appended here.
- Scaffolded the Chrome extension project with Manifest V3, Vite, TypeScript, React side panel, background worker, content script, shared logic modules, and options page structure.
- Implemented the MVP data flow: page metadata extraction, Open Graph extraction, headings extraction, existing JSON-LD detection, validator-based issue reporting, and WebPage draft generation when JSON-LD is absent.
- Added JSON-LD inspection support with safe parsing, schema type detection, block-specific invalid JSON-LD warnings, and an Existing JSON-LD side panel section with copy support.
- Implemented site-wide settings using `chrome.storage.local`, including save, load, reset, and side panel summary display. Added support for applying WebSite and Organization defaults to generated WebPage drafts.
- Added `Open Settings` to the side panel so the options page can be opened directly from the extension UI.
- Added manual QA coverage in `docs/manual-test-checklist.md` and improved Existing JSON-LD UX with collapsible blocks, schema type labels, and parse success / parse failed badges.
- Added lightweight shared-logic automated tests with Vitest covering schema generation, validator behavior, JSON-LD parsing utilities, and settings helpers.
- Repeatedly verified the project with `npm test`, `npm run typecheck`, and `npm run build` after major milestones so the current workspace remains in a passing state.
