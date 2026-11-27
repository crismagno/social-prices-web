"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Button, Checkbox, Input, Modal, Tooltip, theme } from "antd";

import {
  CloseOutlined,
  EditOutlined,
  FileOutlined,
  FilePdfOutlined,
  PlusOutlined,
  SendOutlined,
  SoundOutlined,
} from "@ant-design/icons";

import { isEditableImage } from "../../components/common/ImageEditor/ImageEditorModal";
import { useImageEditStep } from "../../components/common/ImageEditor/useImageEditStep";
import handleClientError from "../../components/common/HandleClientError/HandleClientError";
import useLanguageData from "../../data/context/language/useLanguageData";
import { formatFileSize } from "../apps/telegram/telegram-display";

/** How long a caption can be: the shortest any channel takes. */
const MAX_CAPTION_LENGTH: number = 1000;

/** How many files go in one go. */
const MAX_FILES: number = 30;

interface IItem {
  id: string;
  file: File;
  url: string;
  caption: string;
  isChosen: boolean;
}

interface Props {
  /** The files just picked; the composer opens while there are any. */
  files: File[];
  /** What the box held when the files were picked: the first one's caption. */
  initialCaption: string;
  /** The largest file the channel takes, if it says. */
  maxUploadBytes: number | null;
  /** Sends one file with its caption; throws when the channel refuses it. */
  sendOne: (file: File, caption: string) => Promise<void>;
  /** Everything chosen went out (true), or the composer was left (false). */
  onClose: (isSent: boolean) => void;
}

let nextId: number = 0;

const kindOf = (file: File): "image" | "video" | "audio" | "pdf" | "file" => {
  if (file.type.startsWith("image/")) {
    return "image";
  }

  if (file.type.startsWith("video/")) {
    return "video";
  }

  if (file.type.startsWith("audio/")) {
    return "audio";
  }

  return file.type === "application/pdf" ? "pdf" : "file";
};

/**
 * Several files at once, as on WhatsApp: the one in focus large, all of them
 * in a strip below to choose which go, each with its own caption, and more
 * can be added before sending.
 */
export default function ChatsMediaComposer({
  files,
  initialCaption,
  maxUploadBytes,
  sendOne,
  onClose,
}: Props) {
  const { t } = useLanguageData();

  const { token } = theme.useToken();

  const [items, setItems] = useState<IItem[]>([]);

  const [activeId, setActiveId] = useState<string | null>(null);

  const [isSending, setIsSending] = useState<boolean>(false);

  const [progress, setProgress] = useState<number>(0);

  const addInputRef = useRef<HTMLInputElement | null>(null);

  // The picture editor, for the picture in focus.
  const { editIfImage, editor } = useImageEditStep();

  const isOpen: boolean = files.length > 0;

  const isTooLarge = (file: File): boolean =>
    maxUploadBytes !== null && file.size > maxUploadBytes;

  const toItems = (picked: File[], caption: string = ""): IItem[] =>
    picked.map((file: File, index: number) => ({
      id: String(nextId++),
      file,
      url: URL.createObjectURL(file),
      caption: index === 0 ? caption : "",
      isChosen: !isTooLarge(file),
    }));

  // Each opening starts from the files just picked.
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const fresh: IItem[] = toItems(
      files.slice(0, MAX_FILES),
      initialCaption.slice(0, MAX_CAPTION_LENGTH),
    );

    setItems(fresh);
    setActiveId(fresh[0]?.id ?? null);
    setProgress(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  // The previews live only while the composer does.
  const urlsRef = useRef<string[]>([]);

  useEffect(() => {
    const current: string[] = items.map((item: IItem) => item.url);
    const gone: string[] = urlsRef.current.filter(
      (url: string) => !current.includes(url),
    );

    gone.forEach((url: string) => URL.revokeObjectURL(url));
    urlsRef.current = current;
  }, [items]);

  useEffect(
    () => () => urlsRef.current.forEach((url) => URL.revokeObjectURL(url)),
    [],
  );

  const active: IItem | undefined =
    items.find((item: IItem) => item.id === activeId) ?? items[0];

  const chosen: IItem[] = useMemo(
    () => items.filter((item: IItem) => item.isChosen),
    [items],
  );

  const update = (id: string, patch: Partial<IItem>): void =>
    setItems((current: IItem[]) =>
      current.map((item: IItem) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    );

  const remove = (id: string): void => {
    const rest: IItem[] = items.filter((item: IItem) => item.id !== id);

    if (!rest.length) {
      onClose(false);

      return;
    }

    if (activeId === id) {
      const index: number = items.findIndex((item: IItem) => item.id === id);

      setActiveId(rest[Math.min(index, rest.length - 1)].id);
    }

    setItems(rest);
  };

  const add = (picked: File[]): void => {
    const room: number = MAX_FILES - items.length;
    const fresh: IItem[] = toItems(picked.slice(0, Math.max(0, room)));

    if (fresh.length) {
      setItems((current: IItem[]) => [...current, ...fresh]);
      setActiveId(fresh[0].id);
    }
  };

  const edit = async (item: IItem): Promise<void> => {
    const edited: File = await editIfImage(item.file);

    if (edited !== item.file) {
      update(item.id, { file: edited, url: URL.createObjectURL(edited) });
    }
  };

  // One after the other, in the order of the strip; what failed stays, with
  // what came after it, to try again.
  const send = async (): Promise<void> => {
    if (!chosen.length || isSending) {
      return;
    }

    setIsSending(true);
    setProgress(0);

    let sentIds: string[] = [];

    try {
      for (const item of chosen) {
        await sendOne(item.file, item.caption.trim());

        sentIds = [...sentIds, item.id];
        setProgress(sentIds.length);
      }

      onClose(true);
    } catch (error: any) {
      handleClientError(error);

      setItems((current: IItem[]) =>
        current.filter((item: IItem) => !sentIds.includes(item.id)),
      );
    } finally {
      setIsSending(false);
    }
  };

  const iconOf = (item: IItem, size: number) => {
    const style = { fontSize: size, color: token.colorTextSecondary };

    switch (kindOf(item.file)) {
      case "pdf":
        return (
          <FilePdfOutlined style={{ ...style, color: token.colorError }} />
        );
      case "audio":
        return <SoundOutlined style={style} />;
      default:
        return <FileOutlined style={style} />;
    }
  };

  const renderPreview = (item: IItem) => {
    const kind = kindOf(item.file);

    if (kind === "image") {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.url}
          alt={item.file.name}
          className="max-h-full max-w-full rounded-md object-contain"
        />
      );
    }

    if (kind === "video") {
      return (
        <video
          key={item.url}
          src={item.url}
          controls
          className="max-h-full max-w-full rounded-md"
        />
      );
    }

    return (
      <div className="flex flex-col items-center gap-3 text-center">
        {iconOf(item, 72)}
        <span className="max-w-xs break-all font-medium">{item.file.name}</span>
        <span className="text-xs" style={{ color: token.colorTextSecondary }}>
          {formatFileSize(item.file.size)}
        </span>
        {kind === "audio" && <audio key={item.url} src={item.url} controls />}
      </div>
    );
  };

  return (
    <Modal
      open={isOpen}
      onCancel={() => !isSending && onClose(false)}
      width={820}
      centered
      destroyOnHidden
      title={t("chats.mediaComposer.title").replace(
        "{count}",
        String(items.length),
      )}
      footer={
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm" style={{ color: token.colorTextSecondary }}>
            {isSending
              ? t("chats.mediaComposer.sending")
                  .replace("{sent}", String(progress))
                  .replace("{total}", String(chosen.length))
              : t("chats.mediaComposer.chosen")
                  .replace("{count}", String(chosen.length))
                  .replace("{total}", String(items.length))}
          </span>

          <span className="flex gap-2">
            <Button disabled={isSending} onClick={() => onClose(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              type="primary"
              icon={<SendOutlined />}
              loading={isSending}
              disabled={!chosen.length}
              onClick={send}
            >
              {t("chats.mediaComposer.send").replace(
                "{count}",
                String(chosen.length),
              )}
            </Button>
          </span>
        </div>
      }
    >
      {editor}

      {active && (
        <div className="flex flex-col gap-3">
          {/* The file in focus. */}
          <div
            className="relative flex h-[46vh] min-h-[240px] items-center justify-center overflow-hidden rounded-lg p-3"
            style={{
              background: token.colorFillQuaternary,
              opacity: active.isChosen ? 1 : 0.45,
            }}
          >
            {renderPreview(active)}

            {isEditableImage(active.file) && (
              <Button
                className="absolute right-3 top-3"
                icon={<EditOutlined />}
                disabled={isSending}
                onClick={() => edit(active)}
              >
                {t("chats.mediaComposer.edit")}
              </Button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span
              className="min-w-0 truncate"
              style={{ color: token.colorTextSecondary }}
            >
              {active.file.name} · {formatFileSize(active.file.size)}
            </span>

            {isTooLarge(active.file) ? (
              <span style={{ color: token.colorError }}>
                {t("chats.media.tooLarge").replace(
                  "{size}",
                  formatFileSize(maxUploadBytes ?? 0),
                )}
              </span>
            ) : (
              <Checkbox
                checked={active.isChosen}
                disabled={isSending}
                onChange={(event) =>
                  update(active.id, { isChosen: event.target.checked })
                }
              >
                {t("chats.mediaComposer.include")}
              </Checkbox>
            )}
          </div>

          <Input.TextArea
            autoSize={{ minRows: 1, maxRows: 4 }}
            maxLength={MAX_CAPTION_LENGTH}
            placeholder={t("chats.mediaComposer.caption")}
            value={active.caption}
            disabled={isSending || !active.isChosen}
            onChange={(event) =>
              update(active.id, { caption: event.target.value })
            }
            onPressEnter={(event) => {
              // Enter sends, as in the box; Shift+Enter breaks the line.
              if (!event.shiftKey) {
                event.preventDefault();
                send();
              }
            }}
          />

          {/* Every file: click to see it, the mark to choose it. */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {items.map((item: IItem) => {
              const isActive: boolean = item.id === active.id;
              const kind = kindOf(item.file);

              return (
                <div
                  key={item.id}
                  className="relative h-16 w-16 shrink-0 cursor-pointer overflow-hidden rounded-md"
                  style={{
                    border: `2px solid ${
                      isActive ? token.colorPrimary : token.colorBorderSecondary
                    }`,
                    background: token.colorFillQuaternary,
                    opacity: item.isChosen ? 1 : 0.4,
                  }}
                  role="button"
                  tabIndex={0}
                  title={item.file.name}
                  onClick={() => setActiveId(item.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      setActiveId(item.id);
                    }
                  }}
                >
                  {kind === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : kind === "video" ? (
                    <video
                      src={item.url}
                      muted
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="grid h-full w-full place-items-center">
                      {iconOf(item, 24)}
                    </span>
                  )}

                  {/* Only the mark: the tile itself shows the file. */}
                  <span
                    className="absolute left-0.5 top-0.5"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <Checkbox
                      checked={item.isChosen}
                      disabled={isSending || isTooLarge(item.file)}
                      onChange={(event) =>
                        update(item.id, { isChosen: event.target.checked })
                      }
                    />
                  </span>

                  <Tooltip title={t("chats.media.removeFile")}>
                    <button
                      type="button"
                      disabled={isSending}
                      className="absolute right-0.5 top-0.5 grid h-5 w-5 cursor-pointer place-items-center rounded-full border-0 text-[10px] text-white"
                      style={{ background: "rgba(0, 0, 0, 0.55)" }}
                      onClick={(event) => {
                        event.stopPropagation();
                        remove(item.id);
                      }}
                      aria-label={t("chats.media.removeFile")}
                    >
                      <CloseOutlined />
                    </button>
                  </Tooltip>
                </div>
              );
            })}

            {items.length < MAX_FILES && (
              <button
                type="button"
                disabled={isSending}
                onClick={() => addInputRef.current?.click()}
                className="grid h-16 w-16 shrink-0 cursor-pointer place-items-center rounded-md bg-transparent"
                style={{
                  border: `2px dashed ${token.colorBorder}`,
                  color: token.colorTextSecondary,
                }}
                aria-label={t("chats.mediaComposer.add")}
                title={t("chats.mediaComposer.add")}
              >
                <PlusOutlined />
              </button>
            )}

            <input
              ref={addInputRef}
              type="file"
              multiple
              hidden
              onChange={(event) => {
                const picked: File[] = Array.from(event.target.files ?? []);

                event.target.value = "";
                add(picked);
              }}
            />
          </div>
        </div>
      )}
    </Modal>
  );
}
