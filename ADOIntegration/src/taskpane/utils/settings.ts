import { AddinSettings } from "../types/settings";

export function loadSettings(): AddinSettings | null {
  const roaming = Office.context.roamingSettings;
  const orgUrl = roaming.get("orgUrl") as string | undefined;
  const project = roaming.get("project") as string | undefined;
  const authMethod = roaming.get("authMethod") as "entra" | "pat" | undefined;
  const pat = roaming.get("pat") as string | undefined;

  if (orgUrl && project && authMethod) {
    return { orgUrl, project, authMethod, pat };
  }
  return null;
}

export function saveSettings(settings: AddinSettings): Promise<void> {
  const roaming = Office.context.roamingSettings;
  roaming.set("orgUrl", settings.orgUrl);
  roaming.set("project", settings.project);
  roaming.set("authMethod", settings.authMethod);
  if (settings.pat) {
    roaming.set("pat", settings.pat);
  } else {
    roaming.remove("pat");
  }

  return new Promise((resolve, reject) => {
    roaming.saveAsync((result) => {
      if (result.status === Office.AsyncResultStatus.Succeeded) {
        resolve();
      } else {
        reject(new Error(result.error?.message ?? "Failed to save settings"));
      }
    });
  });
}

export function clearSettings(): Promise<void> {
  const roaming = Office.context.roamingSettings;
  roaming.remove("orgUrl");
  roaming.remove("project");
  roaming.remove("authMethod");
  roaming.remove("pat");

  return new Promise((resolve, reject) => {
    roaming.saveAsync((result) => {
      if (result.status === Office.AsyncResultStatus.Succeeded) {
        resolve();
      } else {
        reject(new Error(result.error?.message ?? "Failed to clear settings"));
      }
    });
  });
}
