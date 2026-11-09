import { useCallback, useEffect, useState } from "react";

import handleClientError from "../../components/common/HandleClientError/HandleClientError";
import { serviceMethodsInstance } from "../../services/social-prices-api/service-methods";
import { IQuickMessage } from "../../shared/business/quick-messages/quick-messages.types";
import {
  ITableStateRequest,
  ITableStateResponse,
} from "../../shared/utils/table/table-state.interface";

export const useFindQuickMessagesByUserTableState = (
  tableState?: ITableStateRequest<IQuickMessage>,
): {
  isLoading: boolean;
  quickMessages: IQuickMessage[];
  total: number;
  refetch: () => Promise<void>;
} => {
  const [quickMessages, setQuickMessages] = useState<IQuickMessage[]>([]);

  const [total, setTotal] = useState<number>(0);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true);

      const response: ITableStateResponse<IQuickMessage[]> =
        await serviceMethodsInstance.quickMessagesServiceMethods.findByUserTableState(
          tableState,
        );

      setQuickMessages(response.data);
      setTotal(response.total);
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  }, [tableState]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { isLoading, quickMessages, total, refetch };
};
