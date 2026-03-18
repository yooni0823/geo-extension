import { useEffect, useState } from "react";
import { analyzeJsonLdBlocks } from "../shared/jsonld";
import { loadExtensionSettings } from "../shared/settings";
import type {
  Issue,
  ExtensionSettings,
  JsonLdBlockAnalysis,
  PageAnalysisResult,
  PageAnalysisResultMessage,
  SchemaRecommendation
} from "../shared/types";
import { ExistingJsonLdSection } from "./components/ExistingJsonLdSection";
import { generateSchemaDrafts, recommendSchemas } from "../shared/schema-generator";
import { validatePageAnalysis } from "../shared/validators";
import { GeneratedJsonLdSection } from "./components/GeneratedJsonLdSection";
import { IssuesSection } from "./components/IssuesSection";
import { PageOverviewSection } from "./components/PageOverviewSection";
import { RecommendationsSection } from "./components/RecommendationsSection";

const containerStyle: React.CSSProperties = {
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  padding: 16,
  color: "#111827",
  background: "#f6f7f9",
  minHeight: "100vh"
};

const stackStyle: React.CSSProperties = {
  display: "grid",
  gap: 12
};

const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #d1d5db",
  borderRadius: 8,
  padding: 12
};

const mutedStyle: React.CSSProperties = {
  color: "#6b7280",
  margin: 0
};

const summaryListStyle: React.CSSProperties = {
  margin: "8px 0 0",
  paddingLeft: 18
};

const headerActionStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 12
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 6,
  border: "1px solid #d1d5db",
  background: "#ffffff",
  color: "#111827",
  cursor: "pointer",
  whiteSpace: "nowrap"
};

function summarizeSettings(settings: ExtensionSettings): string[] {
  const summary: string[] = [];

  if (settings.organizationName || settings.organizationUrl) {
    summary.push(
      `Organization: ${settings.organizationName || "-"}${settings.organizationUrl ? ` (${settings.organizationUrl})` : ""}`
    );
  }

  if (settings.websiteName || settings.websiteUrl) {
    summary.push(
      `WebSite: ${settings.websiteName || "-"}${settings.websiteUrl ? ` (${settings.websiteUrl})` : ""}`
    );
  }

  if (settings.organizationLogo) {
    summary.push(`Organization logo: ${settings.organizationLogo}`);
  }

  if (settings.sameAs.length > 0) {
    summary.push(`sameAs: ${settings.sameAs.join(", ")}`);
  }

  if (settings.defaultLanguage) {
    summary.push(`Default language: ${settings.defaultLanguage}`);
  }

  return summary;
}

async function getActiveTabId(): Promise<number | undefined> {
  const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  return tabs[0]?.id;
}

export function App() {
  const [pageData, setPageData] = useState<PageAnalysisResult | null>(null);
  const [settings, setSettings] = useState<ExtensionSettings>({
    organizationName: "",
    organizationUrl: "",
    organizationLogo: "",
    sameAs: [],
    websiteName: "",
    websiteUrl: "",
    defaultLanguage: ""
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let isMounted = true;

    async function loadPageAnalysis() {
      try {
        const [tabId, loadedSettings] = await Promise.all([
          getActiveTabId(),
          loadExtensionSettings()
        ]);

        if (!tabId) {
          throw new Error("No active tab was found.");
        }

        const response = (await chrome.tabs.sendMessage(tabId, {
          type: "REQUEST_PAGE_ANALYSIS"
        })) as PageAnalysisResultMessage | undefined;

        if (!response || response.type !== "PAGE_ANALYSIS_RESULT") {
          throw new Error("The content script did not return page analysis data.");
        }

        if (!isMounted) {
          return;
        }

        setSettings(loadedSettings);
        setPageData(response.payload);
      } catch (caughtError) {
        if (!isMounted) {
          return;
        }

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Failed to analyze the current page."
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadPageAnalysis();

    return () => {
      isMounted = false;
    };
  }, []);

  const issues: Issue[] = pageData ? validatePageAnalysis(pageData) : [];
  const recommendations: SchemaRecommendation[] = pageData
    ? recommendSchemas(pageData, settings)
    : [];
  const existingJsonLdBlocks: JsonLdBlockAnalysis[] = pageData
    ? analyzeJsonLdBlocks(pageData.jsonLd)
    : [];
  const generatedSchema = pageData ? generateSchemaDrafts(pageData, settings) : null;
  const settingsSummary = summarizeSettings(settings);

  return (
    <main style={containerStyle}>
      <div style={stackStyle}>
        <section style={cardStyle}>
          <div style={headerActionStyle}>
            <div>
              <h1 style={{ marginTop: 0 }}>GEO / AEO Inspector</h1>
              <p style={mutedStyle}>
                Analyze page metadata, validation issues, and draft JSON-LD from the active tab.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                void chrome.runtime.openOptionsPage();
              }}
              style={secondaryButtonStyle}
            >
              Open Settings
            </button>
          </div>
          <h2 style={{ marginBottom: 0, marginTop: 12, fontSize: 16 }}>Site-Wide Defaults</h2>
          {settingsSummary.length === 0 ? (
            <p style={{ ...mutedStyle, marginTop: 8 }}>
              No site-wide defaults are saved. Use the options page to add Organization and WebSite settings.
            </p>
          ) : (
            <ul style={summaryListStyle}>
              {settingsSummary.map((item) => (
                <li key={item} style={{ marginTop: 6 }}>
                  {item}
                </li>
              ))}
            </ul>
          )}
        </section>

        {loading ? (
          <section style={cardStyle}>
            <p style={{ margin: 0 }}>Analyzing the current page...</p>
          </section>
        ) : null}

        {error ? (
          <section style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>Analysis Error</h2>
            <p style={{ marginBottom: 0 }}>{error}</p>
          </section>
        ) : null}

        {pageData ? (
          <>
            <PageOverviewSection pageData={pageData} />
            <ExistingJsonLdSection blocks={existingJsonLdBlocks} />
            <IssuesSection issues={issues} />
            <RecommendationsSection recommendations={recommendations} />
            <GeneratedJsonLdSection
              existingJsonLdCount={pageData.jsonLd.length}
              generatedSchema={generatedSchema}
            />
          </>
        ) : null}
      </div>
    </main>
  );
}
