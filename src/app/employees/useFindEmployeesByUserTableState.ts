import { useCallback, useEffect, useState } from "react";

import handleClientError from "../../components/common/HandleClientError/HandleClientError";
import { serviceMethodsInstance } from "../../services/social-prices-api/service-methods";
import { IEmployee } from "../../shared/business/employees/employee.interface";
import {
  ITableStateRequest,
  ITableStateResponse,
} from "../../shared/utils/table/table-state.interface";

export const useFindEmployeesByUserTableState = (
  tableState?: ITableStateRequest<IEmployee>
): {
  isLoading: boolean;
  employees: IEmployee[];
  total: number;
  fetchFindEmployeesByUserTableState: () => Promise<void>;
} => {
  const [employees, setEmployees] = useState<IEmployee[]>([]);

  const [total, setTotal] = useState<number>(0);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchFindEmployeesByUserTableState = useCallback(async () => {
    try {
      setIsLoading(true);
      const response: ITableStateResponse<IEmployee[]> =
        await serviceMethodsInstance.employeesServiceMethods.findByUserTableState(
          tableState
        );

      if (tableState?.useConcat) {
        setEmployees((value) => [...value, ...response.data]);
      } else {
        setEmployees(response.data);
      }

      setTotal(response.total);
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  }, [tableState]);

  useEffect(() => {
    fetchFindEmployeesByUserTableState();
  }, [fetchFindEmployeesByUserTableState]);

  return {
    isLoading,
    total,
    employees,
    fetchFindEmployeesByUserTableState,
  };
};
