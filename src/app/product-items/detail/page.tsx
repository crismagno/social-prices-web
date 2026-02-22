"use client";

import {
  Alert,
  App,
  Button,
  Card,
  Col,
  Divider,
  message,
  Row,
  Tooltip,
} from "antd";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import { useRouter, useSearchParams } from "next/navigation";

import { CheckCircleTwoTone, EnterOutlined } from "@ant-design/icons";

import Layout from "../../../components/template/Layout/Layout";
import Urls from "../../../shared/common/routes-app/routes-app";
import { ProductItemDetail } from "../components/ProductItemDetail/ProductItemDetail";
import { useFindProductItemById } from "../useFindProductItemById";

export default function ProductItemDetailPage() {
  const { modal } = App.useApp();

  const router: AppRouterInstance = useRouter();
  const searchParams = useSearchParams();
  const productItemId = searchParams.get("piid");

  const { productItem } = useFindProductItemById(productItemId);

  const isEditMode: boolean = !!productItemId && !!productItem;

  const handleCreate = () => {
    modal.confirm({
      title: "Your product item has been created successfully!",
      icon: <CheckCircleTwoTone />,
      content: (
        <Alert
          message="Please confirm if you want to create a new product item"
          type="success"
          showIcon
        />
      ),
      okText: "Confirm",
      cancelText: "Cancel",
      onOk: () => {},
      onCancel: () => router.back(),
    });
  };

  const handleUpdate = () => {
    message.success("Your product item has been update successfully!");
    router.back();
  };

  return (
    <Layout
      subtitle={
        isEditMode ? "Edit product item details" : "New product item details"
      }
      title={
        isEditMode
          ? `Edit product item: ${productItem?.name}`
          : "New product item"
      }
      hasBackButton
    >
      <Card className="h-min-80 mt-2">
        {isEditMode && productItem && (
          <>
            <Row gutter={24} justify={"end"}>
              <Col>
                <Tooltip title="Go to product item">
                  <Button
                    type="primary"
                    onClick={() =>
                      router.push(
                        Urls.PRODUCT_ITEM.replace(
                          ":productItemId",
                          productItem._id
                        )
                      )
                    }
                    icon={<EnterOutlined />}
                  >
                    Product Item
                  </Button>
                </Tooltip>
              </Col>
            </Row>

            <Divider className="mt-2" />
          </>
        )}

        <ProductItemDetail
          productItemId={productItemId}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          onCancel={() => router.back()}
        />
      </Card>
    </Layout>
  );
}
