# schema-detection-rules.md

## 1. Purpose

This document defines rules for detecting which **Schema.org structured data types** should be recommended for a webpage.

The goal is to help the GEO / AEO Inspector extension suggest the most appropriate structured data schemas based on page content and structure.

These rules are used by the **schema recommendation engine**.

---

# 2. General Principles

Schema recommendations should follow these principles:

1. Prefer deterministic signals from the DOM.
2. Never guess unknown factual data.
3. Recommendations are suggestions, not automatic schema insertion.
4. Only recommend schemas when signals are reasonably clear.
5. Multiple schema types may be recommended if appropriate.

---

# 3. Always Recommended Schemas

The following schemas are considered **baseline schemas** and may be recommended for most websites.

### WebPage

Recommend when:

- the page has no existing JSON-LD
- the page is a general web document

Signals:

- any HTML document with title and canonical URL

---

### WebSite

Recommend when:

- site-level schema does not exist
- extension settings contain site information

Signals:

- site root domain
- homepage detection

---

### Organization

Recommend when:

- extension settings contain organization information
- the site represents a company or organization

Signals:

- organization settings available
- corporate site structure

---

# 4. BreadcrumbList Detection

Recommend **BreadcrumbList** when breadcrumb navigation is detected.

Possible DOM signals:

```
nav[aria-label="breadcrumb"]
.breadcrumb
[role="navigation"]
```

Common breadcrumb patterns:

```
Home > Category > Page
```

Rules:

- breadcrumb items must appear in hierarchical order
- items should contain text labels
- URLs should be extracted when available

If breadcrumb extraction is unclear, do not recommend.

---

# 5. Article Schema Detection

Recommend **Article**, **BlogPosting**, or **NewsArticle** when the page appears to contain editorial content.

Signals may include:

### Content signals

- large text blocks inside `article` or `main`
- paragraph count greater than a minimum threshold

### Metadata signals

- publish date
- author name
- article title

Possible selectors:

```
article
main
.meta
.author
.publish-date
time[datetime]
```

Rules:

- recommend but do not automatically generate Article schema
- require user confirmation before generating

---

# 6. FAQ Schema Detection

Recommend **FAQPage** when the page clearly contains question-answer patterns.

Signals:

- multiple question headings
- repeated Q/A structure
- FAQ section headings

Example patterns:

```
Q: What is GEO?
A: GEO stands for Generative Engine Optimization.
```

Possible selectors:

```
.faq
[data-faq]
details
summary
```

Rules:

- questions must be clearly identifiable
- answers must exist directly below the question

If Q/A structure is unclear, do not recommend.

---

# 7. Product Schema Detection

Recommend **Product** schema when the page represents a product.

Signals may include:

- product title
- price information
- product image
- product description
- structured product containers

Possible selectors:

```
.product
.product-detail
[data-product]
.price
```

Rules:

- product price is a strong signal
- avoid recommending Product schema for non-commerce content

---

# 8. LocalBusiness Schema Detection

Recommend **LocalBusiness** schema when the page represents a physical business location.

Signals:

- address
- phone number
- map embed
- opening hours

Possible selectors:

```
address
.tel
.map
.store-info
```

Rules:

- physical address must exist
- avoid recommending when signals are weak

---

# 9. Schema Recommendation Output

The schema recommendation engine should return structured output.

Example:

```json
{
  "recommendedSchemas": [
    "WebPage",
    "BreadcrumbList",
    "Article"
  ]
}
```

Each recommendation may optionally include reasoning.

Example:

```json
{
  "schema": "Article",
  "reason": "publish date and article container detected"
}
```

---

# 10. Recommendation Priority

If multiple schemas are detected, prioritize in this order:

1. WebPage
2. BreadcrumbList
3. Organization
4. WebSite
5. Article
6. FAQPage
7. Product
8. LocalBusiness

Baseline schemas should appear first.

---

# 11. Non-Goals for MVP

The MVP should **not implement complex AI detection**.

Avoid:

- semantic NLP analysis
- content summarization
- external APIs
- machine learning models

Use **rule-based detection only**.

---

# 12. Future Enhancements

Future improvements may include:

- AI-assisted schema detection
- content type classification
- schema validation suggestions
- schema merging strategies
- schema completeness scoring

These features are outside the MVP scope.