import { useCallback, useEffect, useState } from "react";

import handleClientError from "../../components/common/handleClientError/handleClientError";
import { serviceMethodsInstance } from "../../services/social-prices-api/ServiceMethods";
import { ICategory } from "../../shared/business/categories/categories.interface";
import {
  ITableStateRequest,
  ITableStateResponse,
} from "../../shared/utils/table/table-state.interface";

export const useFindCategoriesByUserTableState = (
  tableState?: ITableStateRequest<ICategory>
): {
  isLoading: boolean;
  categories: ICategory[];
  total: number;
  fetchFindCategoriesByUserTableState: () => Promise<void>;
} => {
  const [categories, setCategories] = useState<ICategory[]>([]);

  const [total, setTotal] = useState<number>(0);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchFindCategoriesByUserTableState = useCallback(async () => {
    try {
      setIsLoading(true);

      const response: ITableStateResponse<ICategory[]> =
        await serviceMethodsInstance.categoriesServiceMethods.findByUserTableState(
          tableState
        );

      setCategories(response.data);
      setTotal(response.total);
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  }, [tableState]);

  useEffect(() => {
    fetchFindCategoriesByUserTableState();
  }, [fetchFindCategoriesByUserTableState]);

  return {
    isLoading,
    total,
    categories,
    fetchFindCategoriesByUserTableState,
  };
};
