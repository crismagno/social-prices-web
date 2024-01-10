"use client";

import IUser from "../../../shared/business/users/user.interface";
import ServiceMethodsBase from "../ServiceMethods.base";
import CreateStoreDto from "./dto/createStore.dto";
import StoresServiceEnum from "./stores-service.enum";

export default class StoresServiceMethods extends ServiceMethodsBase {
  public async create(createStoreDto: CreateStoreDto): Promise<IUser> {
    const response = await this._fetchAxios.post<IUser>(
      `${this._socialPricesApiV1}${StoresServiceEnum.Methods.CREATE}`,
      createStoreDto,
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
