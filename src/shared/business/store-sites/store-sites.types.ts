import { IStoreSite } from "./store-site.interface";

/** What a visitor may know about a product: nothing about cost or stock. */
export interface IPublicSiteProduct {
  _id: string;
  name: string;
  description: string | null;
  price: number;
  mainUrl: string | null;
  filesUrl: string[];
  isAvailable: boolean;
}

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
  email: string;
  phoneNumber: string;
  address: ISiteOrderAddress;
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
