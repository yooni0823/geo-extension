import { useEffect, useState } from "react";
import { getGeoRecommendations } from "../shared/geo-recommendations";
import { createTranslator } from "../shared/i18n";
import { analyzeJsonLdBlocks } from "../shared/jsonld";
import { LanguageToggle } from "../shared/LanguageToggle";
import { loadExtensionSettings, saveExtensionSettings } from "../shared/settings";
import type {
  Issue,
  ExtensionSettings,
  JsonLdBlockAnalysis,
  PageAnalysisResult,
  PageAnalysisResultMessage,
  SchemaRecommendation,
  UiLanguage
} from "../shared/types";
import { ExistingJsonLdSection } from "./components/ExistingJsonLdSection";
import { generateSchemaDrafts, recommendSchemas } from "../shared/schema-generator";
import { validatePageAnalysis } from "../shared/validators";
import { GeoRecommendationsSection } from "./components/GeoRecommendationsSection";
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

function summarizeSettings(
  settings: ExtensionSettings,
  language: UiLanguage
): string[] {
  const t = createTranslator(language);
  const summary: string[] = [];

  if (settings.organizationName || settings.organizationUrl) {
    summary.push(
      t("organizationSummary", {
        name: settings.organizationName || "-",
        url: settings.organizationUrl ? ` (${settings.organizationUrl})` : ""
      })
    );
  }

  if (settings.websiteName || settings.websiteUrl) {
    summary.push(
      t("websiteSummary", {
        name: settings.websiteName || "-",
        url: settings.websiteUrl ? ` (${settings.websiteUrl})` : ""
      })
    );
  }

  if (settings.organizationLogo) {
    summary.push(t("organizationLogoSummary", { value: settings.organizationLogo }));
  }

  if (settings.sameAs.length > 0) {
    summary.push(t("sameAsSummary", { value: settings.sameAs.join(", ") }));
  }

  if (settings.defaultLanguage) {
    summary.push(t("defaultLanguageSummary", { value: settings.defaultLanguage }));
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
    defaultLanguage: "",
    uiLanguage: "en"
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
          throw new Error(createTranslator(loadedSettings.uiLanguage)("errorNoActiveTab"));
        }

        const response = (await chrome.tabs.sendMessage(tabId, {
          type: "REQUEST_PAGE_ANALYSIS"
        })) as PageAnalysisResultMessage | undefined;

        if (!response || response.type !== "PAGE_ANALYSIS_RESULT") {
          throw new Error(
            createTranslator(loadedSettings.uiLanguage)("errorContentScriptMissing")
          );
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
            : createTranslator(settings.uiLanguage)("errorAnalyzeFailed")
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
  const geoRecommendations = pageData ? getGeoRecommendations(pageData) : [];
  const recommendations: SchemaRecommendation[] = pageData
    ? recommendSchemas(pageData, settings)
    : [];
  const existingJsonLdBlocks: JsonLdBlockAnalysis[] = pageData
    ? analyzeJsonLdBlocks(pageData.jsonLd)
    : [];
  const generatedSchema = pageData ? generateSchemaDrafts(pageData, settings) : null;
  const t = createTranslator(settings.uiLanguage);
  const settingsSummary = summarizeSettings(settings, settings.uiLanguage);

  async function handleLanguageChange(language: UiLanguage) {
    const nextSettings = { ...settings, uiLanguage: language };
    setSettings(nextSettings);
    await saveExtensionSettings(nextSettings);
  }

  return (
    <main style={containerStyle}>
      <div style={stackStyle}>
        <section style={cardStyle}>
          <div style={headerActionStyle}>
            <div>
              <h1 style={{ marginTop: 0 }}>GEO / AEO Inspector</h1>
              <p style={mutedStyle}>{t("appDescription")}</p>
            </div>
            <div style={{ display: "grid", gap: 8, justifyItems: "end" }}>
              <LanguageToggle language={settings.uiLanguage} onChange={handleLanguageChange} />
              <button
                type="button"
                onClick={() => {
                  void chrome.runtime.openOptionsPage();
                }}
                style={secondaryButtonStyle}
              >
                {t("openSettings")}
              </button>
            </div>
          </div>
          <h2 style={{ marginBottom: 0, marginTop: 12, fontSize: 16 }}>{t("siteWideDefaults")}</h2>
          {settingsSummary.length === 0 ? (
            <p style={{ ...mutedStyle, marginTop: 8 }}>{t("noSiteWideDefaults")}</p>
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
            <p style={{ margin: 0 }}>{t("analyzingCurrentPage")}</p>
          </section>
        ) : null}

        {error ? (
          <section style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>{t("analysisError")}</h2>
            <p style={{ marginBottom: 0 }}>{error}</p>
          </section>
        ) : null}

        {pageData ? (
          <>
            <PageOverviewSection pageData={pageData} language={settings.uiLanguage} />
            <IssuesSection issues={issues} language={settings.uiLanguage} />
            <GeoRecommendationsSection
              recommendations={geoRecommendations}
              language={settings.uiLanguage}
            />
            <RecommendationsSection
              recommendations={recommendations}
              language={settings.uiLanguage}
            />
            <ExistingJsonLdSection
              blocks={existingJsonLdBlocks}
              language={settings.uiLanguage}
            />
            <GeneratedJsonLdSection
              existingJsonLdCount={pageData.jsonLd.length}
              generatedSchema={generatedSchema}
              language={settings.uiLanguage}
            />
          </>
        ) : null}
      </div>
    </main>
  );
}
