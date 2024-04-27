import { useCallback, useEffect, useState } from "react";

import handleClientError from "../../components/common/handleClientError/handleClientError";
import { serviceMethodsInstance } from "../../services/social-prices-api/ServiceMethods";
import { INotification } from "../../shared/business/notifications/notification.interface";
import {
  ITableStateRequest,
  ITableStateResponse,
} from "../../shared/utils/table/table-state.interface";

export const useFindNotificationsByUserTableState = (
  tableState?: ITableStateRequest<INotification>
): {
  isLoading: boolean;
  notifications: INotification[];
  total: number;
  fetchFindNotificationsByUserTableState: () => Promise<void>;
} => {
  const [notifications, setNotifications] = useState<INotification[]>([]);

  const [total, setTotal] = useState<number>(0);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchFindNotificationsByUserTableState = useCallback(async () => {
    try {
      setIsLoading(true);
      const response: ITableStateResponse<INotification[]> =
        await serviceMethodsInstance.notificationsServiceMethods.findByUserTableState(
          tableState
        );

      setNotifications(response.data);
      setTotal(response.total);
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  }, [tableState]);

  useEffect(() => {
    fetchFindNotificationsByUserTableState();
  }, [fetchFindNotificationsByUserTableState]);

  return {
    isLoading,
    total,
    notifications,
    fetchFindNotificationsByUserTableState,
  };
};
