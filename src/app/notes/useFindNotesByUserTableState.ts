import { useCallback, useEffect, useState } from "react";

import handleClientError from "../../components/common/HandleClientError/HandleClientError";
import { serviceMethodsInstance } from "../../services/social-prices-api/service-methods";
import { INote } from "../../shared/business/notes/note.interface";
import {
  ITableStateRequest,
  ITableStateResponse,
} from "../../shared/utils/table/table-state.interface";

export const useFindNotesByUserTableState = (
  tableState?: ITableStateRequest<INote>,
): {
  isLoading: boolean;
  notes: INote[];
  total: number;
  refetch: () => Promise<void>;
} => {
  const [notes, setNotes] = useState<INote[]>([]);

  const [total, setTotal] = useState<number>(0);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchNotes = useCallback(async () => {
    try {
      setIsLoading(true);

      const response: ITableStateResponse<INote[]> =
        await serviceMethodsInstance.notesServiceMethods.findByUserTableState(
          tableState,
        );

      setNotes(response.data);
      setTotal(response.total);
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  }, [tableState]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  return { isLoading, notes, total, refetch: fetchNotes };
};
