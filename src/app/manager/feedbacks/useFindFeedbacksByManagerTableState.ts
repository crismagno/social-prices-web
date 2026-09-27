import { useCallback, useEffect, useState } from "react";

import handleClientError from "../../../components/common/HandleClientError/HandleClientError";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import { IFeedback } from "../../../shared/business/feedbacks/feedback.interface";
import {
  ITableStateRequest,
  ITableStateResponse,
} from "../../../shared/utils/table/table-state.interface";

export const useFindFeedbacksByManagerTableState = (
  tableState?: ITableStateRequest<IFeedback>,
): {
  isLoading: boolean;
  feedbacks: IFeedback[];
  total: number;
  refetch: () => Promise<void>;
} => {
  const [feedbacks, setFeedbacks] = useState<IFeedback[]>([]);

  const [total, setTotal] = useState<number>(0);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchFindFeedbacks = useCallback(async () => {
    try {
      setIsLoading(true);

      const response: ITableStateResponse<IFeedback[]> =
        await serviceMethodsInstance.managerFeedbacksServiceMethods.findByTableState(
          tableState,
        );

      setFeedbacks(response.data);
      setTotal(response.total);
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  }, [tableState]);

  useEffect(() => {
    fetchFindFeedbacks();
  }, [fetchFindFeedbacks]);

  return { isLoading, feedbacks, total, refetch: fetchFindFeedbacks };
};
