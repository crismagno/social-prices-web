"use client";

import { useState } from "react";

import { App, Button, Card, Input } from "antd";

import {
  InstagramOutlined,
  MailOutlined,
  PhoneOutlined,
  SendOutlined,
} from "@ant-design/icons";

import handleClientError from "../../components/common/HandleClientError/HandleClientError";
import Layout from "../../components/template/Layout/Layout";
import useLanguageData from "../../data/context/language/useLanguageData";
import { serviceMethodsInstance } from "../../services/social-prices-api/service-methods";

const SUPPORT_EMAIL: string = "support@social-prices.com";

// Example only for now: shown as plain text, deliberately not a link.
const SUPPORT_PHONE: string = "+0(00)00000.0000";

const INSTAGRAM_URL: string = "https://www.instagram.com/socialprices";

const FEEDBACK_MAX_LENGTH: number = 2000;

export default function SupportPage() {
  const { t } = useLanguageData()!;

  const { message } = App.useApp();

  const [feedback, setFeedback] = useState<string>("");

  const [isSending, setIsSending] = useState<boolean>(false);

  const handleSendFeedback = async (): Promise<void> => {
    try {
      setIsSending(true);

      await serviceMethodsInstance.feedbacksServiceMethods.create(
        feedback.trim(),
      );

      message.success(t("support.feedbackSent"));

      setFeedback("");
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Layout
      title={t("support.title")}
      subtitle={t("support.subtitle")}
      hasBackButton
    >
      <Card title={t("support.contactTitle")} className="mt-5">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <MailOutlined className="text-lg text-green-600" />

            <b>{t("support.email")}:</b>

            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-blue-500">
              {SUPPORT_EMAIL}
            </a>
          </div>

          <div className="flex items-center gap-3">
            <PhoneOutlined className="text-lg text-green-600" />

            <b>{t("support.phone")}:</b>

            <span>{SUPPORT_PHONE}</span>
          </div>

          <div className="flex items-center gap-3">
            <b>{t("support.socialTitle")}:</b>

            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("support.instagram")}
              title={t("support.instagram")}
              className="text-2xl text-pink-500 hover:text-pink-600"
            >
              <InstagramOutlined />
            </a>
          </div>
        </div>
      </Card>

      <Card title={t("support.feedbackTitle")} className="mt-5">
        <p className="mb-3">{t("support.feedbackDescription")}</p>

        <Input.TextArea
          rows={6}
          maxLength={FEEDBACK_MAX_LENGTH}
          showCount
          value={feedback}
          onChange={(event) => setFeedback(event.target.value)}
          placeholder={t("support.feedbackPlaceholder")}
          disabled={isSending}
        />

        <div className="flex justify-end mt-6">
          <Button
            type="primary"
            icon={<SendOutlined />}
            loading={isSending}
            disabled={!feedback.trim()}
            onClick={handleSendFeedback}
          >
            {t("support.sendFeedback")}
          </Button>
        </div>
      </Card>
    </Layout>
  );
}
