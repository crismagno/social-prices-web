import { useCallback, useEffect, useState } from "react";

import handleClientError from "../../components/common/handleClientError/handleClientError";
import { serviceMethodsInstance } from "../../services/social-prices-api/service-methods";
import { IFileUpload } from "../../shared/business/files-uploads/file-upload.interface";
import {
  ITableStateRequest,
  ITableStateResponse,
} from "../../shared/utils/table/table-state.interface";

export const useFindFilesUploadsByUserTableState = (
  tableState?: ITableStateRequest<IFileUpload>
): {
  isLoading: boolean;
  filesUploads: IFileUpload[];
  total: number;
  fetchFindFilesUploadsByUserTableState: () => Promise<void>;
} => {
  const [filesUploads, setFilesUploads] = useState<IFileUpload[]>([]);

  const [total, setTotal] = useState<number>(0);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchFindFilesUploadsByUserTableState = useCallback(async () => {
    try {
      setIsLoading(true);
      const response: ITableStateResponse<IFileUpload[]> =
        await serviceMethodsInstance.filesUploadsServiceMethods.findByUserTableState(
          tableState
        );

      if (tableState?.useConcat) {
        setFilesUploads((value) => [...value, ...response.data]);
      } else {
        setFilesUploads(response.data);
      }

      setTotal(response.total);
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  }, [tableState]);

  useEffect(() => {
    fetchFindFilesUploadsByUserTableState();
  }, [fetchFindFilesUploadsByUserTableState]);

  return {
    isLoading,
    total,
    filesUploads,
    fetchFindFilesUploadsByUserTableState,
  };
};
