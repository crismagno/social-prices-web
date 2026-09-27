"use client";

import { IFeedback } from "../../../shared/business/feedbacks/feedback.interface";
import FeedbacksEnum from "../../../shared/business/feedbacks/feedbacks.enum";
import {
  ITableStateRequest,
  ITableStateResponse,
} from "../../../shared/utils/table/table-state.interface";
import ServiceMethodsBase from "../service-methods.base";
import ManagerFeedbacksServiceEnum from "./manager-feedbacks-service.enum";

export default class ManagerFeedbacksServiceMethods extends ServiceMethodsBase {
  public async findByTableState(
    tableState?: ITableStateRequest<IFeedback>
  ): Promise<ITableStateResponse<IFeedback[]>> {
    const response = await this._fetchAxios.post<
      ITableStateResponse<IFeedback[]>
    >(
      `${this._socialPricesApiV1}${ManagerFeedbacksServiceEnum.Methods.FIND_BY_TABLE_STATE}`,
      tableState,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: this.formatManagerAuthorizationWithToken(),
        },
      }
    );

    return response.data;
  }

  public async updateStatus(
    feedbackId: string,
    status: FeedbacksEnum.Status
  ): Promise<IFeedback> {
    const response = await this._fetchAxios.patch<IFeedback>(
      `${this._socialPricesApiV1}${ManagerFeedbacksServiceEnum.Methods.UPDATE_STATUS.replace(":id", feedbackId)}`,
      { status },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: this.formatManagerAuthorizationWithToken(),
        },
      }
    );

    return response.data;
  }
}
