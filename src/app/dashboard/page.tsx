"use client";

import { Col, Row } from "antd";

import Layout from "../../components/template/Layout/Layout";
import { SalesChart } from "../sales/components/SalesChart/SalesChart";
import { CategoriesCard } from "./components/CategoriesCard/CategoriesCard";
import { CustomersCard } from "./components/CustomersCard/CustomersCard";
import { CustomersDashboardTable } from "./components/CustomersDashboardTable/CustomersDashboardTable";
import { ProductsCard } from "./components/ProductsCard/ProductsCard";
import { StoresCard } from "./components/StoresCard/StoresCard";

export default function DashboardPage() {
  return (
    <Layout subtitle="Dashboard information" title="Dashboard">
      <SalesChart cardClassName="mt-5" />

      <div className="p-2"></div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <StoresCard />
        </Col>

        <Col xs={24} sm={12} md={6}>
          <CustomersCard />
        </Col>

        <Col xs={24} sm={12} md={6}>
          <ProductsCard />
        </Col>

        <Col xs={24} sm={12} md={6}>
          <CategoriesCard />
        </Col>
      </Row>

      <Row>
        <Col xs={24}>
          <CustomersDashboardTable />
        </Col>
      </Row>
    </Layout>
  );
}
