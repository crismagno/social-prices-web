"use client";

import { theme } from "antd";

import useLanguageData from "../../data/context/language/useLanguageData";

/** Which chats the list keeps: all, the unread, or those waiting for an answer. */
export type TChatsFocus = "ALL" | "PENDING" | "UNANSWERED";

interface Props {
  total: number;
  pending: number;
  unanswered: number;
  focus: TChatsFocus;
  onFocusChange: (focus: TChatsFocus) => void;
}

/**
 * How many chats there are, how many have messages nobody read and how many
 * still wait for an answer; each one, clicked, keeps only those.
 */
export default function ChatsCounts({
  total,
  pending,
  unanswered,
  focus,
  onFocusChange,
}: Props) {
  const { t } = useLanguageData();

  const { token } = theme.useToken();

  const items: {
    value: TChatsFocus;
    count: number;
    label: string;
    hint?: string;
    color: string;
    background: string;
    text?: string;
  }[] = [
    {
      value: "ALL",
      count: total,
      label: t("chats.summary.total"),
      color: token.colorPrimary,
      background: token.colorPrimaryBg,
    },
    {
      value: "PENDING",
      count: pending,
      label: t("chats.summary.pending"),
      hint: t("chats.summary.pendingHint"),
      color: token.colorWarning,
      background: token.colorWarningBg,
      text: token.colorWarningText,
    },
    {
      value: "UNANSWERED",
      count: unanswered,
      label: t("chats.summary.unanswered"),
      hint: t("chats.summary.unansweredHint"),
      color: token.colorError,
      background: token.colorErrorBg,
      text: token.colorErrorText,
    },
  ];

  return (
    <div className="flex gap-2">
      {items.map((item) => {
        const isOn: boolean = focus === item.value;

        return (
          <button
            key={item.value}
            type="button"
            aria-pressed={isOn}
            disabled={item.value !== "ALL" && !item.count && !isOn}
            // A filter clicked again goes back to every chat.
            onClick={() =>
              onFocusChange(isOn && item.value !== "ALL" ? "ALL" : item.value)
            }
            title={item.hint}
            className="flex min-w-0 flex-1 items-baseline justify-center gap-1.5 rounded-md px-2 py-0.5 transition-colors disabled:cursor-default"
            style={{
              border: `1px solid ${isOn ? item.color : token.colorBorderSecondary}`,
              background: isOn ? item.background : undefined,
            }}
          >
            <span
              className="text-sm font-semibold"
              style={{
                color: item.count && item.text ? item.text : undefined,
              }}
            >
              {item.count}
            </span>
            <span
              className="truncate text-xs"
              style={{ color: token.colorTextSecondary }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
