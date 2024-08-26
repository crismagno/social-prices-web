import { IGetSalesAnalyticsParams } from "./sales-service.types";

export const createGetSalesAnalyticsParams = (
  params?: IGetSalesAnalyticsParams
): IGetSalesAnalyticsParams => {
  return {
    periodType: params?.periodType,
    status: params?.status,
    rangeDate: params?.rangeDate,
    storesIds: params?.storesIds,
    tagsIds: params?.tagsIds,
    types: params?.types,
  };
};
