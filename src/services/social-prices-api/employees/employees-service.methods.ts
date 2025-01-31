"use client";

import { IEmployee } from "../../../shared/business/employees/employee.interface";
import { IFiltersDownloadEmployees } from "../../../shared/business/employees/employees.types";
import {
  ITableStateRequest,
  ITableStateResponse,
} from "../../../shared/utils/table/table-state.interface";
import ServiceMethodsBase from "../service-methods.base";
import EmployeesServiceEnum from "./employees-service.enum";

export default class EmployeesServiceMethods extends ServiceMethodsBase {
  public async create(formData: FormData): Promise<IEmployee> {
    const response = await this._fetchAxios.post<IEmployee>(
      `${this._socialPricesApiV1}${EmployeesServiceEnum.Methods.CREATE}`,
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

  public async update(formData: FormData): Promise<IEmployee> {
    const response = await this._fetchAxios.put<IEmployee>(
      `${this._socialPricesApiV1}${EmployeesServiceEnum.Methods.UPDATE}`,
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

  public async findById(employeeId: string): Promise<IEmployee | null> {
    const response = await this._fetchAxios.get<IEmployee | null>(
      `${
        this._socialPricesApiV1
      }${EmployeesServiceEnum.Methods.FIND_BY_ID.replace(
        ":employeeId",
        employeeId
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

  public async findByUserTableState(
    tableState?: ITableStateRequest<IEmployee>
  ): Promise<ITableStateResponse<IEmployee[]>> {
    const response = await this._fetchAxios.post<
      ITableStateResponse<IEmployee[]>
    >(
      `${this._socialPricesApiV1}${EmployeesServiceEnum.Methods.FIND_BY_USER_TABLE_STATE}`,
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

  public async countByUser(): Promise<number> {
    const response = await this._fetchAxios.get<number>(
      `${this._socialPricesApiV1}${EmployeesServiceEnum.Methods.COUNT_BY_USER}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: this.formatAuthorizationWithToken(),
        },
      }
    );

    return response.data;
  }

  public async findByUser(): Promise<IEmployee[]> {
    const response = await this._fetchAxios.get<IEmployee[]>(
      `${this._socialPricesApiV1}${EmployeesServiceEnum.Methods.FIND_BY_USER}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: this.formatAuthorizationWithToken(),
        },
      }
    );

    return response.data;
  }

  public async uploadEmployees(formData: FormData): Promise<void> {
    const response = await this._fetchAxios.post<void>(
      `${this._socialPricesApiV1}${EmployeesServiceEnum.Methods.UPLOAD_EMPLOYEES}`,
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

  public async downloadEmployees(
    filters: IFiltersDownloadEmployees
  ): Promise<Buffer> {
    const response = await this._fetchAxios.post<Buffer>(
      `${this._socialPricesApiV1}${EmployeesServiceEnum.Methods.DOWNLOAD_EMPLOYEES}`,
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
