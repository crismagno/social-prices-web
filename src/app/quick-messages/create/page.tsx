"use client";

import { useRouter } from "next/navigation";

import Layout from "../../../components/template/Layout/Layout";
import useLanguageData from "../../../data/context/language/useLanguageData";
import Urls from "../../../shared/common/routes-app/routes-app";
import QuickMessageEditor from "../QuickMessageEditor";
import QuickMessagesAccess from "../QuickMessagesAccess";

export default function QuickMessageCreatePage() {
  const { t } = useLanguageData();

  const router = useRouter();

  return (
    <Layout
      title={t("quickMessages.new")}
      subtitle={t("quickMessages.subtitle")}
      hasBackButton
    >
      <QuickMessagesAccess>
        <QuickMessageEditor onSaved={() => router.push(Urls.QUICK_MESSAGES)} />
      </QuickMessagesAccess>
    </Layout>
  );
}
