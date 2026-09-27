"use client";

import { INote } from "../../../shared/business/notes/note.interface";
import NotesEnum from "../../../shared/business/notes/notes.enum";
import {
  INoteCalendarMarker,
  INoteFilters,
} from "../../../shared/business/notes/notes.types";
import {
  ITableStateRequest,
  ITableStateResponse,
} from "../../../shared/utils/table/table-state.interface";
import ServiceMethodsBase from "../service-methods.base";
import CreateNoteDto from "./dto/createNote.dto";
import NotesServiceEnum from "./notes-service.enum";

export default class NotesServiceMethods extends ServiceMethodsBase {
  private _headers() {
    return {
      "Content-Type": "application/json",
      Authorization: this.formatAuthorizationWithToken(),
    };
  }

  public async create(dto: CreateNoteDto): Promise<INote> {
    const response = await this._fetchAxios.post<INote>(
      `${this._socialPricesApiV1}${NotesServiceEnum.Methods.CREATE}`,
      dto,
      { headers: this._headers() },
    );

    return response.data;
  }

  public async update(id: string, dto: CreateNoteDto): Promise<INote> {
    const response = await this._fetchAxios.put<INote>(
      `${this._socialPricesApiV1}${NotesServiceEnum.Methods.UPDATE.replace(":id", id)}`,
      dto,
      { headers: this._headers() },
    );

    return response.data;
  }

  public async updateStatus(
    id: string,
    status: NotesEnum.Status,
  ): Promise<INote> {
    const response = await this._fetchAxios.patch<INote>(
      `${this._socialPricesApiV1}${NotesServiceEnum.Methods.UPDATE_STATUS.replace(":id", id)}`,
      { status },
      { headers: this._headers() },
    );

    return response.data;
  }

  public async remove(id: string): Promise<void> {
    await this._fetchAxios.delete<void>(
      `${this._socialPricesApiV1}${NotesServiceEnum.Methods.REMOVE.replace(":id", id)}`,
      { headers: this._headers() },
    );
  }

  public async findByUserTableState(
    tableState?: ITableStateRequest<INote>,
  ): Promise<ITableStateResponse<INote[]>> {
    const response = await this._fetchAxios.post<ITableStateResponse<INote[]>>(
      `${this._socialPricesApiV1}${NotesServiceEnum.Methods.FIND_BY_USER_TABLE_STATE}`,
      tableState,
      { headers: this._headers() },
    );

    return response.data;
  }

  public async calendarMarkers(request: {
    search?: string;
    filters?: INoteFilters;
    monthStart: string;
    monthEnd: string;
  }): Promise<INoteCalendarMarker[]> {
    const response = await this._fetchAxios.post<INoteCalendarMarker[]>(
      `${this._socialPricesApiV1}${NotesServiceEnum.Methods.CALENDAR_MARKERS}`,
      request,
      { headers: this._headers() },
    );

    return response.data;
  }
}
