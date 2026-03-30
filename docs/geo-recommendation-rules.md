# GEO Recommendation Rules

## Purpose

This module provides rule-based GEO suggestions that go beyond JSON-LD by reviewing content structure, answer readiness, trust signals, and internal linking patterns on the current page.

## Principles

- deterministic
- explainable
- no AI
- no guessing

## Rules

### Weak Summary

Detect when the main content has no meaningful opening paragraph or only a very short intro. Suggest adding a concise summary near the top of the page.

### Missing H1

Detect when no H1 exists. Suggest adding a single clear H1 that states the main topic.

### Title/H1 mismatch

Detect when the document title and H1 are both present but differ substantially. Suggest aligning them around the same core topic and phrasing.

### Weak heading structure

Detect pages with H2 sections but no H1, or pages with too few headings overall. Suggest clearer sectioning with a primary H1 and descriptive H2s.

### Answer-ready structure

Detect when the page has no lists and no question-style headings. Suggest adding lists, steps, or question-led sections to make answers easier to extract.

### Trust signals

Detect when no date signal, author-like signal, or external reference links are present. Suggest adding visible authorship, freshness cues, and supporting references.

### Internal linking

Detect when there are very few internal links or when internal anchors use generic text such as "read more" or "click here". Suggest adding relevant internal links with descriptive anchor text.

## Output Format

The module returns a `GeoRecommendation` object with a stable `code`, `severity`, short `title`, explanation in `reason`, and actionable `suggestion`.
