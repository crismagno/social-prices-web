"use client";

import { useCallback, useEffect, useState } from "react";

import handleClientError from "../../components/common/handleClientError/handleClientError";
import { serviceMethodsInstance } from "../../services/social-prices-api/service-methods";
import { IProductItem } from "../../shared/business/product-items/product-items.interface";

export const useFindProductItemsByProduct = (
  productId: string | null
): {
  productItems: IProductItem[];
  isLoading: boolean;
  refetch: () => Promise<void>;
} => {
  const [productItems, setProductItems] = useState<IProductItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchProductItems = useCallback(async () => {
    if (!productId) {
      setProductItems([]);
      return;
    }

    try {
      setIsLoading(true);
      const response =
        await serviceMethodsInstance.productItemsServiceMethods.findByProduct(
          productId
        );
      setProductItems(response);
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProductItems();
  }, [fetchProductItems]);

  return {
    productItems,
    isLoading,
    refetch: fetchProductItems,
  };
};
