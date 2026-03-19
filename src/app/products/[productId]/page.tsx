"use client";

import { useState } from "react";

import {
  Avatar as AvatarAntd,
  Button,
  Card,
  Col,
  Descriptions,
  Image,
  Modal,
  QRCode,
  Row,
  Tabs,
  Tag,
  Tooltip,
} from "antd";
import moment from "moment";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";
import { useParams, useRouter } from "next/navigation";

import { EditOutlined } from "@ant-design/icons";

import Avatar from "../../../components/common/Avatar/Avatar";
import ContainerTitle from "../../../components/common/ContainerTitle/ContainerTitle";
import LoadingFull from "../../../components/common/LoadingFull/LoadingFull";
import { ProductHistoricPricesButton } from "../../../components/common/ProductHistoricPricesButton/ProductHistoricPricesButton";
import { TagCategoriesCustomAntd } from "../../../components/common/TagCategoriesCustomAntd/TagCategoriesCustomAntd";
import { TagStoresCustomAntd } from "../../../components/common/TagStoresCustomAntd/TagStoresCustomAntd";
import { TagTagsCustomAntd } from "../../../components/common/TagTagsCustomAntd/TagTagsCustomAntd";
import YesNo from "../../../components/common/YesNo/YesNo";
import Layout from "../../../components/template/Layout/Layout";
import useLanguageData from "../../../data/context/language/useLanguageData";
import CategoriesEnum from "../../../shared/business/categories/categories.enum";
import TagsEnum from "../../../shared/business/tags/tags.enum";
import Urls from "../../../shared/common/routes-app/routes-app";
import DatesEnum from "../../../shared/utils/dates/dates.enum";
import { getImageUrl } from "../../../shared/utils/images/images-url";
import ImagesEnum from "../../../shared/utils/images/images.enum";
import { formatToMoneyDecimal } from "../../../shared/utils/strings/string";
import { useFindCategoriesByType } from "../../categories/useFindCategoriesByType";
import { ProductItemsTable } from "../../product-items/components/ProductItemsTable/ProductItemsTable";
import { SalesBalance } from "../../sales/components/SalesBalance/SalesBalance";
import { SalesChart } from "../../sales/components/SalesChart/SalesChart";
import SalesTable from "../../sales/components/SalesTable/SalesTable";
import { useFindStoresByUser } from "../../stores/useFindStoresByUser";
import { useFindTagsByType } from "../../tags/useFindTagsByType";
import { useFindProductById } from "../detail/useFindProductById";

export default function ProductPage() {
  const { t } = useLanguageData();
  const router: AppRouterInstance = useRouter();

  const params: Params = useParams();

  const [previewOpen, setPreviewOpen] = useState<boolean>(false);

  const paramsProductId: string = params?.productId;

  const { isLoading, product } = useFindProductById(paramsProductId);

  const { tags, isLoading: isLoadingTags } = useFindTagsByType(
    TagsEnum.Type.PRODUCT
  );

  const { categories, isLoading: isLoadingCategories } =
    useFindCategoriesByType(CategoriesEnum.Type.PRODUCT);

  const { stores, isLoading: isLoadingStores } = useFindStoresByUser();

  if (
    isLoading ||
    !product ||
    isLoadingTags ||
    isLoadingStores ||
    isLoadingCategories
  ) {
    return <LoadingFull />;
  }

  const productId: string = product._id;

  const handleEditProduct = () => {
    router.push(Urls.EDIT_PRODUCT.replace(":productId", productId));
  };

  return (
    <Layout
      subtitle={`${t("products.productSubtitle")} - ${product.name}`}
      title={t("products.product")}
      hasBackButton
    >
      <Card className="h-min-80 mt-2">
        <Row gutter={[4, 4]}>
          <Col
            xs={24}
            sm={10}
            md={5}
            className="flex flex-col justify-start items-center"
          >
            <Avatar
              onClick={() => setPreviewOpen(true)}
              src={product.mainUrl}
              width={240}
              className="shadow-lg border-none cursor-pointer z-10 rounded-lg mt-10"
              title={t("products.seeImage")}
            />

            <div className="mt-2">
              <AvatarAntd.Group
                maxCount={2}
                shape="circle"
                size="large"
                maxStyle={{ color: "#f56a00", backgroundColor: "#fde3cf" }}
              >
                {product.filesUrl.map((fileUrl: string) => (
                  <Image
                    key={fileUrl}
                    width={40}
                    src={getImageUrl(fileUrl)}
                    alt="mainUrl"
                    className="rounded-full"
                  />
                ))}
              </AvatarAntd.Group>
            </div>

            <h3 className="md:text-2xl font-semibold text-blueGray-700 mt-1 mb-1">
              {product.name}
            </h3>

            <Tooltip title={t("products.productBarcode")}>
              <Tag>{product.barcode}</Tag>
            </Tooltip>
          </Col>

          <Col xs={24} sm={14} md={19}>
            <ContainerTitle
              title={t("stores.information")}
              extraHeader={
                <Tooltip title={t("products.editProduct")}>
                  <Button
                    type="success"
                    icon={<EditOutlined />}
                    onClick={handleEditProduct}
                  >
                    {t("common.edit")}
                  </Button>
                </Tooltip>
              }
            >
              <Row gutter={[16, 16]}>
                {/* Basic Information */}
                <Col xs={24}>
                  <Descriptions
                    bordered
                    column={{ xs: 1, sm: 1, md: 2, lg: 3, xl: 3 }}
                    size="small"
                  >
                    <Descriptions.Item label={t("common.name")} span={3}>
                      <span className="font-medium">{product.name}</span>
                    </Descriptions.Item>

                    <Descriptions.Item label={t("products.barcode")}>
                      <Tag color="blue">{product.barcode}</Tag>
                    </Descriptions.Item>

                    <Descriptions.Item label={t("products.sku")}>
                      <Tag color="purple">{product.sku || "-"}</Tag>
                    </Descriptions.Item>

                    <Descriptions.Item label={t("products.brand")}>
                      {product.brand || "-"}
                    </Descriptions.Item>

                    <Descriptions.Item label={t("common.price")}>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-green-600">
                          {formatToMoneyDecimal(product.price)}
                        </span>
                        <ProductHistoricPricesButton product={product} />
                      </div>
                    </Descriptions.Item>

                    <Descriptions.Item label={t("common.quantity")}>
                      <Tag color={product.quantity > 0 ? "success" : "error"}>
                        {product.quantity}
                      </Tag>
                    </Descriptions.Item>

                    <Descriptions.Item label={t("products.isActive")}>
                      <Tag color={product.isActive ? "green" : "red"}>
                        <YesNo isTrue={product.isActive} />
                      </Tag>
                    </Descriptions.Item>
                  </Descriptions>
                </Col>

                {/* Description & Details */}
                <Col xs={24}>
                  <Descriptions bordered column={1} size="small">
                    <Descriptions.Item label={t("common.description")}>
                      <div className="max-h-20 overflow-y-auto">
                        {product.description || "-"}
                      </div>
                    </Descriptions.Item>

                    <Descriptions.Item label={t("common.details")}>
                      <div className="max-h-20 overflow-y-auto">
                        {product.details || "-"}
                      </div>
                    </Descriptions.Item>
                  </Descriptions>
                </Col>

                {/* Categories, Tags & Stores */}
                <Col xs={24}>
                  <Descriptions bordered column={1} size="small">
                    <Descriptions.Item label={t("products.categories")}>
                      <div className="max-w-full overflow-x-auto py-1">
                        <div className="flex flex-wrap gap-1">
                          <TagCategoriesCustomAntd
                            categories={categories}
                            useTag
                            categoriesIds={product.categoriesIds}
                          />
                        </div>
                      </div>
                    </Descriptions.Item>

                    <Descriptions.Item label={t("products.tags")}>
                      <div className="max-w-full overflow-x-auto py-1">
                        <div className="flex flex-wrap gap-1">
                          <TagTagsCustomAntd
                            tags={tags}
                            useTag
                            tagsIds={product.tagsIds}
                          />
                        </div>
                      </div>
                    </Descriptions.Item>

                    <Descriptions.Item label={t("products.stores")}>
                      <div className="max-w-full overflow-x-auto py-1">
                        <div className="flex flex-wrap gap-1">
                          <TagStoresCustomAntd
                            stores={stores}
                            useTag
                            storeIds={product.storeIds}
                          />
                        </div>
                      </div>
                    </Descriptions.Item>
                  </Descriptions>
                </Col>

                {/* Dates & Additional Info */}
                <Col xs={24}>
                  <Descriptions
                    bordered
                    column={{ xs: 1, sm: 2, md: 2, lg: 3, xl: 3 }}
                    size="small"
                  >
                    <Descriptions.Item label={t("products.releaseDate")}>
                      {product.releaseDate
                        ? moment(product.releaseDate).format(
                            DatesEnum.Format.DDMMYYY
                          )
                        : "-"}
                    </Descriptions.Item>

                    <Descriptions.Item label={t("products.expirationDate")}>
                      {product.expirationDate
                        ? moment(product.expirationDate).format(
                            DatesEnum.Format.DDMMYYY
                          )
                        : "-"}
                    </Descriptions.Item>

                    <Descriptions.Item label={t("products.uploadFilename")}>
                      {product.uploadFilename || "-"}
                    </Descriptions.Item>

                    <Descriptions.Item label={t("sales.createdAt")}>
                      {product.createdAt
                        ? moment(product.createdAt).format(
                            DatesEnum.Format.DDMMYYYYhhmmss
                          )
                        : "-"}
                    </Descriptions.Item>

                    <Descriptions.Item label={t("sales.updatedAt")}>
                      {product.updatedAt
                        ? moment(product.updatedAt).format(
                            DatesEnum.Format.DDMMYYYYhhmmss
                          )
                        : "-"}
                    </Descriptions.Item>
                  </Descriptions>
                </Col>

                {/* QR Code */}
                {product.QRCode && (
                  <Col xs={24}>
                    <Descriptions bordered column={1} size="small">
                      <Descriptions.Item label={t("products.qrcode")}>
                        <div className="flex items-center gap-4">
                          <QRCode value={product.QRCode} size={100} />
                          <span className="text-gray-600">
                            {product.QRCode}
                          </span>
                        </div>
                      </Descriptions.Item>
                    </Descriptions>
                  </Col>
                )}

                {/* Colors */}
                {product.colors && product.colors.length > 0 && (
                  <Col xs={24}>
                    <Descriptions bordered column={1} size="small">
                      <Descriptions.Item label={t("products.colors")}>
                        <div className="flex flex-wrap gap-2">
                          {product.colors.map(
                            (color: string, index: number) => (
                              <Tooltip key={index} title={color}>
                                <div className="flex items-center gap-2 border rounded px-3 py-1">
                                  <div
                                    style={{
                                      backgroundColor: color,
                                      width: 24,
                                      height: 24,
                                      borderRadius: 4,
                                      border: "1px solid #d9d9d9",
                                    }}
                                  />
                                  <span className="text-xs">{color}</span>
                                </div>
                              </Tooltip>
                            )
                          )}
                        </div>
                      </Descriptions.Item>
                    </Descriptions>
                  </Col>
                )}

                {/* Dimensions */}
                {product.dimensions && (
                  <Col xs={24}>
                    <Descriptions
                      bordered
                      column={{ xs: 1, sm: 2, md: 3, lg: 4, xl: 5 }}
                      size="small"
                      title={t("products.dimensions")}
                    >
                      {product.dimensions.size && (
                        <Descriptions.Item label={t("products.size")}>
                          <Tag color="cyan">{product.dimensions.size}</Tag>
                        </Descriptions.Item>
                      )}

                      {(product.dimensions.height ?? 0) > 0 && (
                        <Descriptions.Item label={t("products.height")}>
                          {product.dimensions.height} m
                        </Descriptions.Item>
                      )}

                      {(product.dimensions.width ?? 0) > 0 && (
                        <Descriptions.Item label={t("products.width")}>
                          {product.dimensions.width} m
                        </Descriptions.Item>
                      )}

                      {(product.dimensions.length ?? 0) > 0 && (
                        <Descriptions.Item label={t("products.length")}>
                          {product.dimensions.length} m
                        </Descriptions.Item>
                      )}

                      {(product.dimensions.depth ?? 0) > 0 && (
                        <Descriptions.Item label={t("products.depth")}>
                          {product.dimensions.depth} m
                        </Descriptions.Item>
                      )}

                      {(product.dimensions.diameter ?? 0) > 0 && (
                        <Descriptions.Item label={t("products.diameter")}>
                          {product.dimensions.diameter} m
                        </Descriptions.Item>
                      )}

                      {(product.dimensions.thickness ?? 0) > 0 && (
                        <Descriptions.Item label={t("products.thickness")}>
                          {product.dimensions.thickness} m
                        </Descriptions.Item>
                      )}

                      {(product.dimensions.volume ?? 0) > 0 && (
                        <Descriptions.Item label={t("products.volume")}>
                          {product.dimensions.volume} l
                        </Descriptions.Item>
                      )}

                      {(product.dimensions.weight ?? 0) > 0 && (
                        <Descriptions.Item label={t("products.weight")}>
                          {product.dimensions.weight} kg
                        </Descriptions.Item>
                      )}
                    </Descriptions>
                  </Col>
                )}
              </Row>
            </ContainerTitle>
          </Col>
        </Row>
      </Card>

      <Card className="mt-4">
        <Tabs
          defaultActiveKey="1"
          items={[
            {
              key: "1",
              label: t("sales.salesChart"),
              children: (
                <>
                  <SalesBalance productId={productId} />
                  <SalesChart productId={productId} />
                </>
              ),
            },
            {
              key: "2",
              label: t("sales.salesTable"),
              children: <SalesTable productId={productId} />,
            },
            {
              key: "3",
              label: t("products.productItems"),
              children: <ProductItemsTable productId={productId} />,
            },
          ]}
        />
      </Card>

      <Modal
        open={previewOpen}
        footer={null}
        onCancel={() => setPreviewOpen(false)}
      >
        <Image
          alt="preview image"
          style={{ width: "100%" }}
          preview={false}
          src={
            product?.mainUrl
              ? getImageUrl(product.mainUrl)
              : ImagesEnum.FilesNames.DefaultAvatarImage
          }
        />
      </Modal>
    </Layout>
  );
}
