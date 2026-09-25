"use client";

import Layout from "../../components/template/Layout/Layout";
import useLanguageData from "../../data/context/language/useLanguageData";
import { ProductItemsTable } from "./components/ProductItemsTable/ProductItemsTable";

export default function ProductItemsPage() {
  const { t } = useLanguageData();

  return (
    <Layout subtitle={t("productItems.myProductItems")} title={t("productItems.title")} hasBackButton>
      <ProductItemsTable />
    </Layout>
  );
}
