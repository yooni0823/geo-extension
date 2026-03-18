import {
  defaultExtensionSettings,
  type ExtensionSettings
} from "./types";

function normalizeSameAs(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return [];
}

export function normalizeExtensionSettings(
  value: Partial<ExtensionSettings> | Record<string, unknown>
): ExtensionSettings {
  return {
    organizationName:
      typeof value.organizationName === "string" ? value.organizationName : "",
    organizationUrl:
      typeof value.organizationUrl === "string" ? value.organizationUrl : "",
    organizationLogo:
      typeof value.organizationLogo === "string" ? value.organizationLogo : "",
    sameAs: normalizeSameAs(value.sameAs),
    websiteName: typeof value.websiteName === "string" ? value.websiteName : "",
    websiteUrl: typeof value.websiteUrl === "string" ? value.websiteUrl : "",
    defaultLanguage:
      typeof value.defaultLanguage === "string" ? value.defaultLanguage : ""
  };
}

export async function loadExtensionSettings(): Promise<ExtensionSettings> {
  const stored = await chrome.storage.local.get(defaultExtensionSettings);
  return normalizeExtensionSettings(stored);
}

export async function saveExtensionSettings(
  settings: ExtensionSettings
): Promise<void> {
  await chrome.storage.local.set(settings);
}

export async function resetExtensionSettings(): Promise<ExtensionSettings> {
  await chrome.storage.local.set(defaultExtensionSettings);
  return defaultExtensionSettings;
}
