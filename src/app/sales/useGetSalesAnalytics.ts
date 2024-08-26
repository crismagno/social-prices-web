import { useCallback, useEffect, useState } from "react";

import handleClientError from "../../components/common/handleClientError/handleClientError";
import {
  IGetSalesAnalyticsParams,
  IGetSalesAnalyticsResponse,
} from "../../services/social-prices-api/sales/sales-service.types";
import { serviceMethodsInstance } from "../../services/social-prices-api/ServiceMethods";

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
