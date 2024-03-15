import { useCallback, useEffect, useState } from "react";

import handleClientError from "../../components/common/handleClientError/handleClientError";
import { serviceMethodsInstance } from "../../services/social-prices-api/ServiceMethods";
import { IStore } from "../../shared/business/stores/stores.interface";
import {
  ITableStateRequest,
  ITableStateResponse,
} from "../../shared/utils/table/table-state.interface";

export const useFindStoresByUserTableState = (
  tableState?: ITableStateRequest<IStore>
): {
  isLoading: boolean;
  stores: IStore[];
  total: number;
  fetchFindStoresByUserTableState: () => Promise<void>;
} => {
  const [stores, setStores] = useState<IStore[]>([]);

  const [total, setTotal] = useState<number>(0);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchFindStoresByUserTableState = useCallback(async () => {
    try {
      setIsLoading(true);

      const response: ITableStateResponse<IStore[]> =
        await serviceMethodsInstance.storesServiceMethods.findByUserTableState(
          tableState
        );

      setStores(response.data);

      setTotal(response.total);
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  }, [tableState]);

  useEffect(() => {
    fetchFindStoresByUserTableState();
  }, [fetchFindStoresByUserTableState]);

  return {
    isLoading,
    total,
    stores,
    fetchFindStoresByUserTableState,
  };
};
