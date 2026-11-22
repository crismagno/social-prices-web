import { getImageUrl } from "../../../shared/utils/images/images-url";

const MONEY: Intl.NumberFormat = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export const formatSiteMoney = (value: number): string =>
  MONEY.format(Number.isFinite(value) ? value : 0);

/** The address of an image of the site, or null when there is none. */
export const siteImage = (fileKey: string | null | undefined): string | null =>
  fileKey?.trim() ? getImageUrl(fileKey) : null;

export const cssUrl = (
  fileKey: string | null | undefined,
): string | undefined => {
  const url: string | null = siteImage(fileKey);

  return url ? `url("${url.replace(/"/g, "%22")}")` : undefined;
};
