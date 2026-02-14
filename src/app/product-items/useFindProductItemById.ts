"use client";

import { useCallback, useEffect, useState } from "react";

import handleClientError from "../../components/common/handleClientError/handleClientError";
import { serviceMethodsInstance } from "../../services/social-prices-api/service-methods";
import { IProductItem } from "../../shared/business/product-items/product-items.interface";

export const useFindProductItemById = (
  productItemId: string | null
): {
  productItem: IProductItem | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
} => {
  const [productItem, setProductItem] = useState<IProductItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchProductItem = useCallback(async () => {
    if (!productItemId) {
      setProductItem(null);
      return;
    }

    try {
      setIsLoading(true);
      const response =
        await serviceMethodsInstance.productItemsServiceMethods.findById(
          productItemId
        );
      setProductItem(response);
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  }, [productItemId]);

  useEffect(() => {
    fetchProductItem();
  }, [fetchProductItem]);

  return {
    productItem,
    isLoading,
    refetch: fetchProductItem,
  };
};
