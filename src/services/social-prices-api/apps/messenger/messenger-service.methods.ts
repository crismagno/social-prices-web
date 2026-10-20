"use client";

import {
  IMessengerChat,
  IMessengerConnection,
  IMessengerMessage,
} from "../../../../shared/business/apps/messenger/messenger.types";
import ServiceMethodsBase from "../../service-methods.base";
import MessengerServiceEnum from "./messenger-service.enum";

export default class MessengerServiceMethods extends ServiceMethodsBase {
  private _headers() {
    return {
      "Content-Type": "application/json",
      Authorization: this.formatAuthorizationWithToken(),
    };
  }

  private _url(path: string, psid?: string): string {
    return `${this._socialPricesApiV1}${
      psid === undefined ? path : path.replace(":psid", psid)
    }`;
  }

  // The address of Facebook's login; the browser goes there.
  public async connect(): Promise<{ url: string }> {
    const response = await this._fetchAxios.post<{ url: string }>(
      this._url(MessengerServiceEnum.Methods.CONNECT),
      {},
      { headers: this._headers() },
    );

    return response.data;
  }

  public async getConnection(): Promise<IMessengerConnection> {
    const response = await this._fetchAxios.get<IMessengerConnection>(
      this._url(MessengerServiceEnum.Methods.CONNECTION),
      { headers: this._headers() },
    );

    return response.data;
  }

  // For a user whose login brought several Pages: connects the one picked.
  public async selectPage(pageId: string): Promise<IMessengerConnection> {
    const response = await this._fetchAxios.post<IMessengerConnection>(
      this._url(MessengerServiceEnum.Methods.CONNECTION_PAGE),
      { pageId },
      { headers: this._headers() },
    );

    return response.data;
  }

  public async disconnect(): Promise<void> {
    await this._fetchAxios.delete(
      this._url(MessengerServiceEnum.Methods.CONNECTION),
      { headers: this._headers() },
    );
  }

  public async listChats(): Promise<IMessengerChat[]> {
    const response = await this._fetchAxios.get<IMessengerChat[]>(
      this._url(MessengerServiceEnum.Methods.CHATS),
      { headers: this._headers() },
    );

    return response.data;
  }

  // Newest first. `before` is the id of the oldest message already loaded.
  public async getChatMessages(
    psid: string,
    options: { limit?: number; before?: string } = {},
  ): Promise<IMessengerMessage[]> {
    const response = await this._fetchAxios.get<IMessengerMessage[]>(
      this._url(MessengerServiceEnum.Methods.CHAT_MESSAGES, psid),
      { headers: this._headers(), params: options },
    );

    return response.data;
  }

  public async sendMessage(
    psid: string,
    text: string,
  ): Promise<IMessengerMessage> {
    const response = await this._fetchAxios.post<IMessengerMessage>(
      this._url(MessengerServiceEnum.Methods.CHAT_MESSAGES, psid),
      { text },
      { headers: this._headers() },
    );

    return response.data;
  }

  // A file or a recording. Facebook takes up to 25 MB, and a file carries no
  // caption: any text goes as a message of its own.
  public async sendAttachment(
    psid: string,
    file: File,
  ): Promise<IMessengerMessage> {
    const formData: FormData = new FormData();

    formData.append("file", file);

    const response = await this._fetchAxios.post<IMessengerMessage>(
      this._url(MessengerServiceEnum.Methods.CHAT_MEDIA, psid),
      formData,
      { headers: { Authorization: this.formatAuthorizationWithToken() } },
    );

    return response.data;
  }

  public async markRead(psid: string): Promise<void> {
    await this._fetchAxios.post(
      this._url(MessengerServiceEnum.Methods.CHAT_READ, psid),
      {},
      { headers: this._headers() },
    );
  }

  public async linkCustomer(
    psid: string,
    customerId: string,
  ): Promise<IMessengerChat> {
    const response = await this._fetchAxios.post<IMessengerChat>(
      this._url(MessengerServiceEnum.Methods.CHAT_CUSTOMER, psid),
      { customerId },
      { headers: this._headers() },
    );

    return response.data;
  }

  public async createCustomer(psid: string): Promise<IMessengerChat> {
    const response = await this._fetchAxios.post<IMessengerChat>(
      this._url(MessengerServiceEnum.Methods.CHAT_CUSTOMER_CREATE, psid),
      {},
      { headers: this._headers() },
    );

    return response.data;
  }

  public async unlinkCustomer(psid: string): Promise<IMessengerChat> {
    const response = await this._fetchAxios.delete<IMessengerChat>(
      this._url(MessengerServiceEnum.Methods.CHAT_CUSTOMER, psid),
      { headers: this._headers() },
    );

    return response.data;
  }

  // The bytes of a message's file. An <img> cannot send the token, hence a blob.
  public async getAttachment(
    psid: string,
    messageId: string,
    index: number,
  ): Promise<Blob> {
    const response = await this._fetchAxios.get<Blob>(
      this._url(
        MessengerServiceEnum.Methods.ATTACHMENT.replace(
          ":messageId",
          messageId,
        ).replace(":index", String(index)),
        psid,
      ),
      { headers: this._headers(), responseType: "blob" },
    );

    return response.data;
  }
}
