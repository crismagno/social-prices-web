import { useCallback, useEffect, useState } from "react";

import handleClientError from "../../components/common/handleClientError/handleClientError";
import { serviceMethodsInstance } from "../../services/social-prices-api/ServiceMethods";

export const useCountCustomersByUser = (): {
  isLoading: boolean;
  count: number;
  fetchCountCustomersByUser: () => Promise<void>;
} => {
  const [count, setCount] = useState<number>(0);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchCountCustomersByUser = useCallback(async () => {
    try {
      setIsLoading(true);

      const response: number =
        await serviceMethodsInstance.customersServiceMethods.countByOwnerUser();

      setCount(response);
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCountCustomersByUser();
  }, [fetchCountCustomersByUser]);

  return {
    isLoading,
    count,
    fetchCountCustomersByUser,
  };
};
