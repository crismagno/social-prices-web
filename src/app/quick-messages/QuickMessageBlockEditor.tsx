"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { App, Button, Card, Input, Space, Tooltip, Typography } from "antd";
import type { TextAreaRef } from "antd/es/input/TextArea";

import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FileOutlined,
  FontSizeOutlined,
  PaperClipOutlined,
} from "@ant-design/icons";

import RichTextEditor, {
  IRichTextEditorHandle,
} from "../../components/common/RichText/RichTextEditor";
import FilePreviewModal from "../../components/common/FilePreview/FilePreviewModal";
import ImageEditorModal, {
  isEditableImage,
} from "../../components/common/ImageEditor/ImageEditorModal";
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

  const textRef = useRef<IRichTextEditorHandle | null>(null);

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

  // The picture being edited, and whether it was just picked (then leaving
  // the editor keeps it as it is).
  const [editing, setEditing] = useState<File | null>(null);
  const [isFreshPick, setIsFreshPick] = useState<boolean>(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

  const source: string | null = fileUrl
    ? fileUrl
    : block.kept
      ? getImageUrl(block.kept.fileKey)
      : null;
  const mimeType: string = block.file?.type ?? block.kept?.mimeType ?? "";
  const fileName: string = block.file?.name ?? block.kept?.fileName ?? "";
  const fileSize: number = block.file?.size ?? block.kept?.size ?? 0;

  const canEdit: boolean =
    mimeType.startsWith("image/") &&
    mimeType !== "image/gif" &&
    mimeType !== "image/svg+xml";

  const attach = (file: File): void => {
    if (file.size > QuickMessagesEnum.MAX_FILE_BYTES) {
      message.error(
        t("quickMessages.fileTooLarge").replace(
          "{size}",
          formatFileSize(QuickMessagesEnum.MAX_FILE_BYTES),
        ),
      );

      return;
    }

    onChange({ ...block, file, kept: null });
  };

  // The stored picture is brought into the page to be edited as a new file.
  const editCurrent = async (): Promise<void> => {
    if (block.file) {
      setIsFreshPick(false);
      setEditing(block.file);

      return;
    }

    if (!source) {
      return;
    }

    try {
      const blob: Blob = await (await fetch(source)).blob();

      setIsFreshPick(false);
      setEditing(
        new File([blob], fileName || "image", { type: blob.type || mimeType }),
      );
    } catch {
      message.error(t("imageEditor.loadFailed"));
    }
  };

  const pickFile = (picked: File | undefined): void => {
    if (!picked) {
      return;
    }

    // A picture opens in the editor first.
    if (isEditableImage(picked)) {
      setIsFreshPick(true);
      setEditing(picked);

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
              type="primary"
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
          <RichTextEditor
            ref={textRef}
            variant="chat"
            value={block.text}
            onChange={(text: string) => onChange({ ...block, text })}
            maxLength={QuickMessagesEnum.MAX_TEXT_LENGTH}
            placeholder={t("quickMessages.textPlaceholder")}
          />
          <InsertFieldButton
            fields={fields}
            onInsert={(token: string) => textRef.current?.insert(token)}
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

          {hasFile && (
            <div
              role="button"
              tabIndex={0}
              className="cursor-zoom-in w-fit"
              title={t("filePreview.open")}
              onClick={() => setIsPreviewOpen(true)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  setIsPreviewOpen(true);
                }
              }}
            >
              {mediaPreview(block, fileUrl)}
            </div>
          )}

          <Space wrap>
            <Button
              icon={<PaperClipOutlined />}
              onClick={() => fileInputRef.current?.click()}
            >
              {t(
                hasFile ? "quickMessages.changeFile" : "quickMessages.pickFile",
              )}
            </Button>
            {hasFile && (
              <Button
                icon={<EyeOutlined />}
                onClick={() => setIsPreviewOpen(true)}
              >
                {t("filePreview.open")}
              </Button>
            )}
            {hasFile && canEdit && (
              <Button icon={<EditOutlined />} onClick={editCurrent}>
                {t("imageEditor.edit")}
              </Button>
            )}
          </Space>

          <ImageEditorModal
            file={editing}
            cancelLabel={isFreshPick ? t("imageEditor.useOriginal") : undefined}
            onCancel={() => {
              if (isFreshPick && editing) {
                attach(editing);
              }

              setEditing(null);
            }}
            onSave={(edited: File) => {
              attach(edited);
              setEditing(null);
            }}
          />

          <FilePreviewModal
            open={isPreviewOpen}
            source={source}
            mimeType={mimeType}
            name={fileName}
            sizeLabel={fileSize ? formatFileSize(fileSize) : undefined}
            onClose={() => setIsPreviewOpen(false)}
          />

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
