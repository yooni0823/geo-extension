import { useEffect, useState } from "react";
import { getGeoRecommendations } from "../shared/geo-recommendations";
import { getGeoScore, type GeoScoreReasonCode } from "../shared/geo-score";
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
import { GeoScoreSection } from "./components/GeoScoreSection";
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

const topBarStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
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
  const [activeScoreReason, setActiveScoreReason] = useState<GeoScoreReasonCode | null>(null);

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
  const geoScore = pageData
    ? getGeoScore(
        pageData,
        issues,
        geoRecommendations,
        recommendations,
        existingJsonLdBlocks
      )
    : null;
  const t = createTranslator(settings.uiLanguage);
  const settingsSummary = summarizeSettings(settings, settings.uiLanguage);

  async function handleLanguageChange(language: UiLanguage) {
    const nextSettings = { ...settings, uiLanguage: language };
    setSettings(nextSettings);
    await saveExtensionSettings(nextSettings);
  }

  function handleScoreReasonSelect(reason: GeoScoreReasonCode, sectionId: string) {
    setActiveScoreReason(reason);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  useEffect(() => {
    if (!activeScoreReason) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setActiveScoreReason(null);
    }, 2600);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [activeScoreReason]);

  return (
    <main style={containerStyle}>
      <div style={stackStyle}>
        <div style={topBarStyle}>
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

        <section style={cardStyle}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 10
            }}
          >
            <h1 style={{ margin: 0, fontSize: 18, lineHeight: 1.2 }}>GEO Inspector</h1>
          </div>
          <h2 style={{ marginBottom: 0, marginTop: 0, fontSize: 16 }}>{t("siteWideDefaults")}</h2>
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
            {geoScore ? (
              <GeoScoreSection
                score={geoScore}
                language={settings.uiLanguage}
                onReasonSelect={handleScoreReasonSelect}
              />
            ) : null}
            <PageOverviewSection
              pageData={pageData}
              language={settings.uiLanguage}
              activeScoreReason={activeScoreReason}
            />
            <IssuesSection
              issues={issues}
              language={settings.uiLanguage}
              activeScoreReason={activeScoreReason}
            />
            <GeoRecommendationsSection
              recommendations={geoRecommendations}
              language={settings.uiLanguage}
              activeScoreReason={activeScoreReason}
            />
            <RecommendationsSection
              recommendations={recommendations}
              language={settings.uiLanguage}
              activeScoreReason={activeScoreReason}
            />
            <ExistingJsonLdSection
              blocks={existingJsonLdBlocks}
              language={settings.uiLanguage}
              activeScoreReason={activeScoreReason}
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
