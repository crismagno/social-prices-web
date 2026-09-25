import { useCallback, useEffect, useState } from "react";

import handleClientError from "../../../../components/common/HandleClientError/HandleClientError";
import { serviceMethodsInstance } from "../../../../services/social-prices-api/service-methods";
import IUser from "../../../../shared/business/users/user.interface";

export const useFindUserByManagerId = (
  userId: string | null,
): {
  isLoading: boolean;
  user: IUser | null;
  refetch: () => Promise<void>;
} => {
  const [user, setUser] = useState<IUser | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refetch = useCallback(async () => {
    if (!userId) {
      setUser(null);

      return;
    }

    try {
      setIsLoading(true);

      setUser(
        await serviceMethodsInstance.managerUsersServiceMethods.findById(
          userId,
        ),
      );
    } catch (error: any) {
      setUser(null);

      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { isLoading, user, refetch };
};
