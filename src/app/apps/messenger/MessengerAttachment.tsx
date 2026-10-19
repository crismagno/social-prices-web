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
import {
  IMessengerAttachment,
  IMessengerMessage,
} from "../../../shared/business/apps/messenger/messenger.types";
import { attachmentKind } from "./messenger-display";

interface Props {
  psid: string;
  message: IMessengerMessage;
  attachment: IMessengerAttachment;
  index: number;
  isOut: boolean;
}

// A file of a message. Pictures load by themselves; video, audio and files wait
// for a click, so a long chat does not download everything. The address Facebook
// gives expires, so the bytes always come through our API.
export default function MessengerAttachment({
  psid,
  message,
  attachment,
  index,
  isOut,
}: Props) {
  const { t } = useLanguageData();

  const { token } = theme.useToken();

  const kind = attachmentKind(attachment.type);

  const [url, setUrl] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [hasFailed, setHasFailed] = useState<boolean>(false);

  const load = async (): Promise<string | null> => {
    try {
      setIsLoading(true);
      setHasFailed(false);

      const blob: Blob =
        await serviceMethodsInstance.messengerServiceMethods.getAttachment(
          psid,
          message._id,
          index,
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
    if (kind === "image") {
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

  const label: string = t(`apps.messenger.content.${kind}`);

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
      {t("apps.messenger.media.retry")}
    </Button>
  );

  if (kind === "image") {
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

  if (url && kind === "video") {
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

  if (url && kind === "audio") {
    return <audio src={url} controls autoPlay style={{ maxWidth: 260 }} />;
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

      <span className="font-medium">{label}</span>

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
              ? "apps.messenger.media.play"
              : "apps.messenger.media.download",
          )}
        />
      )}
    </div>
  );
}
