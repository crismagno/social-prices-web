import { useCallback, useEffect, useState } from "react";

import handleClientError from "../../components/common/HandleClientError/HandleClientError";
import { serviceMethodsInstance } from "../../services/social-prices-api/service-methods";
import {
  IGetSalesAnalyticsParams,
  IGetSalesAnalyticsResponse,
} from "../../shared/business/sales/sales.type";

export const useGetSalesAnalytics = (
  params: IGetSalesAnalyticsParams
): {
  isLoading: boolean;
  salesAnalytics: IGetSalesAnalyticsResponse | null;
  fetchGetSalesAnalytics: () => Promise<void>;
} => {
  const [salesAnalytics, setSalesAnalytics] =
    useState<IGetSalesAnalyticsResponse | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchGetSalesAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);

      const response: IGetSalesAnalyticsResponse =
        await serviceMethodsInstance.salesServiceMethods.getSalesAnalytics(
          params
        );

      setSalesAnalytics(response);
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchGetSalesAnalytics();
  }, [fetchGetSalesAnalytics]);

  return {
    isLoading,
    salesAnalytics,
    fetchGetSalesAnalytics,
  };
};
