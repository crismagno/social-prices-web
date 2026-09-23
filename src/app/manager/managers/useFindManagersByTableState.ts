import { useCallback, useEffect, useState } from "react";

import handleClientError from "../../../components/common/HandleClientError/HandleClientError";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import { IManager } from "../../../shared/business/managers/manager.interface";
import {
  ITableStateRequest,
  ITableStateResponse,
} from "../../../shared/utils/table/table-state.interface";

export const useFindManagersByTableState = (
  tableState?: ITableStateRequest<IManager>
): {
  isLoading: boolean;
  managers: IManager[];
  total: number;
  fetchFindManagersByTableState: () => Promise<void>;
} => {
  const [managers, setManagers] = useState<IManager[]>([]);

  const [total, setTotal] = useState<number>(0);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchFindManagersByTableState = useCallback(async () => {
    try {
      setIsLoading(true);

      const response: ITableStateResponse<IManager[]> =
        await serviceMethodsInstance.managersServiceMethods.findByTableState(
          tableState
        );

      setManagers(response.data);
      setTotal(response.total);
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  }, [tableState]);

  useEffect(() => {
    fetchFindManagersByTableState();
  }, [fetchFindManagersByTableState]);

  return {
    isLoading,
    total,
    managers,
    fetchFindManagersByTableState,
  };
};
