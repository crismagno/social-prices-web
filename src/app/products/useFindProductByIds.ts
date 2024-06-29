import { useCallback, useEffect, useState } from "react";

import handleClientError from "../../components/common/handleClientError/handleClientError";
import { serviceMethodsInstance } from "../../services/social-prices-api/ServiceMethods";
import { IProduct } from "../../shared/business/products/products.interface";

export const useFindProductByIds = (
  productIds: string[]
): {
  isLoading: boolean;
  products: IProduct[];
  fetchFindProductByIds: () => Promise<void>;
} => {
  const [products, setProducts] = useState<IProduct[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchFindProductByIds = useCallback(async () => {
    try {
      setIsLoading(true);

      if (productIds) {
        const response: IProduct[] =
          await serviceMethodsInstance.productsServiceMethods.findByIds(
            productIds
          );

        setProducts(response);
      }
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  }, [productIds]);

  useEffect(() => {
    fetchFindProductByIds();
  }, [fetchFindProductByIds]);

  return {
    isLoading,
    products,
    fetchFindProductByIds,
  };
};
