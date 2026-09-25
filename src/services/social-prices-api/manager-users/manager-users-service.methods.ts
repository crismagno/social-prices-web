"use client";

import { IUserLimits } from "../../../shared/business/users/user-limits.interface";
import IUser from "../../../shared/business/users/user.interface";
import {
  ITableStateRequest,
  ITableStateResponse,
} from "../../../shared/utils/table/table-state.interface";
import ServiceMethodsBase from "../service-methods.base";
import ManagerUsersServiceEnum from "./manager-users-service.enum";

export default class ManagerUsersServiceMethods extends ServiceMethodsBase {
  public async findByTableState(
    tableState?: ITableStateRequest<IUser>
  ): Promise<ITableStateResponse<IUser[]>> {
    const response = await this._fetchAxios.post<ITableStateResponse<IUser[]>>(
      `${this._socialPricesApiV1}${ManagerUsersServiceEnum.Methods.FIND_BY_TABLE_STATE}`,
      tableState,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: this.formatManagerAuthorizationWithToken(),
        },
      }
    );

    return response.data;
  }

  public async findById(userId: string): Promise<IUser> {
    const response = await this._fetchAxios.get<IUser>(
      `${this._socialPricesApiV1}${ManagerUsersServiceEnum.Methods.FIND_BY_ID.replace(":id", userId)}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: this.formatManagerAuthorizationWithToken(),
        },
      }
    );

    return response.data;
  }

  public async update(userId: string, body: Partial<IUser>): Promise<IUser> {
    const response = await this._fetchAxios.patch<IUser>(
      `${this._socialPricesApiV1}${ManagerUsersServiceEnum.Methods.UPDATE.replace(":id", userId)}`,
      body,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: this.formatManagerAuthorizationWithToken(),
        },
      }
    );

    return response.data;
  }

  public async updateLimits(
    userId: string,
    limits: IUserLimits
  ): Promise<IUser> {
    const response = await this._fetchAxios.patch<IUser>(
      `${this._socialPricesApiV1}${ManagerUsersServiceEnum.Methods.UPDATE_LIMITS.replace(":id", userId)}`,
      limits,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: this.formatManagerAuthorizationWithToken(),
        },
      }
    );

    return response.data;
  }
}
