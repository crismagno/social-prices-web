"use client";

import CategoriesEnum from "../../../shared/business/categories/categories.enum";
import { ICategory } from "../../../shared/business/categories/categories.interface";
import {
  ITableStateRequest,
  ITableStateResponse,
} from "../../../shared/utils/table/table-state.interface";
import ServiceMethodsBase from "../ServiceMethods.base";
import CategoriesServiceEnum from "./categories-service.enum";
import CreateCategoryDto from "./dto/createCategory.dto";
import CreateCategoryMultiDto from "./dto/createCategoryMulti.dto";
import UpdateCategoryDto from "./dto/updateCategory.dto";

export default class CategoriesServiceMethods extends ServiceMethodsBase {
  public async findByType(type: CategoriesEnum.Type): Promise<ICategory[]> {
    const response = await this._fetchAxios.get<ICategory[]>(
      `${
        this._socialPricesApiV1
      }${CategoriesServiceEnum.Methods.FIND_BY_TYPE.replace(":type", type)}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: this.formatAuthorizationWithToken(),
        },
      }
    );

    return response.data;
  }

  public async findById(categoryId: string): Promise<ICategory> {
    const response = await this._fetchAxios.get<ICategory>(
      `${
        this._socialPricesApiV1
      }${CategoriesServiceEnum.Methods.FIND_BY_ID.replace(
        ":categoryId",
        categoryId
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
    tableState?: ITableStateRequest<ICategory>
  ): Promise<ITableStateResponse<ICategory[]>> {
    const response = await this._fetchAxios.post<
      ITableStateResponse<ICategory[]>
    >(
      `${this._socialPricesApiV1}${CategoriesServiceEnum.Methods.FIND_BY_USER_TABLE_STATE}`,
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

  public async create(
    createCategoryDto: CreateCategoryDto
  ): Promise<ICategory> {
    const response = await this._fetchAxios.post<ICategory>(
      `${this._socialPricesApiV1}${CategoriesServiceEnum.Methods.CREATE}`,
      createCategoryDto,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: this.formatAuthorizationWithToken(),
        },
      }
    );

    return response.data;
  }

  public async update(
    updateCategoryDto: UpdateCategoryDto
  ): Promise<ICategory> {
    const response = await this._fetchAxios.put<ICategory>(
      `${this._socialPricesApiV1}${CategoriesServiceEnum.Methods.UPDATE}`,
      updateCategoryDto,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: this.formatAuthorizationWithToken(),
        },
      }
    );

    return response.data;
  }

  public async createMulti(
    createCategoryMultiDto: CreateCategoryMultiDto
  ): Promise<ICategory> {
    const response = await this._fetchAxios.post<ICategory>(
      `${this._socialPricesApiV1}${CategoriesServiceEnum.Methods.CREATE_MULTI}`,
      createCategoryMultiDto,
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
      `${this._socialPricesApiV1}${CategoriesServiceEnum.Methods.COUNT_BY_USER}`,
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
