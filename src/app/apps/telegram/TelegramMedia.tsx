"use client";

import { useEffect, useState } from "react";

import { Button, Spin, theme } from "antd";

import {
  DownloadOutlined,
  FileOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";

import handleClientError from "../../../components/common/HandleClientError/HandleClientError";
import useLanguageData from "../../../data/context/language/useLanguageData";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import TelegramEnum from "../../../shared/business/apps/telegram/telegram.enum";
import {
  ITelegramMedia,
  ITelegramMessage,
} from "../../../shared/business/apps/telegram/telegram.types";
import AnimatedSticker from "./AnimatedSticker";
import { formatFileSize, mediaKind, MediaKind } from "./telegram-display";

interface Props {
  chatId: number;
  message: ITelegramMessage;
  media: ITelegramMedia;
  isOut: boolean;
}

// What a message carries besides text. Pictures load by themselves; video,
// audio and files wait for a click, so a long chat does not download everything.
export default function TelegramMedia({
  chatId,
  message,
  media,
  isOut,
}: Props) {
  const { t } = useLanguageData();

  const { token } = theme.useToken();

  const kind: MediaKind = mediaKind(media.mimeType);

  const isSticker: boolean =
    message.contentType === TelegramEnum.ContentType.STICKER;

  // Stickers and pictures show by themselves; the rest waits for a click.
  const autoLoads: boolean =
    kind === "image" ||
    kind === "animated-sticker" ||
    (isSticker && kind === "video");

  const [url, setUrl] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [hasFailed, setHasFailed] = useState<boolean>(false);

  const load = async (): Promise<string | null> => {
    try {
      setIsLoading(true);
      setHasFailed(false);

      const blob: Blob =
        await serviceMethodsInstance.telegramServiceMethods.getMedia(
          chatId,
          message._id,
        );

      const objectUrl: string = URL.createObjectURL(blob);

      setUrl(objectUrl);

      return objectUrl;
    } catch (error: any) {
      setHasFailed(true);
      handleClientError(error);

      return null;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (autoLoads) {
      load();
    }
  }, [message._id]);

  useEffect(
    () => () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    },
    [url],
  );

  const fileName: string =
    media.fileName ?? t(`apps.telegram.content.${message.contentType}`);

  const download = async (): Promise<void> => {
    const href: string | null = url ?? (await load());

    if (!href) {
      return;
    }

    const link: HTMLAnchorElement = document.createElement("a");
    link.href = href;
    link.download = fileName;
    link.click();
  };

  const retry = (
    <Button size="small" onClick={load} loading={isLoading}>
      {t("apps.telegram.media.retry")}
    </Button>
  );

  if (kind === "animated-sticker" || (isSticker && kind === "video")) {
    if (!url) {
      return (
        <div
          className="flex h-40 w-40 items-center justify-center"
          style={{ color: token.colorTextTertiary }}
        >
          {hasFailed ? retry : <Spin />}
        </div>
      );
    }

    return kind === "video" ? (
      <video
        src={url}
        autoPlay
        loop
        muted
        playsInline
        style={{ width: 160, height: 160 }}
      />
    ) : (
      <AnimatedSticker url={url} />
    );
  }

  if (kind === "image") {
    if (url) {
      return (
        <a href={url} target="_blank" rel="noreferrer">
          <img
            src={url}
            alt={fileName}
            className="max-h-72 max-w-full rounded-lg object-contain"
            style={{
              // A sticker is a drawing; a photo gets a frame to sit in.
              maxWidth:
                message.contentType === TelegramEnum.ContentType.STICKER
                  ? 160
                  : 280,
            }}
          />
        </a>
      );
    }

    return (
      <div
        className="flex h-32 w-52 items-center justify-center rounded-lg"
        style={{ background: token.colorFillSecondary }}
      >
        {hasFailed ? retry : <Spin />}
      </div>
    );
  }

  if ((kind === "video" || kind === "audio") && url) {
    return kind === "video" ? (
      <video
        src={url}
        controls
        autoPlay
        className="max-h-72 max-w-full rounded-lg"
        style={{ maxWidth: 280 }}
      />
    ) : (
      <audio src={url} controls autoPlay style={{ maxWidth: 260 }} />
    );
  }

  const isPlayable: boolean = kind === "video" || kind === "audio";

  return (
    <div className="flex items-center gap-3">
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg"
        style={{
          background: isOut
            ? "rgba(255,255,255,0.2)"
            : token.colorFillSecondary,
        }}
      >
        {isPlayable ? <PlayCircleOutlined /> : <FileOutlined />}
      </span>

      <div className="flex min-w-0 flex-col">
        <span className="truncate font-medium">{fileName}</span>

        <span className="text-xs" style={{ opacity: 0.7 }}>
          {[media.size ? formatFileSize(media.size) : null]
            .filter(Boolean)
            .join(" · ")}
        </span>
      </div>

      {hasFailed ? (
        retry
      ) : (
        <Button
          size="small"
          shape="circle"
          loading={isLoading}
          icon={isPlayable ? <PlayCircleOutlined /> : <DownloadOutlined />}
          onClick={isPlayable ? load : download}
          aria-label={t(
            isPlayable
              ? "apps.telegram.media.play"
              : "apps.telegram.media.download",
          )}
        />
      )}
    </div>
  );
}
