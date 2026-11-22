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

/** One image of the site: sends the file and keeps what the API answers. */
const ImageField = ({ storeId, value, onChange }: Props) => {
  const { t } = useLanguageData();

  const inputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState<boolean>(false);

  const upload = async (file: File | undefined): Promise<void> => {
    if (!file) {
      return;
    }

    if (file.size > StoreSitesEnum.MAX_IMAGE_SIZE_BYTES) {
      handleClientError(t("storeSite.editor.imageTooLarge"), 4);
      return;
    }

    try {
      setIsUploading(true);

      onChange(
        await serviceMethodsInstance.storeSitesServiceMethods.uploadImage(
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
    <Space align="center">
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={getImageUrl(value)}
          alt=""
          className="h-14 w-20 rounded object-cover border"
        />
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        hidden
        onChange={(event) => upload(event.target.files?.[0])}
      />
      <Button
        icon={<UploadOutlined />}
        loading={isUploading}
        onClick={() => inputRef.current?.click()}
      >
        {value
          ? t("storeSite.editor.changeImage")
          : t("storeSite.editor.chooseImage")}
      </Button>
      {value && (
        <Button
          danger
          type="text"
          icon={<DeleteOutlined />}
          aria-label={t("storeSite.editor.removeImage")}
          onClick={() => onChange(null)}
        />
      )}
    </Space>
  );
};

export default ImageField;
