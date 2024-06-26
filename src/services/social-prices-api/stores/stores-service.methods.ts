"use client";

import { IStore } from "../../../shared/business/stores/stores.interface";
import {
  ITableStateRequest,
  ITableStateResponse,
} from "../../../shared/utils/table/table-state.interface";
import ServiceMethodsBase from "../ServiceMethods.base";
import StoresServiceEnum from "./stores-service.enum";

export default class StoresServiceMethods extends ServiceMethodsBase {
  public async create(formData: FormData): Promise<IStore> {
    const response = await this._fetchAxios.post<IStore>(
      `${this._socialPricesApiV1}${StoresServiceEnum.Methods.CREATE}`,
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

  public async update(formData: FormData): Promise<IStore> {
    const response = await this._fetchAxios.put<IStore>(
      `${this._socialPricesApiV1}${StoresServiceEnum.Methods.UPDATE}`,
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

  public async findById(storeId: string): Promise<IStore> {
    const response = await this._fetchAxios.get<IStore>(
      `${this._socialPricesApiV1}${StoresServiceEnum.Methods.FIND_BY_ID.replace(
        ":storeId",
        storeId
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

  public async findByUserTableState(
    tableState?: ITableStateRequest<IStore>
  ): Promise<ITableStateResponse<IStore[]>> {
    const response = await this._fetchAxios.post<ITableStateResponse<IStore[]>>(
      `${this._socialPricesApiV1}${StoresServiceEnum.Methods.FIND_BY_USER_TABLE_STATE}`,
      tableState,
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
