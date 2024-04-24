import { useCallback, useEffect, useState } from "react";

import handleClientError from "../../../components/common/handleClientError/handleClientError";
import { serviceMethodsInstance } from "../../../services/social-prices-api/ServiceMethods";
import { IProduct } from "../../../shared/business/products/products.interface";

export const useFindProductById = (
  productsId: string | null
): {
  isLoading: boolean;
  product: IProduct | null;
  fetchFindProductById: () => void;
} => {
  const [product, setProduct] = useState<IProduct | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchFindProductById = useCallback(async () => {
    try {
      setIsLoading(true);

      if (productsId) {
        const response: IProduct =
          await serviceMethodsInstance.productsServiceMethods.findById(
            productsId
          );

        setProduct(response);
      }
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  }, [productsId]);

  useEffect(() => {
    fetchFindProductById();
  }, [fetchFindProductById]);

  return {
    isLoading,
    product,
    fetchFindProductById,
  };
};
