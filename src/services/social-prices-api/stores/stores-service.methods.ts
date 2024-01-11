"use client";

import { IStore } from "../../../shared/business/stores/stores.interface";
import ServiceMethodsBase from "../ServiceMethods.base";
import CreateStoreDto from "./dto/createStore.dto";
import StoresServiceEnum from "./stores-service.enum";

export default class StoresServiceMethods extends ServiceMethodsBase {
  public async create(createStoreDto: CreateStoreDto): Promise<IStore> {
    const response = await this._fetchAxios.post<IStore>(
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

  public async findById(storeId: string): Promise<IStore> {
    const response = await this._fetchAxios.get<IStore>(
      `${this._socialPricesApiV1}${StoresServiceEnum.Methods.FIND_BY_ID}${storeId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: this.formatAuthorizationWithToken(),
        },
      }
    );

    return response.data;
  }

  public async findByUser(): Promise<IStore[]> {
    const response = await this._fetchAxios.get<IStore[]>(
      `${this._socialPricesApiV1}${StoresServiceEnum.Methods.FIND_BY_USER}`,
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
