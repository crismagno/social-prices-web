"use client";

import { Button, Space, Tooltip } from "antd";

import {
  CheckCircleOutlined,
  CheckOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

import useLanguageData from "../../../../data/context/language/useLanguageData";
import FeedbacksEnum from "../../../../shared/business/feedbacks/feedbacks.enum";

interface Props {
  status: FeedbacksEnum.Status;
  isUpdating: boolean;
  onChange: (status: FeedbacksEnum.Status) => void;
  showLabels?: boolean;
}

const ACTIONS = [
  {
    status: FeedbacksEnum.Status.SEEN,
    labelKey: "feedbacks.markSeen",
    icon: <CheckOutlined />,
    type: "default" as const,
    danger: false,
  },
  {
    status: FeedbacksEnum.Status.COMPLETED,
    labelKey: "feedbacks.markCompleted",
    icon: <CheckCircleOutlined />,
    type: "primary" as const,
    danger: false,
  },
  {
    status: FeedbacksEnum.Status.REJECTED,
    labelKey: "feedbacks.markRejected",
    icon: <CloseCircleOutlined />,
    type: "primary" as const,
    danger: true,
  },
];

// Not grouped on purpose: each action is its own button. The button of the
// current status is disabled, so it is clear where the feedback stands.
export const FeedbackStatusActions: React.FC<Props> = ({
  status,
  isUpdating,
  onChange,
  showLabels = false,
}) => {
  const { t } = useLanguageData();

  return (
    <Space wrap>
      {ACTIONS.map((action) => (
        <Tooltip key={action.status} title={t(action.labelKey)}>
          <Button
            type={action.type}
            danger={action.danger}
            icon={action.icon}
            disabled={isUpdating || status === action.status}
            onClick={() => onChange(action.status)}
          >
            {showLabels ? t(action.labelKey) : null}
          </Button>
        </Tooltip>
      ))}
    </Space>
  );
};
