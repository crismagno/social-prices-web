"use client";

import LocalStorageUserMethods from "../../shared/common/local-storage/methods/local-storage-user.methods";
import FetchAxios from "../../shared/utils/fetch/fetch-axios";

export default abstract class ServiceMethodsBase {
  protected readonly _socialPricesApiV1: string;
  protected readonly _fetchAxios: FetchAxios;

  constructor() {
    this._socialPricesApiV1 = `${process.env.NEXT_PUBLIC_SOCIAL_PRICES_API_URL_V1}`;
    this._fetchAxios = new FetchAxios();
  }

  public formatAuthorization(token: string): string {
    return `Bearer ${token}`;
  }

  public formatAuthorizationWithToken(): string {
    const token: string | null = LocalStorageUserMethods.getUserToken();

    if (!token) {
      throw new Error("Unauthorized! Please contact the support. Code: UNT");
    }

    return this.formatAuthorization(token);
  }
}
