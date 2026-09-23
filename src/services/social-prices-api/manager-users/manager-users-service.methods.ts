"use client";

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
}
