import { ICustomer } from "../customers/customer.interface";
import { IAddress } from "../interfaces/address.interface";
import { ICreatedAtEntity } from "../interfaces/created-at.interface";
import { IPhoneNumber } from "../interfaces/phone-number";
import { IUpdatedAtEntity } from "../interfaces/updated-at.interface";
import UsersEnum from "../users/users.enum";
import SalesEnum from "./sales.enum";

export interface ISale extends ICreatedAtEntity, IUpdatedAtEntity {
  readonly _id: string;
  description: string | null;
  createdByUserId: string | null;
  buyer: ISaleBuyer | null;
  number: string;
  type: SalesEnum.Type;
  totals: ISaleTotals;
  header: ISaleHeader;
  note: string | null;
  status: SalesEnum.Status;
  payments: ISalePayment[];
  stores: ISaleStore[];
  paymentStatus: SalesEnum.PaymentStatus;
}

export interface ISaleStore {
  storeId: string;
  number: string;
  products: ISaleStoreProduct[];
  totals: ISaleTotals;
  customerId: string | null;
  customer?: ICustomer;
}

export interface ISaleTotals {
  subtotalAmount: number;
  discount: ISaleTotalsDiscount | null;
  taxAmount: number | null;
  shippingAmount: number | null;
  totalFinalAmount: number;
}

export interface ISaleTotalsDiscount {
  normal: number;
}

export interface ISalePayment {
  type: SalesEnum.PaymentType;
  status: SalesEnum.PaymentStatus;
  amount: number;
  provider: any | null;
}

export interface ISaleStoreProduct {
  productId: string;
  price: number;
  quantity: number;
  barCode: string;
  note: string | null;
}

export interface ISaleHeader {
  billing: ISaleHeaderBilling | null;
  shipping: ISaleHeaderShipping | null;
  deliveryType: SalesEnum.DeliveryType;
}

export interface ISaleHeaderBilling {
  address: IAddress | null;
}

export interface ISaleHeaderShipping {
  address: IAddress | null;
}

export interface ISaleBuyer {
  userId: string | null;
  email: string;
  name: string;
  birthDate: Date | null;
  gender: UsersEnum.Gender | null;
  phoneNumber: IPhoneNumber | null;
  address: IAddress | null;
}
