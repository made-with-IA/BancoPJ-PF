import { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/services/api";
import type { Settings } from "@/types";
import { translations, type Translations, type Lang } from "@/i18n/translations";

interface SettingsContextValue {
  settings: Settings | null;
  t: Translations;
  isLoading: boolean;
  refresh: () => void;
}

const SettingsContext = createContext<SettingsContextValue>({
  settings: null,
  t: translations.pt,
  isLoading: true,
  refresh: () => {},
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function loadSettings() {
    try {
      const s = await api.settings.get();
      setSettings(s);
    } catch {
      // fallback to defaults
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  const lang: Lang = (settings?.language as Lang) ?? "pt";
  const t: Translations = translations[lang] ?? translations.pt;

  return (
    <SettingsContext.Provider value={{ settings, t, isLoading, refresh: loadSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
