import { ICustomer } from "../customers/customer.interface";
import PersonEnum from "../enums/person.enum";
import { IAddress } from "../interfaces/address.interface";
import { ICreatedAtEntity } from "../interfaces/created-at.interface";
import { IPhoneNumber } from "../interfaces/phone-number.interface";
import { ISoftDeleteEntity } from "../interfaces/soft-delete.interface";
import { IUpdatedAtEntity } from "../interfaces/updated-at.interface";
import { IProduct } from "../products/products.interface";
import SalesEnum from "./sales.enum";

export interface ISale
  extends ICreatedAtEntity,
    IUpdatedAtEntity,
    ISoftDeleteEntity {
  readonly _id: string;
  createdByUserId: string | null;
  updatedByUserId: string | null;
  createdByEmployeeId: string | null;
  updatedByEmployeeId: string | null;
  buyer: ISaleBuyer | null;
  number: number;
  type: SalesEnum.Type;
  totals: ISaleTotals;
  header: ISaleHeader;
  note: string | null;
  status: SalesEnum.Status;
  payments: ISalePayment[];
  stores: ISaleStore[];
  paymentStatus: SalesEnum.PaymentStatus;
  tagsIds: string[];
  deliveryAt: Date | null;
  createdDate: Date;
  numberManual: string | null;
  uploadFilename: string | null;
  filesUrl: string[];
  noteToCustomer: string | null;
  previousCustomerIds: string[];
  isSendCustomerNotifications: boolean;
}

export interface ISaleTotals {
  subtotalAmount: number;
  discount: ISaleTotalsDiscount | null;
  tax: ISaleAmountNote | null;
  shipping: ISaleAmountNote | null;
  totalFinalAmount: number;
}

export interface ISaleStore {
  storeId: string;
  number: number;
  products: ISaleStoreProduct[];
  totals: ISaleStoreTotals;
  customerId: string | null;
  customer?: ICustomer;
}

export interface ISaleStoreTotals {
  subtotalAmount: number;
  discount: ISaleStoreTotalsDiscount | null;
  tax: ISaleAmountNote | null;
  shipping: ISaleAmountNote | null;
  totalFinalAmount: number;
}

export interface ISaleStoreTotalsDiscount {
  distributedAmount: number | null;
}

export interface ISaleTotalsDiscount {
  distributed: ISaleAmountNote;
}

export interface ISalePayment {
  type: SalesEnum.PaymentType;
  status: SalesEnum.PaymentStatus;
  amount: number;
  provider: any | null;
}

export interface ISaleStoreProduct {
  product?: IProduct;
  productId: string;
  price: number;
  quantity: number;
  barcode: string;
  note: string | null;
  discount: ISaleStoreProductDiscount | null;
  isValid: boolean;
  isCompleted: boolean;
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
  gender: PersonEnum.Gender | null;
  phoneNumber: IPhoneNumber | null;
  address: IAddress | null;
}

export interface ISaleAmountNote {
  amount: number;
  note: string | null;
}

export interface ISaleStoreProductDiscount {
  distributedAmount: number | null;
}
