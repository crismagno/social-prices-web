"use client";

import {
  ICustomerPortalDashboard,
  ICustomerPortalSale,
  ICustomerPortalStore,
} from "../../../shared/business/customer-portal/customer-portal.types";
import {
  ITableStateRequest,
  ITableStateResponse,
} from "../../../shared/utils/table/table-state.interface";
import ServiceMethodsBase from "../service-methods.base";
import CustomerPortalServiceEnum from "./customer-portal-service.enum";

// The customer account's own area: read-only views of the sales made for them.
export default class CustomerPortalServiceMethods extends ServiceMethodsBase {
  private _headers() {
    return {
      "Content-Type": "application/json",
      Authorization: this.formatAuthorizationWithToken(),
    };
  }

  public async findSalesTableState(
    tableState?: ITableStateRequest<ICustomerPortalSale>,
  ): Promise<ITableStateResponse<ICustomerPortalSale[]>> {
    const response = await this._fetchAxios.post<
      ITableStateResponse<ICustomerPortalSale[]>
    >(
      `${this._socialPricesApiV1}${CustomerPortalServiceEnum.Methods.SALES_TABLE_STATE}`,
      tableState ?? {},
      { headers: this._headers() },
    );

    return response.data;
  }

  public async findSale(saleId: string): Promise<ICustomerPortalSale> {
    const response = await this._fetchAxios.get<ICustomerPortalSale>(
      `${this._socialPricesApiV1}${CustomerPortalServiceEnum.Methods.SALE.replace(
        ":saleId",
        saleId,
      )}`,
      { headers: this._headers() },
    );

    return response.data;
  }

  // The stores this customer bought in, for the stores filter.
  public async findStores(): Promise<ICustomerPortalStore[]> {
    const response = await this._fetchAxios.get<ICustomerPortalStore[]>(
      `${this._socialPricesApiV1}${CustomerPortalServiceEnum.Methods.STORES}`,
      { headers: this._headers() },
    );

    return response.data;
  }

  public async getDashboard(): Promise<ICustomerPortalDashboard> {
    const response = await this._fetchAxios.get<ICustomerPortalDashboard>(
      `${this._socialPricesApiV1}${CustomerPortalServiceEnum.Methods.DASHBOARD}`,
      { headers: this._headers() },
    );

    return response.data;
  }
}
