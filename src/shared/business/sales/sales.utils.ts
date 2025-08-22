import { reduce } from "lodash";

import { ISale, ISalePayment } from "./sale.interface";
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
    productIds: params?.productIds,
    customerIds: params?.customerIds,
    types: params?.types,
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
