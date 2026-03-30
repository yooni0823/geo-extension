import type { CSSProperties } from "react";
import { createTranslator } from "../../shared/i18n";
import type { GeoScoreReasonCode } from "../../shared/geo-score";
import type { SchemaRecommendation, UiLanguage } from "../../shared/types";

const sectionStyle: CSSProperties = {
  background: "#ffffff",
  border: "1px solid #d1d5db",
  borderRadius: 8,
  padding: 12
};

export function RecommendationsSection({
  recommendations,
  language,
  activeScoreReason
}: {
  recommendations: SchemaRecommendation[];
  language: UiLanguage;
  activeScoreReason: GeoScoreReasonCode | null;
}) {
  const t = createTranslator(language);

  return (
    <section id="schema-recommendations-section" style={sectionStyle}>
      <h2 style={{ marginTop: 0 }}>{t("schemaRecommendations")}</h2>

      {recommendations.length === 0 ? (
        <p style={{ margin: 0 }}>{t("noSchemaRecommendations")}</p>
      ) : null}

      {recommendations.map((recommendation) => (
        <div
          key={recommendation.schema}
          style={{
            marginBottom: 12,
            background: activeScoreReason === "JSON_LD_SCHEMA_TYPE_MISSING" ? "#fffbeb" : "transparent",
            borderRadius: activeScoreReason === "JSON_LD_SCHEMA_TYPE_MISSING" ? 6 : 0,
            padding: activeScoreReason === "JSON_LD_SCHEMA_TYPE_MISSING" ? 8 : 0
          }}
        >
          <strong>{t.schema[recommendation.schema].title}</strong>
          <p style={{ margin: "4px 0 0" }}>{t.schema[recommendation.schema].reason}</p>
        </div>
      ))}
    </section>
  );
}
