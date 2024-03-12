"use client";

import { IProduct } from "../../../shared/business/products/products.interface";
import {
  ITableStateRequest,
  ITableStateResponse,
} from "../../../shared/utils/table/table-state.interface";
import ServiceMethodsBase from "../ServiceMethods.base";
import ProductsServiceEnum from "./products-service.enum";

export default class ProductsServiceMethods extends ServiceMethodsBase {
  public async create(formData: FormData): Promise<IProduct> {
    const response = await this._fetchAxios.post<IProduct>(
      `${this._socialPricesApiV1}${ProductsServiceEnum.Methods.CREATE}`,
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

  public async update(formData: FormData): Promise<IProduct> {
    const response = await this._fetchAxios.put<IProduct>(
      `${this._socialPricesApiV1}${ProductsServiceEnum.Methods.UPDATE}`,
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

  public async findById(productId: string): Promise<IProduct> {
    const response = await this._fetchAxios.get<IProduct>(
      `${this._socialPricesApiV1}${ProductsServiceEnum.Methods.FIND_BY_ID}/${productId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: this.formatAuthorizationWithToken(),
        },
      }
    );

    return response.data;
  }

  public async findByUser(): Promise<IProduct[]> {
    const response = await this._fetchAxios.get<IProduct[]>(
      `${this._socialPricesApiV1}${ProductsServiceEnum.Methods.FIND_BY_USER}`,
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
    tableState?: ITableStateRequest<IProduct>
  ): Promise<ITableStateResponse<IProduct[]>> {
    const response = await this._fetchAxios.post<
      ITableStateResponse<IProduct[]>
    >(
      `${this._socialPricesApiV1}${ProductsServiceEnum.Methods.FIND_BY_USER_TABLE_STATE}`,
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
