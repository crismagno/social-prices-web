import { useCallback, useEffect, useState } from "react";

import handleClientError from "../../../components/common/HandleClientError/HandleClientError";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import { ICustomer } from "../../../shared/business/customers/customer.interface";
import {
  ITableStateRequest,
  ITableStateResponse,
} from "../../../shared/utils/table/table-state.interface";

// The customers of one store, page by page, like the customers list does.
export const useFindCustomersByStoreTableState = (
  storeId: string,
  tableState?: ITableStateRequest<ICustomer>,
): {
  isLoading: boolean;
  customers: ICustomer[];
  total: number;
  fetchFindCustomersByStoreTableState: () => Promise<void>;
} => {
  const [customers, setCustomers] = useState<ICustomer[]>([]);

  const [total, setTotal] = useState<number>(0);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchFindCustomersByStoreTableState = useCallback(async () => {
    if (!storeId) {
      return;
    }

    try {
      setIsLoading(true);

      const response: ITableStateResponse<ICustomer[]> =
        await serviceMethodsInstance.customersServiceMethods.findByStoreTableState(
          storeId,
          tableState,
        );

      setCustomers(response.data);

      setTotal(response.total);
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  }, [storeId, tableState]);

  useEffect(() => {
    fetchFindCustomersByStoreTableState();
  }, [fetchFindCustomersByStoreTableState]);

  return {
    isLoading,
    total,
    customers,
    fetchFindCustomersByStoreTableState,
  };
};
