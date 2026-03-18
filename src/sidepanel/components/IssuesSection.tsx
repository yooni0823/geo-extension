import type { CSSProperties } from "react";
import type { Issue } from "../../shared/types";

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

export function IssuesSection({ issues }: { issues: Issue[] }) {
  return (
    <section style={sectionStyle}>
      <h2 style={{ marginTop: 0 }}>Issues</h2>

      {issues.length === 0 ? <p style={{ margin: 0 }}>No issues detected.</p> : null}

      {issues.map((issue, index) => (
        <p
          key={`${issue.code}-${index}`}
          style={{
            margin: "0 0 8px",
            color: severityColorMap[issue.severity]
          }}
        >
          [{issue.severity}] {issue.message}
        </p>
      ))}
    </section>
  );
}
