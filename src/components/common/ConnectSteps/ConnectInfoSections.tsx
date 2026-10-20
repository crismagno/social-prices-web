"use client";

import useLanguageData from "../../../data/context/language/useLanguageData";
import { ConnectChecklist, ConnectFaq } from "./ConnectSteps";

// The texts of an app's connect screen come in numbered keys under one prefix
// (`<prefix>.need.1`, `<prefix>.faq.2.q`...), so every app fills the same shape.

interface Props {
  // Where the app's texts live, like "apps.telegram.info".
  prefix: string;
  accentColor: string;
}

interface Counts {
  need: number;
  works: number;
  limits: number;
  faq: number;
}

const numbered = (count: number): number[] =>
  Array.from({ length: count }, (_, index: number) => index + 1);

// What the person needs to have before they start, so nobody gets lost half-way.
export function ConnectInfoBefore({
  prefix,
  accentColor,
  need,
}: Props & Pick<Counts, "need">) {
  const { t } = useLanguageData();

  return (
    <ConnectChecklist
      title={t(`${prefix}.needTitle`)}
      accentColor={accentColor}
      items={numbered(need).map((n: number) => t(`${prefix}.need.${n}`))}
    />
  );
}

// What they get, what to keep in mind, and the questions people ask.
export function ConnectInfoAfter({
  prefix,
  accentColor,
  works,
  limits,
  faq,
}: Props & Pick<Counts, "works" | "limits" | "faq">) {
  const { t } = useLanguageData();

  return (
    <>
      <ConnectChecklist
        title={t(`${prefix}.worksTitle`)}
        accentColor={accentColor}
        items={numbered(works).map((n: number) => t(`${prefix}.works.${n}`))}
      />

      <ConnectChecklist
        kind="info"
        title={t(`${prefix}.limitsTitle`)}
        accentColor={accentColor}
        items={numbered(limits).map((n: number) => t(`${prefix}.limits.${n}`))}
      />

      <ConnectFaq
        title={t(`${prefix}.faqTitle`)}
        items={numbered(faq).map((n: number) => ({
          question: t(`${prefix}.faq.${n}.q`),
          answer: t(`${prefix}.faq.${n}.a`),
        }))}
      />
    </>
  );
}

// The "how, exactly" lines of a step, from numbered keys.
export const stepDetailKeys = (
  t: (key: string) => string,
  prefix: string,
  count: number,
): string[] => numbered(count).map((n: number) => t(`${prefix}.${n}`));
