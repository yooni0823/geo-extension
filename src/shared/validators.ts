import { analyzeJsonLdBlocks } from "./jsonld";
import type { Issue, PageAnalysisResult } from "./types";

export function validatePageAnalysis(pageData: PageAnalysisResult): Issue[] {
  const issues: Issue[] = [];
  const analyzedJsonLdBlocks = analyzeJsonLdBlocks(pageData.jsonLd);

  if (!pageData.title) {
    issues.push({
      code: "MISSING_TITLE",
      severity: "warning"
    });
  }

  if (!pageData.description) {
    issues.push({
      code: "MISSING_DESCRIPTION",
      severity: "warning"
    });
  }

  if (!pageData.hasCanonicalTag) {
    issues.push({
      code: "MISSING_CANONICAL",
      severity: "warning"
    });
  }

  if (pageData.jsonLd.length === 0) {
    issues.push({
      code: "MISSING_JSON_LD",
      severity: "warning"
    });
  }

  if (pageData.headings.h1Count > 1) {
    issues.push({
      code: "MULTIPLE_H1",
      severity: "warning"
    });
  }

  if (pageData.headings.h1Count === 0) {
    issues.push({
      code: "MISSING_H1",
      severity: "warning"
    });
  }

  if (pageData.headings.h1Count > 0 && pageData.headings.h1.length === 0) {
    issues.push({
      code: "EMPTY_H1",
      severity: "warning"
    });
  }

  if (pageData.headings.h1ImageAltFallbackCount > 0) {
    issues.push({
      code: "H1_FALLBACK_ALT",
      severity: "info"
    });
  }

  if (!pageData.lang) {
    issues.push({
      code: "EMPTY_LANG",
      severity: "info"
    });
  }

  if (!pageData.openGraph.title) {
    issues.push({
      code: "MISSING_OG_TITLE",
      severity: "info"
    });
  }

  if (!pageData.openGraph.description) {
    issues.push({
      code: "MISSING_OG_DESCRIPTION",
      severity: "info"
    });
  }

  for (const block of analyzedJsonLdBlocks) {
    if (!block.parseError) {
      continue;
    }

    issues.push({
      code: "INVALID_JSON_LD",
      severity: "warning",
      params: {
        block: block.index + 1,
        error: block.parseError
      }
    });
  }

  return issues;
}
