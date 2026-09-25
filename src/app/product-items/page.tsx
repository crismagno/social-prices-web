"use client";

import { FeatureUsageBadge } from "../../components/common/FeatureUsageBadge/FeatureUsageBadge";
import { useFeaturesUsage } from "../../components/common/FeatureUsageBadge/useFeaturesUsage";
import Layout from "../../components/template/Layout/Layout";
import useLanguageData from "../../data/context/language/useLanguageData";
import { ProductItemsTable } from "./components/ProductItemsTable/ProductItemsTable";

export default function ProductItemsPage() {
  const { t } = useLanguageData();

  const { usage } = useFeaturesUsage();

  return (
    <Layout subtitle={t("productItems.myProductItems")} title={t("productItems.title")} hasBackButton>
      <div className="flex justify-end mt-5">
        <FeatureUsageBadge feature="product-items" usage={usage?.["product-items"]} />
      </div>

      <ProductItemsTable />
    </Layout>
  );
}
