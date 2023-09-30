"use client";

import IUser from "../../../shared/business/users/user.interface";
import ServiceMethodsBase from "../ServiceMethods.base";
import UsersServiceEnum from "./user-service.enum";

export default class UsersServiceMethods extends ServiceMethodsBase {
  public async getUserByToken(token: string): Promise<IUser> {
    try {
      const response = await this._fetchAxios.get(
        `${this._socialPricesApiV1}${UsersServiceEnum.Methods.GET_USER}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      throw error;
    }
  }
}

export const usersServiceMethodsInstance = new UsersServiceMethods();
