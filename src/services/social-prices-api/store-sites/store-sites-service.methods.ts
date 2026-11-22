"use client";

import {
  ISaveStoreSite,
  IStoreSite,
} from "../../../shared/business/store-sites/store-site.interface";
import {
  ICreateSiteOrder,
  ISiteOrderCreated,
} from "../../../shared/business/store-sites/store-sites.types";
import ServiceMethodsBase from "../service-methods.base";
import StoreSitesServiceEnum from "./store-sites-service.enum";

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
}
