import NotesEnum from "./notes.enum";

export interface INoteFilters {
  status?: NotesEnum.Status[];
  rangeDate?: { startDate?: Date | null; endDate?: Date | null };
  tagsIds?: string[];
  categoriesIds?: string[];
  customerIds?: string[];
  saleIds?: string[];
  storeIds?: string[];
}

export interface INoteCalendarMarker {
  date: string;
  pending: number;
  completed: number;
  cancelled: number;
  colors: string[];
}
