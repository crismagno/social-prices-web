"use client";

import { IManager } from "../../../shared/business/managers/manager.interface";
import {
  ITableStateRequest,
  ITableStateResponse,
} from "../../../shared/utils/table/table-state.interface";
import ServiceMethodsBase from "../service-methods.base";
import CreateManagerDto from "./dto/createManager.dto";
import UpdateManagerDto from "./dto/updateManager.dto";
import ManagersServiceEnum from "./managers-service.enum";

export default class ManagersServiceMethods extends ServiceMethodsBase {
  public async findByTableState(
    tableState?: ITableStateRequest<IManager>
  ): Promise<ITableStateResponse<IManager[]>> {
    const response = await this._fetchAxios.post<
      ITableStateResponse<IManager[]>
    >(
      `${this._socialPricesApiV1}${ManagersServiceEnum.Methods.FIND_BY_TABLE_STATE}`,
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

  public async findById(managerId: string): Promise<IManager> {
    const response = await this._fetchAxios.get<IManager>(
      `${
        this._socialPricesApiV1
      }${ManagersServiceEnum.Methods.FIND_BY_ID.replace(
        ":managerId",
        managerId
      )}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: this.formatManagerAuthorizationWithToken(),
        },
      }
    );

    return response.data;
  }

  public async create(createManagerDto: CreateManagerDto): Promise<IManager> {
    const response = await this._fetchAxios.post<IManager>(
      `${this._socialPricesApiV1}${ManagersServiceEnum.Methods.CREATE}`,
      createManagerDto,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: this.formatManagerAuthorizationWithToken(),
        },
      }
    );

    return response.data;
  }

  public async update(updateManagerDto: UpdateManagerDto): Promise<IManager> {
    const response = await this._fetchAxios.put<IManager>(
      `${this._socialPricesApiV1}${ManagersServiceEnum.Methods.UPDATE}`,
      updateManagerDto,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: this.formatManagerAuthorizationWithToken(),
        },
      }
    );

    return response.data;
  }

  public async deleteManual(
    managerId: string,
    reason: string | null
  ): Promise<IManager> {
    const response = await this._fetchAxios.delete<IManager>(
      `${
        this._socialPricesApiV1
      }${ManagersServiceEnum.Methods.DELETE_MANUAL.replace(
        ":managerId",
        managerId
      )}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: this.formatManagerAuthorizationWithToken(),
        },
        data: { reason },
      }
    );

    return response.data;
  }

  public async activateManual(managerId: string): Promise<IManager> {
    const response = await this._fetchAxios.put<IManager>(
      `${
        this._socialPricesApiV1
      }${ManagersServiceEnum.Methods.ACTIVATE_MANUAL.replace(
        ":managerId",
        managerId
      )}`,
      {},
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
