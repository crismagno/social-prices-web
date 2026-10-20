"use client";

import Layout from "../../components/template/Layout/Layout";
import useLanguageData from "../../data/context/language/useLanguageData";
import ChatsInbox from "./ChatsInbox";

export default function ChatsPage() {
  const { t } = useLanguageData();

  return (
    <Layout title={t("chats.title")} subtitle={t("chats.subtitle")}>
      <div className="mt-4">
        <ChatsInbox />
      </div>
    </Layout>
  );
}
