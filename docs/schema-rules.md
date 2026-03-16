# JSON-LD Generation Rules

This document defines how the extension generates structured data.

Schemas must follow schema.org standards.

---

# General Rules

1. Do not guess factual data
2. Use page metadata whenever possible
3. Use extension settings for organization information
4. Generated schemas are drafts

---

# Schema Priority

If a page contains no JSON-LD, generate:

1. WebPage
2. BreadcrumbList (if breadcrumb detected)
3. Organization (from settings)
4. WebSite (from settings)

---

# WebPage Schema

Generate WebPage schema using:

Fields mapping:

title → name  
meta description → description  
canonical URL → url  
html lang → inLanguage

Example:

```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "URL#webpage",
  "url": "URL",
  "name": "TITLE",
  "description": "DESCRIPTION",
  "inLanguage": "LANG"
}