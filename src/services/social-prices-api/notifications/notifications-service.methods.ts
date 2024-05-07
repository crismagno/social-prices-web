"use client";

import { INotification } from "../../../shared/business/notifications/notification.interface";
import {
  ITableStateRequest,
  ITableStateResponse,
} from "../../../shared/utils/table/table-state.interface";
import ServiceMethodsBase from "../ServiceMethods.base";
import NotificationServiceEnum from "./notifications-service.enum";

export default class NotificationsServiceMethods extends ServiceMethodsBase {
  public async findById(notificationId: string): Promise<INotification> {
    const response = await this._fetchAxios.get<INotification>(
      `${
        this._socialPricesApiV1
      }${NotificationServiceEnum.Methods.FIND_BY_ID.replace(
        ":notificationId",
        notificationId
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
    tableState?: ITableStateRequest<INotification>
  ): Promise<ITableStateResponse<INotification[]>> {
    const response = await this._fetchAxios.post<
      ITableStateResponse<INotification[]>
    >(
      `${this._socialPricesApiV1}${NotificationServiceEnum.Methods.FIND_BY_USER_TABLE_STATE}`,
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

  public async countNotSeenByUser(): Promise<number> {
    const response = await this._fetchAxios.get<number>(
      `${this._socialPricesApiV1}${NotificationServiceEnum.Methods.COUNT_NOT_SEEN_BY_USER}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: this.formatAuthorizationWithToken(),
        },
      }
    );

    return response.data;
  }

  public async updateToSeen(notificationIds: string[]): Promise<void> {
    await this._fetchAxios.post<void>(
      `${this._socialPricesApiV1}${NotificationServiceEnum.Methods.UPDATE_TO_SEEN}`,
      {
        notificationIds,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: this.formatAuthorizationWithToken(),
        },
      }
    );
  }
}
