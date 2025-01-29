import { useCallback, useEffect, useState } from "react";

import handleClientError from "../../../components/common/handleClientError/handleClientError";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import { IEmployee } from "../../../shared/business/employees/employee.interface";

export const useFindEmployeeById = (
  employeeId: string | null
): {
  isLoading: boolean;
  employee: IEmployee | null;
  fetchFindEmployeeById: () => void;
} => {
  const [employee, setEmployee] = useState<IEmployee | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchFindEmployeeById = useCallback(async () => {
    try {
      setIsLoading(true);

      if (employeeId) {
        const response: IEmployee | null =
          await serviceMethodsInstance.employeesServiceMethods.findById(
            employeeId
          );

        setEmployee(response);
      }
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    fetchFindEmployeeById();
  }, [fetchFindEmployeeById]);

  return {
    isLoading,
    employee,
    fetchFindEmployeeById,
  };
};
