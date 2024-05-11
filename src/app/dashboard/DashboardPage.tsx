"use client";
import { Avatar, Card, Col, Row, Tooltip } from "antd";
import Meta from "antd/es/card/Meta";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import { useRouter } from "next/navigation";

import { TabletOutlined } from "@ant-design/icons";

import Layout from "../../components/template/Layout/Layout";
import Urls from "../../shared/common/routes-app/routes-app";
import { CustomersCard } from "./components/CustomersCard/CustomersCard";
import { StoresCard } from "./components/StoresCard/StoresCard";

export default function DashboardPage() {
  const router: AppRouterInstance = useRouter();

  return (
    <Layout subtitle="Dashboard information" title="Dashboard">
      <div className="p-5"></div>
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
          <Card
            cover={
              <img
                alt="example"
                src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
              />
            }
            actions={[
              <Tooltip key="table" title="See Categories">
                <TabletOutlined onClick={() => router.push(Urls.CATEGORIES)} />
              </Tooltip>,
            ]}
          >
            <Meta
              avatar={
                <Avatar src="https://api.dicebear.com/7.x/miniavs/svg?seed=8" />
              }
              title="Categories"
              description="Total Categories: 10"
            />
          </Card>
        </Col>
      </Row>
    </Layout>
  );
}
