import { useCallback, useEffect, useState } from "react";

import handleClientError from "../../components/common/HandleClientError/HandleClientError";
import { serviceMethodsInstance } from "../../services/social-prices-api/service-methods";
import {
  ITransactionSummary,
  ITransactionSummaryRequest,
} from "../../shared/business/transactions/transactions.types";

export const useTransactionsSummary = (
  request: ITransactionSummaryRequest,
): {
  isLoading: boolean;
  summary: ITransactionSummary | null;
  refetch: () => Promise<void>;
} => {
  const [summary, setSummary] = useState<ITransactionSummary | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchSummary = useCallback(async () => {
    try {
      setIsLoading(true);

      setSummary(
        await serviceMethodsInstance.transactionsServiceMethods.summary(
          request,
        ),
      );
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  }, [request]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { isLoading, summary, refetch: fetchSummary };
};
