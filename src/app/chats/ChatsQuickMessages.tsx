"use client";

import { Button, Popover, Typography, theme } from "antd";

import { ThunderboltOutlined } from "@ant-design/icons";

import useLanguageData from "../../data/context/language/useLanguageData";
import { IQuickMessageAvailable } from "../../shared/business/quick-messages/quick-messages.types";
import QuickMessageBubbles from "../quick-messages/QuickMessageBubbles";
import {
  QuickMessageTarget,
  mediaSummary,
  rankQuickMessages,
  unavailableReason,
} from "./quick-messages-filter";

interface Props {
  list: IQuickMessageAvailable[];
  query: string;
  target: QuickMessageTarget;
  disabled: boolean;
  onSend: (message: IQuickMessageAvailable) => void;
}

// The strip of quick messages above the answer box. What is typed narrows it to
// the closest ones; hovering one shows what it sends, one click sends it all.
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

        return (
          <Popover
            key={message._id}
            title={message.name}
            mouseEnterDelay={0.3}
            content={
              <div className="w-72 max-w-[80vw]">
                {reason && (
                  <Typography.Paragraph type="warning" className="!mb-2">
                    {t(reason)}
                  </Typography.Paragraph>
                )}

                <QuickMessageBubbles
                  blocks={message.blocks}
                  className="max-h-72"
                />
              </div>
            }
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
          </Popover>
        );
      })}
    </div>
  );
}
