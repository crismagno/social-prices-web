import { useCallback, useEffect, useState } from "react";

import handleClientError from "../../../../components/common/handleClientError/handleClientError";
import { serviceMethodsInstance } from "../../../../services/social-prices-api/service-methods";
import {
  IGetSalesBalanceParams,
  IGetSalesBalanceResponse,
} from "../../../../shared/business/sales/sales.type";

export const useGetSalesBalance = (
  params: IGetSalesBalanceParams
): {
  isLoading: boolean;
  salesBalance: IGetSalesBalanceResponse | null;
  fetchGetSalesBalance: () => Promise<void>;
} => {
  const [salesBalance, setSalesBalance] =
    useState<IGetSalesBalanceResponse | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchGetSalesBalance = useCallback(async () => {
    try {
      setIsLoading(true);

      const response: IGetSalesBalanceResponse =
        await serviceMethodsInstance.salesServiceMethods.getSalesBalance(
          params
        );

      setSalesBalance(response);
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchGetSalesBalance();
  }, [fetchGetSalesBalance]);

  return {
    isLoading,
    salesBalance,
    fetchGetSalesBalance,
  };
};
