import { useCallback, useEffect, useState } from "react";

import handleClientError from "../../components/common/handleClientError/handleClientError";
import { serviceMethodsInstance } from "../../services/social-prices-api/ServiceMethods";
import CategoriesEnum from "../../shared/business/categories/categories.enum";
import { ICategory } from "../../shared/business/categories/categories.interface";

export const useGetCategoriesByType = (
  type: CategoriesEnum.Type
): {
  isLoading: boolean;
  categories: ICategory[];
  fetchFindCategoriesByType: () => Promise<void>;
} => {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchFindCategoriesByType = useCallback(async () => {
    try {
      setIsLoading(true);
      const response: ICategory[] =
        await serviceMethodsInstance.categoriesServiceMethods.findByType(type);

      setCategories(response);
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchFindCategoriesByType();
  }, [fetchFindCategoriesByType]);

  return {
    isLoading,
    categories,
    fetchFindCategoriesByType,
  };
};
