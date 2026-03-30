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

function getHeadingTextWithFallback(element: Element): {
  value: string;
  usedImageAltFallback: boolean;
} {
  const directText = normalizeText(element.textContent);

  if (directText) {
    return {
      value: directText,
      usedImageAltFallback: false
    };
  }

  const imgAlt = normalizeText(
    element.querySelector("img[alt]")?.getAttribute("alt")
  );

  if (imgAlt) {
    return {
      value: imgAlt,
      usedImageAltFallback: true
    };
  }

  const ariaLabel = normalizeText(
    element.querySelector("[aria-label]")?.getAttribute("aria-label")
  );

  if (ariaLabel) {
    return {
      value: ariaLabel,
      usedImageAltFallback: false
    };
  }

  const titleAttribute = normalizeText(
    element.querySelector("[title]")?.getAttribute("title")
  );

  if (titleAttribute) {
    return {
      value: titleAttribute,
      usedImageAltFallback: false
    };
  }

  return {
    value: "",
    usedImageAltFallback: false
  };
}

export function extractH1Data(documentRef: Pick<Document, "querySelectorAll">): {
  count: number;
  values: string[];
  imageAltFallbackCount: number;
} {
  const seen = new Set<string>();
  const values: string[] = [];
  let imageAltFallbackCount = 0;
  const h1Elements = Array.from(documentRef.querySelectorAll("h1"));

  for (const element of h1Elements) {
    const heading = getHeadingTextWithFallback(element);

    if (!heading.value || seen.has(heading.value)) {
      continue;
    }

    seen.add(heading.value);
    values.push(heading.value);

    if (heading.usedImageAltFallback) {
      imageAltFallbackCount += 1;
    }
  }

  return {
    count: h1Elements.length,
    values,
    imageAltFallbackCount
  };
}

function getContentRoot(documentRef: Document): Element {
  return (
    documentRef.querySelector("main, article, [role='main']") ?? documentRef.body
  );
}

function getMeaningfulTextItems(root: ParentNode, selector: string): string[] {
  return Array.from(root.querySelectorAll(selector))
    .map((element) => normalizeText(element.textContent))
    .filter(Boolean);
}

function isExternalUrl(url: URL, pageOrigin: string): boolean {
  return url.origin !== pageOrigin;
}

function isInternalUrl(url: URL, pageOrigin: string): boolean {
  return url.origin === pageOrigin;
}

function isGenericAnchorText(text: string): boolean {
  return [
    "read more",
    "learn more",
    "click here",
    "here",
    "more",
    "view more",
    "details"
  ].includes(text.toLowerCase());
}

function hasAnyMatchingElement(root: ParentNode, selector: string): boolean {
  return Boolean(root.querySelector(selector));
}

function hasTextMatchingElements(root: ParentNode, selector: string, pattern: RegExp): boolean {
  return Array.from(root.querySelectorAll(selector)).some((element) =>
    pattern.test(normalizeText(element.textContent))
  );
}

function getContentSignals(documentRef: Document, pageUrl: string) {
  const contentRoot = getContentRoot(documentRef);
  const paragraphs = getMeaningfulTextItems(contentRoot, "p");
  const introParagraph = paragraphs.find((paragraph) => paragraph.length >= 40) ?? "";
  const headings = getMeaningfulTextItems(contentRoot, "h2, h3, h4");
  const questionHeadingCount = headings.filter((heading) =>
    /(^|\s)(what|why|how|when|where|who|which|can|should|is|are|do|does|did)\b|[?？]$/i.test(
      heading
    )
  ).length;

  const pageOrigin = new URL(pageUrl).origin;
  let internalLinkCount = 0;
  let externalLinkCount = 0;
  let genericInternalLinkCount = 0;

  for (const anchor of Array.from(contentRoot.querySelectorAll<HTMLAnchorElement>("a[href]"))) {
    const href = normalizeText(anchor.getAttribute("href"));

    if (
      !href ||
      href.startsWith("#") ||
      href.startsWith("javascript:") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:")
    ) {
      continue;
    }

    const anchorText = normalizeText(anchor.textContent);

    try {
      const resolvedUrl = new URL(href, pageUrl);

      if (isInternalUrl(resolvedUrl, pageOrigin)) {
        internalLinkCount += 1;

        if (anchorText && isGenericAnchorText(anchorText)) {
          genericInternalLinkCount += 1;
        }
      } else if (isExternalUrl(resolvedUrl, pageOrigin)) {
        externalLinkCount += 1;
      }
    } catch {
      continue;
    }
  }

  const hasTimeElement = Boolean(
    documentRef.querySelector(
      "time, [datetime], meta[property='article:published_time'], meta[name='author:published_time'], meta[name='pubdate'], meta[name='publish_date']"
    )
  );

  const authorMeta = normalizeText(
    documentRef.querySelector("meta[name='author']")?.getAttribute("content")
  );
  const authorText = getMeaningfulTextItems(
    contentRoot,
    "[rel='author'], [itemprop='author'], [class*='author'], [id*='author'], [class*='byline'], [id*='byline']"
  );
  const hasPriceLikeText =
    hasAnyMatchingElement(
      contentRoot,
      "[itemprop='price'], [data-price], [class*='price'], [id*='price'], [aria-label*='price' i]"
    ) ||
    hasTextMatchingElements(
      contentRoot,
      "p, li, span, strong, div",
      /([$€£¥₩]\s?\d)|(\b\d[\d,]*(\.\d{2})?\s?(usd|eur|gbp|krw|jpy)\b)/i
    );
  const hasProductLikeSignals = hasAnyMatchingElement(
    contentRoot,
    "[itemtype*='Product'], [data-product], [class*='product'], [id*='product']"
  );
  const hasAddressLikeText = hasAnyMatchingElement(
    contentRoot,
    "address, [itemprop='address'], [class*='address'], [id*='address']"
  );
  const hasPhoneLikeText = hasAnyMatchingElement(
    contentRoot,
    "a[href^='tel:'], [itemprop='telephone'], [class*='phone'], [id*='phone'], [class*='tel'], [id*='tel']"
  );
  const hasMapLikeEmbed = hasAnyMatchingElement(
    contentRoot,
    "iframe[src*='maps'], iframe[src*='google.com/maps'], [class*='map'], [id*='map'], [data-map]"
  );
  const hasOpeningHoursLikeText =
    hasAnyMatchingElement(
      contentRoot,
      "[itemprop*='openingHours'], [class*='hours'], [id*='hours'], [class*='open'], [id*='open']"
    ) ||
    hasTextMatchingElements(
      contentRoot,
      "p, li, div, span",
      /\b(mon|tue|wed|thu|fri|sat|sun)\b|\b(am|pm)\b|\bopening hours\b|\bbusiness hours\b/i
    );

  return {
    introParagraph,
    paragraphCount: paragraphs.length,
    listCount: contentRoot.querySelectorAll("ul, ol").length,
    questionHeadingCount,
    hasTimeElement,
    hasAuthorLikeText: Boolean(authorMeta) || authorText.some((value) => value.length >= 3),
    externalLinkCount,
    internalLinkCount,
    genericInternalLinkCount,
    hasPriceLikeText,
    hasProductLikeSignals,
    hasAddressLikeText,
    hasPhoneLikeText,
    hasMapLikeEmbed,
    hasOpeningHoursLikeText
  };
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
  const h1Data = extractH1Data(documentRef);

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
      h1Count: h1Data.count,
      h1ImageAltFallbackCount: h1Data.imageAltFallbackCount,
      h1: h1Data.values,
      h2: getTextList(documentRef, "h2")
    },
    contentSignals: getContentSignals(documentRef, pageUrl),
    jsonLd: getJsonLdBlocks(documentRef),
    breadcrumbs: getBreadcrumbs(documentRef)
  };
}
