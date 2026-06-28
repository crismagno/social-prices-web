import { reduce } from "lodash";

import {
  ISale,
  ISalePayment,
  ISaleStore,
  ISaleStoreProduct,
} from "./sale.interface";
import { IGetSalesAnalyticsParams } from "./sales.type";

export const createGetSalesAnalyticsParams = (
  params?: IGetSalesAnalyticsParams
): IGetSalesAnalyticsParams => {
  return {
    periodType: params?.periodType,
    status: params?.status,
    rangeDate: params?.rangeDate,
    storesIds: params?.storesIds,
    tagsIds: params?.tagsIds,
    categoriesIds: params?.categoriesIds,
    productIds: params?.productIds,
    customerIds: params?.customerIds,
    types: params?.types,
    paymentStatus: params?.paymentStatus,
    deliveryTypes: params?.deliveryTypes,
    productItemIds: params?.productItemIds,
  };
};

export const getTotalPayment = (sale: ISale): number => {
  const total: number = reduce(
    sale.payments,
    (acc: number, payment: ISalePayment) => {
      acc += payment.amount;

      return acc;
    },
    0
  );

  return total > 0 ? total : 0;
};

export const getQuantity = (sale: ISale): number => {
  const quantity: number = reduce(
    sale.stores,
    (accSaleStore: number, saleStore: ISaleStore) => {
      const productsQuantityPrice = reduce(
        saleStore.products,
        (accSaleStoreProduct: number, saleStoreProduct: ISaleStoreProduct) => {
          accSaleStoreProduct += saleStoreProduct.quantity;

          return accSaleStoreProduct;
        },
        0
      );

      accSaleStore += productsQuantityPrice;

      return accSaleStore;
    },
    0
  );

  return quantity;
};

export const getTotalAfterDiscount = (sale: ISale): number => {
  const discountAmount: number = sale.totals.discount?.distributed.amount ?? 0;

  const totalAfterDiscount: number =
    sale.totals.subtotalAmount - discountAmount;

  return totalAfterDiscount > 0 ? totalAfterDiscount : 0;
};

export const getTotalAfterPayment = (
  sale: ISale,
  totalPayment: number
): number => sale.totals.totalFinalAmount - totalPayment;
