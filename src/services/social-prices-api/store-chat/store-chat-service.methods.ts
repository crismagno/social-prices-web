"use client";

import {
  IStoreChatConversation,
  IStoreChatMessage,
  IStoreChatStarted,
  IStoreChatStoreCard,
} from "../../../shared/business/store-chat/store-chat.types";
import {
  ITableStateRequest,
  ITableStateResponse,
} from "../../../shared/utils/table/table-state.interface";
import ServiceMethodsBase from "../service-methods.base";
import StoreChatServiceEnum from "./store-chat-service.enum";

// The platform's own chat between a customer account and a store.
export default class StoreChatServiceMethods extends ServiceMethodsBase {
  private _headers() {
    return {
      "Content-Type": "application/json",
      Authorization: this.formatAuthorizationWithToken(),
    };
  }

  private _url(method: StoreChatServiceEnum.Methods, id?: string): string {
    return `${this._socialPricesApiV1}${method
      .replace(":storeId", encodeURIComponent(id ?? ""))
      .replace(":customerId", encodeURIComponent(id ?? ""))}`;
  }

  public async searchStores(
    tableState?: ITableStateRequest<IStoreChatStoreCard>,
  ): Promise<ITableStateResponse<IStoreChatStoreCard[]>> {
    const response = await this._fetchAxios.post<
      ITableStateResponse<IStoreChatStoreCard[]>
    >(this._url(StoreChatServiceEnum.Methods.STORES_SEARCH), tableState ?? {}, {
      headers: this._headers(),
    });

    return response.data;
  }

  public async findStore(storeId: string): Promise<IStoreChatStoreCard> {
    const response = await this._fetchAxios.get<IStoreChatStoreCard>(
      this._url(StoreChatServiceEnum.Methods.STORE, storeId),
      { headers: this._headers() },
    );

    return response.data;
  }

  public async listConversations(): Promise<IStoreChatConversation[]> {
    const response = await this._fetchAxios.get<IStoreChatConversation[]>(
      this._url(StoreChatServiceEnum.Methods.CONVERSATIONS),
      { headers: this._headers() },
    );

    return response.data;
  }

  // Newest first. `before` is the id of the oldest message already loaded.
  public async listMessages(
    storeId: string,
    before?: string,
  ): Promise<IStoreChatMessage[]> {
    const response = await this._fetchAxios.get<IStoreChatMessage[]>(
      this._url(StoreChatServiceEnum.Methods.MESSAGES, storeId),
      { headers: this._headers(), params: before ? { before } : undefined },
    );

    return response.data;
  }

  public async send(storeId: string, text: string): Promise<IStoreChatMessage> {
    const response = await this._fetchAxios.post<IStoreChatMessage>(
      this._url(StoreChatServiceEnum.Methods.MESSAGES, storeId),
      { text },
      { headers: this._headers() },
    );

    return response.data;
  }

  public async markRead(storeId: string): Promise<void> {
    await this._fetchAxios.post<void>(
      this._url(StoreChatServiceEnum.Methods.READ, storeId),
      {},
      { headers: this._headers() },
    );
  }

  public async countUnread(): Promise<number> {
    const response = await this._fetchAxios.get<number>(
      this._url(StoreChatServiceEnum.Methods.UNREAD_COUNT),
      { headers: this._headers() },
    );

    return Number(response.data) || 0;
  }

  // The store writes first, to a customer that has an account.
  public async startWithCustomer(
    customerId: string,
    storeId: string,
    text: string,
  ): Promise<IStoreChatStarted> {
    const response = await this._fetchAxios.post<IStoreChatStarted>(
      this._url(StoreChatServiceEnum.Methods.START_WITH_CUSTOMER, customerId),
      { storeId, text },
      { headers: this._headers() },
    );

    return response.data;
  }

  public async countOwnerUnread(): Promise<number> {
    const response = await this._fetchAxios.get<number>(
      this._url(StoreChatServiceEnum.Methods.OWNER_UNREAD_COUNT),
      { headers: this._headers() },
    );

    return Number(response.data) || 0;
  }
}
