import { useCallback, useEffect, useState } from "react";

import handleClientError from "../../components/common/HandleClientError/HandleClientError";
import { serviceMethodsInstance } from "../../services/social-prices-api/service-methods";
import { INote } from "../../shared/business/notes/note.interface";
import { INoteFilters } from "../../shared/business/notes/notes.types";
import { createTableState } from "../../shared/utils/table/table-state";

// A week holds far fewer notes than this; it only keeps one request bounded.
const MAX_NOTES_IN_RANGE: number = 500;

/**
 * Every note between two moments, earliest first, under the same search and
 * filters as the grid: what the hours of the calendar show. Nothing is asked
 * while `isEnabled` is false.
 */
export const useNotesInRange = (request: {
  start: string;
  end: string;
  search?: string;
  filters: INoteFilters;
  isEnabled: boolean;
}): {
  isLoading: boolean;
  notes: INote[];
  refetch: () => Promise<void>;
} => {
  const [notes, setNotes] = useState<INote[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { start, end, search, filters, isEnabled } = request;

  const fetchNotes = useCallback(async () => {
    if (!isEnabled) {
      return;
    }

    try {
      setIsLoading(true);

      const response =
        await serviceMethodsInstance.notesServiceMethods.findByUserTableState(
          createTableState({
            search,
            // The range of the view wins over a day picked on the month.
            filters: {
              ...filters,
              rangeDate: { startDate: new Date(start), endDate: new Date(end) },
            } as any,
            sort: { field: "date", order: "ascend" },
            pagination: {
              current: 1,
              pageSize: MAX_NOTES_IN_RANGE,
              total: 0,
              skip: 0,
            },
          }),
        );

      setNotes(response.data);
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  }, [start, end, search, filters, isEnabled]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  return { isLoading, notes, refetch: fetchNotes };
};
