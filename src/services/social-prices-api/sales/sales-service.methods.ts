"use client";

import { ISale } from "../../../shared/business/sales/sale.interface";
import SalesEnum from "../../../shared/business/sales/sales.enum";
import {
  IFiltersDownloadSales,
  IGetSalesAnalyticsParams,
  IGetSalesAnalyticsResponse,
  IGetSalesBalanceParams,
  IGetSalesBalanceResponse,
  IGetSalesSummaryByUserTableStateResponse,
} from "../../../shared/business/sales/sales.type";
import {
  ITableStateRequest,
  ITableStateResponse,
} from "../../../shared/utils/table/table-state.interface";
import ServiceMethodsBase from "../service-methods.base";
import CreateSaleDto from "./dto/createSale.dto";
import UpdateSaleDto from "./dto/updateSale.dto";
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

  public async updateManual(updateSaleDto: UpdateSaleDto): Promise<ISale> {
    const response = await this._fetchAxios.post<ISale>(
      `${this._socialPricesApiV1}${SalesServiceEnum.Methods.UPDATE_MANUAL}`,
      updateSaleDto,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: this.formatAuthorizationWithToken(),
        },
      }
    );

    return response.data;
  }

  public async findById(saleId: string): Promise<ISale | null> {
    const response = await this._fetchAxios.get<ISale | null>(
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

  public async getSalesSummaryByUserTableState(
    tableState?: ITableStateRequest<ISale>
  ): Promise<IGetSalesSummaryByUserTableStateResponse> {
    const response =
      await this._fetchAxios.post<IGetSalesSummaryByUserTableStateResponse>(
        `${this._socialPricesApiV1}${SalesServiceEnum.Methods.GET_SALES_SUMMARY_BY_USER_TABLE_STATE}`,
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

  public async deleteManual(saleId: string): Promise<ISale> {
    const response = await this._fetchAxios.delete<ISale>(
      `${
        this._socialPricesApiV1
      }${SalesServiceEnum.Methods.DELETE_MANUAL.replace(":saleId", saleId)}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: this.formatAuthorizationWithToken(),
        },
      }
    );

    return response.data;
  }

  public async getSalesAnalytics(
    params: IGetSalesAnalyticsParams
  ): Promise<IGetSalesAnalyticsResponse> {
    const response = await this._fetchAxios.post<IGetSalesAnalyticsResponse>(
      `${this._socialPricesApiV1}${SalesServiceEnum.Methods.GET_SALES_ANALYTICS}`,
      params,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: this.formatAuthorizationWithToken(),
        },
      }
    );

    return response.data;
  }

  public async getSalesBalance(
    params: IGetSalesBalanceParams
  ): Promise<IGetSalesBalanceResponse> {
    const response = await this._fetchAxios.post<IGetSalesBalanceResponse>(
      `${this._socialPricesApiV1}${SalesServiceEnum.Methods.GET_SALES_BALANCE}`,
      params,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: this.formatAuthorizationWithToken(),
        },
      }
    );

    return response.data;
  }

  public async uploadSales(formData: FormData): Promise<void> {
    const response = await this._fetchAxios.post<void>(
      `${this._socialPricesApiV1}${SalesServiceEnum.Methods.UPLOAD_SALES}`,
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

  public async downloadSales(filters: IFiltersDownloadSales): Promise<Buffer> {
    const response = await this._fetchAxios.post<Buffer>(
      `${this._socialPricesApiV1}${SalesServiceEnum.Methods.DOWNLOAD_SALES}`,
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

  public async updateStatusManual(
    saleId: string,
    newStatus: SalesEnum.Status
  ): Promise<ISale> {
    const response = await this._fetchAxios.put<ISale>(
      `${
        this._socialPricesApiV1
      }${SalesServiceEnum.Methods.UPDATE_STATUS_MANUAL.replace(
        ":saleId",
        saleId
      )}`,
      {
        newStatus,
      },
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
