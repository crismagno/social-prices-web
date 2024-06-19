import { useCallback, useEffect, useState } from "react";

import handleClientError from "../../components/common/handleClientError/handleClientError";
import { serviceMethodsInstance } from "../../services/social-prices-api/ServiceMethods";
import { ICategory } from "../../shared/business/categories/categories.interface";

export const useFindCategoryById = (
  categoryId?: string
): {
  isLoading: boolean;
  category: ICategory | null;
  fetchFindCategoryById: () => Promise<void>;
} => {
  const [category, setCategory] = useState<ICategory | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchFindCategoryById = useCallback(async () => {
    try {
      setIsLoading(true);

      if (categoryId) {
        const response: ICategory | null =
          await serviceMethodsInstance.categoriesServiceMethods.findById(
            categoryId
          );

        setCategory(response);
      }
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    fetchFindCategoryById();
  }, [fetchFindCategoryById]);

  return {
    isLoading,
    category,
    fetchFindCategoryById,
  };
};
