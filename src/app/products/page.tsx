"use client";

import { RefObject, useEffect, useRef, useState } from "react";

import { Avatar, Button, Card, Image, Space, Tag, Tooltip } from "antd";
import { find } from "lodash";
import moment from "moment";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
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

import LoadingFull from "../../components/common/LoadingFull/LoadingFull";
import { ProductHistoricPricesButton } from "../../components/common/ProductHistoricPricesButton/ProductHistoricPricesButton";
import { StoreNameStatus } from "../../components/common/StoreNameStatus/StoreNameStatus";
import { TagCategoriesCustomAntd } from "../../components/common/TagCategoriesCustomAntd/TagCategoriesCustomAntd";
import { TagTagsCustomAntd } from "../../components/common/TagTagsCustomAntd/TagTagsCustomAntd";
import { UploadFilesDrawer } from "../../components/common/UploadFilesDrawer/UploadFilesDrawer";
import YesNo from "../../components/common/YesNo/YesNo";
import TableCustomAntd2 from "../../components/custom/antd/TableCustomAntd2/TableCustomAntd2";
import Layout from "../../components/template/Layout/Layout";
import useAuthData from "../../data/context/auth/useAuthData";
import useLanguageData from "../../data/context/language/useLanguageData";
import useSocketData from "../../data/context/socket/useSocketData";
import { serviceMethodsInstance } from "../../services/social-prices-api/service-methods";
import CategoriesEnum from "../../shared/business/categories/categories.enum";
import { ICategory } from "../../shared/business/categories/categories.interface";
import FilesUploadsEnum from "../../shared/business/files-uploads/files-uploads.enum";
import { IProduct } from "../../shared/business/products/products.interface";
import SocketsEnum from "../../shared/business/sockets/sockets.enum";
import { IStore } from "../../shared/business/stores/stores.interface";
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
import { DownloadProductsDrawer } from "./components/DownloadProductsDrawer/DownloadProductsDrawer";
import { useFindProductsByUserTableState } from "./useFindProductsByUserTableState";

export default function ProductsPage() {
  const { t } = useLanguageData();
  const { user } = useAuthData();

  const { socket } = useSocketData();

  const router: AppRouterInstance = useRouter();

  const [tableStateRequest, setTableStateRequest] = useState<
    ITableStateRequest<IProduct> | undefined
  >(createTableState({ sort: { field: "createdAt", order: "ascend" } }));

  const { isLoading, products, total, fetchFindProductsByUserTableState } =
    useFindProductsByUserTableState(tableStateRequest);

  const { categories, isLoading: isLoadingCategories } =
    useFindCategoriesByType(CategoriesEnum.Type.PRODUCT);

  const { tags, isLoading: isLoadingTags } = useFindTagsByType(
    TagsEnum.Type.PRODUCT,
  );

  const { stores, isLoading: isLoadingStores } = useFindStoresByUser();

  const [isUploadFilesDrawerOpen, setIsUploadFilesDrawerOpen] =
    useState<boolean>(false);

  const [isDownloadProductsDrawerOpen, setIsDownloadProductsDrawerOpen] =
    useState<boolean>(false);

  const filesUploadsTableRef: RefObject<IFilesUploadsTableRefProps> =
    useRef<IFilesUploadsTableRefProps>(null);

  useEffect(() => {
    if (socket && filesUploadsTableRef && user) {
      socket.on(
        SocketsEnum.EventNames.RESPONSE_UPLOAD_PRODUCTS_FILE_TO_USER(user._id),
        async () => {
          await filesUploadsTableRef?.current?.fetchFindFilesUploadsByUserTableState();
          await fetchFindProductsByUserTableState();
        },
      );

      return () => {
        socket.off(
          SocketsEnum.EventNames.RESPONSE_UPLOAD_PRODUCTS_FILE_TO_USER(
            user._id,
          ),
        );
      };
    }
  }, [socket, filesUploadsTableRef, user]);

  if (isLoadingStores || isLoadingCategories || isLoadingTags) {
    return <LoadingFull />;
  }

  const categoriesSort: ICategory[] = sortArray(categories, "name");

  const tagsSort: ITag[] = sortArray(tags, "name");

  return (
    <Layout
      subtitle={t("products.manageMyProducts")}
      title={t("products.title")}
      hasBackButton
    >
      <Card
        title={t("products.title")}
        className="h-min-80 mt-5"
        extra={
          <>
            <Button
              type="primary"
              onClick={() => setIsDownloadProductsDrawerOpen(true)}
              className="mr-2"
              icon={<DownloadOutlined />}
            >
              {t("common.download")}
            </Button>

            <Button
              type="primary"
              onClick={() => setIsUploadFilesDrawerOpen(true)}
              className="mr-2"
              icon={<UploadOutlined />}
            >
              {t("common.upload")}
            </Button>

            <Button
              type="primary"
              onClick={() => router.push(Urls.NEW_PRODUCT)}
              icon={<PlusOutlined />}
            >
              {t("products.newProduct")}
            </Button>
          </>
        }
      >
        <TableCustomAntd2<IProduct>
          rowKey={"_id"}
          tableStateRequest={tableStateRequest}
          setTableStateRequest={setTableStateRequest}
          dataSource={products}
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
              title: t("common.name"),
              dataIndex: "name",
              key: "name",
              sorter: true,
              align: "center",
              render: (_, product: IProduct) => {
                return (
                  <div className="flex flex-col justify-center items-center">
                    <span>{product.name}</span>
                    <span className="text-sm italic text-slate-500">
                      {product.brand}
                    </span>
                  </div>
                );
              },
            },
            {
              title: t("products.barcode"),
              dataIndex: "barcode",
              key: "barcode",
              sorter: true,
              align: "center",
            },
            {
              title: t("products.sku"),
              dataIndex: "sku",
              key: "sku",
              sorter: true,
              align: "center",
              render: (sku: string) => sku || "-",
            },
            {
              title: t("common.quantity"),
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
                      <Tooltip title={t("products.needsToBeFilledStock")}>
                        <QuestionCircleOutlined style={{ color: "orange" }} />
                      </Tooltip>
                    ) : null}
                  </div>
                );
              },
            },
            {
              title: t("common.price"),
              dataIndex: "price",
              key: "price",
              align: "center",
              width: 140,
              sorter: true,
              render: (price: number, product: IProduct) => {
                return (
                  <div className="flex justify-center items-center">
                    <span className="mr-2">{formatterMoney(price)}</span>
                    <ProductHistoricPricesButton product={product} />
                  </div>
                );
              },
            },
            {
              title: t("navigation.categories"),
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
              title: t("navigation.tags"),
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
              title: t("common.active"),
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
              title: t("sales.stores"),
              dataIndex: "storeIds",
              key: "storeIds",
              align: "center",
              filters: stores.map((store: IStore) => ({
                value: store._id,
                text: store.name,
              })),
              render: (storeIds: string[]) => {
                return storeIds.map((storeId: string) => {
                  const store: IStore | undefined = find(stores, {
                    _id: storeId,
                  });

                  if (!store) {
                    return null;
                  }

                  return (
                    <Tag key={storeId}>
                      <StoreNameStatus store={store} />
                    </Tag>
                  );
                });
              },
            },
            {
              title: t("common.date"),
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
              title: t("common.date"),
              dataIndex: "expirationDate",
              key: "expirationDate",
              align: "center",
              render: (expirationDate: Date) =>
                expirationDate
                  ? moment(expirationDate).format(
                      DatesEnum.Format.DDMMYYYYhhmmss,
                    )
                  : "-",
              sorter: true,
            },
            {
              title: t("sales.createdAt"),
              dataIndex: "createdAt",
              key: "createdAt",
              align: "center",
              render: (createdAt: Date) =>
                moment(createdAt).format(DatesEnum.Format.DDMMYYYYhhmmss),
              sorter: true,
            },
            {
              title: t("sales.updatedAt"),
              dataIndex: "updatedAt",
              key: "updatedAt",
              align: "center",
              render: (updatedAt: Date) =>
                moment(updatedAt).format(DatesEnum.Format.DDMMYYYYhhmmss),
              sorter: true,
            },
            {
              title: t("common.actions"),
              dataIndex: "action",
              key: "action",
              align: "center",
              fixed: "right",
              render: (_: any, product: IProduct) => (
                <Space.Compact>
                  <Tooltip title={t("products.editProduct")}>
                    <Button
                      type="success"
                      onClick={() =>
                        router.push(
                          Urls.EDIT_PRODUCT.replace(":productId", product._id),
                        )
                      }
                      icon={<EditOutlined />}
                    />
                  </Tooltip>

                  <Tooltip title={t("products.goToProduct")}>
                    <Button
                      type="default"
                      onClick={() =>
                        router.push(
                          Urls.PRODUCT.replace(":productId", product._id),
                        )
                      }
                      icon={<EnterOutlined />}
                    />
                  </Tooltip>

                  <Tooltip title={t("sales.createSale")}>
                    <Button
                      type="primary"
                      onClick={() =>
                        router.push(
                          Urls.SALES_CREATE_BY_PRODUCT.replace(
                            ":productId",
                            product._id,
                          ),
                        )
                      }
                      icon={<ShoppingCartOutlined />}
                    />
                  </Tooltip>
                </Space.Compact>
              ),
            },
          ]}
          search={{ placeholder: t("products.searchProducts") }}
          loading={isLoading}
          total={total}
        />
      </Card>

      <UploadFilesDrawer
        width={"70%"}
        isOpen={isUploadFilesDrawerOpen}
        onClose={() => setIsUploadFilesDrawerOpen(false)}
        onUploadFiles={async (formData: FormData) => {
          await serviceMethodsInstance.productsServiceMethods.uploadProducts(
            formData,
          );

          await filesUploadsTableRef?.current?.fetchFindFilesUploadsByUserTableState();
        }}
        downloadFileName="social-prices-products-template.xlsx"
        accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        title={t("products.uploadProducts")}
      >
        <FilesUploadsTable
          type={FilesUploadsEnum.Type.UPLOAD_PRODUCTS}
          ref={filesUploadsTableRef}
        />
      </UploadFilesDrawer>

      <DownloadProductsDrawer
        isOpen={isDownloadProductsDrawerOpen}
        onClose={() => setIsDownloadProductsDrawerOpen(false)}
        title={t("products.downloadProducts")}
        tags={tagsSort}
        categories={categories}
        stores={stores}
      />
    </Layout>
  );
}
