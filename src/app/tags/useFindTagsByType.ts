import { useCallback, useEffect, useState } from "react";

import handleClientError from "../../components/common/HandleClientError/HandleClientError";
import { serviceMethodsInstance } from "../../services/social-prices-api/service-methods";
import TagsEnum from "../../shared/business/tags/tags.enum";
import { ITag } from "../../shared/business/tags/tags.interface";

export const useFindTagsByType = (
  type: TagsEnum.Type
): {
  isLoading: boolean;
  tags: ITag[];
  fetchFindTagsByType: () => Promise<void>;
} => {
  const [tags, setTags] = useState<ITag[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchFindTagsByType = useCallback(async () => {
    try {
      setIsLoading(true);

      const response: ITag[] =
        await serviceMethodsInstance.tagsServiceMethods.findByType(type);

      setTags(response);
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchFindTagsByType();
  }, [fetchFindTagsByType]);

  return {
    isLoading,
    tags,
    fetchFindTagsByType,
  };
};
