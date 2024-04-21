"use client";

import CategoriesEnum from "../../../shared/business/categories/categories.enum";
import { ICategory } from "../../../shared/business/categories/categories.interface";
import ServiceMethodsBase from "../ServiceMethods.base";
import CategoriesServiceEnum from "./categories-service.enum";

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
}
