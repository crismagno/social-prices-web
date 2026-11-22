"use client";

import { useCallback, useEffect, useState } from "react";

import enTranslations from "../../../locales/en/en.json";
import ptBRTranslations from "../../../locales/ptBR/ptBR.json";

type TSiteLanguage = "ptBR" | "en";

const TRANSLATIONS: Record<TSiteLanguage, unknown> = {
  ptBR: ptBRTranslations,
  en: enTranslations,
};

// Same key the panel uses, so someone who chose a language keeps it here.
const LANGUAGE_STORAGE_KEY = "app-language";

const detectLanguage = (): TSiteLanguage => {
  try {
    const stored: string | null =
      window.localStorage.getItem(LANGUAGE_STORAGE_KEY);

    if (stored === "en" || stored === "ptBR") {
      return stored;
    }
  } catch {
    // No storage (private mode): fall through to the browser's language.
  }

  return window.navigator.language?.toLowerCase().startsWith("pt")
    ? "ptBR"
    : "en";
};

export type TSiteTranslate = (
  key: string,
  values?: Record<string, string | number>,
) => string;

/**
 * The fixed texts of the public site. A visitor never chose a language in the
 * panel, so it follows the browser; the server renders Portuguese, the
 * language of the stores, and the browser corrects it after loading.
 */
const useSiteT = (): TSiteTranslate => {
  const [language, setLanguage] = useState<TSiteLanguage>("ptBR");

  useEffect(() => {
    setLanguage(detectLanguage());
  }, []);

  return useCallback(
    (key: string, values?: Record<string, string | number>): string => {
      const found: unknown = key
        .split(".")
        .reduce<unknown>(
          (node: unknown, part: string) =>
            node && typeof node === "object"
              ? (node as Record<string, unknown>)[part]
              : undefined,
          TRANSLATIONS[language],
        );

      const text: string = typeof found === "string" ? found : key;

      return Object.entries(values ?? {}).reduce(
        (current: string, [name, value]: [string, string | number]) =>
          current.split(`{${name}}`).join(String(value)),
        text,
      );
    },
    [language],
  );
};

export default useSiteT;
