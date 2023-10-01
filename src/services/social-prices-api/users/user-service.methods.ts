"use client";

import IUser from "../../../shared/business/users/user.interface";
import ServiceMethodsBase from "../ServiceMethods.base";
import RecoverPasswordDto from "./dto/recoverPassword.dto";
import UsersServiceEnum from "./user-service.enum";

export default class UsersServiceMethods extends ServiceMethodsBase {
  public async getUserByToken(token: string): Promise<IUser> {
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
  }

  public async sendRecoverPasswordCode(email: string): Promise<IUser> {
    const response = await this._fetchAxios.get(
      `${this._socialPricesApiV1}${UsersServiceEnum.Methods.SEND_RECOVER_PASSWORD_CODE}/${email}`
    );

    return response.data;
  }

  public async recoverPassword(
    recoverPassword: RecoverPasswordDto
  ): Promise<IUser> {
    const response = await this._fetchAxios.post(
      `${this._socialPricesApiV1}${UsersServiceEnum.Methods.RECOVER_PASSWORD}`,
      recoverPassword
    );

    return response.data;
  }
}

export const usersServiceMethodsInstance = new UsersServiceMethods();
