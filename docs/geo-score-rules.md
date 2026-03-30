# GEO Score Rules

## Purpose

GEO Score provides a simple, explainable summary score for the current page based on the extension's existing rule-based analysis.

## Score Categories

The score is divided into five categories, each worth up to 20 points:

- Metadata
- Structure
- JSON-LD
- Content Clarity
- Trust Signals

## Category Rules

| Category | Max | Main positive signals | Main deductions |
|--------|--------|--------|--------|
| Metadata | 20 | title, description, canonical, basic Open Graph fields | missing title, description, canonical, or OG basics |
| Structure | 20 | meaningful H1, valid H1 usage, H2 sectioning | missing H1, empty H1, multiple H1, H1 alt fallback reliance, missing H2 |
| JSON-LD | 20 | JSON-LD exists, parses successfully, schema types detected | no JSON-LD, parse failure, no schema types detected |
| Content Clarity | 20 | no major clarity-related GEO recommendations | weak summary, weak heading structure, low answer-ready structure |
| Trust Signals | 20 | trust signals present, internal linking healthy, language present | missing trust signals, weak internal linking, missing language, limited freshness/author signals |

## Rule-Based Scoring Approach

The score uses deterministic checks only.

- Metadata reviews title, description, canonical, and basic Open Graph coverage.
- Structure reviews meaningful H1 presence, heading validity, and H2 sectioning.
- JSON-LD reviews whether structured data exists, parses successfully, and exposes schema types.
- Content Clarity reviews clarity-related GEO recommendations such as weak summary, weak heading structure, and low answer-ready structure.
- Trust Signals reviews trust-related GEO recommendations such as missing trust signals and weak internal linking, plus basic language presence.

The side panel can also show the main deduction reasons for each category so the score remains explainable.

## Status Mapping

- 80 to 100: good
- 50 to 79: needs-improvement
- below 50: poor

## Explainable Scoring Principle

GEO Score is not predictive or AI-generated.
It is a transparent aggregation of existing rule-based checks so that the user can quickly understand where the page is strong and where it needs improvement.
