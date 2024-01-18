import { useCallback, useEffect, useState } from "react";

import handleClientError from "../../components/common/handleClientError/handleClientError";
import { serviceMethodsInstance } from "../../services/social-prices-api/ServiceMethods";
import { IStore } from "../../shared/business/stores/stores.interface";

export const useFindStoresByUser = (): {
  isLoading: boolean;
  stores: IStore[];
  fetchFindStoresByUser: () => void;
} => {
  const [stores, setStores] = useState<IStore[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchFindStoresByUser = useCallback(async () => {
    try {
      setIsLoading(true);
      const response: IStore[] =
        await serviceMethodsInstance.storesServiceMethods.findByUser();

      setStores(response);
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFindStoresByUser();
  }, [fetchFindStoresByUser]);

  return {
    isLoading,
    stores,
    fetchFindStoresByUser,
  };
};
