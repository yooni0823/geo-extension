import type { CSSProperties } from "react";
import { createTranslator } from "../../shared/i18n";
import type { SchemaRecommendation, UiLanguage } from "../../shared/types";

const sectionStyle: CSSProperties = {
  background: "#ffffff",
  border: "1px solid #d1d5db",
  borderRadius: 8,
  padding: 12
};

export function RecommendationsSection({
  recommendations,
  language
}: {
  recommendations: SchemaRecommendation[];
  language: UiLanguage;
}) {
  const t = createTranslator(language);

  return (
    <section style={sectionStyle}>
      <h2 style={{ marginTop: 0 }}>{t("schemaRecommendations")}</h2>

      {recommendations.length === 0 ? (
        <p style={{ margin: 0 }}>{t("noSchemaRecommendations")}</p>
      ) : null}

      {recommendations.map((recommendation) => (
        <div key={recommendation.schema} style={{ marginBottom: 12 }}>
          <strong>{t.schema[recommendation.schema].title}</strong>
          <p style={{ margin: "4px 0 0" }}>{t.schema[recommendation.schema].reason}</p>
        </div>
      ))}
    </section>
  );
}
