import type { CSSProperties } from "react";
import { createTranslator } from "../../shared/i18n";
import type { UiLanguage } from "../../shared/types";

const sectionStyle: CSSProperties = {
  background: "#ffffff",
  border: "1px solid #d1d5db",
  borderRadius: 8,
  padding: 12
};

const preStyle: CSSProperties = {
  margin: 0,
  padding: 12,
  borderRadius: 6,
  background: "#111827",
  color: "#f9fafb",
  overflowX: "auto",
  fontSize: 12
};

async function copyToClipboard(value: string) {
  await navigator.clipboard.writeText(value);
}

export function GeneratedJsonLdSection({
  existingJsonLdCount,
  generatedSchema,
  language
}: {
  existingJsonLdCount: number;
  generatedSchema: Record<string, unknown> | null;
  language: UiLanguage;
}) {
  const t = createTranslator(language);

  if (existingJsonLdCount > 0) {
    return (
      <section style={sectionStyle}>
        <h2 style={{ marginTop: 0 }}>{t("generatedJsonLd")}</h2>
        <p style={{ margin: 0 }}>
          {t("generatedJsonLdBlocked", { count: existingJsonLdCount })}
        </p>
      </section>
    );
  }

  if (!generatedSchema) {
    return (
      <section style={sectionStyle}>
        <h2 style={{ marginTop: 0 }}>{t("generatedJsonLd")}</h2>
        <p style={{ margin: 0 }}>{t("generatedJsonLdUnavailable")}</p>
      </section>
    );
  }

  const formattedJson = JSON.stringify(generatedSchema, null, 2);

  return (
    <section style={sectionStyle}>
      <h2 style={{ marginTop: 0 }}>{t("generatedJsonLd")}</h2>
      <p>{t("generatedJsonLdDescription")}</p>
      <button
        type="button"
        onClick={() => {
          void copyToClipboard(formattedJson);
        }}
        style={{
          marginBottom: 12,
          padding: "8px 12px",
          borderRadius: 6,
          border: "1px solid #111827",
          background: "#111827",
          color: "#ffffff",
          cursor: "pointer"
        }}
      >
        {t("copyJsonLd")}
      </button>
      <pre style={preStyle}>{formattedJson}</pre>
    </section>
  );
}
