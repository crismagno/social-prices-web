"use client";

import { DownloadOutlined, FileOutlined } from "@ant-design/icons";
import { Button, Modal, Typography } from "antd";

import useLanguageData from "../../../data/context/language/useLanguageData";
import styles from "./FilePreviewModal.module.css";

interface Props {
  open: boolean;
  /** Where the file is: a local address of a picked file, or the stored one. */
  source: string | null;
  mimeType: string;
  name: string;
  /** A size already written for people (e.g. "1.2 MB"). */
  sizeLabel?: string;
  onClose: () => void;
}

/** Whether the browser shows a file of this kind inside a frame. */
const isFramed = (mimeType: string): boolean =>
  mimeType === "application/pdf" || mimeType.startsWith("text/");

/**
 * A file seen in full before it is sent: a picture at its size, a player for
 * video and audio, a PDF or a text in a frame, and for anything else its name
 * with a way to download it.
 */
const FilePreviewModal = ({
  open,
  source,
  mimeType,
  name,
  sizeLabel,
  onClose,
}: Props) => {
  const { t } = useLanguageData();

  let body: React.ReactNode;

  if (source && mimeType.startsWith("image/")) {
    // eslint-disable-next-line @next/next/no-img-element
    body = <img src={source} alt={name} className={styles.image} />;
  } else if (source && mimeType.startsWith("video/")) {
    body = <video src={source} controls autoPlay className={styles.video} />;
  } else if (source && mimeType.startsWith("audio/")) {
    body = (
      <div className={styles.audioBox}>
        <FileOutlined className={styles.bigIcon} />
        <audio src={source} controls autoPlay className={styles.audio} />
      </div>
    );
  } else if (source && isFramed(mimeType)) {
    body = <iframe src={source} title={name} className={styles.frame} />;
  } else {
    body = (
      <div className={styles.other}>
        <FileOutlined className={styles.bigIcon} />
        <Typography.Text>{t("filePreview.noPreview")}</Typography.Text>
      </div>
    );
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={880}
      destroyOnClose
      title={
        <span className={styles.title}>
          <span className={styles.name}>{name}</span>
          {sizeLabel && (
            <Typography.Text type="secondary">{sizeLabel}</Typography.Text>
          )}
        </span>
      }
      footer={[
        source && (
          <Button
            key="download"
            icon={<DownloadOutlined />}
            href={source}
            download={name}
            target="_blank"
          >
            {t("filePreview.download")}
          </Button>
        ),
        <Button key="close" type="primary" onClick={onClose}>
          {t("filePreview.close")}
        </Button>,
      ]}
    >
      <div className={styles.area}>{body}</div>
    </Modal>
  );
};

export default FilePreviewModal;
