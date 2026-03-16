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
} from 'antd';
import {
  AppRouterInstance,
} from 'next/dist/shared/lib/app-router-context.shared-runtime';
import {
  useRouter,
  useSearchParams,
} from 'next/navigation';

import {
  CheckCircleTwoTone,
  EnterOutlined,
} from '@ant-design/icons';

import Layout from '../../../components/template/Layout/Layout';
import useLanguageData from '../../../data/context/language/useLanguageData';
import Urls from '../../../shared/common/routes-app/routes-app';
import {
  ProductItemDetail,
} from '../components/ProductItemDetail/ProductItemDetail';
import { useFindProductItemById } from '../useFindProductItemById';

export default function ProductItemDetailPage() {
  const { modal } = App.useApp();
  const { t } = useLanguageData();

  const router: AppRouterInstance = useRouter();
  const searchParams = useSearchParams();
  const productItemId = searchParams.get("piid");

  const { productItem } = useFindProductItemById(productItemId);

  const isEditMode: boolean = !!productItemId && !!productItem;

  const handleCreate = () => {
    modal.confirm({
      title: t("productItems.productItemCreatedSuccessfully"),
      icon: <CheckCircleTwoTone />,
      content: (
        <Alert
          message={t("productItems.confirmCreateProductItem")}
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
    message.success(t("productItems.productItemUpdatedSuccessfully"));
    router.back();
  };

  return (
    <Layout
      subtitle={
        isEditMode ? t("productItems.editProductItemDetails") : t("productItems.newProductItemDetails")
      }
      title={
        isEditMode
          ? `${t("productItems.editProductItem")}: ${productItem?.name}`
          : t("productItems.newProductItem")
      }
      hasBackButton
    >
      <Card className="h-min-80 mt-2">
        {isEditMode && productItem && (
          <>
            <Row gutter={24} justify={"end"}>
              <Col>
                <Tooltip title={t("productItems.goToProductItem")}>
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
                    {t("productItems.productItem")}
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
