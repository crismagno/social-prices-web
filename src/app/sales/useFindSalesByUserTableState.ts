import { useCallback, useEffect, useState } from "react";

import handleClientError from "../../components/common/handleClientError/handleClientError";
import { serviceMethodsInstance } from "../../services/social-prices-api/ServiceMethods";
import { ISale } from "../../shared/business/sales/sale.interface";
import {
  ITableStateRequest,
  ITableStateResponse,
} from "../../shared/utils/table/table-state.interface";

export const useFindSalesByUserTableState = (
  tableState?: ITableStateRequest<ISale>
): {
  isLoading: boolean;
  sales: ISale[];
  total: number;
  fetchFindSalesByUserTableState: () => Promise<void>;
} => {
  const [sales, setSales] = useState<ISale[]>([]);

  const [total, setTotal] = useState<number>(0);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchFindSalesByUserTableState = useCallback(async () => {
    try {
      setIsLoading(true);

      const response: ITableStateResponse<ISale[]> =
        await serviceMethodsInstance.salesServiceMethods.findByUserTableState(
          tableState
        );

      setSales(response.data);

      setTotal(response.total);
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  }, [tableState]);

  useEffect(() => {
    fetchFindSalesByUserTableState();
  }, [fetchFindSalesByUserTableState]);

  return {
    isLoading,
    total,
    sales,
    fetchFindSalesByUserTableState,
  };
};
