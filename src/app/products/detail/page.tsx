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
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import {
  ReadonlyURLSearchParams,
  useRouter,
  useSearchParams,
} from "next/navigation";

import { CheckCircleTwoTone, EnterOutlined } from "@ant-design/icons";

import Layout from "../../../components/template/Layout/Layout";
import useLanguageData from "../../../data/context/language/useLanguageData";
import Urls from "../../../shared/common/routes-app/routes-app";
import { ProductDetail } from "../components/ProductDetail/ProductDetail";
import { useFindProductById } from "./useFindProductById";

export default function ProductDetailPage() {
  const { modal } = App.useApp();
  const { t } = useLanguageData();

  const router: AppRouterInstance = useRouter();

  const searchParams: ReadonlyURLSearchParams = useSearchParams();

  const productId: string | null = searchParams.get("pid");

  const { product } = useFindProductById(productId);

  const isEditMode: boolean = !!productId && !!product;

  const handleCreate = () => {
    modal.confirm({
      title: t("products.productCreatedSuccessfully"),
      icon: <CheckCircleTwoTone />,
      content: (
        <Alert
          message={t("products.confirmCreateProduct")}
          type="success"
          showIcon
        />
      ),
      okText: t("common.confirm"),
      cancelText: t("common.cancel"),
      onOk: () => {},
      onCancel: () => router.back(),
    });
  };

  const handleUpdate = () => {
    message.success(t("products.productUpdatedSuccessfully"));
    router.back();
  };

  return (
    <Layout
      subtitle={
        isEditMode
          ? t("products.editProductDetails")
          : t("products.newProductDetails")
      }
      title={
        isEditMode
          ? `${t("products.editProduct")}: ${product?.name}`
          : t("products.newProduct")
      }
      hasBackButton
    >
      <Card className="h-min-80 mt-2">
        {product && (
          <>
            <Row gutter={24} justify={"end"}>
              <Col>
                <Tooltip title={t("products.goToProduct")}>
                  <Button
                    type="primary"
                    onClick={() =>
                      router.push(
                        Urls.PRODUCT.replace(":productId", product!._id),
                      )
                    }
                    icon={<EnterOutlined />}
                  >
                    {t("products.product")}
                  </Button>
                </Tooltip>
              </Col>
            </Row>

            <Divider className="mt-2" />
          </>
        )}

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
