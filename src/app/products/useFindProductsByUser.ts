import { useCallback, useEffect, useState } from "react";

import handleClientError from "../../components/common/handleClientError/handleClientError";
import { serviceMethodsInstance } from "../../services/social-prices-api/ServiceMethods";
import { IProduct } from "../../shared/business/products/products.interface";

export const useFindProductsByUser = (): {
  isLoading: boolean;
  products: IProduct[];
  fetchFindProductsByUser: () => Promise<void>;
} => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchFindProductsByUser = useCallback(async () => {
    try {
      setIsLoading(true);
      const response: IProduct[] =
        await serviceMethodsInstance.productsServiceMethods.findByUser();

      setProducts(response);
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFindProductsByUser();
  }, [fetchFindProductsByUser]);

  return {
    isLoading,
    products,
    fetchFindProductsByUser,
  };
};
