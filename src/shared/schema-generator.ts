import type {
  ExtensionSettings,
  PageAnalysisResult,
  SchemaRecommendation
} from "./types";
import { analyzeJsonLdBlocks } from "./jsonld";

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

function hasAnySchemaType(pageData: PageAnalysisResult, candidates: string[]): boolean {
  if (pageData.jsonLd.length === 0) {
    return false;
  }

  const candidateSet = new Set(candidates.map((candidate) => candidate.toLowerCase()));
  const blocks = analyzeJsonLdBlocks(pageData.jsonLd);

  return blocks.some((block) =>
    block.schemaTypes.some((schemaType) => candidateSet.has(schemaType.toLowerCase()))
  );
}

function hasFaqLabel(pageData: PageAnalysisResult): boolean {
  const faqPattern = /\bfaq\b|frequently asked questions/i;

  return [pageData.title, ...pageData.headings.h1, ...pageData.headings.h2].some((value) =>
    faqPattern.test(value)
  );
}

function shouldRecommendArticle(pageData: PageAnalysisResult): boolean {
  if (hasAnySchemaType(pageData, ["Article", "BlogPosting", "NewsArticle"])) {
    return false;
  }

  const { headings, contentSignals } = pageData;
  const hasEditorialSignals = contentSignals.hasTimeElement || contentSignals.hasAuthorLikeText;
  const hasMeaningfulIntro = contentSignals.introParagraph.trim().length >= 120;
  const hasSectionStructure = headings.h2.length >= 2;
  const hasEnoughBodyContent = contentSignals.paragraphCount >= 4;
  const isFaqHeavy = contentSignals.questionHeadingCount >= 2 || hasFaqLabel(pageData);

  return (
    headings.h1.length > 0 &&
    hasEditorialSignals &&
    hasMeaningfulIntro &&
    hasSectionStructure &&
    hasEnoughBodyContent &&
    !isFaqHeavy
  );
}

function shouldRecommendFaqPage(pageData: PageAnalysisResult): boolean {
  if (hasAnySchemaType(pageData, ["FAQPage"])) {
    return false;
  }

  const { headings, contentSignals } = pageData;
  const hasStrongQuestionPattern = contentSignals.questionHeadingCount >= 2;
  const hasFaqHeadingSignal = hasFaqLabel(pageData);
  const hasEnoughQuestionStructure = headings.h2.length >= 2 || contentSignals.listCount > 0;

  return (hasStrongQuestionPattern || hasFaqHeadingSignal) && hasEnoughQuestionStructure;
}

function shouldRecommendProduct(pageData: PageAnalysisResult): boolean {
  if (hasAnySchemaType(pageData, ["Product"])) {
    return false;
  }

  const { contentSignals, headings, openGraph, description } = pageData;
  const hasCoreProductSignals =
    contentSignals.hasPriceLikeText && contentSignals.hasProductLikeSignals;
  const hasSupportingContent = Boolean(description) || Boolean(openGraph.image) || headings.h2.length > 0;

  return headings.h1.length > 0 && hasCoreProductSignals && hasSupportingContent;
}

function shouldRecommendLocalBusiness(pageData: PageAnalysisResult): boolean {
  if (hasAnySchemaType(pageData, ["LocalBusiness"])) {
    return false;
  }

  const { contentSignals, headings } = pageData;
  const trustSignalCount = [
    contentSignals.hasPhoneLikeText,
    contentSignals.hasMapLikeEmbed,
    contentSignals.hasOpeningHoursLikeText
  ].filter(Boolean).length;

  return headings.h1.length > 0 && contentSignals.hasAddressLikeText && trustSignalCount >= 1;
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

  if (shouldRecommendArticle(pageData)) {
    recommendations.push({
      schema: "Article"
    });
  }

  if (shouldRecommendFaqPage(pageData)) {
    recommendations.push({
      schema: "FAQPage"
    });
  }

  if (shouldRecommendProduct(pageData)) {
    recommendations.push({
      schema: "Product"
    });
  }

  if (shouldRecommendLocalBusiness(pageData)) {
    recommendations.push({
      schema: "LocalBusiness"
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
