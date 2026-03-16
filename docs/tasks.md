# GEO / AEO Extension Development Tasks

This document defines development tasks for the GEO/AEO browser extension.

The extension analyzes webpages and generates JSON-LD structured data drafts.

---

# Phase 1 — Foundation

Goal: basic extension that can read page data and generate WebPage schema.

Tasks:

- [ ] Setup Chrome Extension (Manifest V3)
- [ ] Setup Vite + TypeScript build system
- [ ] Create Side Panel UI
- [ ] Create Content Script
- [ ] Implement messaging between content script and extension UI
- [ ] Extract basic metadata from the webpage
- [ ] Extract existing JSON-LD scripts
- [ ] Display extracted data in the side panel

---

# Phase 2 — JSON-LD Generator

Goal: generate structured data when missing.

Tasks:

- [ ] Implement schema generator module
- [ ] Generate WebPage JSON-LD
- [ ] Detect Breadcrumb navigation
- [ ] Generate BreadcrumbList schema
- [ ] Load Organization schema from extension settings
- [ ] Load WebSite schema from extension settings
- [ ] Display generated JSON-LD code
- [ ] Add "Copy JSON-LD" button

---

# Phase 3 — Validation

Goal: detect SEO / AEO issues.

Tasks:

- [ ] Detect missing meta description
- [ ] Detect missing canonical
- [ ] Detect missing JSON-LD
- [ ] Detect multiple H1
- [ ] Detect heading hierarchy issues
- [ ] Validate JSON-LD format

---

# Phase 4 — Schema Recommendations

Goal: suggest schema types.

Tasks:

- [ ] Detect article pages
- [ ] Suggest Article schema
- [ ] Suggest FAQ schema
- [ ] Suggest Breadcrumb schema

---

# Phase 5 — Advanced Features

Optional improvements:

- [ ] AI assisted content summarization
- [ ] FAQ schema generator
- [ ] GEO/AEO score calculation
- [ ] Export report
- [ ] CMS integration

---

# Development Principles

- Never guess unknown factual information
- Prefer rule-based extraction
- Generated schemas must be drafts
- Developer must verify output before use