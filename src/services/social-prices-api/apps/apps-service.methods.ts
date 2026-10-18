"use client";

import { IAppCatalogItem } from "../../../shared/business/apps/apps.types";
import ServiceMethodsBase from "../service-methods.base";
import AppsServiceEnum from "./apps-service.enum";

// The catalog only. Each app has its own service methods next to this one.
export default class AppsServiceMethods extends ServiceMethodsBase {
  public async findCatalog(): Promise<IAppCatalogItem[]> {
    const response = await this._fetchAxios.get<IAppCatalogItem[]>(
      `${this._socialPricesApiV1}${AppsServiceEnum.Methods.FIND_CATALOG}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: this.formatAuthorizationWithToken(),
        },
      },
    );

    return response.data;
  }
}
