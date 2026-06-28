"use client";

import { Card } from "antd";

import Layout from "../../../components/template/Layout/Layout";
import useLanguageData from "../../../data/context/language/useLanguageData";
import DeleteAccount from "./components/DeleteAccount/DeleteAccount";

export default function ProfileDeletePage() {
  const { t } = useLanguageData()!;

  return (
    <Layout
      title={t("profile.deleteAccount")}
      subtitle={t("profile.deleteAccountSubtitle")}
      hasBackButton
    >
      <Card className="mt-6">
        <DeleteAccount />
      </Card>
    </Layout>
  );
}
