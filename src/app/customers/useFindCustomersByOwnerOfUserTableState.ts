import { useCallback, useEffect, useState } from "react";

import handleClientError from "../../components/common/handleClientError/handleClientError";
import { serviceMethodsInstance } from "../../services/social-prices-api/ServiceMethods";
import { ICustomer } from "../../shared/business/customers/customer.interface";
import {
  ITableStateRequest,
  ITableStateResponse,
} from "../../shared/utils/table/table-state.interface";

export const useFindCustomersByOwnerOfUserTableState = (
  tableState?: ITableStateRequest<ICustomer>
): {
  isLoading: boolean;
  customers: ICustomer[];
  total: number;
  fetchFindCustomersByOwnerOfUserTableState: () => Promise<void>;
} => {
  const [customers, setCustomers] = useState<ICustomer[]>([]);

  const [total, setTotal] = useState<number>(0);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchFindCustomersByOwnerOfUserTableState = useCallback(async () => {
    try {
      setIsLoading(true);
      const response: ITableStateResponse<ICustomer[]> =
        await serviceMethodsInstance.customersServiceMethods.findByOwnerOfUserTableState(
          tableState
        );

      setCustomers(response.data);
      setTotal(response.total);
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  }, [tableState]);

  useEffect(() => {
    fetchFindCustomersByOwnerOfUserTableState();
  }, [fetchFindCustomersByOwnerOfUserTableState]);

  return {
    isLoading,
    total,
    customers,
    fetchFindCustomersByOwnerOfUserTableState,
  };
};
