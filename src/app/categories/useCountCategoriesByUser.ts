import { useCallback, useEffect, useState } from "react";

import handleClientError from "../../components/common/handleClientError/handleClientError";
import { serviceMethodsInstance } from "../../services/social-prices-api/ServiceMethods";

export const useCountCategoriesByUser = (): {
  isLoading: boolean;
  count: number;
  fetchCountCategoriesByUser: () => Promise<void>;
} => {
  const [count, setCount] = useState<number>(0);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchCountCategoriesByUser = useCallback(async () => {
    try {
      setIsLoading(true);

      const response: number =
        await serviceMethodsInstance.categoriesServiceMethods.countByUser();

      setCount(response);
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCountCategoriesByUser();
  }, [fetchCountCategoriesByUser]);

  return {
    isLoading,
    count,
    fetchCountCategoriesByUser,
  };
};
