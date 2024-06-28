import { useCallback, useEffect, useState } from "react";

import handleClientError from "../../components/common/handleClientError/handleClientError";
import { serviceMethodsInstance } from "../../services/social-prices-api/ServiceMethods";
import { ISale } from "../../shared/business/sales/sale.interface";

export const useFindSaleById = (
  saleId: string | null
): {
  isLoading: boolean;
  sale: ISale | null;
  fetchFindSaleById: () => void;
} => {
  const [sale, setSale] = useState<ISale | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchFindSaleById = useCallback(async () => {
    try {
      setIsLoading(true);

      if (saleId) {
        const response: ISale | null =
          await serviceMethodsInstance.salesServiceMethods.findById(saleId);

        setSale(response);
      }
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  }, [saleId]);

  useEffect(() => {
    fetchFindSaleById();
  }, [fetchFindSaleById]);

  return {
    isLoading,
    sale,
    fetchFindSaleById,
  };
};
