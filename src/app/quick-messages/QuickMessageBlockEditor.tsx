"use client";

import { useEffect, useMemo, useRef } from "react";

import { App, Button, Card, Input, Space, Tooltip, Typography } from "antd";
import type { TextAreaRef } from "antd/es/input/TextArea";

import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  FileOutlined,
  FontSizeOutlined,
  PaperClipOutlined,
} from "@ant-design/icons";

import useLanguageData from "../../data/context/language/useLanguageData";
import QuickMessagesEnum from "../../shared/business/quick-messages/quick-messages.enum";
import {
  IQuickMessageFieldInfo,
  IQuickMessageMediaBlock,
} from "../../shared/business/quick-messages/quick-messages.types";
import { getImageUrl } from "../../shared/utils/images/images-url";
import { formatFileSize } from "../apps/telegram/telegram-display";
import InsertFieldButton from "./InsertFieldButton";

// A block while it is being edited: text, a new file, or a file already stored.
export interface IEditorBlock {
  uid: string;
  type: QuickMessagesEnum.BlockType;
  text: string;
  caption: string;
  file: File | null;
  kept: IQuickMessageMediaBlock | null;
}

interface Props {
  block: IEditorBlock;
  index: number;
  count: number;
  fields: IQuickMessageFieldInfo[];
  onChange: (block: IEditorBlock) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
}

// Puts `token` where the cursor is (or at the end) and gives back the new text.
const insertAt = (
  ref: TextAreaRef | null,
  value: string,
  token: string,
): string => {
  const element: HTMLTextAreaElement | undefined =
    ref?.resizableTextArea?.textArea;

  const start: number = element?.selectionStart ?? value.length;

  const end: number = element?.selectionEnd ?? value.length;

  return value.slice(0, start) + token + value.slice(end);
};

const mediaPreview = (block: IEditorBlock, fileUrl: string | null) => {
  const source: string | null = fileUrl
    ? fileUrl
    : block.kept
      ? getImageUrl(block.kept.fileKey)
      : null;

  const mimeType: string = block.file?.type ?? block.kept?.mimeType ?? "";

  const name: string = block.file?.name ?? block.kept?.fileName ?? "";

  const size: number = block.file?.size ?? block.kept?.size ?? 0;

  if (source && mimeType.startsWith("image/")) {
    return <img src={source} alt={name} className="max-h-40 rounded" />;
  }

  if (source && mimeType.startsWith("video/")) {
    return <video src={source} controls className="max-h-40 rounded" />;
  }

  if (source && mimeType.startsWith("audio/")) {
    return <audio src={source} controls />;
  }

  return (
    <Space>
      <FileOutlined />
      <span>{name}</span>
      <Typography.Text type="secondary">{formatFileSize(size)}</Typography.Text>
    </Space>
  );
};

export default function QuickMessageBlockEditor({
  block,
  index,
  count,
  fields,
  onChange,
  onMove,
  onRemove,
}: Props) {
  const { t } = useLanguageData();

  const { message } = App.useApp();

  const textRef = useRef<TextAreaRef | null>(null);

  const captionRef = useRef<TextAreaRef | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isText: boolean = block.type === QuickMessagesEnum.BlockType.TEXT;

  // One address per picked file, given back when the file changes or the block goes.
  const fileUrl: string | null = useMemo(
    () => (block.file ? URL.createObjectURL(block.file) : null),
    [block.file],
  );

  useEffect(
    () => () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    },
    [fileUrl],
  );

  const hasFile: boolean = !!block.file || !!block.kept;

  const pickFile = (picked: File | undefined): void => {
    if (!picked) {
      return;
    }

    if (picked.size > QuickMessagesEnum.MAX_FILE_BYTES) {
      message.error(
        t("quickMessages.fileTooLarge").replace(
          "{size}",
          formatFileSize(QuickMessagesEnum.MAX_FILE_BYTES),
        ),
      );

      return;
    }

    onChange({ ...block, file: picked, kept: null });
  };

  return (
    <Card
      size="small"
      title={
        <Space>
          {isText ? <FontSizeOutlined /> : <PaperClipOutlined />}
          {`${index + 1}. ${t(isText ? "quickMessages.blockText" : "quickMessages.blockMedia")}`}
        </Space>
      }
      extra={
        <Space size={4}>
          <Tooltip title={t("quickMessages.moveUp")}>
            <Button
              size="small"
              icon={<ArrowUpOutlined />}
              disabled={index === 0}
              onClick={() => onMove(-1)}
            />
          </Tooltip>
          <Tooltip title={t("quickMessages.moveDown")}>
            <Button
              size="small"
              icon={<ArrowDownOutlined />}
              disabled={index === count - 1}
              onClick={() => onMove(1)}
            />
          </Tooltip>
          <Tooltip title={t("quickMessages.removeBlock")}>
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              disabled={count === 1}
              onClick={onRemove}
            />
          </Tooltip>
        </Space>
      }
    >
      {isText ? (
        <Space direction="vertical" className="w-full">
          <Input.TextArea
            ref={textRef}
            value={block.text}
            onChange={(event) =>
              onChange({ ...block, text: event.target.value })
            }
            maxLength={QuickMessagesEnum.MAX_TEXT_LENGTH}
            showCount
            autoSize={{ minRows: 3, maxRows: 10 }}
            placeholder={t("quickMessages.textPlaceholder")}
          />
          <InsertFieldButton
            fields={fields}
            onInsert={(token: string) =>
              onChange({
                ...block,
                text: insertAt(textRef.current, block.text, token),
              })
            }
          />
        </Space>
      ) : (
        <Space direction="vertical" className="w-full">
          <input
            ref={fileInputRef}
            type="file"
            hidden
            onChange={(event) => {
              pickFile(event.target.files?.[0]);
              event.target.value = "";
            }}
          />

          {hasFile && mediaPreview(block, fileUrl)}

          <Button
            icon={<PaperClipOutlined />}
            onClick={() => fileInputRef.current?.click()}
          >
            {t(hasFile ? "quickMessages.changeFile" : "quickMessages.pickFile")}
          </Button>

          <Input.TextArea
            ref={captionRef}
            value={block.caption}
            onChange={(event) =>
              onChange({ ...block, caption: event.target.value })
            }
            maxLength={QuickMessagesEnum.MAX_TEXT_LENGTH}
            showCount
            autoSize={{ minRows: 1, maxRows: 5 }}
            placeholder={t("quickMessages.captionPlaceholder")}
          />
          <InsertFieldButton
            fields={fields}
            onInsert={(token: string) =>
              onChange({
                ...block,
                caption: insertAt(captionRef.current, block.caption, token),
              })
            }
          />
        </Space>
      )}
    </Card>
  );
}
