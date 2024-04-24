import { useCallback, useEffect, useState } from "react";

import handleClientError from "../../../components/common/handleClientError/handleClientError";
import { serviceMethodsInstance } from "../../../services/social-prices-api/ServiceMethods";
import { ICustomer } from "../../../shared/business/customers/customer.interface";

export const useFindCustomerById = (
  customerId: string | null
): {
  isLoading: boolean;
  customer: ICustomer | null;
  fetchFindCustomerById: () => void;
} => {
  const [customer, setCustomer] = useState<ICustomer | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchFindCustomerById = useCallback(async () => {
    try {
      setIsLoading(true);

      if (customerId) {
        const response: ICustomer =
          await serviceMethodsInstance.customersServiceMethods.findById(
            customerId
          );

        setCustomer(response);
      }
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    fetchFindCustomerById();
  }, [fetchFindCustomerById]);

  return {
    isLoading,
    customer,
    fetchFindCustomerById,
  };
};
