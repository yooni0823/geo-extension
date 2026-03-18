import type { CSSProperties } from "react";

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
  generatedSchema
}: {
  existingJsonLdCount: number;
  generatedSchema: Record<string, unknown> | null;
}) {
  if (existingJsonLdCount > 0) {
    return (
      <section style={sectionStyle}>
        <h2 style={{ marginTop: 0 }}>Generated JSON-LD</h2>
        <p style={{ margin: 0 }}>
          Existing JSON-LD detected on this page. {existingJsonLdCount} block(s) found.
        </p>
      </section>
    );
  }

  if (!generatedSchema) {
    return (
      <section style={sectionStyle}>
        <h2 style={{ marginTop: 0 }}>Generated JSON-LD</h2>
        <p style={{ margin: 0 }}>No JSON-LD draft is available for this page.</p>
      </section>
    );
  }

  const formattedJson = JSON.stringify(generatedSchema, null, 2);

  return (
    <section style={sectionStyle}>
      <h2 style={{ marginTop: 0 }}>Generated JSON-LD</h2>
      <p>WebPage draft JSON-LD is shown below for review before publishing.</p>
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
        Copy JSON-LD
      </button>
      <pre style={preStyle}>{formattedJson}</pre>
    </section>
  );
}
