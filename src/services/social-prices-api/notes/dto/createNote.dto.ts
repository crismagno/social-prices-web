import NotesEnum from "../../../../shared/business/notes/notes.enum";

export default interface CreateNoteDto {
  title: string;
  text: string;
  color: string | null;
  date: string;
  status: NotesEnum.Status;
  tagsIds: string[];
  categoriesIds: string[];
  customerIds: string[];
  saleIds: string[];
  storeIds: string[];
}
