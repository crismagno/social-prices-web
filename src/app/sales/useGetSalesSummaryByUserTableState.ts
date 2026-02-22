import { useCallback, useEffect, useState } from "react";

import handleClientError from "../../components/common/HandleClientError/HandleClientError";
import { serviceMethodsInstance } from "../../services/social-prices-api/service-methods";
import { ISale } from "../../shared/business/sales/sale.interface";
import { IGetSalesSummaryByUserTableStateResponse } from "../../shared/business/sales/sales.type";
import { ITableStateRequest } from "../../shared/utils/table/table-state.interface";

export const useGetSalesSummaryByUserTableState = (
  tableState?: ITableStateRequest<ISale>
): {
  isLoadingSalesSummary: boolean;
  salesSummary: IGetSalesSummaryByUserTableStateResponse;
  fetchSalesSummaryByUserTableState: () => Promise<void>;
} => {
  const [salesSummary, setSalesSummary] =
    useState<IGetSalesSummaryByUserTableStateResponse>({
      discount: 0,
      shipping: 0,
      subtotal: 0,
      tax: 0,
      totalFinal: 0,
    });

  const [isLoadingSalesSummary, setIsLoadingSalesSummary] =
    useState<boolean>(false);

  const fetchSalesSummaryByUserTableState = useCallback(async () => {
    try {
      setIsLoadingSalesSummary(true);

      const response: IGetSalesSummaryByUserTableStateResponse =
        await serviceMethodsInstance.salesServiceMethods.getSalesSummaryByUserTableState(
          tableState
        );

      setSalesSummary(response);
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsLoadingSalesSummary(false);
    }
  }, [tableState]);

  useEffect(() => {
    fetchSalesSummaryByUserTableState();
  }, [fetchSalesSummaryByUserTableState]);

  return {
    isLoadingSalesSummary,
    salesSummary,
    fetchSalesSummaryByUserTableState,
  };
};
