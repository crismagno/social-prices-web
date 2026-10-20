"use client";

import {
  IInboxChat,
  IInboxConversation,
  IInboxMessage,
  IInboxScope,
} from "../../../shared/business/inbox/inbox.types";
import ServiceMethodsBase from "../service-methods.base";
import InboxServiceEnum from "./inbox-service.enum";

export default class InboxServiceMethods extends ServiceMethodsBase {
  private _headers() {
    return {
      "Content-Type": "application/json",
      Authorization: this.formatAuthorizationWithToken(),
    };
  }

  private _url(path: string): string {
    return `${this._socialPricesApiV1}${path}`;
  }

  public async listChats(): Promise<IInboxChat[]> {
    const response = await this._fetchAxios.get<IInboxChat[]>(
      this._url(InboxServiceEnum.Methods.CHATS),
      { headers: this._headers() },
    );

    return response.data;
  }

  // Newest first. `before` is the id of the oldest message already loaded.
  public async getMessages(
    scope: IInboxScope,
    options: { limit?: number; before?: string } = {},
  ): Promise<IInboxMessage[]> {
    const response = await this._fetchAxios.get<IInboxMessage[]>(
      this._url(InboxServiceEnum.Methods.MESSAGES),
      { headers: this._headers(), params: { ...scope, ...options } },
    );

    return response.data;
  }

  // Removes it through its channel: Telegram deletes it for the customer too, the
  // others only take it out of the inbox.
  public async deleteMessage(messageId: string): Promise<void> {
    await this._fetchAxios.delete(
      this._url(
        InboxServiceEnum.Methods.MESSAGE.replace(":messageId", messageId),
      ),
      { headers: this._headers() },
    );
  }

  public async markRead(scope: IInboxScope): Promise<void> {
    await this._fetchAxios.post(
      this._url(InboxServiceEnum.Methods.READ),
      scope,
      { headers: this._headers() },
    );
  }

  // Ties a conversation to a customer, moves it to another one, or frees it
  // (null). Its whole history goes with it. Answers the row it ended up in.
  public async assignCustomer(
    conversationId: string,
    customerId: string | null,
  ): Promise<IInboxChat> {
    const response = await this._fetchAxios.post<IInboxChat>(
      this._url(
        InboxServiceEnum.Methods.CONVERSATION_CUSTOMER.replace(
          ":conversationId",
          conversationId,
        ),
      ),
      { customerId },
      { headers: this._headers() },
    );

    return response.data;
  }

  // Makes a customer out of the person of a conversation and ties it to them.
  public async createCustomer(conversationId: string): Promise<IInboxChat> {
    const response = await this._fetchAxios.post<IInboxChat>(
      this._url(
        InboxServiceEnum.Methods.CONVERSATION_CUSTOMER_CREATE.replace(
          ":conversationId",
          conversationId,
        ),
      ),
      {},
      { headers: this._headers() },
    );

    return response.data;
  }

  // Answers through the channel of that conversation.
  public async reply(
    conversationId: string,
    text: string,
  ): Promise<IInboxMessage> {
    const response = await this._fetchAxios.post<IInboxMessage>(
      this._url(
        InboxServiceEnum.Methods.CONVERSATION_MESSAGES.replace(
          ":conversationId",
          conversationId,
        ),
      ),
      { text },
      { headers: this._headers() },
    );

    return response.data;
  }

  // The conversations a customer has, for the buttons of their profile.
  public async getCustomerSummary(
    customerId: string,
  ): Promise<IInboxConversation[]> {
    const response = await this._fetchAxios.get<IInboxConversation[]>(
      this._url(
        InboxServiceEnum.Methods.CUSTOMER_SUMMARY.replace(
          ":customerId",
          customerId,
        ),
      ),
      { headers: this._headers() },
    );

    return response.data;
  }

  // The bytes of a message's file. An <img> cannot send the token, hence a blob.
  public async getAttachment(messageId: string, index: number): Promise<Blob> {
    const response = await this._fetchAxios.get<Blob>(
      this._url(
        InboxServiceEnum.Methods.ATTACHMENT.replace(
          ":messageId",
          messageId,
        ).replace(":index", String(index)),
      ),
      { headers: this._headers(), responseType: "blob" },
    );

    return response.data;
  }
}
