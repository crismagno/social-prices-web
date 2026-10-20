"use client";

import { useEffect, useState } from "react";

import { Button, Spin, theme } from "antd";

import {
  DownloadOutlined,
  FileOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";

import handleClientError from "../../components/common/HandleClientError/HandleClientError";
import useLanguageData from "../../data/context/language/useLanguageData";
import { serviceMethodsInstance } from "../../services/social-prices-api/service-methods";
import {
  IInboxAttachment,
  IInboxMessage,
} from "../../shared/business/inbox/inbox.types";
import InboxEnum from "../../shared/business/inbox/inbox.enum";
import AnimatedSticker from "../apps/telegram/AnimatedSticker";
import { attachmentShape, contentKey } from "./chats-display";

interface Props {
  message: IInboxMessage;
  attachment: IInboxAttachment;
  isOut: boolean;
}

// A file of a message. Pictures load by themselves; video, audio and files wait
// for a click, so a long chat does not download everything. The bytes always come
// through our API: the channel's own address expires, and a tag cannot send the token.
export default function ChatsAttachment({ message, attachment, isOut }: Props) {
  const { t } = useLanguageData();

  const { token } = theme.useToken();

  const shape = attachmentShape(attachment.kind, attachment.mimeType);

  const isSticker: boolean = message.kind === InboxEnum.MessageKind.STICKER;

  // Pictures and stickers show by themselves; the rest waits for a click.
  const autoLoads: boolean =
    shape === "image" || shape === "animated-sticker" || isSticker;

  const [url, setUrl] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [hasFailed, setHasFailed] = useState<boolean>(false);

  const load = async (): Promise<string | null> => {
    try {
      setIsLoading(true);
      setHasFailed(false);

      const blob: Blob =
        await serviceMethodsInstance.inboxServiceMethods.getAttachment(
          message._id,
          attachment.index,
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

  const label: string =
    attachment.fileName ?? t(`chats.content.${contentKey(attachment.kind)}`);

  const download = async (): Promise<void> => {
    const href: string | null = url ?? (await load());

    if (!href) {
      return;
    }

    const link: HTMLAnchorElement = document.createElement("a");
    link.href = href;
    link.download = label;
    link.click();
  };

  const retry = (
    <Button size="small" onClick={load} loading={isLoading}>
      {t("chats.media.retry")}
    </Button>
  );

  // A sticker is a drawing, not a picture: no frame, and it moves when it can.
  if (shape === "animated-sticker" || (isSticker && shape !== "file")) {
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

    return shape === "animated-sticker" ? (
      <AnimatedSticker url={url} />
    ) : shape === "video" ? (
      <video
        src={url}
        autoPlay
        loop
        muted
        playsInline
        style={{ width: 160, height: 160 }}
      />
    ) : (
      <img
        src={url}
        alt={label}
        className="object-contain"
        style={{ maxWidth: 160, maxHeight: 160 }}
      />
    );
  }

  if (shape === "image") {
    return url ? (
      <a href={url} target="_blank" rel="noreferrer">
        <img
          src={url}
          alt={label}
          className="max-h-72 max-w-full rounded-lg object-contain"
          style={{ maxWidth: 280 }}
        />
      </a>
    ) : (
      <div
        className="flex h-32 w-52 items-center justify-center rounded-lg"
        style={{ background: token.colorFillSecondary }}
      >
        {hasFailed ? retry : <Spin />}
      </div>
    );
  }

  if (url && shape === "video") {
    return (
      <video
        src={url}
        controls
        autoPlay
        className="max-h-72 rounded-lg"
        style={{ maxWidth: 280 }}
      />
    );
  }

  if (url && shape === "audio") {
    return <audio src={url} controls autoPlay style={{ maxWidth: 260 }} />;
  }

  const isPlayable: boolean = shape === "video" || shape === "audio";

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

      <span className="min-w-0 truncate font-medium">{label}</span>

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
            isPlayable ? "chats.media.play" : "chats.media.download",
          )}
        />
      )}
    </div>
  );
}
