import { useCallback, useEffect, useState } from "react";

import handleClientError from "../../../../../components/common/handleClientError/handleClientError";
import { serviceMethodsInstance } from "../../../../../services/social-prices-api/ServiceMethods";
import useAuthData from "../../../auth/useAuthData";

export interface IAppContextNotifications {
  countNotificationNotSeen: number;
  isLoadingCountNotificationNotSeen: boolean;
  fetchCountNotSeenNotificationsByUser: () => Promise<void>;
}

export const useCountNotSeenNotificationsByUserDefaultValue: IAppContextNotifications =
  {
    countNotificationNotSeen: 0,
    fetchCountNotSeenNotificationsByUser: () =>
      new Promise((resolve) => resolve),
    isLoadingCountNotificationNotSeen: false,
  };

export const useCountNotSeenNotificationsByUser =
  (): IAppContextNotifications => {
    const { isLogged } = useAuthData();

    const [countNotificationNotSeen, setCountNotificationNotSeen] =
      useState<number>(0);

    const [
      isLoadingCountNotificationNotSeen,
      setIsLoadingCountNotificationNotSeen,
    ] = useState<boolean>(false);

    const fetchCountNotSeenNotificationsByUser = useCallback(async () => {
      try {
        setIsLoadingCountNotificationNotSeen(true);

        if (isLogged) {
          const response: number =
            await serviceMethodsInstance.notificationsServiceMethods.countNotSeenByUser();

          setCountNotificationNotSeen(response);
        } else {
          setCountNotificationNotSeen(0);
        }
      } catch (error: any) {
        handleClientError(error);
      } finally {
        setIsLoadingCountNotificationNotSeen(false);
      }
    }, [isLogged]);

    useEffect(() => {
      fetchCountNotSeenNotificationsByUser();
    }, [fetchCountNotSeenNotificationsByUser]);

    return {
      isLoadingCountNotificationNotSeen,
      countNotificationNotSeen,
      fetchCountNotSeenNotificationsByUser,
    };
  };
