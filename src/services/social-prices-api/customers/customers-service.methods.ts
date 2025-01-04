"use client";

import { ICustomer } from "../../../shared/business/customers/customer.interface";
import { IFiltersDownloadCustomers } from "../../../shared/business/customers/customers.type";
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

  public async findById(customerId: string): Promise<ICustomer | null> {
    const response = await this._fetchAxios.get<ICustomer | null>(
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

  public async countByOwnerUser(): Promise<number> {
    const response = await this._fetchAxios.get<number>(
      `${this._socialPricesApiV1}${CustomersServiceEnum.Methods.COUNT_BY_OWNER_USER}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: this.formatAuthorizationWithToken(),
        },
      }
    );

    return response.data;
  }

  public async uploadCustomers(formData: FormData): Promise<void> {
    const response = await this._fetchAxios.post<void>(
      `${this._socialPricesApiV1}${CustomersServiceEnum.Methods.UPLOAD_CUSTOMERS}`,
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

  public async downloadCustomers(
    filters: IFiltersDownloadCustomers
  ): Promise<Buffer> {
    const response = await this._fetchAxios.post<Buffer>(
      `${this._socialPricesApiV1}${CustomersServiceEnum.Methods.DOWNLOAD_CUSTOMERS}`,
      filters,
      {
        headers: {
          Authorization: this.formatAuthorizationWithToken(),
        },
        responseType: "blob",
      }
    );

    return response.data;
  }
}
