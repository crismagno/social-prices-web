"use client";

import { Button, Tooltip, theme } from "antd";

import { ThunderboltOutlined } from "@ant-design/icons";

import useLanguageData from "../../data/context/language/useLanguageData";
import { IInboxConversation } from "../../shared/business/inbox/inbox.types";
import { IQuickMessageAvailable } from "../../shared/business/quick-messages/quick-messages.types";
import {
  firstText,
  mediaSummary,
  rankQuickMessages,
  unavailableReason,
} from "./quick-messages-filter";

interface Props {
  list: IQuickMessageAvailable[];
  query: string;
  target: IInboxConversation;
  disabled: boolean;
  onSend: (message: IQuickMessageAvailable) => void;
}

// The strip of quick messages above the answer box. What is typed narrows it to
// the closest ones; one click sends the whole message.
export default function ChatsQuickMessages({
  list,
  query,
  target,
  disabled,
  onSend,
}: Props) {
  const { t } = useLanguageData();

  const { token } = theme.useToken();

  const ranked: IQuickMessageAvailable[] = rankQuickMessages(list, query);

  if (!ranked.length) {
    return null;
  }

  return (
    <div
      className="mb-2 flex items-center gap-2 overflow-x-auto pb-1"
      aria-label={t("quickMessages.title")}
    >
      <ThunderboltOutlined style={{ color: token.colorTextSecondary }} />

      {ranked.map((message: IQuickMessageAvailable) => {
        const reason: string | null = unavailableReason(message, target);

        const summary: string = mediaSummary(message);

        const preview: string = firstText(message);

        return (
          <Tooltip
            key={message._id}
            title={reason ? t(reason) : preview || undefined}
          >
            <Button
              size="small"
              shape="round"
              className="shrink-0"
              disabled={disabled || !!reason}
              onClick={() => onSend(message)}
            >
              <span className="font-medium">{message.name}</span>

              {summary && (
                <span style={{ color: token.colorTextSecondary }}>
                  {summary}
                </span>
              )}
            </Button>
          </Tooltip>
        );
      })}
    </div>
  );
}
