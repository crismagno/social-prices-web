import { IStoreSite } from "./store-site.interface";

/** What a visitor may know about a product: nothing about cost or stock. */
export interface IPublicSiteProduct {
  _id: string;
  name: string;
  description: string | null;
  price: number;
  mainUrl: string | null;
  filesUrl: string[];
  /** The longer text about it, shown when a visitor opens the product. */
  details?: string | null;
  brand?: string | null;
  colors?: string[];
  /** Only the measures that were filled; null when none was. */
  dimensions?: TPublicSiteProductDimensions | null;
  isAvailable: boolean;
}

/** Lengths in meters, volume in liters, weight in kilos: as the product form asks. */
export type TPublicSiteProductDimensions = Partial<{
  size: string;
  height: number;
  width: number;
  length: number;
  depth: number;
  diameter: number;
  thickness: number;
  volume: number;
  weight: number;
}>;

export interface IPublicSiteStore {
  name: string;
  logo: string | null;
  description: string | null;
  about: string | null;
}

export type TPublicSite = Omit<IStoreSite, "userId">;

export interface IPublicStoreSite {
  site: TPublicSite;
  store: IPublicSiteStore;
  products: IPublicSiteProduct[];
}

export interface ISiteOrderAddress {
  address1: string;
  address2: string | null;
  district: string;
  city: string;
  stateCode: string;
  stateName: string;
  zip: string;
}

export interface ISiteOrderBuyer {
  name: string;
  /** Email, phone and address: null when the site does not ask or it was skipped. */
  email: string | null;
  phoneNumber: string | null;
  address: ISiteOrderAddress | null;
}

export interface ISiteCartItem {
  productId: string;
  quantity: number;
}

export interface ICreateSiteOrder {
  buyer: ISiteOrderBuyer;
  items: ISiteCartItem[];
  note: string | null;
}

export interface ISiteOrderCreated {
  number: number;
}
