import type { BreadcrumbItem, PageAnalysisResult } from "./types";

function normalizeText(value: string | null | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function getMetaByName(documentRef: Document, name: string): string {
  const element = documentRef.querySelector(`meta[name="${name}"]`);

  return normalizeText(element?.getAttribute("content"));
}

function getMetaByProperty(documentRef: Document, property: string): string {
  const element = documentRef.querySelector(`meta[property="${property}"]`);

  return normalizeText(element?.getAttribute("content"));
}

function getCanonical(documentRef: Document, fallbackUrl: string): {
  canonical: string;
  hasCanonicalTag: boolean;
} {
  const canonical = normalizeText(
    documentRef.querySelector('link[rel="canonical"]')?.getAttribute("href")
  );

  return {
    canonical: canonical || fallbackUrl,
    hasCanonicalTag: Boolean(canonical)
  };
}

function getTextList(documentRef: Document, selector: string): string[] {
  const seen = new Set<string>();

  return Array.from(documentRef.querySelectorAll(selector))
    .map((element) => normalizeText(element.textContent))
    .filter((value) => {
      if (!value || seen.has(value)) {
        return false;
      }

      seen.add(value);
      return true;
    });
}

function getJsonLdBlocks(documentRef: Document): string[] {
  return Array.from(
    documentRef.querySelectorAll<HTMLScriptElement>(
      'script[type="application/ld+json"]'
    )
  )
    .map((element) => normalizeText(element.textContent))
    .filter(Boolean);
}

function getBreadcrumbs(documentRef: Document): BreadcrumbItem[] {
  const candidate = documentRef.querySelector(
    'nav[aria-label="breadcrumb"], .breadcrumb, [role="navigation"]'
  );

  if (!candidate) {
    return [];
  }

  const items = Array.from(candidate.querySelectorAll("a, li, span")).flatMap((element) => {
      const name = normalizeText(element.textContent);
      const anchor = element instanceof HTMLAnchorElement ? element : element.closest("a");
      const url = normalizeText(anchor?.getAttribute("href"));

      if (!name) {
        return [];
      }

      return [{
        name,
        url: url || undefined
      }];
    });

  const uniqueItems: BreadcrumbItem[] = [];
  const seen = new Set<string>();

  for (const item of items) {
    const key = `${item.name}::${item.url ?? ""}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    uniqueItems.push(item);
  }

  return uniqueItems;
}

export function extractPageData(
  documentRef: Document = document,
  pageUrl: string = window.location.href
): PageAnalysisResult {
  const canonical = getCanonical(documentRef, pageUrl);

  return {
    url: pageUrl,
    title: normalizeText(documentRef.title),
    description: getMetaByName(documentRef, "description"),
    canonical: canonical.canonical,
    hasCanonicalTag: canonical.hasCanonicalTag,
    lang: normalizeText(documentRef.documentElement.lang),
    openGraph: {
      title: getMetaByProperty(documentRef, "og:title"),
      description: getMetaByProperty(documentRef, "og:description"),
      image: getMetaByProperty(documentRef, "og:image"),
      url: getMetaByProperty(documentRef, "og:url")
    },
    headings: {
      h1: getTextList(documentRef, "h1"),
      h2: getTextList(documentRef, "h2")
    },
    jsonLd: getJsonLdBlocks(documentRef),
    breadcrumbs: getBreadcrumbs(documentRef)
  };
}
