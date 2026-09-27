import { useCallback, useEffect, useState } from "react";

import handleClientError from "../../components/common/HandleClientError/HandleClientError";
import { serviceMethodsInstance } from "../../services/social-prices-api/service-methods";
import { INoteCalendarMarker } from "../../shared/business/notes/notes.types";

export const useNotesCalendarMarkers = (request: {
  search?: string;
  filters?: any;
  monthStart: string;
  monthEnd: string;
}): {
  isLoading: boolean;
  markers: INoteCalendarMarker[];
  refetch: () => Promise<void>;
} => {
  const [markers, setMarkers] = useState<INoteCalendarMarker[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchMarkers = useCallback(async () => {
    try {
      setIsLoading(true);

      setMarkers(
        await serviceMethodsInstance.notesServiceMethods.calendarMarkers(
          request,
        ),
      );
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  }, [request]);

  useEffect(() => {
    fetchMarkers();
  }, [fetchMarkers]);

  return { isLoading, markers, refetch: fetchMarkers };
};
