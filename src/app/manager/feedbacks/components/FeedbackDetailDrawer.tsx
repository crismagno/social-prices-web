"use client";

import { Descriptions, Drawer, Tag } from "antd";
import moment from "moment";

import useLanguageData from "../../../../data/context/language/useLanguageData";
import { IFeedback } from "../../../../shared/business/feedbacks/feedback.interface";
import FeedbacksEnum from "../../../../shared/business/feedbacks/feedbacks.enum";
import DatesEnum from "../../../../shared/utils/dates/dates.enum";
import { FeedbackStatusActions } from "./FeedbackStatusActions";

interface Props {
  feedback: IFeedback | null;
  canEdit: boolean;
  isUpdating: boolean;
  onClose: () => void;
  onChangeStatus: (status: FeedbacksEnum.Status) => void;
}

export const FeedbackDetailDrawer: React.FC<Props> = ({
  feedback,
  canEdit,
  isUpdating,
  onClose,
  onChangeStatus,
}) => {
  const { t } = useLanguageData();

  const formatDate = (date: Date | null): string =>
    date ? moment(date).format(DatesEnum.Format.DDMMYYYYhhmmss) : "-";

  return (
    <Drawer
      open={!!feedback}
      onClose={onClose}
      width={600}
      title={t("feedbacks.view")}
      destroyOnHidden
      footer={
        feedback && canEdit ? (
          <FeedbackStatusActions
            status={feedback.status}
            isUpdating={isUpdating}
            onChange={onChangeStatus}
            showLabels
          />
        ) : null
      }
    >
      {feedback && (
        <>
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label={t("feedbacks.sender")}>
              <div className="flex flex-col">
                <span>{feedback.name || "-"}</span>

                <span className="text-sm italic text-slate-500">
                  {feedback.email}
                </span>

                {feedback.employeeId && (
                  <Tag className="mt-1 w-fit">{t("feedbacks.employee")}</Tag>
                )}
              </div>
            </Descriptions.Item>

            <Descriptions.Item label={t("manager.status")}>
              <Tag color={FeedbacksEnum.StatusColors[feedback.status]}>
                {t(FeedbacksEnum.StatusLabels[feedback.status])}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item label={t("feedbacks.receivedAt")}>
              {formatDate(feedback.createdAt)}
            </Descriptions.Item>

            <Descriptions.Item label={t("feedbacks.statusUpdatedAt")}>
              {formatDate(feedback.statusUpdatedAt)}
            </Descriptions.Item>
          </Descriptions>

          <h3 className="mt-5 mb-2 font-semibold">{t("feedbacks.message")}</h3>

          <p className="whitespace-pre-wrap break-words">{feedback.message}</p>
        </>
      )}
    </Drawer>
  );
};
