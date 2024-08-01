"use client";

import CategoriesEnum from "../../../shared/business/categories/categories.enum";
import { ITag } from "../../../shared/business/tags/tags.interface";
import {
  ITableStateRequest,
  ITableStateResponse,
} from "../../../shared/utils/table/table-state.interface";
import ServiceMethodsBase from "../ServiceMethods.base";
import CreateTagDto from "./dto/createTag.dto";
import CreateTagMultiDto from "./dto/createTagMulti.dto";
import UpdateTagDto from "./dto/updateTag.dto";
import TagsServiceEnum from "./tags-service.enum";

export default class TagsServiceMethods extends ServiceMethodsBase {
  public async findByType(
    userId: string,
    type: CategoriesEnum.Type
  ): Promise<ITag[]> {
    const response = await this._fetchAxios.get<ITag[]>(
      `${this._socialPricesApiV1}${TagsServiceEnum.Methods.FIND_BY_TYPE.replace(
        ":userId",
        userId
      ).replace(":type", type)}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: this.formatAuthorizationWithToken(),
        },
      }
    );

    return response.data;
  }

  public async findById(tagId: string): Promise<ITag | null> {
    const response = await this._fetchAxios.get<ITag | null>(
      `${this._socialPricesApiV1}${TagsServiceEnum.Methods.FIND_BY_ID.replace(
        ":tagId",
        tagId
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
    userId: string,
    tableState?: ITableStateRequest<ITag>
  ): Promise<ITableStateResponse<ITag[]>> {
    const response = await this._fetchAxios.post<ITableStateResponse<ITag[]>>(
      `${
        this._socialPricesApiV1
      }${TagsServiceEnum.Methods.FIND_BY_USER_TABLE_STATE.replace(
        ":userId",
        userId
      )}`,
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

  public async create(createTagDto: CreateTagDto): Promise<ITag> {
    const response = await this._fetchAxios.post<ITag>(
      `${this._socialPricesApiV1}${TagsServiceEnum.Methods.CREATE}`,
      createTagDto,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: this.formatAuthorizationWithToken(),
        },
      }
    );

    return response.data;
  }

  public async update(updateTagDto: UpdateTagDto): Promise<ITag> {
    const response = await this._fetchAxios.put<ITag>(
      `${this._socialPricesApiV1}${TagsServiceEnum.Methods.UPDATE}`,
      updateTagDto,
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
    createTagMultiDto: CreateTagMultiDto
  ): Promise<void> {
    const response = await this._fetchAxios.post<void>(
      `${this._socialPricesApiV1}${TagsServiceEnum.Methods.CREATE_MULTI}`,
      createTagMultiDto,
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
