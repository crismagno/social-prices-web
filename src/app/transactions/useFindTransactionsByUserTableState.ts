import { useCallback, useEffect, useState } from "react";

import handleClientError from "../../components/common/HandleClientError/HandleClientError";
import { serviceMethodsInstance } from "../../services/social-prices-api/service-methods";
import { ITransaction } from "../../shared/business/transactions/transaction.interface";
import {
  ITableStateRequest,
  ITableStateResponse,
} from "../../shared/utils/table/table-state.interface";

export const useFindTransactionsByUserTableState = (
  tableState?: ITableStateRequest<ITransaction>,
): {
  isLoading: boolean;
  transactions: ITransaction[];
  total: number;
  refetch: () => Promise<void>;
} => {
  const [transactions, setTransactions] = useState<ITransaction[]>([]);

  const [total, setTotal] = useState<number>(0);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchTransactions = useCallback(async () => {
    try {
      setIsLoading(true);

      const response: ITableStateResponse<ITransaction[]> =
        await serviceMethodsInstance.transactionsServiceMethods.findByUserTableState(
          tableState,
        );

      setTransactions(response.data);
      setTotal(response.total);
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  }, [tableState]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return { isLoading, transactions, total, refetch: fetchTransactions };
};
