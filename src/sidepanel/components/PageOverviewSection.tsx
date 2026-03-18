import type { CSSProperties } from "react";
import type { PageAnalysisResult } from "../../shared/types";

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

export function PageOverviewSection({ pageData }: { pageData: PageAnalysisResult }) {
  return (
    <section style={sectionStyle}>
      <h2 style={{ marginTop: 0 }}>Page Overview</h2>

      <div style={labelStyle}>URL</div>
      <p style={valueStyle}>{pageData.url}</p>

      <div style={labelStyle}>Title</div>
      <p style={valueStyle}>{pageData.title || "-"}</p>

      <div style={labelStyle}>Description</div>
      <p style={valueStyle}>{pageData.description || "-"}</p>

      <div style={labelStyle}>Canonical URL</div>
      <p style={valueStyle}>{pageData.canonical || "-"}</p>

      <div style={labelStyle}>Language</div>
      <p style={valueStyle}>{pageData.lang || "-"}</p>

      <div style={labelStyle}>Open Graph Title</div>
      <p style={valueStyle}>{pageData.openGraph.title || "-"}</p>

      <div style={labelStyle}>Open Graph Description</div>
      <p style={valueStyle}>{pageData.openGraph.description || "-"}</p>

      <div style={labelStyle}>Open Graph Image</div>
      <p style={valueStyle}>{pageData.openGraph.image || "-"}</p>

      <div style={labelStyle}>Open Graph URL</div>
      <p style={valueStyle}>{pageData.openGraph.url || "-"}</p>

      <div style={labelStyle}>H1</div>
      <p style={valueStyle}>{renderList(pageData.headings.h1)}</p>

      <div style={labelStyle}>H2</div>
      <p style={valueStyle}>{renderList(pageData.headings.h2)}</p>

      <div style={labelStyle}>Existing JSON-LD</div>
      <p style={{ ...valueStyle, marginBottom: 0 }}>{pageData.jsonLd.length} detected</p>
    </section>
  );
}
