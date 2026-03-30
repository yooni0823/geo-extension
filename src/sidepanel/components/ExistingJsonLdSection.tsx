import type { CSSProperties } from "react";
import { createTranslator } from "../../shared/i18n";
import type { GeoScoreReasonCode } from "../../shared/geo-score";
import type { JsonLdBlockAnalysis, UiLanguage } from "../../shared/types";

const sectionStyle: CSSProperties = {
  background: "#ffffff",
  border: "1px solid #d1d5db",
  borderRadius: 8,
  padding: 12
};

const blockStyle: CSSProperties = {
  border: "1px solid #d1d5db",
  borderRadius: 6,
  marginBottom: 12
};

const labelStyle: CSSProperties = {
  fontSize: 12,
  textTransform: "uppercase",
  color: "#6b7280",
  marginBottom: 6
};

const preStyle: CSSProperties = {
  margin: 0,
  padding: 12,
  borderRadius: 6,
  background: "#111827",
  color: "#f9fafb",
  overflowX: "auto",
  fontSize: 12,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word"
};

const summaryStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  padding: 12,
  cursor: "pointer",
  listStyle: "none"
};

const headerMetaStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  alignItems: "center",
  marginTop: 6
};

const badgeBaseStyle: CSSProperties = {
  display: "inline-block",
  padding: "2px 8px",
  borderRadius: 999,
  fontSize: 12,
  border: "1px solid transparent"
};

const blockBodyStyle: CSSProperties = {
  padding: "0 12px 12px"
};

async function copyToClipboard(value: string) {
  await navigator.clipboard.writeText(value);
}

export function ExistingJsonLdSection({
  blocks,
  language,
  activeScoreReason
}: {
  blocks: JsonLdBlockAnalysis[];
  language: UiLanguage;
  activeScoreReason: GeoScoreReasonCode | null;
}) {
  const t = createTranslator(language);
  const highlightEmptyState = activeScoreReason === "NO_JSON_LD";

  return (
    <section
      id="existing-jsonld-section"
      style={{
        ...sectionStyle,
        background:
          highlightEmptyState || activeScoreReason === "JSON_LD_PARSE_FAILURE"
            ? "#fffbeb"
            : "#ffffff",
        borderColor:
          highlightEmptyState || activeScoreReason === "JSON_LD_PARSE_FAILURE"
            ? "#f59e0b"
            : "#d1d5db"
      }}
    >
      <h2 style={{ marginTop: 0 }}>{t("existingJsonLd")}</h2>

      {blocks.length === 0 ? <p style={{ margin: 0 }}>{t("existingJsonLdEmpty")}</p> : null}

      {blocks.map((block) => (
        <details
          key={block.index}
          style={{
            ...blockStyle,
            background:
              activeScoreReason === "JSON_LD_PARSE_FAILURE" && block.parseError
                ? "#fffbeb"
                : "#ffffff",
            borderColor:
              activeScoreReason === "JSON_LD_PARSE_FAILURE" && block.parseError
                ? "#f59e0b"
                : "#d1d5db"
          }}
        >
          <summary style={summaryStyle}>
            <div>
              <strong>{t("jsonLdBlock", { count: block.index + 1 })}</strong>
              <div style={headerMetaStyle}>
                <span
                  style={{
                    ...badgeBaseStyle,
                    background: block.parseError ? "#fef2f2" : "#ecfdf5",
                    borderColor: block.parseError ? "#fecaca" : "#a7f3d0",
                    color: block.parseError ? "#b91c1c" : "#047857"
                  }}
                >
                  {block.parseError ? t("parseFailed") : t("parseSuccess")}
                </span>

                {!block.parseError && block.schemaTypes.length > 0
                  ? block.schemaTypes.map((schemaType) => (
                      <span
                        key={`${block.index}-${schemaType}`}
                        style={{
                          ...badgeBaseStyle,
                          background: "#eff6ff",
                          borderColor: "#bfdbfe",
                          color: "#1d4ed8"
                        }}
                      >
                        {schemaType}
                      </span>
                    ))
                  : null}
              </div>
            </div>

            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                void copyToClipboard(block.raw);
              }}
              style={{
                height: "fit-content",
                padding: "8px 12px",
                borderRadius: 6,
                border: "1px solid #111827",
                background: "#111827",
                color: "#ffffff",
                cursor: "pointer"
              }}
            >
              {t("copyBlock")}
            </button>
          </summary>

          <div style={blockBodyStyle}>
            <div style={{ marginBottom: 12, color: block.parseError ? "#b91c1c" : "#111827" }}>
              {block.parseError
                ? `${t("parseFailed")}: ${block.parseError}`
                : t("schemaTypes", {
                    value:
                      block.schemaTypes.length > 0
                        ? block.schemaTypes.join(", ")
                        : t("unknown")
                  })}
            </div>

            <div>
              <div style={labelStyle}>{t("rawJsonLd")}</div>
              <pre style={preStyle}>{block.raw}</pre>
            </div>
          </div>
        </details>
      ))}
    </section>
  );
}
