"use client";

import { IFileUpload } from "../../../shared/business/files-uploads/file-upload.interface";
import {
  ITableStateRequest,
  ITableStateResponse,
} from "../../../shared/utils/table/table-state.interface";
import ServiceMethodsBase from "../ServiceMethods.base";
import FilesUploadsServiceEnum from "./files-uploads-service.enum";

export default class FilesUploadsServiceMethods extends ServiceMethodsBase {
  public async findById(fileUploadId: string): Promise<IFileUpload | null> {
    const response = await this._fetchAxios.get<IFileUpload | null>(
      `${
        this._socialPricesApiV1
      }${FilesUploadsServiceEnum.Methods.FIND_BY_ID.replace(
        ":fileUploadId",
        fileUploadId
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
    tableState?: ITableStateRequest<IFileUpload>
  ): Promise<ITableStateResponse<IFileUpload[]>> {
    const response = await this._fetchAxios.post<
      ITableStateResponse<IFileUpload[]>
    >(
      `${this._socialPricesApiV1}${FilesUploadsServiceEnum.Methods.FIND_BY_USER_TABLE_STATE}`,
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

  public async downloadErrors(fileUploadId: string): Promise<Buffer> {
    const response = await this._fetchAxios.get<Buffer>(
      `${
        this._socialPricesApiV1
      }${FilesUploadsServiceEnum.Methods.DOWNLOAD_ERRORS.replace(
        ":fileUploadId",
        fileUploadId
      )}`,
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
