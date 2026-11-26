"use client";

import { Modal, Typography } from "antd";

import useLanguageData from "../../data/context/language/useLanguageData";
import { IQuickMessage } from "../../shared/business/quick-messages/quick-messages.types";
import QuickMessageBubbles from "./QuickMessageBubbles";

interface Props {
  quickMessage: IQuickMessage | null;
  onClose: () => void;
}

// Shows a quick message as the chat will get it, before anyone sends it.
export default function QuickMessagePreviewModal({
  quickMessage,
  onClose,
}: Props) {
  const { t } = useLanguageData();

  return (
    <Modal
      open={!!quickMessage}
      title={quickMessage?.name}
      footer={null}
      onCancel={onClose}
      destroyOnClose
    >
      <Typography.Paragraph type="secondary">
        {t("quickMessages.previewHelp")}
      </Typography.Paragraph>

      <QuickMessageBubbles
        blocks={quickMessage?.blocks ?? []}
        className="max-h-[60vh]"
      />
    </Modal>
  );
}
