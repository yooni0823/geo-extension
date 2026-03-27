import type {
  ExtensionSettings,
  PageAnalysisResult,
  SchemaRecommendation
} from "./types";

function compactRecord(record: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(record).filter(([, value]) => {
      if (value === undefined || value === null) {
        return false;
      }

      if (typeof value === "string") {
        return value.trim().length > 0;
      }

      if (Array.isArray(value)) {
        return value.length > 0;
      }

      return true;
    })
  );
}

function resolveLanguage(
  pageData: PageAnalysisResult,
  settings: ExtensionSettings
): string {
  return pageData.lang || settings.defaultLanguage;
}

export function recommendSchemas(
  pageData: PageAnalysisResult,
  settings: ExtensionSettings
): SchemaRecommendation[] {
  const recommendations: SchemaRecommendation[] = [];

  if (pageData.jsonLd.length === 0 && pageData.title && pageData.canonical) {
    recommendations.push({
      schema: "WebPage"
    });
  }

  if (pageData.breadcrumbs.length > 1) {
    recommendations.push({
      schema: "BreadcrumbList"
    });
  }

  if (settings.organizationName && settings.organizationUrl) {
    recommendations.push({
      schema: "Organization"
    });
  }

  if (settings.websiteName && settings.websiteUrl) {
    recommendations.push({
      schema: "WebSite"
    });
  }

  return recommendations;
}

export function generateSchemaDrafts(
  pageData: PageAnalysisResult,
  settings: ExtensionSettings
): Record<string, unknown> | null {
  if (pageData.jsonLd.length > 0) {
    return null;
  }

  const baseUrl = pageData.canonical || pageData.url;
  const language = resolveLanguage(pageData, settings);
  const webpage: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${baseUrl}#webpage`,
    url: baseUrl,
    name: pageData.title,
    description: pageData.description,
    inLanguage: language
  };

  if (settings.websiteUrl) {
    webpage.isPartOf = compactRecord({
      "@type": "WebSite",
      "@id": `${settings.websiteUrl}#website`,
      url: settings.websiteUrl,
      name: settings.websiteName || undefined,
      inLanguage: language || undefined
    });
  }

  if (settings.organizationName || settings.organizationUrl) {
    webpage.publisher = compactRecord({
      "@type": "Organization",
      "@id": settings.organizationUrl
        ? `${settings.organizationUrl}#organization`
        : undefined,
      name: settings.organizationName || undefined,
      url: settings.organizationUrl || undefined,
      logo: settings.organizationLogo || undefined,
      sameAs: settings.sameAs.length > 0 ? settings.sameAs : undefined
    });
  }

  return webpage;
}
