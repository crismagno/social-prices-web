"use client";

import AppsEnum from "../../../shared/business/apps/apps.enum";
import {
  IAppCatalogItem,
  IAppImportResult,
  IAppSyncPreview,
} from "../../../shared/business/apps/apps.types";
import ServiceMethodsBase from "../service-methods.base";
import AppsServiceEnum from "./apps-service.enum";

export default class AppsServiceMethods extends ServiceMethodsBase {
  public async findCatalog(): Promise<IAppCatalogItem[]> {
    const response = await this._fetchAxios.get<IAppCatalogItem[]>(
      `${this._socialPricesApiV1}${AppsServiceEnum.Methods.FIND_CATALOG}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: this.formatAuthorizationWithToken(),
        },
      }
    );

    return response.data;
  }

  public async connect(appId: AppsEnum.App): Promise<{ url: string }> {
    const response = await this._fetchAxios.post<{ url: string }>(
      `${this._socialPricesApiV1}${AppsServiceEnum.Methods.CONNECT.replace(":appId", appId)}`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: this.formatAuthorizationWithToken(),
        },
      }
    );

    return response.data;
  }

  // Lists the provider's contacts and what already exists here; saves nothing.
  public async sync(appId: AppsEnum.App): Promise<IAppSyncPreview> {
    const response = await this._fetchAxios.post<IAppSyncPreview>(
      `${this._socialPricesApiV1}${AppsServiceEnum.Methods.SYNC.replace(":appId", appId)}`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: this.formatAuthorizationWithToken(),
        },
      }
    );

    return response.data;
  }

  public async importContacts(
    appId: AppsEnum.App,
    externalIds: string[]
  ): Promise<IAppImportResult> {
    const response = await this._fetchAxios.post<IAppImportResult>(
      `${this._socialPricesApiV1}${AppsServiceEnum.Methods.IMPORT.replace(":appId", appId)}`,
      { externalIds },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: this.formatAuthorizationWithToken(),
        },
      }
    );

    return response.data;
  }

  public async disconnect(appId: AppsEnum.App): Promise<void> {
    await this._fetchAxios.delete(
      `${this._socialPricesApiV1}${AppsServiceEnum.Methods.DISCONNECT.replace(":appId", appId)}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: this.formatAuthorizationWithToken(),
        },
      }
    );
  }
}
