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

// A store the customer bought in: only its name is shown.
export interface ICustomerPortalStore {
  _id: string;
  name: string;
}
