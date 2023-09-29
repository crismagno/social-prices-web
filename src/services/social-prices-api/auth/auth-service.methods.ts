"use client";

import IUser from "../../../shared/business/users/user.interface";
import FetchAxios from "../../../shared/utils/fetch/fetch-axios";
import AuthServiceEnum from "./auth-service.enum";
import CreateUserDto from "./dto/createUser.dto";

export default class AuthServiceMethods {
  private readonly _socialPricesApiV1: string;
  private readonly _fetchAxios: FetchAxios;

  constructor() {
    this._socialPricesApiV1 = `${process.env.NEXT_PUBLIC_SOCIAL_PRICES_API_URL_V1}`;
    this._fetchAxios = new FetchAxios();
  }

  public async signIn(email: string, password: string): Promise<IUser> {
    const response = await this._fetchAxios.post(
      `${this._socialPricesApiV1}${AuthServiceEnum.Methods.SIGN_IN}`,
      {
        email,
        password,
      }
    );

    return response.data;
  }

  public async signUp(createUserDto: CreateUserDto): Promise<IUser> {
    const response = await this._fetchAxios.post(
      `${this._socialPricesApiV1}${AuthServiceEnum.Methods.SIGN_UP}`,
      createUserDto
    );

    return response.data;
  }

  public async validateToken(token: string): Promise<boolean> {
    try {
      const response = await this._fetchAxios.get(
        `${this._socialPricesApiV1}${AuthServiceEnum.Methods.VALIDATE_TOKEN}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      return false;
    }
  }

  public async validateSignInCode(
    token: string,
    codeValue: string
  ): Promise<boolean> {
    try {
      const response = await this._fetchAxios.get(
        `${this._socialPricesApiV1}${AuthServiceEnum.Methods.VALIDATE_SIGN_IN_CODE}/${codeValue}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      return false;
    }
  }
}

export const authServiceMethodsInstance = new AuthServiceMethods();
