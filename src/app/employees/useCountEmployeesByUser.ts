import { useCallback, useEffect, useState } from "react";

import handleClientError from "../../components/common/handleClientError/handleClientError";
import { serviceMethodsInstance } from "../../services/social-prices-api/service-methods";

export const useCountEmployeesByUser = (): {
  isLoading: boolean;
  count: number;
  fetchCountEmployeesByUser: () => Promise<void>;
} => {
  const [count, setCount] = useState<number>(0);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchCountEmployeesByUser = useCallback(async () => {
    try {
      setIsLoading(true);

      const response: number =
        await serviceMethodsInstance.employeesServiceMethods.countByUser();

      setCount(response);
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCountEmployeesByUser();
  }, [fetchCountEmployeesByUser]);

  return {
    isLoading,
    count,
    fetchCountEmployeesByUser,
  };
};
