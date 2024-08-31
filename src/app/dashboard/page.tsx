"use client";

import { Col, Row } from "antd";

import Layout from "../../components/template/Layout/Layout";
import { SalesChart } from "../sales/components/SalesChart/SalesChart";
import SalesTable from "../sales/components/SalesTable/SalesTable";
import { CategoriesCard } from "./components/CategoriesCard/CategoriesCard";
import { CustomersCard } from "./components/CustomersCard/CustomersCard";
import { ProductsCard } from "./components/ProductsCard/ProductsCard";
import { StoresCard } from "./components/StoresCard/StoresCard";

export default function DashboardPage() {
  return (
    <Layout subtitle="Dashboard information" title="Dashboard">
      <Row gutter={[10, 10]} className="mt-5">
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

      <SalesChart cardClassName="mt-2" />

      <Row>
        <Col xs={24}>
          <SalesTable />
        </Col>
      </Row>
    </Layout>
  );
}
