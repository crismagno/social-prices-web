import { useCallback, useEffect, useState } from "react";

import handleClientError from "../../../components/common/HandleClientError/HandleClientError";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import IUser from "../../../shared/business/users/user.interface";
import {
  ITableStateRequest,
  ITableStateResponse,
} from "../../../shared/utils/table/table-state.interface";

export const useFindUsersByManagerTableState = (
  tableState?: ITableStateRequest<IUser>
): {
  isLoading: boolean;
  users: IUser[];
  total: number;
} => {
  const [users, setUsers] = useState<IUser[]>([]);

  const [total, setTotal] = useState<number>(0);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchFindUsers = useCallback(async () => {
    try {
      setIsLoading(true);

      const response: ITableStateResponse<IUser[]> =
        await serviceMethodsInstance.managerUsersServiceMethods.findByTableState(
          tableState
        );

      setUsers(response.data);
      setTotal(response.total);
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  }, [tableState]);

  useEffect(() => {
    fetchFindUsers();
  }, [fetchFindUsers]);

  return { isLoading, users, total };
};
