"use client";

import { message } from "antd";

import AuthEnum from "../../../shared/business/auth/auth.enum";
import {
  IAuthLogin,
  IAuthUserEmployee,
} from "../../../shared/business/auth/auth.types";
import { ISearchEmployee } from "../../../shared/business/employees/employees.types";
import ServiceMethodsBase from "../ServiceMethods.base";
import AuthServiceEnum from "./auth-service.enum";
import CreateUserDto from "./dto/createUser.dto";

export default class AuthServiceMethods extends ServiceMethodsBase {
  public async signIn(
    emailOrUsername: string,
    password: string
  ): Promise<IAuthLogin> {
    const response = await this._fetchAxios.post<IAuthLogin>(
      `${this._socialPricesApiV1}${AuthServiceEnum.Methods.SIGN_IN}`,
      {
        emailOrUsername,
        password,
      }
    );

    return response.data;
  }

  public async searchEmployees(
    emailOrUsername: string
  ): Promise<ISearchEmployee[]> {
    const response = await this._fetchAxios.get<ISearchEmployee[]>(
      `${
        this._socialPricesApiV1
      }${AuthServiceEnum.Methods.SEARCH_EMPLOYEES.replace(
        ":emailOrUsername",
        emailOrUsername
      )}`
    );

    return response.data;
  }

  public async signUp(createUserDto: CreateUserDto): Promise<IAuthLogin> {
    const response = await this._fetchAxios.post<IAuthLogin>(
      `${this._socialPricesApiV1}${AuthServiceEnum.Methods.SIGN_UP}`,
      createUserDto
    );

    return response.data;
  }

  public async validateToken(token: string): Promise<boolean> {
    try {
      const response = await this._fetchAxios.get<boolean>(
        `${this._socialPricesApiV1}${AuthServiceEnum.Methods.VALIDATE_TOKEN}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: this.formatAuthorization(token),
          },
        }
      );

      return response.data;
    } catch (error: any) {
      if (
        error?.response?.data?.error?.error ===
          AuthEnum.AuthErrors.UNAUTHORIZED ||
        error?.response?.status === AuthEnum.Status.Unauthorized ||
        error?.response?.statusText === AuthEnum.StatusText
      ) {
        return false;
      }

      message.error("Please reload page!");

      return true;
    }
  }

  public async validateSignInCode(
    token: string,
    codeValue: string
  ): Promise<boolean> {
    try {
      const response = await this._fetchAxios.get<boolean>(
        `${
          this._socialPricesApiV1
        }${AuthServiceEnum.Methods.VALIDATE_SIGN_IN_CODE.replace(
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

      return response.data;
    } catch (error: any) {
      return false;
    }
  }

  public async signInEmployee(
    username: string,
    password: string
  ): Promise<IAuthLogin> {
    const response = await this._fetchAxios.post<IAuthLogin>(
      `${this._socialPricesApiV1}${AuthServiceEnum.Methods.SIGN_IN_EMPLOYEE}`,
      {
        username,
        password,
      }
    );

    return response.data;
  }

  public async validateSignInEmployeeCode(
    token: string,
    codeValue: string
  ): Promise<boolean> {
    try {
      const response = await this._fetchAxios.get<boolean>(
        `${
          this._socialPricesApiV1
        }${AuthServiceEnum.Methods.VALIDATE_SIGN_IN_EMPLOYEE_CODE.replace(
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

      return response.data;
    } catch (error: any) {
      return false;
    }
  }

  public async getAuthUserEmployee(): Promise<IAuthUserEmployee> {
    const response = await this._fetchAxios.get<IAuthUserEmployee>(
      `${this._socialPricesApiV1}${AuthServiceEnum.Methods.GET_AUTH_USER_EMPLOYEE}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: this.formatAuthorizationWithToken(),
        },
      }
    );

    return response.data;
  }

  public async getAuthLoginByToken(authToken: string): Promise<IAuthLogin> {
    const response = await this._fetchAxios.get<IAuthLogin>(
      `${this._socialPricesApiV1}${AuthServiceEnum.Methods.GET_AUTH_LOGIN_BY_TOKEN}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: this.formatAuthorization(authToken),
        },
      }
    );

    return response.data;
  }
}
