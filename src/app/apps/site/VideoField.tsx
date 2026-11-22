"use client";

import { useRef, useState } from "react";

import { Button, Space } from "antd";

import { DeleteOutlined, UploadOutlined } from "@ant-design/icons";

import handleClientError from "../../../components/common/HandleClientError/HandleClientError";
import useLanguageData from "../../../data/context/language/useLanguageData";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import { getImageUrl } from "../../../shared/utils/images/images-url";

interface Props {
  storeId: string;
  value: string | null;
  onChange: (value: string | null) => void;
}

/** One video file of the site: sends it and keeps what the API answers. */
const VideoField = ({ storeId, value, onChange }: Props) => {
  const { t } = useLanguageData();

  const inputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState<boolean>(false);

  const upload = async (file: File | undefined): Promise<void> => {
    if (!file) {
      return;
    }

    if (file.size > StoreSitesEnum.MAX_VIDEO_SIZE_BYTES) {
      handleClientError(t("storeSite.editor.about.videoTooLarge"), 4);
      return;
    }

    try {
      setIsUploading(true);

      onChange(
        await serviceMethodsInstance.storeSitesServiceMethods.uploadVideo(
          storeId,
          file,
        ),
      );
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsUploading(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  return (
    <Space direction="vertical" className="w-full">
      {value && (
        <video
          src={getImageUrl(value)}
          controls
          playsInline
          preload="metadata"
          className="w-full max-h-40 rounded border bg-black"
        />
      )}
      <Space>
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          hidden
          onChange={(event) => upload(event.target.files?.[0])}
        />
        <Button
          icon={<UploadOutlined />}
          loading={isUploading}
          onClick={() => inputRef.current?.click()}
        >
          {value
            ? t("storeSite.editor.about.changeVideo")
            : t("storeSite.editor.about.chooseVideo")}
        </Button>
        {value && (
          <Button
            danger
            type="text"
            icon={<DeleteOutlined />}
            aria-label={t("storeSite.editor.about.removeVideo")}
            onClick={() => onChange(null)}
          />
        )}
      </Space>
    </Space>
  );
};

export default VideoField;
