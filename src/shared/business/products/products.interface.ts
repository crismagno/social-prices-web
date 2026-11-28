import { IDynamicField } from "../shared/dynamic-field/dynamic-field.interface";
import { IPricing } from "../shared/pricing/pricing.interface";
import { IProductItem } from "../product-items/product-items.interface";
import { ICreatedAtEntity } from "../shared/global/created-at.interface";
import { IUpdatedAtEntity } from "../shared/global/updated-at.interface";

export interface IProduct extends ICreatedAtEntity, IUpdatedAtEntity {
  readonly _id: string;
  name: string;
  quantity: number;
  description: string | null;
  details: string | null;
  price: number;
  isActive: boolean;
  userId: string;
  storeIds: string[];
  filesUrl: string[];
  mainUrl: string | null;
  barcode: string | null;
  sku: string | null;
  previousBarcodes: string[];
  QRCode: string | null;
  categoriesIds: string[];
  tagsIds: string[];
  uploadFilename: string | null;
  brand: string | null;
  location: string | null;
  historicPrices: IProductHistoricPrice[];
  releaseDate: Date | null;
  expirationDate: Date | null;
  dimensions: IProductDimensions | null;
  /** The years the product is for, when it is for some: a part, a model. */
  yearRange?: IProductYearRange | null;
  pricing?: IPricing | null;
  colors: string[] | null;
  dynamicFields: IDynamicField[];
  productItemDefault?: IProductItem;
}

export interface IProductHistoricPrice {
  price: number;
  barcode: string;
  updatedAt: Date;
}

/**
 * The years a product is for, first and last. One of them left out leaves
 * that end open: only `from` is "since", only `to` is "until".
 */
export interface IProductYearRange {
  from: number | null;
  to: number | null;
}

/** The years as words: "2015–2018", "2015", "2015+", "–2018"; none, nothing. */
export const yearRangeLabel = (
  range: IProductYearRange | null | undefined,
): string => {
  const from: number | null = range?.from ?? null;
  const to: number | null = range?.to ?? null;

  if (from === null && to === null) {
    return "";
  }

  if (from !== null && to !== null) {
    return from === to ? `${from}` : `${from}–${to}`;
  }

  return from !== null ? `${from}+` : `–${to}`;
};

export interface IProductDimensions {
  size: string | null;
  height: number | null;
  width: number | null;
  length: number | null;
  depth: number | null;
  diameter: number | null;
  thickness: number | null;
  volume: number | null;
  weight: number | null;
}
