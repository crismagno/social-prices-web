"use client";

import { Collapse } from "antd";

import Layout from "../../components/template/Layout/Layout";
import useLanguageData from "../../data/context/language/useLanguageData";
import { SalesChart } from "./components/SalesChart/SalesChart";
import SalesTable from "./components/SalesTable/SalesTable";

export default function SalesPage() {
  const { t } = useLanguageData();

  return (
    <Layout
      subtitle={t("sales.information")}
      title={t("sales.title")}
      hasBackButton
    >
      <Collapse
        className="mt-5"
        style={{ backgroundColor: "#fff", boxShadow: "none" }}
        ghost
        items={[
          {
            key: "1",
            label: (
              <span className="font-semibold text-base">
                {t("sales.salesChart")}
              </span>
            ),
            children: <SalesChart isShowHeader={false} />,
          },
        ]}
      />

      <SalesTable />
    </Layout>
  );
}
