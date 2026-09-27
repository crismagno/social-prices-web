"use client";

import { useState } from "react";

import { App, Button, Card, Tag, Tooltip } from "antd";
import moment from "moment";

import { EyeOutlined } from "@ant-design/icons";

import handleClientError from "../../../components/common/HandleClientError/HandleClientError";
import TableCustomAntd2 from "../../../components/custom/antd/TableCustomAntd2/TableCustomAntd2";
import ManagerLayout from "../../../components/template/ManagerLayout/ManagerLayout";
import useLanguageData from "../../../data/context/language/useLanguageData";
import useManagerAuthData from "../../../data/context/managerAuth/useManagerAuthData";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import { IFeedback } from "../../../shared/business/feedbacks/feedback.interface";
import FeedbacksEnum from "../../../shared/business/feedbacks/feedbacks.enum";
import ManagersEnum from "../../../shared/business/managers/managers.enum";
import DatesEnum from "../../../shared/utils/dates/dates.enum";
import { createTableState } from "../../../shared/utils/table/table-state";
import { ITableStateRequest } from "../../../shared/utils/table/table-state.interface";
import { FeedbackDetailDrawer } from "./components/FeedbackDetailDrawer";
import { FeedbackStatusActions } from "./components/FeedbackStatusActions";
import { useFindFeedbacksByManagerTableState } from "./useFindFeedbacksByManagerTableState";

export default function ManagerFeedbacksPage() {
  const { t } = useLanguageData();

  const { message } = App.useApp();

  const { manager } = useManagerAuthData();

  const [tableStateRequest, setTableStateRequest] = useState<
    ITableStateRequest<IFeedback> | undefined
  >(createTableState({ sort: { field: "createdAt", order: "descend" } }));

  const { isLoading, feedbacks, total, refetch } =
    useFindFeedbacksByManagerTableState(tableStateRequest);

  const [selected, setSelected] = useState<IFeedback | null>(null);

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const canEdit: boolean =
    !!manager && manager.level !== ManagersEnum.Level.SUB_MANAGER;

  const handleChangeStatus = async (
    feedback: IFeedback,
    status: FeedbacksEnum.Status,
  ): Promise<void> => {
    try {
      setUpdatingId(feedback._id);

      const updated: IFeedback =
        await serviceMethodsInstance.managerFeedbacksServiceMethods.updateStatus(
          feedback._id,
          status,
        );

      message.success(t("feedbacks.statusUpdated"));

      // Keep the open drawer in sync, then refresh the grid behind it.
      setSelected((current) =>
        current && current._id === updated._id ? updated : current,
      );

      await refetch();
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <ManagerLayout
      title={t("manager.feedbacks")}
      subtitle={t("manager.feedbacksSubtitle")}
    >
      <Card title={t("manager.feedbacks")} className="h-min-80">
        <TableCustomAntd2<IFeedback>
          rowKey={"_id"}
          dataSource={feedbacks}
          columns={[
            {
              title: t("feedbacks.sender"),
              dataIndex: "name",
              key: "name",
              align: "center",
              render: (_: unknown, feedback: IFeedback) => (
                <div className="flex flex-col items-center">
                  <span>{feedback.name || "-"}</span>

                  <span className="text-[11px] leading-tight italic text-gray-400 dark:text-gray-500">
                    {feedback.email}
                  </span>

                  {feedback.employeeId && (
                    <Tag className="mt-1">{t("feedbacks.employee")}</Tag>
                  )}
                </div>
              ),
            },
            {
              title: t("feedbacks.message"),
              dataIndex: "message",
              key: "message",
              render: (text: string) => (
                <div className="max-w-md truncate" title={text}>
                  {text}
                </div>
              ),
            },
            {
              title: t("manager.status"),
              dataIndex: "status",
              key: "status",
              align: "center",
              filters: Object.keys(FeedbacksEnum.Status).map(
                (status: string) => ({
                  text: t(
                    FeedbacksEnum.StatusLabels[status as FeedbacksEnum.Status],
                  ),
                  value: status,
                }),
              ),
              render: (status: FeedbacksEnum.Status) => (
                <Tag color={FeedbacksEnum.StatusColors[status]}>
                  {t(FeedbacksEnum.StatusLabels[status])}
                </Tag>
              ),
            },
            {
              title: t("manager.createdAt"),
              dataIndex: "createdAt",
              key: "createdAt",
              align: "center",
              sorter: true,
              render: (createdAt: Date) =>
                moment(createdAt).format(DatesEnum.Format.DDMMYYYYhhmmss),
            },
            {
              title: t("common.actions"),
              key: "actions",
              align: "center",
              render: (_: unknown, feedback: IFeedback) => (
                <div className="flex items-center justify-center gap-2">
                  <Tooltip title={t("feedbacks.view")}>
                    <Button
                      type="primary"
                      shape="circle"
                      icon={<EyeOutlined />}
                      aria-label={t("feedbacks.view")}
                      onClick={() => setSelected(feedback)}
                    />
                  </Tooltip>

                  {canEdit && (
                    <FeedbackStatusActions
                      status={feedback.status}
                      isUpdating={updatingId === feedback._id}
                      onChange={(status) =>
                        handleChangeStatus(feedback, status)
                      }
                    />
                  )}
                </div>
              ),
            },
          ]}
          search={{ placeholder: t("manager.searchFeedbacks") }}
          loading={isLoading}
          tableStateRequest={tableStateRequest}
          setTableStateRequest={setTableStateRequest}
          total={total}
        />
      </Card>

      <FeedbackDetailDrawer
        feedback={selected}
        canEdit={canEdit}
        isUpdating={!!selected && updatingId === selected._id}
        onClose={() => setSelected(null)}
        onChangeStatus={(status) =>
          selected && handleChangeStatus(selected, status)
        }
      />
    </ManagerLayout>
  );
}
