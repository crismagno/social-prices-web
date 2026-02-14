"use client";

import { Button, Card, Col, Divider, Modal, Row, Tooltip } from "antd";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import { useRouter, useSearchParams } from "next/navigation";

import { CheckCircleTwoTone, EnterOutlined } from "@ant-design/icons";

import Layout from "../../../components/template/Layout/Layout";
import { IProductItem } from "../../../shared/business/product-items/product-items.interface";
import Urls from "../../../shared/common/routes-app/routes-app";
import { ProductItemDetail } from "../components/ProductItemDetail/ProductItemDetail";
import { useFindProductItemById } from "../useFindProductItemById";

export default function ProductItemDetailPage() {
  const router: AppRouterInstance = useRouter();
  const searchParams = useSearchParams();
  const productItemId = searchParams.get("piid");

  const { productItem } = useFindProductItemById(productItemId);

  const isEditMode: boolean = !!productItemId && !!productItem;

  const handleCreate = async () => {
    Modal.confirm({
      title: "Your product item has been created successfully!",
      icon: <CheckCircleTwoTone twoToneColor="#52c41a" />,
      okText: "See all product items",
      cancelText: "Create another",
      onOk: async () => {
        router.push(Urls.PRODUCT_ITEMS);
      },
    });
  };

  const handleUpdate = async (productItem: IProductItem | null) => {
    Modal.confirm({
      title: "Your product item has been updated successfully!",
      icon: <CheckCircleTwoTone twoToneColor="#52c41a" />,
      okText: "See all product items",
      cancelText: "Continue editing",
      onOk: async () => {
        router.push(Urls.PRODUCT_ITEMS);
      },
    });
  };

  const handleCancel = () => {
    router.push(Urls.PRODUCT_ITEMS);
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
          onCancel={handleCancel}
        />
      </Card>
    </Layout>
  );
}
