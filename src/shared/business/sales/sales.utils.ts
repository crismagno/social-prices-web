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
