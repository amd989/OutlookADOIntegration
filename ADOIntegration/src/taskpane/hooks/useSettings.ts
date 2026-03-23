import { useState, useEffect, useCallback } from "react";
import type { AddinSettings } from "../types/settings";
import { loadSettings, saveSettings, clearSettings } from "../utils/settings";

interface UseSettingsReturn {
  settings: AddinSettings | null;
  isLoaded: boolean;
  updateSettings: (settings: AddinSettings) => Promise<void>;
  resetSettings: () => Promise<void>;
}

export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<AddinSettings | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = loadSettings();
    setSettings(stored);
    setIsLoaded(true);
  }, []);

  const updateSettings = useCallback(async (newSettings: AddinSettings) => {
    await saveSettings(newSettings);
    setSettings(newSettings);
  }, []);

  const resetSettings = useCallback(async () => {
    await clearSettings();
    setSettings(null);
  }, []);

  return { settings, isLoaded, updateSettings, resetSettings };
}
