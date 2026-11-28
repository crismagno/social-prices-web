"use client";

import Layout from "../../components/template/Layout/Layout";
import useLanguageData from "../../data/context/language/useLanguageData";
import SalesTable from "./components/SalesTable/SalesTable";

export default function SalesPage() {
  const { t } = useLanguageData();

  return (
    <Layout
      subtitle={t("sales.information")}
      title={t("sales.title")}
      hasBackButton
    >
      <SalesTable isShowStatusCards />
    </Layout>
  );
}
