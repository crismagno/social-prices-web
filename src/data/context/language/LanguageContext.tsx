"use client";

import { createContext, useEffect, useState } from "react";

import enTranslations from "../../../locales/en/en.json";
import ptBRTranslations from "../../../locales/ptBR/ptBR.json";

export enum LanguageEnum {
  en = "en",
  ptBR = "ptBR",
}

interface Translations {
  en: any;
  ptBR: any;
}

interface ILanguageContext {
  language: LanguageEnum;
  setLanguage: (language: LanguageEnum) => void;
  t: (key: string) => string;
  translations: Translations;
}

const translations: Translations = {
  en: enTranslations,
  ptBR: ptBRTranslations,
};

const LanguageContext = createContext<ILanguageContext>({
  language: LanguageEnum.en,
  setLanguage: () => {},
  t: (key: string) => key,
  translations: translations[LanguageEnum.en],
});

const LANGUAGE_STORAGE_KEY = "app-language";

export const LanguageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [language, setLanguageState] = useState<LanguageEnum>(LanguageEnum.en);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem(
      LANGUAGE_STORAGE_KEY
    ) as unknown as LanguageEnum;
    if (
      savedLanguage &&
      (savedLanguage === LanguageEnum.en || savedLanguage === LanguageEnum.ptBR)
    ) {
      setLanguageState(savedLanguage);
    }
    setIsLoaded(true);
  }, []);

  const setLanguage = (newLanguage: LanguageEnum) => {
    setLanguageState(newLanguage);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage);
  };

  // Translation function with nested key support (e.g., "common.save")
  const t = (key: string): string => {
    const keys = key.split(".");
    let value: any = translations[language];

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }

    return typeof value === "string" ? value : key;
  };

  if (!isLoaded) {
    return null; // or a loading spinner
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        translations: translations[language],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
