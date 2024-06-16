"use client";

import { ISale } from "../../../shared/business/sales/sale.interface";
import {
  ITableStateRequest,
  ITableStateResponse,
} from "../../../shared/utils/table/table-state.interface";
import ServiceMethodsBase from "../ServiceMethods.base";
import CreateSaleDto from "./dto/createSale.dto";
import SalesServiceEnum from "./sales-service.enum";

export default class SalesServiceMethods extends ServiceMethodsBase {
  public async createManual(createSaleDto: CreateSaleDto): Promise<ISale> {
    const response = await this._fetchAxios.post<ISale>(
      `${this._socialPricesApiV1}${SalesServiceEnum.Methods.CREATE_MANUAL}`,
      createSaleDto,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: this.formatAuthorizationWithToken(),
        },
      }
    );

    return response.data;
  }

  public async findById(saleId: string): Promise<ISale> {
    const response = await this._fetchAxios.get<ISale>(
      `${this._socialPricesApiV1}${SalesServiceEnum.Methods.FIND_BY_ID.replace(
        ":saleId",
        saleId
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
    tableState?: ITableStateRequest<ISale>
  ): Promise<ITableStateResponse<ISale[]>> {
    const response = await this._fetchAxios.post<ITableStateResponse<ISale[]>>(
      `${this._socialPricesApiV1}${SalesServiceEnum.Methods.FIND_BY_USER_TABLE_STATE}`,
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
      `${this._socialPricesApiV1}${SalesServiceEnum.Methods.COUNT_BY_USER}`,
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
