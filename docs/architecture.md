# architecture.md

## 1. Purpose

This document describes the system architecture of the **GEO / AEO Inspector Chrome Extension**.

The goal is to clearly define:

- component responsibilities
- data flow
- messaging behavior
- extension lifecycle

This document helps developers and AI coding tools understand how the extension should be structured.

---

# 2. High-Level Architecture

The extension follows a typical **Chrome Extension Manifest V3 architecture**.

Main components:

```
Web Page
   │
   │ (DOM extraction)
   ▼
Content Script
   │
   │ (send extracted data)
   ▼
Background Service Worker
   │
   │ (message routing)
   ▼
Side Panel UI (React)
```

Each component has a clear responsibility.

---

# 3. Components

## 3.1 Content Script

Location:

```
src/content/content-script.ts
```

Responsibilities:

- run inside the webpage
- access DOM
- extract page data
- send extracted data to the extension

Tasks:

- extract metadata
- extract Open Graph tags
- extract headings
- extract JSON-LD
- detect breadcrumb candidates

The content script must **not contain UI logic**.

---

## 3.2 Background Service Worker

Location:

```
src/background/service-worker.ts
```

Responsibilities:

- manage extension lifecycle
- open the side panel
- route messages between components
- handle extension installation events

Tasks:

- configure side panel behavior
- receive messages from content script
- forward data to UI if necessary

Example behavior:

```
Extension icon clicked
      │
      ▼
Open side panel
```

---

## 3.3 Side Panel UI

Location:

```
src/sidepanel/
```

The side panel is the main developer interface.

Responsibilities:

- display extracted page data
- show validation issues
- show schema recommendations
- generate JSON-LD drafts
- allow copying structured data

The UI should be built using **React + TypeScript**.

---

## 3.4 Shared Logic

Location:

```
src/shared/
```

Shared modules contain logic used across the extension.

Modules:

```
extractors.ts
schema-generator.ts
validators.ts
types.ts
```

Responsibilities:

- DOM extraction helpers
- schema generation logic
- validation rules
- shared data types

These modules should be **pure logic** with no Chrome API dependencies.

---

# 4. Data Flow

The extension follows this data flow:

```
1. User opens webpage

2. User opens extension side panel

3. Content script extracts page data

4. Extracted data is sent via message

5. Side panel receives page data

6. Validators analyze the data

7. Schema generator creates draft schema

8. UI renders the results
```

Flow diagram:

```
Web Page
   │
   ▼
Content Script
   │
   ▼
Extracted Page Data
   │
   ▼
Validator + Schema Generator
   │
   ▼
Side Panel UI
```

---

# 5. Messaging System

Communication uses the Chrome messaging API.

Content script sends page analysis results.

Example:

```ts
chrome.runtime.sendMessage({
  type: "PAGE_ANALYSIS_RESULT",
  payload: result
});
```

The side panel or background script receives this message.

Message types may include:

```
PAGE_ANALYSIS_RESULT
REQUEST_PAGE_ANALYSIS
COPY_JSON_LD
```

---

# 6. State Management

The side panel maintains a simple UI state.

Example state structure:

```ts
type PanelState = {
  pageData?: PageAnalysisResult;
  issues: Issue[];
  recommendedSchemas: string[];
  generatedSchema?: object;
};
```

State may be managed using:

- React state
- Zustand (optional)

---

# 7. Schema Generation Flow

Schema generation occurs after validation.

Process:

```
Page Data
   │
   ▼
Validation
   │
   ▼
Schema Recommendation
   │
   ▼
Schema Generation
```

Example result:

```
WebPage schema generated
```

More complex schemas may be added later.

---

# 8. Extension Lifecycle

Typical extension lifecycle:

```
User opens webpage
      │
      ▼
User clicks extension icon
      │
      ▼
Side panel opens
      │
      ▼
Content script extracts page data
      │
      ▼
UI displays results
```

---

# 9. Manifest Overview

The extension uses **Manifest V3**.

Important sections:

```
background
content_scripts
side_panel
permissions
```

Required permissions for MVP may include:

```
activeTab
scripting
storage
sidePanel
```

Host permissions may include:

```
<all_urls>
```

---

# 10. Separation of Concerns

The architecture should maintain clear boundaries:

| Layer | Responsibility |
|------|---------------|
| Content Script | DOM extraction |
| Shared Logic | validation and schema generation |
| Background | extension lifecycle |
| UI | developer interface |

Avoid mixing responsibilities.

---

# 11. Future Architecture Improvements

Possible improvements for later versions:

- caching page analysis results
- advanced schema validation
- AI-assisted content analysis
- background analysis engine
- report export system

These features are outside the MVP scope.

---

# 12. Architecture Goals

The architecture should prioritize:

1. simplicity
2. clear separation of concerns
3. maintainability
4. predictable data flow
5. compatibility with AI-assisted development tools