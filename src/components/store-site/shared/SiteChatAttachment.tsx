"use client";

import { useEffect, useState } from "react";

import { DownloadOutlined, FileOutlined } from "@ant-design/icons";

import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import { ISiteChatAttachment } from "../../../shared/business/store-sites/store-site-chat";
import styles from "./SiteChatWidget.module.css";

interface Props {
  slug: string;
  token: string;
  messageId: string;
  index: number;
  attachment: ISiteChatAttachment;
  /** The words for "download", in the language of the site. */
  downloadLabel: string;
}

const sizeOf = (bytes: number | null): string => {
  if (!bytes) {
    return "";
  }

  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

/**
 * One file of a chat message. Its bytes come only with the visitor's secret,
 * so they are fetched here and shown from memory: a picture, a player for
 * video and audio, or a card to download anything else.
 */
const SiteChatAttachment = ({
  slug,
  token,
  messageId,
  index,
  attachment,
  downloadLabel,
}: Props) => {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState<boolean>(false);

  useEffect(() => {
    let isCurrent: boolean = true;
    let objectUrl: string | null = null;

    serviceMethodsInstance.storeSitesServiceMethods
      .chatAttachment(slug, token, messageId, index)
      .then((blob: Blob) => {
        if (!isCurrent) {
          return;
        }

        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => isCurrent && setFailed(true));

    return () => {
      isCurrent = false;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [slug, token, messageId, index]);

  const name: string = attachment.fileName ?? "file";

  if (url && attachment.kind === "IMAGE") {
    return (
      <a href={url} target="_blank" rel="noreferrer" className={styles.media}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={name} className={styles.image} />
      </a>
    );
  }

  if (url && attachment.kind === "VIDEO") {
    return <video src={url} controls className={styles.video} />;
  }

  if (url && (attachment.kind === "AUDIO" || attachment.kind === "VOICE")) {
    return <audio src={url} controls className={styles.audio} />;
  }

  if (!url && !failed && attachment.kind !== "FILE") {
    return <span className={styles.loading} aria-hidden />;
  }

  return (
    <a
      className={styles.fileCard}
      href={url ?? undefined}
      download={name}
      aria-disabled={!url}
    >
      <span className={styles.fileIcon}>
        <FileOutlined />
      </span>
      <span className={styles.fileInfo}>
        <span className={styles.fileName}>{name}</span>
        <span className={styles.fileSize}>{sizeOf(attachment.size)}</span>
      </span>
      {url && <DownloadOutlined aria-label={downloadLabel} />}
    </a>
  );
};

export default SiteChatAttachment;
