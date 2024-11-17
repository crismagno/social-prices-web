import { useCallback, useEffect, useState } from "react";

import handleClientError from "../../components/common/handleClientError/handleClientError";
import { serviceMethodsInstance } from "../../services/social-prices-api/ServiceMethods";
import { IFileUpload } from "../../shared/business/files-uploads/file-upload.interface";

export const useFindFileUploadById = (
  fileUploadId: string
): {
  isLoading: boolean;
  fileUpload: IFileUpload | null;
  fetchFindFileUploadById: () => Promise<void>;
} => {
  const [fileUpload, setFileUpload] = useState<IFileUpload | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchFindFileUploadById = useCallback(async () => {
    try {
      setIsLoading(true);

      const response: IFileUpload | null =
        await serviceMethodsInstance.filesUploadsServiceMethods.findById(
          fileUploadId
        );

      setFileUpload(response);
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  }, [fileUploadId]);

  useEffect(() => {
    fetchFindFileUploadById();
  }, [fetchFindFileUploadById]);

  return {
    isLoading,
    fileUpload,
    fetchFindFileUploadById,
  };
};
