"use client";

import { Fragment } from "react";

import { Space, Typography, theme } from "antd";

import {
  AudioOutlined,
  FileOutlined,
  PictureOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";

import QuickMessagesEnum from "../../shared/business/quick-messages/quick-messages.enum";
import {
  IQuickMessageAvailableMediaBlock,
  IQuickMessageMediaBlock,
  IQuickMessageTextBlock,
} from "../../shared/business/quick-messages/quick-messages.types";
import { getImageUrl } from "../../shared/utils/images/images-url";
import { formatFileSize } from "../apps/telegram/telegram-display";
import RichTextView from "../../components/common/RichText/RichTextView";
import { isRichText } from "../../shared/utils/rich-text/rich-text";

// A file block with where it is kept (the grid) or without it (the chat).
type MediaBlock = IQuickMessageMediaBlock | IQuickMessageAvailableMediaBlock;

export type QuickMessageBubbleBlock = IQuickMessageTextBlock | MediaBlock;

interface Props {
  blocks: QuickMessageBubbleBlock[];
  className?: string;
}

// Splits on `{field}` keeping the fields, so they can be told apart from the text.
const FIELD_PATTERN: RegExp = /(\{[^{}\s]+\})/g;

const KIND_ICONS: Record<QuickMessagesEnum.MediaKind, JSX.Element> = {
  [QuickMessagesEnum.MediaKind.IMAGE]: <PictureOutlined />,
  [QuickMessagesEnum.MediaKind.VIDEO]: <VideoCameraOutlined />,
  [QuickMessagesEnum.MediaKind.AUDIO]: <AudioOutlined />,
  [QuickMessagesEnum.MediaKind.FILE]: <FileOutlined />,
};

const renderText = (text: string, fieldColor: string) =>
  text.split(FIELD_PATTERN).map((part: string, index: number) =>
    index % 2 === 1 ? (
      <code key={index} style={{ color: fieldColor }}>
        {part}
      </code>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    ),
  );

const renderMedia = (block: MediaBlock) => {
  // Without the key there is no file to show, only what it is.
  const source: string | null =
    "fileKey" in block ? getImageUrl(block.fileKey) : null;

  if (source && block.mimeType.startsWith("image/")) {
    return (
      <img
        src={source}
        alt={block.fileName}
        className="max-h-60 max-w-full rounded"
      />
    );
  }

  if (source && block.mimeType.startsWith("video/")) {
    return (
      <video src={source} controls className="max-h-60 max-w-full rounded" />
    );
  }

  if (source && block.mimeType.startsWith("audio/")) {
    return <audio src={source} controls className="max-w-full" />;
  }

  return (
    <Space>
      {KIND_ICONS[block.kind] ?? <FileOutlined />}
      <span className="break-all">{block.fileName}</span>
      <Typography.Text type="secondary">
        {formatFileSize(block.size)}
      </Typography.Text>
    </Space>
  );
};

// A quick message as the chat will get it: one bubble per block, in order.
export default function QuickMessageBubbles({ blocks, className }: Props) {
  const { token } = theme.useToken();

  return (
    <div
      className={`flex flex-col items-end gap-2 overflow-y-auto rounded p-3 ${className ?? ""}`}
      style={{ background: token.colorFillTertiary }}
    >
      {blocks.map((block: QuickMessageBubbleBlock, index: number) => {
        const text: string | null =
          block.type === QuickMessagesEnum.BlockType.TEXT
            ? block.text
            : block.caption;

        return (
          <div
            key={index}
            className="max-w-[85%] rounded-lg px-3 py-2"
            style={{ background: token.colorPrimaryBg, color: token.colorText }}
          >
            {block.type === QuickMessagesEnum.BlockType.MEDIA &&
              renderMedia(block)}

            {text && (
              <div
                className={`whitespace-pre-wrap break-words ${
                  block.type === QuickMessagesEnum.BlockType.MEDIA ? "mt-2" : ""
                }`}
              >
                {/* Written in the editor: shown formatted, as the chats that
                    can show it will. */}
                {isRichText(text) ? (
                  <RichTextView value={text} />
                ) : (
                  renderText(text, token.colorPrimary)
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
