import { useCallback, useEffect, useState } from "react";

import handleClientError from "../../../components/common/handleClientError/handleClientError";
import { serviceMethodsInstance } from "../../../services/social-prices-api/ServiceMethods";
import { IStore } from "../../../shared/business/stores/stores.interface";

export const useFindStoreById = (
  storeId: string | null
): {
  isLoadingStore: boolean;
  store: IStore | null;
  fetchFindStoreById: () => void;
} => {
  const [store, setStore] = useState<IStore | null>(null);

  const [isLoadingStore, setIsLoadingStore] = useState<boolean>(false);

  const fetchFindStoreById = useCallback(async () => {
    try {
      setIsLoadingStore(true);

      if (storeId) {
        const response: IStore | null =
          await serviceMethodsInstance.storesServiceMethods.findById(storeId);

        setStore(response);
      }
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsLoadingStore(false);
    }
  }, [storeId]);

  useEffect(() => {
    fetchFindStoreById();
  }, [fetchFindStoreById]);

  return {
    isLoadingStore,
    store,
    fetchFindStoreById,
  };
};
