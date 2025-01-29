import { useCallback, useEffect, useState } from "react";

import handleClientError from "../../components/common/handleClientError/handleClientError";
import { serviceMethodsInstance } from "../../services/social-prices-api/service-methods";
import { ITag } from "../../shared/business/tags/tags.interface";
import {
  ITableStateRequest,
  ITableStateResponse,
} from "../../shared/utils/table/table-state.interface";

export const useFindTagsByUserTableState = (
  tableState?: ITableStateRequest<ITag>
): {
  isLoading: boolean;
  tags: ITag[];
  total: number;
  fetchFindTagsByUserTableState: () => Promise<void>;
} => {
  const [tags, setTags] = useState<ITag[]>([]);

  const [total, setTotal] = useState<number>(0);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchFindTagsByUserTableState = useCallback(async () => {
    try {
      setIsLoading(true);

      const response: ITableStateResponse<ITag[]> =
        await serviceMethodsInstance.tagsServiceMethods.findByUserTableState(
          tableState
        );

      setTags(response.data);
      setTotal(response.total);
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  }, [tableState]);

  useEffect(() => {
    fetchFindTagsByUserTableState();
  }, [fetchFindTagsByUserTableState]);

  return {
    isLoading,
    total,
    tags,
    fetchFindTagsByUserTableState,
  };
};
