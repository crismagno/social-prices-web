"use client";

import { useState } from "react";

import { App, Avatar, Button, Image, Popconfirm, Space, Upload } from "antd";

import {
  DeleteOutlined,
  RobotOutlined,
  UploadOutlined,
} from "@ant-design/icons";

import { useImageEditStep } from "../../../components/common/ImageEditor/useImageEditStep";
import handleClientError from "../../../components/common/HandleClientError/HandleClientError";
import useLanguageData from "../../../data/context/language/useLanguageData";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import { botProfileErrorText } from "./telegram-display";

// Telegram takes only a JPEG and shows it round, so the picture is cropped to the
// centered square and scaled down here, before it leaves the browser.
const PHOTO_SIZE: number = 640;
const JPEG_QUALITY: number = 0.9;

const toSquareJpeg = async (file: File): Promise<Blob> => {
  const bitmap: ImageBitmap = await createImageBitmap(file);

  const side: number = Math.min(bitmap.width, bitmap.height);
  const size: number = Math.min(side, PHOTO_SIZE);

  const canvas: HTMLCanvasElement = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const context: CanvasRenderingContext2D | null = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas is not available.");
  }

  // JPEG has no transparency: a transparent PNG gets a white background.
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, size, size);
  context.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    size,
    size,
  );
  bitmap.close();

  return await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("No JPEG."))),
      "image/jpeg",
      JPEG_QUALITY,
    ),
  );
};

interface Props {
  photoUrl: string | null;
  onChange: (photo: Blob | null) => void;
}

// The bot's photo: changed or removed on Telegram right away. Who shows it owns it.
export default function TelegramBotPhotoField({ photoUrl, onChange }: Props) {
  const { t } = useLanguageData();

  const { message } = App.useApp();

  // The bot's photo is square on Telegram: the editor starts square.
  const { editIfImage, editor } = useImageEditStep("1:1");

  const [isBusy, setIsBusy] = useState<boolean>(false);

  const showError = (error: any): void => {
    const text: string | null = botProfileErrorText(error, t);

    if (text) {
      message.error(text);
    } else {
      handleClientError(error);
    }
  };

  const handlePick = async (file: File): Promise<void> => {
    if (!file.type.startsWith("image/")) {
      message.error(t("apps.telegram.profile.photoNotImage"));
      return;
    }

    try {
      setIsBusy(true);

      const jpeg: Blob = await toSquareJpeg(file);

      await serviceMethodsInstance.telegramServiceMethods.setBotPhoto(jpeg);

      onChange(jpeg);

      message.success(t("apps.telegram.profile.photoSaved"));
    } catch (error: any) {
      if (error?.response) {
        showError(error);
      } else {
        // The browser could not decode the file.
        message.error(t("apps.telegram.errors.TELEGRAM_BOT_PHOTO_INVALID"));
      }
    } finally {
      setIsBusy(false);
    }
  };

  const handleRemove = async (): Promise<void> => {
    try {
      setIsBusy(true);

      await serviceMethodsInstance.telegramServiceMethods.removeBotPhoto();

      onChange(null);

      message.success(t("apps.telegram.profile.photoRemoved"));
    } catch (error: any) {
      showError(error);
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="mb-4 flex items-center gap-4">
      {/* With a photo, clicking it opens Antd's full-size preview. */}
      <Avatar
        size={72}
        className={photoUrl ? "cursor-pointer" : undefined}
        src={photoUrl ? <Image src={photoUrl} alt="" preview /> : undefined}
        icon={!photoUrl && <RobotOutlined />}
      />

      <div className="min-w-0">
        <Space wrap>
          <Upload
            accept="image/jpeg,image/png,image/webp"
            showUploadList={false}
            beforeUpload={(file) => {
              editIfImage(file).then(handlePick);
              // The upload is done by hand, after the conversion.
              return false;
            }}
            disabled={isBusy}
          >
            <Button icon={<UploadOutlined />} loading={isBusy}>
              {t("apps.telegram.profile.photoChange")}
            </Button>
          </Upload>
          {editor}

          {photoUrl && (
            <Popconfirm
              title={t("apps.telegram.profile.photoRemoveConfirm")}
              onConfirm={handleRemove}
              disabled={isBusy}
            >
              <Button
                type="primary"
                icon={<DeleteOutlined />}
                danger
                disabled={isBusy}
              >
                {t("apps.telegram.profile.photoRemove")}
              </Button>
            </Popconfirm>
          )}
        </Space>

        <div className="mt-1 text-xs opacity-60">
          {t("apps.telegram.profile.photoHint")}
        </div>
      </div>
    </div>
  );
}
