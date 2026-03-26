export type IssueSeverity = "info" | "warning" | "error";

export type IssueCode =
  | "MISSING_TITLE"
  | "MISSING_DESCRIPTION"
  | "MISSING_CANONICAL"
  | "MISSING_JSON_LD"
  | "MULTIPLE_H1"
  | "MISSING_H1"
  | "EMPTY_LANG"
  | "MISSING_OG_TITLE"
  | "MISSING_OG_DESCRIPTION"
  | "INVALID_JSON_LD";

export type Issue = {
  code: IssueCode;
  severity: IssueSeverity;
  message: string;
};

export type JsonLdBlockAnalysis = {
  index: number;
  raw: string;
  parsed: unknown | null;
  schemaTypes: string[];
  parseError: string | null;
};

export type BreadcrumbItem = {
  name: string;
  url?: string;
};

export type OpenGraphData = {
  title: string;
  description: string;
  image: string;
  url: string;
};

export type Headings = {
  h1: string[];
  h2: string[];
};

export type ContentSignals = {
  introParagraph: string;
  paragraphCount: number;
  listCount: number;
  questionHeadingCount: number;
  hasTimeElement: boolean;
  hasAuthorLikeText: boolean;
  externalLinkCount: number;
  internalLinkCount: number;
  genericInternalLinkCount: number;
};

export type PageAnalysisResult = {
  url: string;
  title: string;
  description: string;
  canonical: string;
  hasCanonicalTag: boolean;
  lang: string;
  openGraph: OpenGraphData;
  headings: Headings;
  contentSignals: ContentSignals;
  jsonLd: string[];
  breadcrumbs: BreadcrumbItem[];
};

export type SchemaName =
  | "WebPage"
  | "BreadcrumbList"
  | "Organization"
  | "WebSite"
  | "Article";

export type SchemaRecommendation = {
  schema: SchemaName;
  reason: string;
};

export type ExtensionSettings = {
  organizationName: string;
  organizationUrl: string;
  organizationLogo: string;
  sameAs: string[];
  websiteName: string;
  websiteUrl: string;
  defaultLanguage: string;
};

export const defaultExtensionSettings: ExtensionSettings = {
  organizationName: "",
  organizationUrl: "",
  organizationLogo: "",
  sameAs: [],
  websiteName: "",
  websiteUrl: "",
  defaultLanguage: ""
};

export type RequestPageAnalysisMessage = {
  type: "REQUEST_PAGE_ANALYSIS";
};

export type PageAnalysisResultMessage = {
  type: "PAGE_ANALYSIS_RESULT";
  payload: PageAnalysisResult;
};

export type ExtensionMessage =
  | RequestPageAnalysisMessage
  | PageAnalysisResultMessage;
