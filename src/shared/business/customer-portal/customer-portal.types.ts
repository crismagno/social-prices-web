import { ISale } from "../sales/sale.interface";

// A sale as a customer account sees it, with the names of its stores and products.
export type ICustomerPortalSale = ISale & {
  storesNames: Record<string, string | null>;
  productsNames: Record<string, string | null>;
  // The main picture of each product, when it has one.
  productsImages: Record<string, string | null>;
};

export interface ICustomerPortalDashboard {
  totalPurchases: number;
  // Completed sales only.
  totalSpent: number;
  // Still to pay on sales not fully paid; cancelled and refunded ones aside.
  openAmount: number;
  lastPurchases: ICustomerPortalSale[];
}

// A site that is online, as the list of sites shows it. Mirrors the API's
// IPublicSiteCard.
export interface ICustomerPortalSite {
  slug: string;
  // The name at its top: its own, else the store's.
  name: string;
  logo: string | null;
  // What its entrance says.
  title: string;
  subtitle: string | null;
  // A picture of its entrance, when it has one.
  imageUrl: string | null;
  // Its main colour, for a card with no picture.
  color: string | null;
  // Whether it has a bag: off, it only shows.
  sells: boolean;
}

// A store the customer bought in: only its name is shown.
export interface ICustomerPortalStore {
  _id: string;
  name: string;
}
