import type { CSSProperties } from "react";
import { createTranslator } from "../../shared/i18n";
import type { GeoScoreReasonCode } from "../../shared/geo-score";
import type { PageAnalysisResult, UiLanguage } from "../../shared/types";

const sectionStyle: CSSProperties = {
  background: "#ffffff",
  border: "1px solid #d1d5db",
  borderRadius: 8,
  padding: 12
};

const labelStyle: CSSProperties = {
  fontSize: 12,
  textTransform: "uppercase",
  color: "#6b7280",
  marginBottom: 4
};

const valueStyle: CSSProperties = {
  marginTop: 0,
  marginBottom: 12,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word"
};

function renderList(items: string[]): string {
  return items.length > 0 ? items.join("\n") : "-";
}

export function PageOverviewSection({
  pageData,
  language,
  activeScoreReason
}: {
  pageData: PageAnalysisResult;
  language: UiLanguage;
  activeScoreReason: GeoScoreReasonCode | null;
}) {
  const t = createTranslator(language);
  const highlightH2 = activeScoreReason === "MISSING_H2";

  return (
    <section id="page-overview-section" style={sectionStyle}>
      <h2 style={{ marginTop: 0 }}>{t("pageOverview")}</h2>

      <div style={labelStyle}>{t("url")}</div>
      <p style={valueStyle}>{pageData.url}</p>

      <div style={labelStyle}>{t("title")}</div>
      <p style={valueStyle}>{pageData.title || "-"}</p>

      <div style={labelStyle}>{t("description")}</div>
      <p style={valueStyle}>{pageData.description || "-"}</p>

      <div style={labelStyle}>{t("canonicalUrl")}</div>
      <p style={valueStyle}>{pageData.canonical || "-"}</p>

      <div style={labelStyle}>{t("language")}</div>
      <p style={valueStyle}>{pageData.lang || "-"}</p>

      <div style={labelStyle}>{t("openGraphTitle")}</div>
      <p style={valueStyle}>{pageData.openGraph.title || "-"}</p>

      <div style={labelStyle}>{t("openGraphDescription")}</div>
      <p style={valueStyle}>{pageData.openGraph.description || "-"}</p>

      <div style={labelStyle}>{t("openGraphImage")}</div>
      <p style={valueStyle}>{pageData.openGraph.image || "-"}</p>

      <div style={labelStyle}>{t("openGraphUrl")}</div>
      <p style={valueStyle}>{pageData.openGraph.url || "-"}</p>

      <div style={labelStyle}>{t("headingH1")}</div>
      <p style={valueStyle}>{renderList(pageData.headings.h1)}</p>

      <div
        style={{
          ...labelStyle,
          background: highlightH2 ? "#fef3c7" : "transparent",
          display: "inline-block",
          borderRadius: highlightH2 ? 4 : 0,
          padding: highlightH2 ? "2px 6px" : 0
        }}
      >
        {t("headingH2")}
      </div>
      <p
        style={{
          ...valueStyle,
          background: highlightH2 ? "#fffbeb" : "transparent",
          borderRadius: highlightH2 ? 6 : 0,
          padding: highlightH2 ? "6px 8px" : 0
        }}
      >
        {renderList(pageData.headings.h2)}
      </p>

      <div style={labelStyle}>{t("existingJsonLd")}</div>
      <p style={{ ...valueStyle, marginBottom: 0 }}>
        {t("detectedCount", { count: pageData.jsonLd.length })}
      </p>
    </section>
  );
}
