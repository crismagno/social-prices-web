"use client";

import { IManagerAuthLogin } from "../../../shared/business/managers/managers.types";
import ServiceMethodsBase from "../service-methods.base";
import RecoverManagerPasswordDto from "./dto/recoverManagerPassword.dto";
import ManagerAuthServiceEnum from "./manager-auth-service.enum";

export default class ManagerAuthServiceMethods extends ServiceMethodsBase {
  public async signIn(
    email: string,
    password: string
  ): Promise<IManagerAuthLogin> {
    const response = await this._fetchAxios.post<IManagerAuthLogin>(
      `${this._socialPricesApiV1}${ManagerAuthServiceEnum.Methods.SIGN_IN}`,
      {
        email,
        password,
      }
    );

    return response.data;
  }

  public async validateSignInCode(
    token: string,
    codeValue: string
  ): Promise<IManagerAuthLogin | null> {
    // A wrong code comes back as a 200 with no body (null). Anything else, such as
    // an inactive account (403) or an expired code (400), is thrown so the page can
    // show the API's own message instead of a generic "invalid code".
    const response = await this._fetchAxios.get<IManagerAuthLogin | null>(
      `${
        this._socialPricesApiV1
      }${ManagerAuthServiceEnum.Methods.VALIDATE_SIGN_IN_CODE.replace(
        ":codeValue",
        codeValue
      )}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: this.formatAuthorization(token),
        },
      }
    );

    return response.data || null;
  }

  public async getAuthManagerByToken(
    token: string
  ): Promise<IManagerAuthLogin> {
    const response = await this._fetchAxios.get<IManagerAuthLogin>(
      `${this._socialPricesApiV1}${ManagerAuthServiceEnum.Methods.GET_AUTH_MANAGER_BY_TOKEN}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: this.formatAuthorization(token),
        },
      }
    );

    return response.data;
  }

  public async sendRecoverPasswordCode(email: string): Promise<void> {
    const response = await this._fetchAxios.get<void>(
      `${
        this._socialPricesApiV1
      }${ManagerAuthServiceEnum.Methods.SEND_RECOVER_PASSWORD_CODE.replace(
        ":email",
        email
      )}`
    );

    return response.data;
  }

  public async recoverPassword(
    recoverManagerPasswordDto: RecoverManagerPasswordDto
  ): Promise<void> {
    const response = await this._fetchAxios.post<void>(
      `${this._socialPricesApiV1}${ManagerAuthServiceEnum.Methods.RECOVER_PASSWORD}`,
      recoverManagerPasswordDto
    );

    return response.data;
  }
}
