"use client";

import Layout from "../../components/template/Layout/Layout";
import { ProductItemsTable } from "./components/ProductItemsTable/ProductItemsTable";

export default function ProductItemsPage() {
  return (
    <Layout subtitle="My Product Items" title="Product Items" hasBackButton>
      <ProductItemsTable />
    </Layout>
  );
}
