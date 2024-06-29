import { useCallback, useEffect, useState } from "react";

import handleClientError from "../../../components/common/handleClientError/handleClientError";
import { serviceMethodsInstance } from "../../../services/social-prices-api/ServiceMethods";
import { IProduct } from "../../../shared/business/products/products.interface";

export const useFindProductById = (
  productId: string | null
): {
  isLoading: boolean;
  product: IProduct | null;
  fetchFindProductById: () => Promise<void>;
} => {
  const [product, setProduct] = useState<IProduct | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchFindProductById = useCallback(async () => {
    try {
      setIsLoading(true);

      if (productId) {
        const response: IProduct | null =
          await serviceMethodsInstance.productsServiceMethods.findById(
            productId
          );

        setProduct(response);
      }
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchFindProductById();
  }, [fetchFindProductById]);

  return {
    isLoading,
    product,
    fetchFindProductById,
  };
};
