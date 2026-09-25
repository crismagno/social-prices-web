"use client";

import { IFeaturesUsage } from "../../../shared/business/users/user-limits.interface";
import ServiceMethodsBase from "../service-methods.base";
import AccountServiceEnum from "./account-service.enum";

export default class AccountServiceMethods extends ServiceMethodsBase {
  public async getFeaturesUsage(): Promise<IFeaturesUsage> {
    const response = await this._fetchAxios.get<IFeaturesUsage>(
      `${this._socialPricesApiV1}${AccountServiceEnum.Methods.FEATURES_USAGE}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: this.formatAuthorizationWithToken(),
        },
      }
    );

    return response.data;
  }
}
