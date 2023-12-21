"use client";

import { Button, Card } from "antd";

import Layout from "../../../components/template/Layout/Layout";

export default function NewStore() {
  return (
    <Layout subtitle="New store" title="New store">
      <Card
        className="h-min-80 mt-5"
        extra={
          <>
            <Button>Back</Button>
          </>
        }
      ></Card>
    </Layout>
  );
}
