import { useCallback, useEffect, useState } from "react";

import handleClientError from "../../components/common/HandleClientError/HandleClientError";
import { serviceMethodsInstance } from "../../services/social-prices-api/service-methods";
import { ITag } from "../../shared/business/tags/tags.interface";

export const useFindTagById = (
  tagId?: string
): {
  isLoading: boolean;
  tag: ITag | null;
  fetchFindTagById: () => Promise<void>;
} => {
  const [tag, setTag] = useState<ITag | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchFindTagById = useCallback(async () => {
    try {
      setIsLoading(true);

      if (tagId) {
        const response: ITag | null =
          await serviceMethodsInstance.tagsServiceMethods.findById(tagId);

        setTag(response);
      }
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  }, [tagId]);

  useEffect(() => {
    fetchFindTagById();
  }, [fetchFindTagById]);

  return {
    isLoading,
    tag,
    fetchFindTagById,
  };
};
