"use client";

import {
  IQuickMessage,
  IQuickMessageAvailable,
  IQuickMessageFieldInfo,
  IQuickMessageSendResult,
  IQuickMessageUpsert,
} from "../../../shared/business/quick-messages/quick-messages.types";
import {
  ITableStateRequest,
  ITableStateResponse,
} from "../../../shared/utils/table/table-state.interface";
import ServiceMethodsBase from "../service-methods.base";
import QuickMessagesServiceEnum from "./quick-messages-service.enum";

export default class QuickMessagesServiceMethods extends ServiceMethodsBase {
  private _headers() {
    return {
      "Content-Type": "application/json",
      Authorization: this.formatAuthorizationWithToken(),
    };
  }

  private _url(path: string, id?: string): string {
    return `${this._socialPricesApiV1}${id ? path.replace(":id", id) : path}`;
  }

  // The message goes as JSON next to its new files.
  private _formData(data: IQuickMessageUpsert, files: File[]): FormData {
    const formData: FormData = new FormData();

    formData.append("data", JSON.stringify(data));

    files.forEach((file: File) => formData.append("files", file));

    return formData;
  }

  public async findByUserTableState(
    tableState?: ITableStateRequest<IQuickMessage>,
  ): Promise<ITableStateResponse<IQuickMessage[]>> {
    const response = await this._fetchAxios.post<
      ITableStateResponse<IQuickMessage[]>
    >(this._url(QuickMessagesServiceEnum.Methods.TABLE), tableState ?? {}, {
      headers: this._headers(),
    });

    return response.data;
  }

  public async getOne(id: string): Promise<IQuickMessage> {
    const response = await this._fetchAxios.get<IQuickMessage>(
      this._url(QuickMessagesServiceEnum.Methods.ONE, id),
      { headers: this._headers() },
    );

    return response.data;
  }

  public async create(
    data: IQuickMessageUpsert,
    files: File[],
  ): Promise<IQuickMessage> {
    const response = await this._fetchAxios.post<IQuickMessage>(
      this._url(QuickMessagesServiceEnum.Methods.BASE),
      this._formData(data, files),
      { headers: { Authorization: this.formatAuthorizationWithToken() } },
    );

    return response.data;
  }

  public async update(
    id: string,
    data: IQuickMessageUpsert,
    files: File[],
  ): Promise<IQuickMessage> {
    const response = await this._fetchAxios.put<IQuickMessage>(
      this._url(QuickMessagesServiceEnum.Methods.ONE, id),
      this._formData(data, files),
      { headers: { Authorization: this.formatAuthorizationWithToken() } },
    );

    return response.data;
  }

  public async remove(id: string, reason?: string): Promise<void> {
    await this._fetchAxios.patch(
      this._url(QuickMessagesServiceEnum.Methods.DELETE, id),
      { reason },
      { headers: this._headers() },
    );
  }

  public async activate(id: string): Promise<void> {
    await this._fetchAxios.patch(
      this._url(QuickMessagesServiceEnum.Methods.ACTIVATE, id),
      {},
      { headers: this._headers() },
    );
  }

  // The ones the signed-in person may send from the chat, most used first.
  public async listAvailable(): Promise<IQuickMessageAvailable[]> {
    const response = await this._fetchAxios.get<IQuickMessageAvailable[]>(
      this._url(QuickMessagesServiceEnum.Methods.AVAILABLE),
      { headers: this._headers() },
    );

    return response.data;
  }

  public async listFields(): Promise<IQuickMessageFieldInfo[]> {
    const response = await this._fetchAxios.get<IQuickMessageFieldInfo[]>(
      this._url(QuickMessagesServiceEnum.Methods.FIELDS),
      { headers: this._headers() },
    );

    return response.data;
  }

  public async send(
    id: string,
    conversationId: string,
  ): Promise<IQuickMessageSendResult> {
    const response = await this._fetchAxios.post<IQuickMessageSendResult>(
      this._url(QuickMessagesServiceEnum.Methods.SEND, id),
      { conversationId },
      { headers: this._headers() },
    );

    return response.data;
  }
}
