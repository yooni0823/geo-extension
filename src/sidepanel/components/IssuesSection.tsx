import type { CSSProperties } from "react";
import { createTranslator, translateIssue, translateSeverity } from "../../shared/i18n";
import type { GeoScoreReasonCode } from "../../shared/geo-score";
import type { Issue, UiLanguage } from "../../shared/types";

const sectionStyle: CSSProperties = {
  background: "#ffffff",
  border: "1px solid #d1d5db",
  borderRadius: 8,
  padding: 12
};

const severityColorMap = {
  info: "#6b7280",
  warning: "#b45309",
  error: "#b91c1c"
} satisfies Record<Issue["severity"], string>;

export function IssuesSection({
  issues,
  language,
  activeScoreReason
}: {
  issues: Issue[];
  language: UiLanguage;
  activeScoreReason: GeoScoreReasonCode | null;
}) {
  const t = createTranslator(language);

  function shouldHighlight(issue: Issue): boolean {
    if (!activeScoreReason) {
      return false;
    }

    return issue.code === activeScoreReason || (
      activeScoreReason === "MISSING_OG_BASICS" &&
      (issue.code === "MISSING_OG_TITLE" || issue.code === "MISSING_OG_DESCRIPTION")
    );
  }

  return (
    <section id="issues-section" style={sectionStyle}>
      <h2 style={{ marginTop: 0 }}>{t("issues")}</h2>

      {issues.length === 0 ? <p style={{ margin: 0 }}>{t("noIssuesDetected")}</p> : null}

      {issues.map((issue, index) => (
        <p
          key={`${issue.code}-${index}`}
          style={{
            margin: "0 0 8px",
            color: severityColorMap[issue.severity],
            background: shouldHighlight(issue) ? "#fef3c7" : "transparent",
            borderRadius: shouldHighlight(issue) ? 6 : 0,
            padding: shouldHighlight(issue) ? "6px 8px" : 0
          }}
        >
          [{translateSeverity(language, issue.severity)}] {translateIssue(language, issue)}
        </p>
      ))}
    </section>
  );
}
