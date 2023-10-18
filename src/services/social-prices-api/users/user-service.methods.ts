"use client";

import IUser from "../../../shared/business/users/user.interface";
import ServiceMethodsBase from "../ServiceMethods.base";
import RecoverPasswordDto from "./dto/recoverPassword.dto";
import UpdateUserDto from "./dto/updateUser.dto";
import UpdateUserAddressesDto from "./dto/updateUserAddresses.dto";
import UpdateUserPhoneNumbersDto from "./dto/updateUserPhoneNumbers.dto";
import UsersServiceEnum from "./user-service.enum";

export default class UsersServiceMethods extends ServiceMethodsBase {
  public async getUser(): Promise<IUser> {
    const response = await this._fetchAxios.get(
      `${this._socialPricesApiV1}${UsersServiceEnum.Methods.GET_USER}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: this.formatAuthorizationWithToken(),
        },
      }
    );

    return response.data;
  }

  public async getUserByToken(token: string): Promise<IUser> {
    const response = await this._fetchAxios.get(
      `${this._socialPricesApiV1}${UsersServiceEnum.Methods.GET_USER_BY_TOKEN}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: this.formatAuthorization(token),
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
    recoverPasswordDto: RecoverPasswordDto
  ): Promise<IUser> {
    const response = await this._fetchAxios.post(
      `${this._socialPricesApiV1}${UsersServiceEnum.Methods.RECOVER_PASSWORD}`,
      recoverPasswordDto
    );

    return response.data;
  }

  public async updateUser(updateUserDto: UpdateUserDto): Promise<IUser> {
    const response = await this._fetchAxios.post(
      `${this._socialPricesApiV1}${UsersServiceEnum.Methods.UPDATE_USER}`,
      updateUserDto,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: this.formatAuthorizationWithToken(),
        },
      }
    );

    return response.data;
  }

  public async updateUserPhoneNumbers(
    updateUserPhoneNumbersDto: UpdateUserPhoneNumbersDto
  ): Promise<IUser> {
    const response = await this._fetchAxios.post(
      `${this._socialPricesApiV1}${UsersServiceEnum.Methods.UPDATE_USER_PHONE_NUMBERS}`,
      updateUserPhoneNumbersDto,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: this.formatAuthorizationWithToken(),
        },
      }
    );

    return response.data;
  }

  public async updateUserAddresses(
    updateUserAddressesDto: UpdateUserAddressesDto
  ): Promise<IUser> {
    const response = await this._fetchAxios.post(
      `${this._socialPricesApiV1}${UsersServiceEnum.Methods.UPDATE_USER_ADDRESSES}`,
      updateUserAddressesDto,
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

export const usersServiceMethodsInstance = new UsersServiceMethods();
