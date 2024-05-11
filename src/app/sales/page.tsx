"use client";

import { Button, Card } from "antd";

import { PlusOutlined } from "@ant-design/icons";

import Layout from "../../components/template/Layout/Layout";

export default function SalesPage() {
  return (
    <Layout subtitle="Sales information" title="Sales">
      <Card
        title="Sales"
        className="h-min-80 mt-5"
        extra={
          <>
            <Button type="primary" onClick={() => {}} icon={<PlusOutlined />}>
              Create Sale
            </Button>
          </>
        }
      >
        test
      </Card>
    </Layout>
  );
}
