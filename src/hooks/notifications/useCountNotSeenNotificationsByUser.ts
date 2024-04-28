import { useCallback, useEffect, useState } from "react";

import handleClientError from "../../components/common/handleClientError/handleClientError";
import { serviceMethodsInstance } from "../../services/social-prices-api/ServiceMethods";

export const useCountNotSeenNotificationsByUser = (): {
  isLoading: boolean;
  count: number;
  fetchCountNotSeenNotificationsByUser: () => Promise<void>;
} => {
  const [count, setCount] = useState<number>(0);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchCountNotSeenNotificationsByUser = useCallback(async () => {
    try {
      setIsLoading(true);

      const response: number =
        await serviceMethodsInstance.notificationsServiceMethods.countNotSeenByUser();

      setCount(response);
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCountNotSeenNotificationsByUser();
  }, [fetchCountNotSeenNotificationsByUser]);

  return {
    isLoading,
    count,
    fetchCountNotSeenNotificationsByUser,
  };
};
