"use client";

import {
  ISaveStoreSite,
  IStoreSite,
} from "../../../shared/business/store-sites/store-site.interface";
import {
  ICreateSiteOrder,
  ISiteOrderCreated,
} from "../../../shared/business/store-sites/store-sites.types";
import {
  ISiteChatMessage,
  ISiteChatVisitor,
  ISiteContactForm,
} from "../../../shared/business/store-sites/store-site-chat";
import ServiceMethodsBase from "../service-methods.base";
import StoreSitesServiceEnum from "./store-sites-service.enum";

/** The header a visitor's chat sends its secret in. */
const SITE_CHAT_TOKEN_HEADER = "x-site-chat-token";

export default class StoreSitesServiceMethods extends ServiceMethodsBase {
  private _url(
    method: StoreSitesServiceEnum.Methods,
    params: Record<string, string>,
  ): string {
    const path: string = Object.entries(params).reduce(
      (current: string, [key, value]: [string, string]) =>
        current.replace(`:${key}`, encodeURIComponent(value)),
      method as string,
    );

    return `${this._socialPricesApiV1}${path}`;
  }

  private _jsonHeaders(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      Authorization: this.formatAuthorizationWithToken(),
    };
  }

  public async findByStoreId(storeId: string): Promise<IStoreSite | null> {
    const response = await this._fetchAxios.get<IStoreSite | null>(
      this._url(StoreSitesServiceEnum.Methods.FIND_BY_STORE_ID, { storeId }),
      { headers: this._jsonHeaders() },
    );

    return response.data || null;
  }

  public async save(
    storeId: string,
    site: ISaveStoreSite,
  ): Promise<IStoreSite> {
    const response = await this._fetchAxios.put<IStoreSite>(
      this._url(StoreSitesServiceEnum.Methods.SAVE, { storeId }),
      site,
      { headers: this._jsonHeaders() },
    );

    return response.data;
  }

  public async isSlugAvailable(
    slug: string,
    storeId: string,
  ): Promise<boolean> {
    const response = await this._fetchAxios.get<{ available: boolean }>(
      `${this._url(StoreSitesServiceEnum.Methods.SLUG_AVAILABLE, {
        slug,
      })}?storeId=${encodeURIComponent(storeId)}`,
      { headers: this._jsonHeaders() },
    );

    return !!response.data?.available;
  }

  public async publish(storeId: string): Promise<IStoreSite> {
    const response = await this._fetchAxios.post<IStoreSite>(
      this._url(StoreSitesServiceEnum.Methods.PUBLISH, { storeId }),
      {},
      { headers: this._jsonHeaders() },
    );

    return response.data;
  }

  public async unpublish(storeId: string): Promise<IStoreSite> {
    const response = await this._fetchAxios.post<IStoreSite>(
      this._url(StoreSitesServiceEnum.Methods.UNPUBLISH, { storeId }),
      {},
      { headers: this._jsonHeaders() },
    );

    return response.data;
  }

  /** Stores one image and answers with its file key. */
  public async uploadImage(storeId: string, file: File): Promise<string> {
    const formData: FormData = new FormData();

    formData.append("files", file);

    const response = await this._fetchAxios.post<{ url: string }>(
      this._url(StoreSitesServiceEnum.Methods.UPLOAD_IMAGE, { storeId }),
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: this.formatAuthorizationWithToken(),
        },
      },
    );

    return response.data.url;
  }

  /** Stores one video (the about section) and answers with its file key. */
  public async uploadVideo(storeId: string, file: File): Promise<string> {
    const formData: FormData = new FormData();

    formData.append("files", file);

    const response = await this._fetchAxios.post<{ url: string }>(
      this._url(StoreSitesServiceEnum.Methods.UPLOAD_VIDEO, { storeId }),
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: this.formatAuthorizationWithToken(),
        },
      },
    );

    return response.data.url;
  }

  /** Sent by a visitor: no account, so no token. */
  public async createOrder(
    slug: string,
    order: ICreateSiteOrder,
  ): Promise<ISiteOrderCreated> {
    const response = await this._fetchAxios.post<ISiteOrderCreated>(
      this._url(StoreSitesServiceEnum.Methods.PUBLIC_CREATE_ORDER, { slug }),
      order,
      { headers: { "Content-Type": "application/json" } },
    );

    return response.data;
  }

  /** A visitor starts the chat of a site: answers with the secret of that chat. */
  public async startChat(
    slug: string,
    visitor: ISiteChatVisitor,
  ): Promise<string> {
    const response = await this._fetchAxios.post<{ token: string }>(
      this._url(StoreSitesServiceEnum.Methods.PUBLIC_CHAT_START, { slug }),
      visitor,
      { headers: { "Content-Type": "application/json" } },
    );

    return response.data.token;
  }

  /**
   * The form of the contact page. Answers with the secret of the conversation
   * when the site has its chat on, so the chat window can follow the answer.
   */
  public async sendContact(
    slug: string,
    form: ISiteContactForm,
  ): Promise<string | null> {
    const response = await this._fetchAxios.post<{ token: string | null }>(
      this._url(StoreSitesServiceEnum.Methods.PUBLIC_CHAT_CONTACT, { slug }),
      form,
      { headers: { "Content-Type": "application/json" } },
    );

    return response.data.token ?? null;
  }

  /** The visitor's conversation, oldest first. */
  public async listChat(
    slug: string,
    token: string,
  ): Promise<ISiteChatMessage[]> {
    const response = await this._fetchAxios.get<ISiteChatMessage[]>(
      this._url(StoreSitesServiceEnum.Methods.PUBLIC_CHAT_MESSAGES, { slug }),
      { headers: { [SITE_CHAT_TOKEN_HEADER]: token } },
    );

    return response.data;
  }

  public async sendChat(
    slug: string,
    token: string,
    text: string,
  ): Promise<ISiteChatMessage> {
    const response = await this._fetchAxios.post<ISiteChatMessage>(
      this._url(StoreSitesServiceEnum.Methods.PUBLIC_CHAT_MESSAGES, { slug }),
      { text },
      {
        headers: {
          "Content-Type": "application/json",
          [SITE_CHAT_TOKEN_HEADER]: token,
        },
      },
    );

    return response.data;
  }

  /** A file or a recording of the visitor, with its words when there are any. */
  public async sendChatMedia(
    slug: string,
    token: string,
    file: File,
    options: { caption: string | null; voice: boolean },
  ): Promise<ISiteChatMessage> {
    const body: FormData = new FormData();

    body.append("file", file, file.name);
    body.append("voice", String(options.voice));

    if (options.caption) {
      body.append("caption", options.caption);
    }

    const response = await this._fetchAxios.post<ISiteChatMessage>(
      this._url(StoreSitesServiceEnum.Methods.PUBLIC_CHAT_MEDIA, { slug }),
      body,
      { headers: { [SITE_CHAT_TOKEN_HEADER]: token } },
    );

    return response.data;
  }

  /** The bytes of one file of a message of the visitor's chat. */
  public async chatAttachment(
    slug: string,
    token: string,
    messageId: string,
    index: number,
  ): Promise<Blob> {
    const response = await this._fetchAxios.get<Blob>(
      this._url(StoreSitesServiceEnum.Methods.PUBLIC_CHAT_ATTACHMENT, {
        slug,
        messageId,
        index: String(index),
      }),
      {
        headers: { [SITE_CHAT_TOKEN_HEADER]: token },
        responseType: "blob",
      },
    );

    return response.data;
  }

  /** The visitor is writing: the store's inbox shows it. Best effort. */
  public async sendChatTyping(slug: string, token: string): Promise<void> {
    await this._fetchAxios.post(
      this._url(StoreSitesServiceEnum.Methods.PUBLIC_CHAT_TYPING, { slug }),
      {},
      { headers: { [SITE_CHAT_TOKEN_HEADER]: token } },
    );
  }

  /** Whether the store is writing to this visitor right now. */
  public async isStoreTyping(slug: string, token: string): Promise<boolean> {
    const response = await this._fetchAxios.get<{ isStoreTyping: boolean }>(
      this._url(StoreSitesServiceEnum.Methods.PUBLIC_CHAT_TYPING, { slug }),
      { headers: { [SITE_CHAT_TOKEN_HEADER]: token } },
    );

    return response.data?.isStoreTyping === true;
  }
}
