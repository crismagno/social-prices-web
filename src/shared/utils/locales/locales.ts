import { LanguageEnum } from "../../../data/context/language/LanguageContext";

const LOCALES: Record<LanguageEnum, string> = {
  [LanguageEnum.en]: "en-US",
  [LanguageEnum.ptBR]: "pt-BR",
};

export const getLocale = (language: LanguageEnum): string =>
  LOCALES[language] ?? LOCALES[LanguageEnum.en];
