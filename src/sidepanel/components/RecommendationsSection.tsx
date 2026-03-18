import type { CSSProperties } from "react";
import type { SchemaRecommendation } from "../../shared/types";

const sectionStyle: CSSProperties = {
  background: "#ffffff",
  border: "1px solid #d1d5db",
  borderRadius: 8,
  padding: 12
};

export function RecommendationsSection({
  recommendations
}: {
  recommendations: SchemaRecommendation[];
}) {
  return (
    <section style={sectionStyle}>
      <h2 style={{ marginTop: 0 }}>Schema Recommendations</h2>

      {recommendations.length === 0 ? (
        <p style={{ margin: 0 }}>No schema recommendations are available for this page yet.</p>
      ) : null}

      {recommendations.map((recommendation) => (
        <div key={recommendation.schema} style={{ marginBottom: 12 }}>
          <strong>{recommendation.schema}</strong>
          <p style={{ margin: "4px 0 0" }}>{recommendation.reason}</p>
        </div>
      ))}
    </section>
  );
}
