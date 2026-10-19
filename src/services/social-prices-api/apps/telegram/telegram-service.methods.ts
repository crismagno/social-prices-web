"use client";

import {
  ITelegramChat,
  ITelegramConnection,
  ITelegramMessage,
  ITelegramWebhookStatus,
} from "../../../../shared/business/apps/telegram/telegram.types";
import ServiceMethodsBase from "../../service-methods.base";
import TelegramServiceEnum from "./telegram-service.enum";

export default class TelegramServiceMethods extends ServiceMethodsBase {
  private _headers() {
    return {
      "Content-Type": "application/json",
      Authorization: this.formatAuthorizationWithToken(),
    };
  }

  private _url(path: string, chatId?: number): string {
    return `${this._socialPricesApiV1}${
      chatId === undefined ? path : path.replace(":chatId", String(chatId))
    }`;
  }

  public async connect(botToken: string): Promise<ITelegramConnection> {
    const response = await this._fetchAxios.post<ITelegramConnection>(
      this._url(TelegramServiceEnum.Methods.CONNECT),
      { botToken },
      { headers: this._headers() },
    );

    return response.data;
  }

  public async getConnection(): Promise<ITelegramConnection> {
    const response = await this._fetchAxios.get<ITelegramConnection>(
      this._url(TelegramServiceEnum.Methods.CONNECTION),
      { headers: this._headers() },
    );

    return response.data;
  }

  public async getWebhookStatus(): Promise<ITelegramWebhookStatus> {
    const response = await this._fetchAxios.get<ITelegramWebhookStatus>(
      this._url(TelegramServiceEnum.Methods.WEBHOOK_STATUS),
      { headers: this._headers() },
    );

    return response.data;
  }

  // Registers the webhook again with the token already kept.
  public async refreshWebhook(): Promise<ITelegramWebhookStatus> {
    const response = await this._fetchAxios.post<ITelegramWebhookStatus>(
      this._url(TelegramServiceEnum.Methods.REFRESH_WEBHOOK),
      {},
      { headers: this._headers() },
    );

    return response.data;
  }

  public async disconnect(): Promise<void> {
    await this._fetchAxios.delete(
      this._url(TelegramServiceEnum.Methods.CONNECTION),
      { headers: this._headers() },
    );
  }

  public async listChats(): Promise<ITelegramChat[]> {
    const response = await this._fetchAxios.get<ITelegramChat[]>(
      this._url(TelegramServiceEnum.Methods.CHATS),
      { headers: this._headers() },
    );

    return response.data;
  }

  // Newest first. `before` is the id of the oldest message already loaded.
  public async getChatMessages(
    chatId: number,
    options: { limit?: number; before?: string } = {},
  ): Promise<ITelegramMessage[]> {
    const response = await this._fetchAxios.get<ITelegramMessage[]>(
      this._url(TelegramServiceEnum.Methods.CHAT_MESSAGES, chatId),
      { headers: this._headers(), params: options },
    );

    return response.data;
  }

  public async sendMessage(
    chatId: number,
    text: string,
  ): Promise<ITelegramMessage> {
    const response = await this._fetchAxios.post<ITelegramMessage>(
      this._url(TelegramServiceEnum.Methods.CHAT_MESSAGES, chatId),
      { text },
      { headers: this._headers() },
    );

    return response.data;
  }

  // Removes it for the customer too; Telegram only allows that for 48 hours.
  public async deleteMessage(chatId: number, messageId: string): Promise<void> {
    await this._fetchAxios.delete(
      this._url(
        TelegramServiceEnum.Methods.CHAT_MESSAGE.replace(
          ":messageId",
          messageId,
        ),
        chatId,
      ),
      { headers: this._headers() },
    );
  }

  // The file is the message's attachment; the text, when there is one, its caption.
  public async sendMedia(
    chatId: number,
    file: File,
    caption: string,
    asVoice: boolean = false,
  ): Promise<ITelegramMessage> {
    const formData: FormData = new FormData();

    formData.append("file", file);

    if (asVoice) {
      formData.append("voice", "true");
    }

    if (caption.trim()) {
      formData.append("caption", caption);
    }

    const response = await this._fetchAxios.post<ITelegramMessage>(
      this._url(TelegramServiceEnum.Methods.CHAT_MEDIA, chatId),
      formData,
      { headers: { Authorization: this.formatAuthorizationWithToken() } },
    );

    return response.data;
  }

  // The bytes of a message's file. An <img> cannot send the token, hence a blob.
  public async getMedia(chatId: number, messageId: string): Promise<Blob> {
    const response = await this._fetchAxios.get<Blob>(
      this._url(
        TelegramServiceEnum.Methods.CHAT_MESSAGE_MEDIA.replace(
          ":messageId",
          messageId,
        ),
        chatId,
      ),
      { headers: this._headers(), responseType: "blob" },
    );

    return response.data;
  }

  public async markRead(chatId: number): Promise<void> {
    await this._fetchAxios.post(
      this._url(TelegramServiceEnum.Methods.CHAT_READ, chatId),
      {},
      { headers: this._headers() },
    );
  }

  public async linkCustomer(
    chatId: number,
    customerId: string,
  ): Promise<ITelegramChat> {
    const response = await this._fetchAxios.post<ITelegramChat>(
      this._url(TelegramServiceEnum.Methods.CHAT_CUSTOMER, chatId),
      { customerId },
      { headers: this._headers() },
    );

    return response.data;
  }

  public async createCustomer(chatId: number): Promise<ITelegramChat> {
    const response = await this._fetchAxios.post<ITelegramChat>(
      this._url(TelegramServiceEnum.Methods.CHAT_CUSTOMER_CREATE, chatId),
      {},
      { headers: this._headers() },
    );

    return response.data;
  }

  public async unlinkCustomer(chatId: number): Promise<ITelegramChat> {
    const response = await this._fetchAxios.delete<ITelegramChat>(
      this._url(TelegramServiceEnum.Methods.CHAT_CUSTOMER, chatId),
      { headers: this._headers() },
    );

    return response.data;
  }
}
