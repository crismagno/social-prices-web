"use client";

import { useEffect, useState } from "react";

import { Alert, App, Form, Input, Modal, Spin } from "antd";

import handleClientError from "../../../components/common/HandleClientError/HandleClientError";
import useLanguageData from "../../../data/context/language/useLanguageData";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import { ITelegramBotProfile } from "../../../shared/business/apps/telegram/telegram.types";
import TelegramBotPhotoField from "./TelegramBotPhotoField";
import { botProfileErrorText } from "./telegram-display";

// Telegram's own limits for each field.
const MAX_NAME: number = 64;
const MAX_DESCRIPTION: number = 512;
const MAX_SHORT_DESCRIPTION: number = 120;

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: (profile: ITelegramBotProfile) => void;
  photoUrl: string | null;
  onPhotoChanged: (photo: Blob | null) => void;
}

// Name and descriptions of the bot, read live from Telegram each time it opens.
export default function TelegramBotProfileModal({
  open,
  onClose,
  onSaved,
  photoUrl,
  onPhotoChanged,
}: Props) {
  const { t } = useLanguageData();

  const { message } = App.useApp();

  const [form] = Form.useForm<ITelegramBotProfile>();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    const load = async (): Promise<void> => {
      try {
        setIsLoading(true);

        form.setFieldsValue(
          await serviceMethodsInstance.telegramServiceMethods.getBotProfile(),
        );
      } catch (error: any) {
        handleClientError(error);
        onClose();
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [open, form, onClose]);

  const showError = (error: any): void => {
    const text: string | null = botProfileErrorText(error, t);

    if (text) {
      message.error(text);
    } else {
      handleClientError(error);
    }
  };

  const handleSave = async (): Promise<void> => {
    try {
      const values: ITelegramBotProfile = await form.validateFields();

      setIsSaving(true);

      const saved: ITelegramBotProfile =
        await serviceMethodsInstance.telegramServiceMethods.updateBotProfile(
          values,
        );

      message.success(t("apps.telegram.profile.saved"));

      onSaved(saved);
    } catch (error: any) {
      // Form validation failures already show next to the fields.
      if (!error?.errorFields) {
        showError(error);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title={t("apps.telegram.profile.title")}
      okText={t("apps.telegram.profile.save")}
      onOk={handleSave}
      onCancel={onClose}
      confirmLoading={isSaving}
      okButtonProps={{ disabled: isLoading }}
      destroyOnClose
    >
      <p className="mb-4 mt-0 opacity-70">
        {t("apps.telegram.profile.subtitle")}
      </p>

      <TelegramBotPhotoField photoUrl={photoUrl} onChange={onPhotoChanged} />

      <Spin spinning={isLoading}>
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="name"
            label={t("apps.telegram.profile.name")}
            rules={[
              {
                required: true,
                whitespace: true,
                message: t("apps.telegram.profile.nameRequired"),
              },
            ]}
          >
            <Input maxLength={MAX_NAME} showCount />
          </Form.Item>

          <Form.Item
            name="shortDescription"
            label={t("apps.telegram.profile.shortDescription")}
            extra={t("apps.telegram.profile.shortDescriptionHint")}
          >
            <Input.TextArea
              maxLength={MAX_SHORT_DESCRIPTION}
              showCount
              autoSize={{ minRows: 2, maxRows: 3 }}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label={t("apps.telegram.profile.description")}
            extra={t("apps.telegram.profile.descriptionHint")}
          >
            <Input.TextArea
              maxLength={MAX_DESCRIPTION}
              showCount
              autoSize={{ minRows: 3, maxRows: 8 }}
            />
          </Form.Item>
        </Form>
      </Spin>

      <Alert
        type="info"
        showIcon
        message={t("apps.telegram.profile.rateLimitNote")}
      />
    </Modal>
  );
}
