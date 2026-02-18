"use client";

import { IProductItem } from "../../../shared/business/product-items/product-items.interface";
import {
  ITableStateRequest,
  ITableStateResponse,
} from "../../../shared/utils/table/table-state.interface";
import ServiceMethodsBase from "../service-methods.base";
import ProductItemsServiceEnum from "./product-items-service.enum";

export default class ProductItemsServiceMethods extends ServiceMethodsBase {
  public async create(createDto: any): Promise<IProductItem> {
    const response = await this._fetchAxios.post<IProductItem>(
      `${this._socialPricesApiV1}${ProductItemsServiceEnum.Methods.CREATE}`,
      createDto,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: this.formatAuthorizationWithToken(),
        },
      }
    );

    return response.data;
  }

  public async update(updateDto: any): Promise<IProductItem> {
    const response = await this._fetchAxios.put<IProductItem>(
      `${this._socialPricesApiV1}${ProductItemsServiceEnum.Methods.UPDATE}`,
      updateDto,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: this.formatAuthorizationWithToken(),
        },
      }
    );

    return response.data;
  }

  public async findById(productItemId: string): Promise<IProductItem | null> {
    const response = await this._fetchAxios.get<IProductItem | null>(
      `${
        this._socialPricesApiV1
      }${ProductItemsServiceEnum.Methods.FIND_BY_ID.replace(
        ":productItemId",
        productItemId
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

  public async findByProduct(productId: string): Promise<IProductItem[]> {
    const response = await this._fetchAxios.get<IProductItem[]>(
      `${
        this._socialPricesApiV1
      }${ProductItemsServiceEnum.Methods.FIND_BY_PRODUCT.replace(
        ":productId",
        productId
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

  public async findByUser(): Promise<IProductItem[]> {
    const response = await this._fetchAxios.get<IProductItem[]>(
      `${this._socialPricesApiV1}${ProductItemsServiceEnum.Methods.FIND_BY_USER}`,
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
    tableState?: ITableStateRequest<IProductItem>
  ): Promise<ITableStateResponse<IProductItem[]>> {
    const response = await this._fetchAxios.post<
      ITableStateResponse<IProductItem[]>
    >(
      `${this._socialPricesApiV1}${ProductItemsServiceEnum.Methods.FIND_BY_USER_TABLE_STATE}`,
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

  public async uploadProductItems(formData: FormData): Promise<void> {
    await this._fetchAxios.post<void>(
      `${this._socialPricesApiV1}${ProductItemsServiceEnum.Methods.UPLOAD_PRODUCT_ITEMS}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: this.formatAuthorizationWithToken(),
        },
      }
    );
  }

  public async downloadProductItems(filters: any): Promise<Buffer> {
    const response = await this._fetchAxios.post<Buffer>(
      `${this._socialPricesApiV1}${ProductItemsServiceEnum.Methods.DOWNLOAD_PRODUCT_ITEMS}`,
      filters,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: this.formatAuthorizationWithToken(),
        },
        responseType: "arraybuffer",
      }
    );

    return response.data;
  }

  public async findByIds(productItemIds: string[]): Promise<IProductItem[]> {
    const response = await this._fetchAxios.post<IProductItem[]>(
      `${this._socialPricesApiV1}${ProductItemsServiceEnum.Methods.FIND_BY_IDS}`,
      productItemIds,
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
