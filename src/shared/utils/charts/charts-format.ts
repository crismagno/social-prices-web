export const formatCompactNumber = (value: number, locale: string): string =>
  new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value ?? 0);

export const formatCompactMoney = (value: number, locale: string): string =>
  `R$\u00a0${formatCompactNumber(value, locale).replace(/\s/g, "\u00a0")}`;

export const getPercentage = (value: number, total: number): number =>
  total ? (value * 100) / total : 0;

export const formatPercentage = (value: number, total: number): string =>
  `${getPercentage(value, total).toFixed(1)}%`;
