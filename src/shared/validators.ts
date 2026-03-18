import { analyzeJsonLdBlocks } from "./jsonld";
import type { Issue, PageAnalysisResult } from "./types";

export function validatePageAnalysis(pageData: PageAnalysisResult): Issue[] {
  const issues: Issue[] = [];
  const analyzedJsonLdBlocks = analyzeJsonLdBlocks(pageData.jsonLd);

  if (!pageData.title) {
    issues.push({
      code: "MISSING_TITLE",
      severity: "warning",
      message: "Page title is missing."
    });
  }

  if (!pageData.description) {
    issues.push({
      code: "MISSING_DESCRIPTION",
      severity: "warning",
      message: "Meta description is missing."
    });
  }

  if (!pageData.hasCanonicalTag) {
    issues.push({
      code: "MISSING_CANONICAL",
      severity: "warning",
      message: "Canonical URL is missing."
    });
  }

  if (pageData.jsonLd.length === 0) {
    issues.push({
      code: "MISSING_JSON_LD",
      severity: "warning",
      message: "No JSON-LD structured data was found on this page."
    });
  }

  if (pageData.headings.h1.length > 1) {
    issues.push({
      code: "MULTIPLE_H1",
      severity: "warning",
      message: "Multiple H1 elements were found on this page."
    });
  }

  if (pageData.headings.h1.length === 0) {
    issues.push({
      code: "MISSING_H1",
      severity: "warning",
      message: "No H1 element was found on this page."
    });
  }

  if (!pageData.lang) {
    issues.push({
      code: "EMPTY_LANG",
      severity: "info",
      message: "Document language is missing."
    });
  }

  if (!pageData.openGraph.title) {
    issues.push({
      code: "MISSING_OG_TITLE",
      severity: "info",
      message: "Open Graph title is missing."
    });
  }

  if (!pageData.openGraph.description) {
    issues.push({
      code: "MISSING_OG_DESCRIPTION",
      severity: "info",
      message: "Open Graph description is missing."
    });
  }

  for (const block of analyzedJsonLdBlocks) {
    if (!block.parseError) {
      continue;
    }

    issues.push({
      code: "INVALID_JSON_LD",
      severity: "warning",
      message: `JSON-LD block ${block.index + 1} could not be parsed: ${block.parseError}`
    });
  }

  return issues;
}
