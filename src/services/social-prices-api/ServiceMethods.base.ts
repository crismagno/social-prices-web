"use client";

import IUser from "../../shared/business/users/user.interface";
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
    const user: IUser | null = this.getUser();

    if (!user) {
      throw new Error(
        "Unauthorized user not found! Please contact the support. Code: UUNT"
      );
    }

    const token: string | null = user.authToken;

    if (!token) {
      throw new Error(
        "Unauthorized user! Please contact the support. Code: UNT"
      );
    }

    return this.formatAuthorization(token);
  }

  public getUser = (): IUser | null => {
    const user: IUser | null = LocalStorageUserMethods.getUser();

    return user;
  };

  public getOwnerUserOrFail = (): IUser => {
    const user: IUser | null = LocalStorageUserMethods.getUser();

    if (!user) {
      throw new Error(
        "User not found[1]! Please contact the support. Code: UONT"
      );
    }

    return user;
  };
}
