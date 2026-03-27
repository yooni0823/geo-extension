import { useEffect, useState } from "react";
import React from "react";
import ReactDOM from "react-dom/client";
import { createTranslator } from "../shared/i18n";
import { LanguageToggle } from "../shared/LanguageToggle";
import {
  loadExtensionSettings,
  resetExtensionSettings,
  saveExtensionSettings
} from "../shared/settings";
import {
  defaultExtensionSettings,
  type ExtensionSettings,
  type UiLanguage
} from "../shared/types";

const pageStyle: React.CSSProperties = {
  margin: "0 auto",
  maxWidth: 720,
  padding: 24,
  fontFamily: "system-ui, sans-serif",
  color: "#111827"
};

const formStyle: React.CSSProperties = {
  display: "grid",
  gap: 16
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  marginTop: 6,
  padding: 10,
  borderRadius: 8,
  border: "1px solid #d1d5db",
  boxSizing: "border-box"
};

const actionRowStyle: React.CSSProperties = {
  display: "flex",
  gap: 12,
  alignItems: "center",
  flexWrap: "wrap"
};

function OptionsApp() {
  const [formState, setFormState] = useState<ExtensionSettings>(defaultExtensionSettings);
  const [status, setStatus] = useState("");
  const t = createTranslator(formState.uiLanguage);

  useEffect(() => {
    async function loadSettings() {
      const stored = await loadExtensionSettings();
      setFormState(stored);
    }

    void loadSettings();
  }, []);

  useEffect(() => {
    const translate = createTranslator(formState.uiLanguage);
    document.title = translate("optionsTitle");
    document.documentElement.lang = formState.uiLanguage;
  }, [formState.uiLanguage]);

  function updateField<Key extends keyof ExtensionSettings>(
    key: Key,
    value: ExtensionSettings[Key]
  ) {
    setFormState((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await saveExtensionSettings(formState);
    setStatus(t("settingsSaved"));
  }

  async function handleReset() {
    const resetState = await resetExtensionSettings();
    setFormState(resetState);
    setStatus(createTranslator(resetState.uiLanguage)("settingsReset"));
  }

  async function handleLanguageChange(language: UiLanguage) {
    const nextState = { ...formState, uiLanguage: language };
    setFormState(nextState);
    setStatus("");
    await saveExtensionSettings(nextState);
  }

  return (
    <main style={pageStyle}>
      <div style={{ display: "grid", gap: 12, marginBottom: 16 }}>
        <LanguageToggle language={formState.uiLanguage} onChange={handleLanguageChange} />
        <div>
          <h1>{t("optionsTitle")}</h1>
          <p>{t("optionsDescription")}</p>
        </div>
      </div>

      <form style={formStyle} onSubmit={handleSubmit}>
        <label>
          {t("organizationName")}
          <input
            style={inputStyle}
            value={formState.organizationName}
            onChange={(event) => updateField("organizationName", event.target.value)}
          />
        </label>

        <label>
          {t("organizationUrl")}
          <input
            style={inputStyle}
            value={formState.organizationUrl}
            onChange={(event) => updateField("organizationUrl", event.target.value)}
          />
        </label>

        <label>
          {t("organizationLogo")}
          <input
            style={inputStyle}
            value={formState.organizationLogo}
            onChange={(event) => updateField("organizationLogo", event.target.value)}
          />
        </label>

        <label>
          {t("sameAs")}
          <textarea
            style={{ ...inputStyle, minHeight: 88, resize: "vertical" }}
            value={formState.sameAs.join(", ")}
            onChange={(event) =>
              updateField(
                "sameAs",
                event.target.value
                  .split(",")
                  .map((entry) => entry.trim())
                  .filter(Boolean)
              )
            }
          />
        </label>

        <label>
          {t("websiteName")}
          <input
            style={inputStyle}
            value={formState.websiteName}
            onChange={(event) => updateField("websiteName", event.target.value)}
          />
        </label>

        <label>
          {t("websiteUrl")}
          <input
            style={inputStyle}
            value={formState.websiteUrl}
            onChange={(event) => updateField("websiteUrl", event.target.value)}
          />
        </label>

        <label>
          {t("defaultLanguage")}
          <input
            style={inputStyle}
            value={formState.defaultLanguage}
            onChange={(event) => updateField("defaultLanguage", event.target.value)}
          />
        </label>

        <div style={actionRowStyle}>
          <button
            type="submit"
            style={{
              width: "fit-content",
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid #111827",
              background: "#111827",
              color: "#ffffff",
              cursor: "pointer"
            }}
          >
            {t("saveSettings")}
          </button>

          <button
            type="button"
            onClick={() => {
              void handleReset();
            }}
            style={{
              width: "fit-content",
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid #d1d5db",
              background: "#ffffff",
              color: "#111827",
              cursor: "pointer"
            }}
          >
            {t("reset")}
          </button>
        </div>
      </form>

      {status ? <p>{status}</p> : null}
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <OptionsApp />
  </React.StrictMode>
);
