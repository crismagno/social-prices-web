"use client";

import { Button, Card, Col, Divider, message, Row, Tooltip } from "antd";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import {
  ReadonlyURLSearchParams,
  useRouter,
  useSearchParams,
} from "next/navigation";

import { EnterOutlined } from "@ant-design/icons";

import Layout from "../../../components/template/Layout/Layout";
import Urls from "../../../shared/common/routes-app/routes-app";
import { ProductDetail } from "../components/ProductDetail/ProductDetail";
import { useFindProductById } from "./useFindProductById";

export default function ProductDetailPage() {
  const router: AppRouterInstance = useRouter();

  const searchParams: ReadonlyURLSearchParams = useSearchParams();

  const productId: string | null = searchParams.get("pid");

  const { product } = useFindProductById(productId);

  const isEditMode: boolean = !!productId && !!product;

  const handleCreate = async () => {
    message.success("Your product has been created successfully!");
    router.back();
  };

  const handleUpdate = async () => {
    message.success("Your product has been update successfully!");
    router.back();
  };

  return (
    <Layout
      subtitle={isEditMode ? "Edit product details" : "New product details"}
      title={isEditMode ? `Edit product: ${product?.name}` : "New product"}
      hasBackButton
    >
      <Card className="h-min-80 mt-2">
        <Row gutter={24} justify={"end"}>
          <Col>
            <Tooltip title="Go to product">
              <Button
                type="primary"
                onClick={() =>
                  router.push(Urls.PRODUCT.replace(":productId", product!._id))
                }
                icon={<EnterOutlined />}
              >
                Product
              </Button>
            </Tooltip>
          </Col>
        </Row>

        <Divider className="mt-2" />

        <ProductDetail
          productId={productId}
          onCreate={handleCreate}
          onCancel={() => router.back()}
          onUpdate={handleUpdate}
        />
      </Card>
    </Layout>
  );
}
