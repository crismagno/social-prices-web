"use client";

import IUser from "../../../shared/business/users/user.interface";
import ServiceMethodsBase from "../ServiceMethods.base";
import RecoverPasswordDto from "./dto/recoverPassword.dto";
import UpdateEmailDto from "./dto/updateEmail.dto";
import UpdateUserDto from "./dto/updateUser.dto";
import UpdateUserAddressesDto from "./dto/updateUserAddresses.dto";
import UpdateUserPhoneNumbersDto from "./dto/updateUserPhoneNumbers.dto";
import UsersServiceEnum from "./users-service.enum";

export default class UsersServiceMethods extends ServiceMethodsBase {
  public async getUser(): Promise<IUser> {
    const response = await this._fetchAxios.get<IUser>(
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
    const response = await this._fetchAxios.get<IUser>(
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
    const response = await this._fetchAxios.get<IUser>(
      `${
        this._socialPricesApiV1
      }${UsersServiceEnum.Methods.SEND_RECOVER_PASSWORD_CODE.replace(
        ":email",
        email
      )}`
    );

    return response.data;
  }

  public async recoverPassword(
    recoverPasswordDto: RecoverPasswordDto
  ): Promise<IUser> {
    const response = await this._fetchAxios.post<IUser>(
      `${this._socialPricesApiV1}${UsersServiceEnum.Methods.RECOVER_PASSWORD}`,
      recoverPasswordDto
    );

    return response.data;
  }

  public async updateUser(updateUserDto: UpdateUserDto): Promise<IUser> {
    const response = await this._fetchAxios.post<IUser>(
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
    const response = await this._fetchAxios.post<IUser>(
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
    const response = await this._fetchAxios.post<IUser>(
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

  public async uploadAvatar(formData: FormData): Promise<IUser> {
    const response = await this._fetchAxios.post<IUser>(
      `${this._socialPricesApiV1}${UsersServiceEnum.Methods.UPLOAD_AVATAR}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: this.formatAuthorizationWithToken(),
        },
      }
    );

    return response.data;
  }

  public async removeAvatar(): Promise<IUser> {
    const response = await this._fetchAxios.delete<IUser>(
      `${this._socialPricesApiV1}${UsersServiceEnum.Methods.REMOVE_AVATAR}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: this.formatAuthorizationWithToken(),
        },
      }
    );

    return response.data;
  }

  public async getAvatarImage(filename: string): Promise<any> {
    const response = await this._fetchAxios.get<any>(
      `${this._socialPricesApiV1}${UsersServiceEnum.Methods.GET_AVATAR_IMAGE}/${filename}`,
      {
        headers: {
          Authorization: this.formatAuthorizationWithToken(),
        },
      }
    );

    return response.data;
  }

  public async sendUpdateEmailCode(email: string): Promise<IUser> {
    const response = await this._fetchAxios.get<IUser>(
      `${
        this._socialPricesApiV1
      }${UsersServiceEnum.Methods.SEND_UPDATE_EMAIL_CODE.replace(
        ":email",
        email
      )}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: this.formatAuthorizationWithToken(),
        },
      }
    );

    return response.data;
  }

  public async updateEmail(updateEmailDto: UpdateEmailDto): Promise<IUser> {
    const response = await this._fetchAxios.post<IUser>(
      `${this._socialPricesApiV1}${UsersServiceEnum.Methods.UPDATE_EMAIL}`,
      updateEmailDto,
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
