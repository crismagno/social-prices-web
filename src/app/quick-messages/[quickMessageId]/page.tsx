"use client";

import { useEffect, useState } from "react";

import { Spin } from "antd";
import { useParams, useRouter } from "next/navigation";

import handleClientError from "../../../components/common/HandleClientError/HandleClientError";
import Layout from "../../../components/template/Layout/Layout";
import useLanguageData from "../../../data/context/language/useLanguageData";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import { IQuickMessage } from "../../../shared/business/quick-messages/quick-messages.types";
import Urls from "../../../shared/common/routes-app/routes-app";
import QuickMessageEditor from "../QuickMessageEditor";
import QuickMessagesAccess from "../QuickMessagesAccess";

export default function QuickMessageEditPage() {
  const { t } = useLanguageData();

  const router = useRouter();

  const { quickMessageId } = useParams<{ quickMessageId: string }>();

  const [quickMessage, setQuickMessage] = useState<IQuickMessage | null>(null);

  useEffect(() => {
    if (!quickMessageId) {
      return;
    }

    serviceMethodsInstance.quickMessagesServiceMethods
      .getOne(quickMessageId)
      .then(setQuickMessage)
      .catch(handleClientError);
  }, [quickMessageId]);

  return (
    <Layout
      title={t("quickMessages.edit")}
      subtitle={quickMessage?.name ?? t("quickMessages.subtitle")}
      hasBackButton
    >
      <QuickMessagesAccess>
        {quickMessage ? (
          <QuickMessageEditor
            initial={quickMessage}
            onSaved={() => router.push(Urls.QUICK_MESSAGES)}
          />
        ) : (
          <Spin className="mt-5" />
        )}
      </QuickMessagesAccess>
    </Layout>
  );
}
