"use client";

import { Button, Card } from "antd";

import Layout from "../../../components/template/Layout/Layout";

export default function EditStore() {
  return (
    <Layout subtitle="Edit store" title="Edit store">
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
