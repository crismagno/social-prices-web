"use client";

import ServiceMethodsBase from "../service-methods.base";
import FilesServiceEnum from "./files-service.enum";

export default class FilesServiceMethods extends ServiceMethodsBase {
  public async download(filename: string): Promise<Buffer> {
    const response = await this._fetchAxios.get<Buffer>(
      `${this._socialPricesApiV1}${FilesServiceEnum.Methods.DOWNLOAD.replace(
        ":filename",
        filename
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
