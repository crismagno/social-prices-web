import { useCallback, useEffect, useState } from "react";

import handleClientError from "../../components/common/handleClientError/handleClientError";
import { serviceMethodsInstance } from "../../services/social-prices-api/ServiceMethods";

export const useCountProductsByUser = (): {
  isLoading: boolean;
  count: number;
  fetchCountProductsByUser: () => Promise<void>;
} => {
  const [count, setCount] = useState<number>(0);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchCountProductsByUser = useCallback(async () => {
    try {
      setIsLoading(true);

      const response: number =
        await serviceMethodsInstance.productsServiceMethods.countByUser();

      setCount(response);
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCountProductsByUser();
  }, [fetchCountProductsByUser]);

  return {
    isLoading,
    count,
    fetchCountProductsByUser,
  };
};
