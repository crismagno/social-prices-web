"use client";

import {
  Avatar as AvatarAntd,
  Button,
  Card,
  Col,
  Descriptions,
  Image,
  QRCode,
  Row,
  Tabs,
  Tag,
  Tooltip,
} from "antd";
import { find } from "lodash";
import moment from "moment";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";
import { useParams, useRouter } from "next/navigation";

import { EditOutlined, EyeOutlined, InboxOutlined } from "@ant-design/icons";

import ContainerTitle from "../../../components/common/ContainerTitle/ContainerTitle";
import { ImageOrDefault } from "../../../components/common/ImageOrDefault/ImageOrDefault";
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
import { formatToMoneyDecimal } from "../../../shared/utils/strings/string";
import { useFindCategoriesByType } from "../../categories/useFindCategoriesByType";
import { useFindProductsByUser } from "../../products/useFindProductsByUser";
import { SalesBalance } from "../../sales/components/SalesBalance/SalesBalance";
import { SalesChart } from "../../sales/components/SalesChart/SalesChart";
import SalesTable from "../../sales/components/SalesTable/SalesTable";
import { useFindStoresByUser } from "../../stores/useFindStoresByUser";
import { useFindTagsByType } from "../../tags/useFindTagsByType";
import { useFindProductItemById } from "../useFindProductItemById";

export default function ProductItemPage() {
  const { t } = useLanguageData();
  const router: AppRouterInstance = useRouter();

  const params: Params = useParams();

  const paramsProductItemId: string = params?.productItemId;

  const { isLoading, productItem } =
    useFindProductItemById(paramsProductItemId);

  const { tags, isLoading: isLoadingTags } = useFindTagsByType(
    TagsEnum.Type.PRODUCT,
  );

  const { categories, isLoading: isLoadingCategories } =
    useFindCategoriesByType(CategoriesEnum.Type.PRODUCT);

  const { stores, isLoading: isLoadingStores } = useFindStoresByUser();

  const { products, isLoading: isLoadingProducts } = useFindProductsByUser();

  if (
    isLoading ||
    !productItem ||
    isLoadingTags ||
    isLoadingStores ||
    isLoadingCategories ||
    isLoadingProducts
  ) {
    return <LoadingFull />;
  }

  const productId: string = productItem.productId;

  const productItemId: string = productItem._id;
  const product = find(products, { _id: productId });

  const handleEditProductItem = () => {
    router.push(
      Urls.EDIT_PRODUCT_ITEM.replace(":productItemId", productItemId),
    );
  };

  return (
    <Layout
      subtitle={`${t("productItems.productItemSubtitle")} - ${productItem.name}`}
      title={t("productItems.productItem")}
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
            <ImageOrDefault src={productItem.mainUrl} width={240} />

            <div className="mt-2">
              <AvatarAntd.Group
                maxCount={2}
                shape="circle"
                size="large"
                maxStyle={{ color: "#f56a00", backgroundColor: "#fde3cf" }}
              >
                {productItem.filesUrl.map((fileUrl: string) => (
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
              {productItem.name}
            </h3>

            <Tooltip title={t("productItems.productItemBarcode")}>
              <Tag>{productItem.barcode}</Tag>
            </Tooltip>

            {productItem.isDefault && (
              <Tag color="blue" className="mt-2">
                {t("productItems.defaultItem")}
              </Tag>
            )}
          </Col>

          <Col xs={24} sm={14} md={19}>
            <ContainerTitle
              title={t("stores.information")}
              extraHeader={
                <div className="flex gap-2">
                  <Tooltip title={t("products.goToProductItems")}>
                    <Button
                      type="primary"
                      icon={<InboxOutlined />}
                      onClick={() => router.push(Urls.PRODUCT_ITEMS)}
                    >
                      {t("productItems.title")}
                    </Button>
                  </Tooltip>
                  <Tooltip title={t("productItems.editProductItem")}>
                    <Button
                      type="success"
                      icon={<EditOutlined />}
                      onClick={handleEditProductItem}
                    >
                      {t("common.edit")}
                    </Button>
                  </Tooltip>
                </div>
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
                      <span className="font-medium">{productItem.name}</span>
                    </Descriptions.Item>

                    <Descriptions.Item label={t("productItems.product")}>
                      <div className="flex items-center gap-2">
                        <Tag color="geekblue">{product?.name || "-"}</Tag>
                        {productId && (
                          <Tooltip title={t("common.view")}>
                            <Button
                              type="link"
                              size="small"
                              icon={<EyeOutlined />}
                              onClick={() =>
                                router.push(
                                  Urls.PRODUCT.replace(":productId", productId),
                                )
                              }
                            >
                              {t("common.view")}
                            </Button>
                          </Tooltip>
                        )}
                      </div>
                    </Descriptions.Item>

                    <Descriptions.Item label={t("products.barcode")}>
                      <Tag color="blue">{productItem.barcode}</Tag>
                    </Descriptions.Item>

                    <Descriptions.Item label={t("products.sku")}>
                      <Tag color="purple">{productItem.sku || "-"}</Tag>
                    </Descriptions.Item>

                    <Descriptions.Item label={t("products.brand")}>
                      {productItem.brand || "-"}
                    </Descriptions.Item>

                    <Descriptions.Item label={t("common.price")}>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-green-600">
                          {formatToMoneyDecimal(productItem.price)}
                        </span>
                        <ProductHistoricPricesButton product={productItem} />
                      </div>
                    </Descriptions.Item>

                    <Descriptions.Item label={t("common.quantity")}>
                      <Tag
                        color={productItem.quantity > 0 ? "success" : "error"}
                      >
                        {productItem.quantity}
                      </Tag>
                    </Descriptions.Item>

                    <Descriptions.Item label={t("products.isActive")}>
                      <Tag color={productItem.isActive ? "green" : "red"}>
                        <YesNo isTrue={productItem.isActive} />
                      </Tag>
                    </Descriptions.Item>

                    <Descriptions.Item label={t("products.isDefault")}>
                      <Tag color={productItem.isDefault ? "blue" : "gray"}>
                        <YesNo isTrue={productItem.isDefault} />
                      </Tag>
                    </Descriptions.Item>
                  </Descriptions>
                </Col>

                {/* Description & Details */}
                <Col xs={24}>
                  <Descriptions bordered column={1} size="small">
                    <Descriptions.Item label={t("common.description")}>
                      <div className="max-h-20 overflow-y-auto">
                        {productItem.description || "-"}
                      </div>
                    </Descriptions.Item>

                    <Descriptions.Item label={t("common.details")}>
                      <div className="max-h-20 overflow-y-auto">
                        {productItem.details || "-"}
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
                            categoriesIds={productItem.categoriesIds}
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
                            tagsIds={productItem.tagsIds}
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
                            storeIds={productItem.storeIds}
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
                      {productItem.releaseDate
                        ? moment(productItem.releaseDate).format(
                            DatesEnum.Format.DDMMYYY,
                          )
                        : "-"}
                    </Descriptions.Item>

                    <Descriptions.Item label={t("products.expirationDate")}>
                      {productItem.expirationDate
                        ? moment(productItem.expirationDate).format(
                            DatesEnum.Format.DDMMYYY,
                          )
                        : "-"}
                    </Descriptions.Item>

                    <Descriptions.Item label={t("products.uploadFilename")}>
                      {productItem.uploadFilename || "-"}
                    </Descriptions.Item>

                    <Descriptions.Item label={t("sales.createdAt")}>
                      {productItem.createdAt
                        ? moment(productItem.createdAt).format(
                            DatesEnum.Format.DDMMYYYYhhmmss,
                          )
                        : "-"}
                    </Descriptions.Item>

                    <Descriptions.Item label={t("sales.updatedAt")}>
                      {productItem.updatedAt
                        ? moment(productItem.updatedAt).format(
                            DatesEnum.Format.DDMMYYYYhhmmss,
                          )
                        : "-"}
                    </Descriptions.Item>
                  </Descriptions>
                </Col>

                {/* QR Code */}
                {productItem.QRCode && (
                  <Col xs={24}>
                    <Descriptions bordered column={1} size="small">
                      <Descriptions.Item label={t("products.qrcode")}>
                        <div className="flex items-center gap-4">
                          <QRCode value={productItem.QRCode} size={100} />
                          <span className="text-gray-600">
                            {productItem.QRCode}
                          </span>
                        </div>
                      </Descriptions.Item>
                    </Descriptions>
                  </Col>
                )}

                {/* Colors */}
                {productItem.colors && productItem.colors.length > 0 && (
                  <Col xs={24}>
                    <Descriptions bordered column={1} size="small">
                      <Descriptions.Item label={t("products.colors")}>
                        <div className="flex flex-wrap gap-2">
                          {productItem.colors.map(
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
                            ),
                          )}
                        </div>
                      </Descriptions.Item>
                    </Descriptions>
                  </Col>
                )}

                {/* Dimensions */}
                {productItem.dimensions && (
                  <Col xs={24}>
                    <Descriptions
                      bordered
                      column={{ xs: 1, sm: 2, md: 3, lg: 4, xl: 5 }}
                      size="small"
                      title={t("products.dimensions")}
                    >
                      {productItem.dimensions.size && (
                        <Descriptions.Item label={t("products.size")}>
                          <Tag color="cyan">{productItem.dimensions.size}</Tag>
                        </Descriptions.Item>
                      )}

                      {(productItem.dimensions.height ?? 0) > 0 && (
                        <Descriptions.Item label={t("products.height")}>
                          {productItem.dimensions.height} m
                        </Descriptions.Item>
                      )}

                      {(productItem.dimensions.width ?? 0) > 0 && (
                        <Descriptions.Item label={t("products.width")}>
                          {productItem.dimensions.width} m
                        </Descriptions.Item>
                      )}

                      {(productItem.dimensions.length ?? 0) > 0 && (
                        <Descriptions.Item label={t("products.length")}>
                          {productItem.dimensions.length} m
                        </Descriptions.Item>
                      )}

                      {(productItem.dimensions.depth ?? 0) > 0 && (
                        <Descriptions.Item label={t("products.depth")}>
                          {productItem.dimensions.depth} m
                        </Descriptions.Item>
                      )}

                      {(productItem.dimensions.diameter ?? 0) > 0 && (
                        <Descriptions.Item label={t("products.diameter")}>
                          {productItem.dimensions.diameter} m
                        </Descriptions.Item>
                      )}

                      {(productItem.dimensions.thickness ?? 0) > 0 && (
                        <Descriptions.Item label={t("products.thickness")}>
                          {productItem.dimensions.thickness} m
                        </Descriptions.Item>
                      )}

                      {(productItem.dimensions.volume ?? 0) > 0 && (
                        <Descriptions.Item label={t("products.volume")}>
                          {productItem.dimensions.volume} l
                        </Descriptions.Item>
                      )}

                      {(productItem.dimensions.weight ?? 0) > 0 && (
                        <Descriptions.Item label={t("products.weight")}>
                          {productItem.dimensions.weight} kg
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
                  <SalesBalance
                    productId={productId}
                    productItemId={productItemId}
                  />
                  <SalesChart
                    productId={productId}
                    productItemId={productItemId}
                  />
                </>
              ),
            },
            {
              key: "2",
              label: t("sales.salesTable"),
              children: (
                <SalesTable
                  productItemId={productItemId}
                  productId={productId}
                />
              ),
            },
          ]}
        />
      </Card>
    </Layout>
  );
}
