"use client";

import { useState } from "react";

import {
  Avatar as AvatarAntd,
  Button,
  Card,
  Col,
  Collapse,
  Image,
  Modal,
  QRCode,
  Row,
  Tag,
  Tooltip,
} from "antd";
import moment from "moment";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";
import { useParams, useRouter } from "next/navigation";

import {
  BlockOutlined,
  CalendarOutlined,
  EditOutlined,
  FileOutlined,
  PlusCircleOutlined,
  QrcodeOutlined,
  QuestionCircleOutlined,
  ShopOutlined,
  TagOutlined,
} from "@ant-design/icons";

import Avatar from "../../../components/common/Avatar/Avatar";
import ContainerTitle from "../../../components/common/ContainerTitle/ContainerTitle";
import Description from "../../../components/common/Description/Description";
import {
  IconCake,
  IconIdentification,
  IconMoney,
  IconPencilSquare,
  IconQuestion,
  IconUser,
} from "../../../components/common/icons/icons";
import LoadingFull from "../../../components/common/LoadingFull/LoadingFull";
import { ProductPreviousBarcodesPopover } from "../../../components/common/ProductPreviousBarcodesPopover/ProductPreviousBarcodesPopover";
import { TagCategoriesCustomAntd } from "../../../components/common/TagCategoriesCustomAntd/TagCategoriesCustomAntd";
import { TagStoresCustomAntd } from "../../../components/common/TagStoresCustomAntd/TagStoresCustomAntd";
import { TagTagsCustomAntd } from "../../../components/common/TagTagsCustomAntd/TagTagsCustomAntd";
import YesNo from "../../../components/common/YesNo/YesNo";
import Layout from "../../../components/template/Layout/Layout";
import CategoriesEnum from "../../../shared/business/categories/categories.enum";
import TagsEnum from "../../../shared/business/tags/tags.enum";
import Urls from "../../../shared/common/routes-app/routes-app";
import DatesEnum from "../../../shared/utils/dates/dates.enum";
import { defaultAvatarImage } from "../../../shared/utils/images/files-names";
import { getImageUrl } from "../../../shared/utils/images/url-images";
import { formatToMoneyDecimal } from "../../../shared/utils/strings/string";
import { useFindCategoriesByType } from "../../categories/useFindCategoriesByType";
import { SalesBalance } from "../../sales/components/SalesBalance/SalesBalance";
import { SalesChart } from "../../sales/components/SalesChart/SalesChart";
import SalesTable from "../../sales/components/SalesTable/SalesTable";
import { useFindStoresByUser } from "../../stores/useFindStoresByUser";
import { useFindTagsByType } from "../../tags/useFindTagsByType";
import { useFindProductById } from "../detail/useFindProductById";

export default function ProductPage() {
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
      subtitle={`Here we can see about product - ${product.name}`}
      title="Product"
      hasBackButton
    >
      <Card className="h-min-80 mt-2">
        <Row gutter={[4, 4]}>
          <Col
            xs={24}
            sm={10}
            md={5}
            className="flex flex-col justify-center items-center"
          >
            <Avatar
              onClick={() => setPreviewOpen(true)}
              src={product.mainUrl}
              width={240}
              className="shadow-lg border-none cursor-pointer z-10 rounded-lg"
              title="See image"
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

            <Tooltip title={"Product Barcode"}>
              <Tag>{product.barcode}</Tag>
            </Tooltip>
          </Col>

          <Col xs={24} sm={14} md={19}>
            <ContainerTitle
              title="Information"
              extraHeader={
                <Tooltip title="Edit product">
                  <Button
                    type="success"
                    icon={<EditOutlined />}
                    onClick={handleEditProduct}
                  >
                    Edit
                  </Button>
                </Tooltip>
              }
            >
              <Row>
                <Col xs={24} md={8}>
                  <Description
                    label="Name"
                    description={product.name}
                    leftIcon={IconUser()}
                  />

                  <Description
                    label={
                      <>
                        <span>Barcode</span>
                        <ProductPreviousBarcodesPopover product={product} />
                      </>
                    }
                    description={<Tag>{product.barcode}</Tag>}
                    leftIcon={IconIdentification()}
                  />

                  <Description
                    label="Price"
                    description={formatToMoneyDecimal(product.price)}
                    leftIcon={IconMoney()}
                  />

                  <Description
                    label="Quantity"
                    description={
                      <div className="flex">
                        <div
                          className={
                            product.quantity <= 0
                              ? "text-red-600 mr-1"
                              : " text-green-600 mr-1"
                          }
                        >
                          {product.quantity}
                        </div>

                        {product.quantity <= 0 ? (
                          <Tooltip title="Needs to be filled stock">
                            <QuestionCircleOutlined
                              style={{ color: "orange" }}
                            />
                          </Tooltip>
                        ) : null}
                      </div>
                    }
                    leftIcon={<PlusCircleOutlined className="text-lg" />}
                  />

                  <Description
                    label="Is Active"
                    description={
                      <Tag color={product.isActive ? "green" : "red"}>
                        <YesNo isTrue={product.isActive} />
                      </Tag>
                    }
                    leftIcon={IconQuestion()}
                  />

                  <Description
                    label="Upload Filename"
                    description={product.uploadFilename}
                    leftIcon={<FileOutlined className="text-lg" />}
                  />
                </Col>

                <Col xs={24} md={10}>
                  <Description
                    label="Description"
                    description={product.description}
                    leftIcon={IconPencilSquare()}
                  />

                  <Description
                    label="Details"
                    description={product.details}
                    leftIcon={IconPencilSquare()}
                  />

                  <Description
                    label="Tags"
                    description={
                      <div className="w-full flex">
                        <TagTagsCustomAntd
                          tags={tags}
                          useTag
                          tagsIds={product.tagsIds}
                        />
                      </div>
                    }
                    leftIcon={<TagOutlined className="text-lg" />}
                  />

                  <Description
                    label="Categories"
                    description={
                      <div className="w-full flex">
                        <TagCategoriesCustomAntd
                          categories={categories}
                          useTag
                          categoriesIds={product.categoriesIds}
                        />
                      </div>
                    }
                    leftIcon={<BlockOutlined className="text-lg" />}
                  />

                  <Description
                    label="Stores"
                    description={
                      <div className="w-full flex">
                        <TagStoresCustomAntd
                          stores={stores}
                          useTag
                          storeIds={product.storeIds}
                        />
                      </div>
                    }
                    leftIcon={<ShopOutlined className="text-lg" />}
                  />
                </Col>

                <Col xs={24} md={4}>
                  <Description
                    label="QR Code"
                    description={<QRCode value={product.QRCode ?? ""} />}
                    leftIcon={<QrcodeOutlined className="text-lg" />}
                  />

                  <Description
                    label="Created At"
                    description={
                      product.createdAt
                        ? moment(product.createdAt).format(
                            DatesEnum.Format.DDMMYYYYhhmmss
                          )
                        : "-"
                    }
                    leftIcon={IconCake()}
                  />

                  <Description
                    label="Updated At"
                    description={
                      product.updatedAt
                        ? moment(product.updatedAt).format(
                            DatesEnum.Format.DDMMYYYYhhmmss
                          )
                        : "-"
                    }
                    leftIcon={<CalendarOutlined className="text-lg" />}
                  />
                </Col>
              </Row>
            </ContainerTitle>
          </Col>
        </Row>
      </Card>

      <SalesBalance productId={productId} />

      <Collapse
        style={{ backgroundColor: "#fff", boxShadow: "none" }}
        ghost
        items={[
          {
            key: "1",
            label: <span className="font-semibold text-base">Sales Chart</span>,
            children: <SalesChart isShowHeader={false} productId={productId} />,
          },
        ]}
      />

      <Row>
        <Col xs={24}>
          <SalesTable productId={productId} />{" "}
        </Col>
      </Row>

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
            product?.mainUrl ? getImageUrl(product.mainUrl) : defaultAvatarImage
          }
        />
      </Modal>
    </Layout>
  );
}
