"use client";

import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  message,
  Modal,
  Row,
  Tooltip,
} from 'antd';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context';
import {
  ReadonlyURLSearchParams,
  useRouter,
  useSearchParams,
} from 'next/navigation';

import {
  CheckCircleTwoTone,
  EnterOutlined,
} from '@ant-design/icons';

import Layout from '../../../components/template/Layout/Layout';
import Urls from '../../../shared/common/routes-app/routes-app';
import { ProductDetail } from '../components/ProductDetail/ProductDetail';
import { useFindProductById } from './useFindProductById';

export default function ProductDetailPage() {
  const router: AppRouterInstance = useRouter();

  const searchParams: ReadonlyURLSearchParams = useSearchParams();

  const productId: string | null = searchParams.get("pid");

  const { product } = useFindProductById(productId);

  const isEditMode: boolean = !!productId && !!product;

  const handleCreate = () => {
    Modal.confirm({
      title: "Your product has been created successfully!",
      icon: <CheckCircleTwoTone />,
      content: (
        <Alert
          message="Please confirm if you want to create a new product"
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
