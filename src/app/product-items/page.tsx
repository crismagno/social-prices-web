"use client";

import { RefObject, useEffect, useRef, useState } from "react";

import { Avatar, Button, Card, Col, Image, Row, Tag, Tooltip } from "antd";
import moment from "moment";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import { useRouter } from "next/navigation";

import {
  DownloadOutlined,
  EditOutlined,
  EnterOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  ShoppingCartOutlined,
  UploadOutlined,
} from "@ant-design/icons";

import { CustomRangeDatePicker } from "../../components/common/CustomRangeDatePicker/CustomRangeDatePicker";
import LoadingFull from "../../components/common/LoadingFull/LoadingFull";
import SelectProducts from "../../components/common/SelectProducts/SelectProducts";
import { TagCategoriesCustomAntd } from "../../components/common/TagCategoriesCustomAntd/TagCategoriesCustomAntd";
import { TagStoresCustomAntd } from "../../components/common/TagStoresCustomAntd/TagStoresCustomAntd";
import { TagTagsCustomAntd } from "../../components/common/TagTagsCustomAntd/TagTagsCustomAntd";
import { UploadFilesDrawer } from "../../components/common/UploadFilesDrawer/UploadFilesDrawer";
import YesNo from "../../components/common/YesNo/YesNo";
import TableCustomAntd2 from "../../components/custom/antd/TableCustomAntd2/TableCustomAntd2";
import Layout from "../../components/template/Layout/Layout";
import useAuthData from "../../data/context/auth/useAuthData";
import useSocketData from "../../data/context/socket/useSocketData";
import { serviceMethodsInstance } from "../../services/social-prices-api/service-methods";
import CategoriesEnum from "../../shared/business/categories/categories.enum";
import { ICategory } from "../../shared/business/categories/categories.interface";
import FilesUploadsEnum from "../../shared/business/files-uploads/files-uploads.enum";
import ProductItemsEnum from "../../shared/business/product-items/product-items.enum";
import { IProductItem } from "../../shared/business/product-items/product-items.interface";
import { IProduct } from "../../shared/business/products/products.interface";
import SocketsEnum from "../../shared/business/sockets/sockets.enum";
import TagsEnum from "../../shared/business/tags/tags.enum";
import { ITag } from "../../shared/business/tags/tags.interface";
import CommonEnum from "../../shared/common/enums/common.enum";
import Urls from "../../shared/common/routes-app/routes-app";
import { sortArray } from "../../shared/utils/array/array-functions";
import DatesEnum from "../../shared/utils/dates/dates.enum";
import { getImageUrl } from "../../shared/utils/images/images-url";
import ImagesEnum from "../../shared/utils/images/images.enum";
import { formatterMoney } from "../../shared/utils/strings/string";
import { createTableState } from "../../shared/utils/table/table-state";
import { ITableStateRequest } from "../../shared/utils/table/table-state.interface";
import { useFindCategoriesByType } from "../categories/useFindCategoriesByType";
import {
  FilesUploadsTable,
  IFilesUploadsTableRefProps,
} from "../files-uploads/FilesUploadsTable";
import { useFindStoresByUser } from "../stores/useFindStoresByUser";
import { useFindTagsByType } from "../tags/useFindTagsByType";
import { DownloadProductItemsDrawer } from "./components/DownloadProductItemsDrawer/DownloadProductItemsDrawer";
import { useFindProductItemsByUserTableState } from "./useFindProductItemsByUserTableState";

export default function ProductItemsPage() {
  const { user } = useAuthData();
  const { socket } = useSocketData();
  const router: AppRouterInstance = useRouter();

  const [tableStateRequest, setTableStateRequest] = useState<
    ITableStateRequest<IProductItem> | undefined
  >(createTableState({ sort: { field: "createdAt", order: "ascend" } }));

  const {
    isLoading,
    productItems,
    total,
    fetchFindProductItemsByUserTableState,
  } = useFindProductItemsByUserTableState(tableStateRequest);

  const { categories, isLoading: isLoadingCategories } =
    useFindCategoriesByType(CategoriesEnum.Type.PRODUCT);

  const { tags, isLoading: isLoadingTags } = useFindTagsByType(
    TagsEnum.Type.PRODUCT
  );

  const { stores, isLoading: isLoadingStores } = useFindStoresByUser();

  const [isUploadFilesDrawerOpen, setIsUploadFilesDrawerOpen] =
    useState<boolean>(false);

  const [isDownloadDrawerOpen, setIsDownloadDrawerOpen] =
    useState<boolean>(false);

  const filesUploadsTableRef: RefObject<IFilesUploadsTableRefProps> =
    useRef<IFilesUploadsTableRefProps>(null);

  useEffect(() => {
    if (socket && filesUploadsTableRef && user) {
      socket.on(
        SocketsEnum.EventNames.RESPONSE_UPLOAD_PRODUCT_ITEMS_FILE_TO_USER(
          user._id
        ),
        async () => {
          await filesUploadsTableRef?.current?.fetchFindFilesUploadsByUserTableState();
          await fetchFindProductItemsByUserTableState();
        }
      );

      return () => {
        socket.off(
          SocketsEnum.EventNames.RESPONSE_UPLOAD_PRODUCT_ITEMS_FILE_TO_USER(
            user._id
          )
        );
      };
    }
  }, [
    socket,
    filesUploadsTableRef,
    user,
    fetchFindProductItemsByUserTableState,
  ]);

  if (isLoadingStores || isLoadingCategories || isLoadingTags) {
    return <LoadingFull />;
  }

  const categoriesSort: ICategory[] = sortArray(categories, "name");
  const tagsSort: ITag[] = sortArray(tags, "name");

  return (
    <Layout subtitle="My Product Items" title="Product Items" hasBackButton>
      <Card
        title="Product Items"
        className="h-min-80 mt-5"
        extra={
          <>
            <Button
              type="primary"
              onClick={() => setIsDownloadDrawerOpen(true)}
              className="mr-2"
              icon={<DownloadOutlined />}
            >
              Download
            </Button>

            <Button
              type="primary"
              onClick={() => setIsUploadFilesDrawerOpen(true)}
              className="mr-2"
              icon={<UploadOutlined />}
            >
              Upload
            </Button>

            <Button
              type="primary"
              onClick={() => router.push(Urls.NEW_PRODUCT_ITEM)}
              icon={<PlusOutlined />}
            >
              New Product Item
            </Button>
          </>
        }
      >
        <Row gutter={[16, 16]}>
          <Col md={8} className="flex items-end">
            <CustomRangeDatePicker
              format={DatesEnum.Format.DDMMYYYYhhmmss}
              showTime
              onChange={(startDate: Date | null, endDate: Date | null) => {
                setTableStateRequest({
                  ...tableStateRequest,
                  filters: {
                    ...tableStateRequest?.filters,
                    rangeDate:
                      startDate && endDate ? [startDate, endDate] : undefined,
                  },
                });
              }}
              select={{
                options: ProductItemsEnum.SelectOptionsRangeDatePicker,
                value:
                  (tableStateRequest?.filters?.fieldDate as string) ||
                  ProductItemsEnum.SortField.createdAt,
                onChange: (value: string) => {
                  setTableStateRequest({
                    ...tableStateRequest,
                    filters: {
                      ...tableStateRequest?.filters,
                      fieldDate: value,
                    },
                  });
                },
              }}
            />
          </Col>

          <Col md={6}>
            <SelectProducts
              label={"Products"}
              selectedProductIds={
                (tableStateRequest?.filters?.productIds as string[]) || []
              }
              onSelectProducts={(selectedProducts: IProduct[]) => {
                setTableStateRequest({
                  ...tableStateRequest,
                  filters: {
                    ...tableStateRequest?.filters,
                    productIds: selectedProducts.map(
                      (product: IProduct) => product._id
                    ),
                  },
                });
              }}
            />
          </Col>
        </Row>

        <TableCustomAntd2<IProductItem>
          rowKey={"_id"}
          tableStateRequest={tableStateRequest}
          setTableStateRequest={setTableStateRequest}
          dataSource={productItems}
          className="overflow-auto"
          columns={[
            {
              title: "#",
              dataIndex: "filesUrl",
              key: "filesUrl",
              align: "center",
              render: (filesUrl: string[]) => {
                if (!filesUrl?.length) {
                  return (
                    <Image
                      width={50}
                      height={50}
                      src={ImagesEnum.FilesNames.DefaultAvatarImage}
                      alt="mainUrl"
                      className="rounded-full"
                    />
                  );
                }

                return (
                  <Avatar.Group
                    maxCount={2}
                    shape="circle"
                    size="large"
                    maxStyle={{ color: "#f56a00", backgroundColor: "#fde3cf" }}
                  >
                    {filesUrl.map((fileUrl: string) => (
                      <Image
                        key={fileUrl}
                        width={50}
                        height={50}
                        src={getImageUrl(fileUrl)}
                        alt="mainUrl"
                        className="rounded-full"
                      />
                    ))}
                  </Avatar.Group>
                );
              },
            },
            {
              title: "Name",
              dataIndex: "name",
              key: "name",
              align: "center",
              render: (_, productItem: IProductItem) => {
                return (
                  <div className="flex flex-col justify-center items-center">
                    <span>{productItem.name}</span>
                    <span className="text-sm italic text-slate-500">
                      {productItem.brand}
                    </span>
                  </div>
                );
              },
            },
            {
              title: "Product",
              dataIndex: "product",
              key: "product",
              align: "center",
              render: (product?: IProduct) => {
                if (!product) return "-";
                return <span>{product.name}</span>;
              },
            },
            {
              title: "Barcode",
              dataIndex: "barcode",
              key: "barcode",
              align: "center",
            },
            {
              title: "SKU",
              dataIndex: "sku",
              key: "sku",
              align: "center",
              render: (sku: string) => sku || "-",
            },
            {
              title: "Quantity",
              dataIndex: "quantity",
              key: "quantity",
              align: "center",
              sorter: true,
              render: (quantity: number) => {
                return (
                  <div className="flex">
                    <div
                      className={quantity <= 0 ? "text-red-600 mr-1" : "mr-1"}
                    >
                      {quantity}
                    </div>

                    {quantity <= 0 ? (
                      <Tooltip title="Needs to be filled stock">
                        <QuestionCircleOutlined style={{ color: "orange" }} />
                      </Tooltip>
                    ) : null}
                  </div>
                );
              },
            },
            {
              title: "Price",
              dataIndex: "price",
              key: "price",
              align: "center",
              width: 140,
              sorter: true,
              render: (price: number) => {
                return (
                  <div className="flex justify-center items-center">
                    <span className="mr-2">{formatterMoney(price)}</span>
                  </div>
                );
              },
            },
            {
              title: "Categories",
              dataIndex: "categoriesIds",
              key: "categoriesIds",
              align: "center",
              filters: categoriesSort.map((category: ICategory) => ({
                text: category.name,
                value: category._id,
              })),
              render: (categoriesIds: string[]) => (
                <TagCategoriesCustomAntd
                  categories={categoriesSort}
                  categoriesIds={categoriesIds}
                />
              ),
            },
            {
              title: "Tags",
              dataIndex: "tagsIds",
              key: "tagsIds",
              filters: tagsSort.map((tag: ITag) => ({
                text: tag.name,
                value: tag._id,
              })),
              align: "center",
              render: (tagsIds: string[]) => (
                <TagTagsCustomAntd tags={tagsSort} tagsIds={tagsIds} />
              ),
            },
            {
              title: "Stores",
              dataIndex: "storeIds",
              key: "storeIds",
              align: "center",
              filters: stores.map((store) => ({
                text: store.name,
                value: store._id,
              })),
              render: (storeIds: string[]) => (
                <TagStoresCustomAntd stores={stores} storeIds={storeIds} />
              ),
            },
            {
              title: "Active",
              dataIndex: "isActive",
              key: "isActive",
              align: "center",
              filters: Object.keys(CommonEnum.YesNo).map((value: string) => ({
                value: value === CommonEnum.YesNo.YES,
                text: CommonEnum.YesNoLabels[value as CommonEnum.YesNo],
              })),
              render: (isActive: boolean) => (
                <Tag color={isActive ? "green" : "red"}>
                  <YesNo isTrue={isActive} />
                </Tag>
              ),
            },
            {
              title: "Default",
              dataIndex: "isDefault",
              key: "isDefault",
              align: "center",
              filters: Object.keys(CommonEnum.YesNo).map((value: string) => ({
                value: value === CommonEnum.YesNo.YES,
                text: CommonEnum.YesNoLabels[value as CommonEnum.YesNo],
              })),
              render: (isDefault: boolean) => (
                <Tag color={isDefault ? "blue" : "gray"}>
                  <YesNo isTrue={isDefault} />
                </Tag>
              ),
            },
            {
              title: "Release Date",
              dataIndex: "releaseDate",
              key: "releaseDate",
              align: "center",
              render: (releaseDate: Date) =>
                releaseDate
                  ? moment(releaseDate).format(DatesEnum.Format.DDMMYYYYhhmmss)
                  : "-",
              sorter: true,
            },
            {
              title: "Expiration Date",
              dataIndex: "expirationDate",
              key: "expirationDate",
              align: "center",
              render: (expirationDate: Date) =>
                expirationDate
                  ? moment(expirationDate).format(
                      DatesEnum.Format.DDMMYYYYhhmmss
                    )
                  : "-",
              sorter: true,
            },
            {
              title: "Created At",
              dataIndex: "createdAt",
              key: "createdAt",
              align: "center",
              render: (createdAt: Date) =>
                moment(createdAt).format(DatesEnum.Format.DDMMYYYYhhmmss),
              sorter: true,
            },
            {
              title: "Updated At",
              dataIndex: "updatedAt",
              key: "updatedAt",
              align: "center",
              render: (updatedAt: Date) =>
                moment(updatedAt).format(DatesEnum.Format.DDMMYYYYhhmmss),
              sorter: true,
            },
            {
              title: "Action",
              dataIndex: "action",
              key: "action",
              align: "center",
              fixed: "right",
              render: (_: any, productItem: IProductItem) => (
                <Button.Group>
                  <Tooltip title="Edit product item">
                    <Button
                      type="success"
                      onClick={() =>
                        router.push(
                          Urls.EDIT_PRODUCT_ITEM.replace(
                            ":productItemId",
                            productItem._id
                          )
                        )
                      }
                      icon={<EditOutlined />}
                    />
                  </Tooltip>

                  <Tooltip title="Go to product item">
                    <Button
                      type="default"
                      onClick={() =>
                        router.push(
                          Urls.PRODUCT_ITEM.replace(
                            ":productItemId",
                            productItem._id
                          )
                        )
                      }
                      icon={<EnterOutlined />}
                    />
                  </Tooltip>

                  <Tooltip title="Create Sale">
                    <Button
                      type="primary"
                      onClick={() =>
                        router.push(
                          Urls.SALES_CREATE_BY_PRODUCT_ITEM.replace(
                            ":productItemId",
                            productItem._id
                          )
                        )
                      }
                      icon={<ShoppingCartOutlined />}
                    />
                  </Tooltip>
                </Button.Group>
              ),
            },
          ]}
          search={{ placeholder: "Search product items..." }}
          loading={isLoading}
          total={total}
        />
      </Card>

      <UploadFilesDrawer
        width={"70%"}
        isOpen={isUploadFilesDrawerOpen}
        onClose={() => setIsUploadFilesDrawerOpen(false)}
        onUploadFiles={async (formData: FormData) => {
          await serviceMethodsInstance.productItemsServiceMethods.uploadProductItems(
            formData
          );

          await filesUploadsTableRef?.current?.fetchFindFilesUploadsByUserTableState();
        }}
        downloadFileName="social-prices-product-items-template.xlsx"
        accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        title="Upload Product Items"
        useProduct={true}
      >
        <FilesUploadsTable
          type={FilesUploadsEnum.Type.UPLOAD_PRODUCT_ITEMS}
          ref={filesUploadsTableRef}
        />
      </UploadFilesDrawer>

      <DownloadProductItemsDrawer
        isOpen={isDownloadDrawerOpen}
        onClose={() => setIsDownloadDrawerOpen(false)}
        title="Download Product Items"
        width="50%"
        tags={tagsSort}
        categories={categoriesSort}
        stores={stores}
      />
    </Layout>
  );
}
