"use client";

import { Avatar, Card, Col, Row, Tooltip } from "antd";
import Meta from "antd/es/card/Meta";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import { useRouter } from "next/navigation";

import { PlusOutlined, TabletOutlined } from "@ant-design/icons";

import Layout from "../../components/template/Layout/Layout";
import Urls from "../../shared/common/routes-app/routes-app";

export default function DashboardPage() {
  const router: AppRouterInstance = useRouter();

  return (
    <Layout subtitle="Dashboard information" title="Dashboard">
      <div className="p-5"></div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card
            cover={
              <img
                alt="example"
                src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
              />
            }
            actions={[
              <Tooltip key="table" title="See Customers">
                <TabletOutlined onClick={() => router.push(Urls.CUSTOMERS)} />
              </Tooltip>,
              <Tooltip key="plus" title="Create a new Customer">
                <PlusOutlined onClick={() => router.push(Urls.NEW_CUSTOMER)} />
              </Tooltip>,
            ]}
          >
            <Meta
              avatar={
                <Avatar src="https://api.dicebear.com/7.x/miniavs/svg?seed=8" />
              }
              title="Customers"
              description="Total Customers: 50"
            />
          </Card>
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
              <Tooltip key="table" title="See Stores">
                <TabletOutlined onClick={() => router.push(Urls.STORES)} />
              </Tooltip>,
              <Tooltip key="plus" title="Create a new Store">
                <PlusOutlined onClick={() => router.push(Urls.NEW_STORE)} />
              </Tooltip>,
            ]}
          >
            <Meta
              avatar={
                <Avatar src="https://api.dicebear.com/7.x/miniavs/svg?seed=8" />
              }
              title="Stores"
              description="Total Stores: 10"
            />
          </Card>
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
              <Tooltip key="table" title="See Products">
                <TabletOutlined onClick={() => router.push(Urls.PRODUCTS)} />
              </Tooltip>,
              <Tooltip key="plus" title="Create a new Product">
                <PlusOutlined onClick={() => router.push(Urls.NEW_PRODUCT)} />
              </Tooltip>,
            ]}
          >
            <Meta
              avatar={
                <Avatar src="https://api.dicebear.com/7.x/miniavs/svg?seed=8" />
              }
              title="Products"
              description="Total Products: 200"
            />
          </Card>
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
