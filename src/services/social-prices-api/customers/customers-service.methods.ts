"use client";

import { ICustomer } from "../../../shared/business/customers/customer.interface";
import {
  ITableStateRequest,
  ITableStateResponse,
} from "../../../shared/utils/table/table-state.interface";
import ServiceMethodsBase from "../ServiceMethods.base";
import CustomersServiceEnum from "./customers-service.enum";

export default class CustomersServiceMethods extends ServiceMethodsBase {
  public async create(formData: FormData): Promise<ICustomer> {
    const response = await this._fetchAxios.post<ICustomer>(
      `${this._socialPricesApiV1}${CustomersServiceEnum.Methods.CREATE}`,
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

  public async update(formData: FormData): Promise<ICustomer> {
    const response = await this._fetchAxios.put<ICustomer>(
      `${this._socialPricesApiV1}${CustomersServiceEnum.Methods.UPDATE}`,
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

  public async findById(customerId: string): Promise<ICustomer> {
    const response = await this._fetchAxios.get<ICustomer>(
      `${
        this._socialPricesApiV1
      }${CustomersServiceEnum.Methods.FIND_BY_ID.replace(
        ":customerId",
        customerId
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

  public async findByOwnerUserTableState(
    tableState?: ITableStateRequest<ICustomer>
  ): Promise<ITableStateResponse<ICustomer[]>> {
    const response = await this._fetchAxios.post<
      ITableStateResponse<ICustomer[]>
    >(
      `${this._socialPricesApiV1}${CustomersServiceEnum.Methods.FIND_BY_OWNER_USER_TABLE_STATE}`,
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
