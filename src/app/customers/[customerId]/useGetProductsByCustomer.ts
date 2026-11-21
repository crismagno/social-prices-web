"use client";

import { useEffect, useState } from "react";

import handleClientError from "../../../components/common/HandleClientError/HandleClientError";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import { IGetCustomerProductResponse } from "../../../shared/business/sales/sales.type";

export const useGetProductsByCustomer = (
  customerId: string,
): {
  isLoading: boolean;
  customerProducts: IGetCustomerProductResponse[];
} => {
  const [customerProducts, setCustomerProducts] = useState<
    IGetCustomerProductResponse[]
  >([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isCurrent = true;

    setIsLoading(true);

    serviceMethodsInstance.salesServiceMethods
      .getProductsByCustomer(customerId)
      .then((found: IGetCustomerProductResponse[]) => {
        if (isCurrent) {
          setCustomerProducts(found);
        }
      })
      .catch((error: any) => handleClientError(error))
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [customerId]);

  return {
    isLoading,
    customerProducts,
  };
};
