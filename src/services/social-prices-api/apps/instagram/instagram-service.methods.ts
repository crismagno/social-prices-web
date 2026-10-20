"use client";

import {
  IInstagramChat,
  IInstagramConnection,
  IInstagramMessage,
} from "../../../../shared/business/apps/instagram/instagram.types";
import ServiceMethodsBase from "../../service-methods.base";
import InstagramServiceEnum from "./instagram-service.enum";

export default class InstagramServiceMethods extends ServiceMethodsBase {
  private _headers() {
    return {
      "Content-Type": "application/json",
      Authorization: this.formatAuthorizationWithToken(),
    };
  }

  private _url(path: string, igsid?: string): string {
    return `${this._socialPricesApiV1}${
      igsid === undefined ? path : path.replace(":igsid", igsid)
    }`;
  }

  // The address of Instagram's login; the browser goes there.
  public async connect(): Promise<{ url: string }> {
    const response = await this._fetchAxios.post<{ url: string }>(
      this._url(InstagramServiceEnum.Methods.CONNECT),
      {},
      { headers: this._headers() },
    );

    return response.data;
  }

  public async getConnection(): Promise<IInstagramConnection> {
    const response = await this._fetchAxios.get<IInstagramConnection>(
      this._url(InstagramServiceEnum.Methods.CONNECTION),
      { headers: this._headers() },
    );

    return response.data;
  }

  public async disconnect(): Promise<void> {
    await this._fetchAxios.delete(
      this._url(InstagramServiceEnum.Methods.CONNECTION),
      { headers: this._headers() },
    );
  }

  public async listChats(): Promise<IInstagramChat[]> {
    const response = await this._fetchAxios.get<IInstagramChat[]>(
      this._url(InstagramServiceEnum.Methods.CHATS),
      { headers: this._headers() },
    );

    return response.data;
  }

  // Newest first. `before` is the id of the oldest message already loaded.
  public async getChatMessages(
    igsid: string,
    options: { limit?: number; before?: string } = {},
  ): Promise<IInstagramMessage[]> {
    const response = await this._fetchAxios.get<IInstagramMessage[]>(
      this._url(InstagramServiceEnum.Methods.CHAT_MESSAGES, igsid),
      { headers: this._headers(), params: options },
    );

    return response.data;
  }

  public async sendMessage(
    igsid: string,
    text: string,
  ): Promise<IInstagramMessage> {
    const response = await this._fetchAxios.post<IInstagramMessage>(
      this._url(InstagramServiceEnum.Methods.CHAT_MESSAGES, igsid),
      { text },
      { headers: this._headers() },
    );

    return response.data;
  }

  public async markRead(igsid: string): Promise<void> {
    await this._fetchAxios.post(
      this._url(InstagramServiceEnum.Methods.CHAT_READ, igsid),
      {},
      { headers: this._headers() },
    );
  }

  public async linkCustomer(
    igsid: string,
    customerId: string,
  ): Promise<IInstagramChat> {
    const response = await this._fetchAxios.post<IInstagramChat>(
      this._url(InstagramServiceEnum.Methods.CHAT_CUSTOMER, igsid),
      { customerId },
      { headers: this._headers() },
    );

    return response.data;
  }

  public async createCustomer(igsid: string): Promise<IInstagramChat> {
    const response = await this._fetchAxios.post<IInstagramChat>(
      this._url(InstagramServiceEnum.Methods.CHAT_CUSTOMER_CREATE, igsid),
      {},
      { headers: this._headers() },
    );

    return response.data;
  }

  public async unlinkCustomer(igsid: string): Promise<IInstagramChat> {
    const response = await this._fetchAxios.delete<IInstagramChat>(
      this._url(InstagramServiceEnum.Methods.CHAT_CUSTOMER, igsid),
      { headers: this._headers() },
    );

    return response.data;
  }

  // The bytes of a message's file. An <img> cannot send the token, hence a blob.
  public async getAttachment(
    igsid: string,
    messageId: string,
    index: number,
  ): Promise<Blob> {
    const response = await this._fetchAxios.get<Blob>(
      this._url(
        InstagramServiceEnum.Methods.ATTACHMENT.replace(
          ":messageId",
          messageId,
        ).replace(":index", String(index)),
        igsid,
      ),
      { headers: this._headers(), responseType: "blob" },
    );

    return response.data;
  }
}
