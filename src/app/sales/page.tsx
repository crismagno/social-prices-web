"use client";

import { Collapse } from "antd";

import Layout from "../../components/template/Layout/Layout";
import { SalesChart } from "./components/SalesChart/SalesChart";
import SalesTable from "./components/SalesTable/SalesTable";

export default function SalesPage() {
  return (
    <Layout subtitle="Sales information" title="Sales" hasBackButton>
      <Collapse
        className="mt-5"
        style={{ backgroundColor: "#fff", boxShadow: "none" }}
        ghost
        items={[
          {
            key: "1",
            label: <span className="font-semibold text-base">Sales Chart</span>,
            children: <SalesChart isShowHeader={false} />,
          },
        ]}
      />

      <SalesTable />
    </Layout>
  );
}
