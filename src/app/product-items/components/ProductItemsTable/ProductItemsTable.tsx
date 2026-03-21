"use client";

import { RefObject, useEffect, useRef, useState } from "react";

import {
  Avatar,
  Button,
  Card,
  Col,
  Image,
  Row,
  Space,
  Tag,
  Tooltip,
} from "antd";
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

import { CustomRangeDatePicker } from "../../../../components/common/CustomRangeDatePicker/CustomRangeDatePicker";
import LoadingFull from "../../../../components/common/LoadingFull/LoadingFull";
import SelectProducts from "../../../../components/common/SelectProducts/SelectProducts";
import { TagCategoriesCustomAntd } from "../../../../components/common/TagCategoriesCustomAntd/TagCategoriesCustomAntd";
import { TagStoresCustomAntd } from "../../../../components/common/TagStoresCustomAntd/TagStoresCustomAntd";
import { TagTagsCustomAntd } from "../../../../components/common/TagTagsCustomAntd/TagTagsCustomAntd";
import { UploadFilesDrawer } from "../../../../components/common/UploadFilesDrawer/UploadFilesDrawer";
import YesNo from "../../../../components/common/YesNo/YesNo";
import TableCustomAntd2 from "../../../../components/custom/antd/TableCustomAntd2/TableCustomAntd2";
import useAuthData from "../../../../data/context/auth/useAuthData";
import useLanguageData from "../../../../data/context/language/useLanguageData";
import useSocketData from "../../../../data/context/socket/useSocketData";
import { serviceMethodsInstance } from "../../../../services/social-prices-api/service-methods";
import CategoriesEnum from "../../../../shared/business/categories/categories.enum";
import { ICategory } from "../../../../shared/business/categories/categories.interface";
import FilesUploadsEnum from "../../../../shared/business/files-uploads/files-uploads.enum";
import ProductItemsEnum from "../../../../shared/business/product-items/product-items.enum";
import { IProductItem } from "../../../../shared/business/product-items/product-items.interface";
import { IProduct } from "../../../../shared/business/products/products.interface";
import SocketsEnum from "../../../../shared/business/sockets/sockets.enum";
import TagsEnum from "../../../../shared/business/tags/tags.enum";
import { ITag } from "../../../../shared/business/tags/tags.interface";
import CommonEnum from "../../../../shared/common/enums/common.enum";
import Urls from "../../../../shared/common/routes-app/routes-app";
import { sortArray } from "../../../../shared/utils/array/array-functions";
import DatesEnum from "../../../../shared/utils/dates/dates.enum";
import { getImageUrl } from "../../../../shared/utils/images/images-url";
import ImagesEnum from "../../../../shared/utils/images/images.enum";
import { formatterMoney } from "../../../../shared/utils/strings/string";
import { createTableState } from "../../../../shared/utils/table/table-state";
import { ITableStateRequest } from "../../../../shared/utils/table/table-state.interface";
import { useFindCategoriesByType } from "../../../categories/useFindCategoriesByType";
import {
  FilesUploadsTable,
  IFilesUploadsTableRefProps,
} from "../../../files-uploads/FilesUploadsTable";
import { DownloadProductItemsDrawer } from "../../../product-items/components/DownloadProductItemsDrawer/DownloadProductItemsDrawer";
import { useFindProductItemsByUserTableState } from "../../../product-items/useFindProductItemsByUserTableState";
import { useFindStoresByUser } from "../../../stores/useFindStoresByUser";
import { useFindTagsByType } from "../../../tags/useFindTagsByType";

interface Props {
  productId?: string;
}

export const ProductItemsTable: React.FC<Props> = ({ productId }) => {
  const { user } = useAuthData();
  const { socket } = useSocketData();
  const { t } = useLanguageData();
  const router: AppRouterInstance = useRouter();

  const [tableStateRequest, setTableStateRequest] = useState<
    ITableStateRequest<IProductItem> | undefined
  >(
    createTableState({
      sort: { field: "createdAt", order: "ascend" },
      filters: { productIds: productId ? [productId] : undefined },
    }),
  );

  const {
    isLoading,
    productItems,
    total,
    fetchFindProductItemsByUserTableState,
  } = useFindProductItemsByUserTableState(tableStateRequest);

  const { categories, isLoading: isLoadingCategories } =
    useFindCategoriesByType(CategoriesEnum.Type.PRODUCT);

  const { tags, isLoading: isLoadingTags } = useFindTagsByType(
    TagsEnum.Type.PRODUCT,
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
          user._id,
        ),
        async () => {
          await filesUploadsTableRef?.current?.fetchFindFilesUploadsByUserTableState();
          await fetchFindProductItemsByUserTableState();
        },
      );

      return () => {
        socket.off(
          SocketsEnum.EventNames.RESPONSE_UPLOAD_PRODUCT_ITEMS_FILE_TO_USER(
            user._id,
          ),
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
    <div>
      <Card
        title={t("productItems.title")}
        className="h-min-80 mt-5"
        extra={
          <>
            <Button
              type="primary"
              onClick={() => setIsDownloadDrawerOpen(true)}
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
              onClick={() => router.push(Urls.NEW_PRODUCT_ITEM)}
              icon={<PlusOutlined />}
            >
              {t("productItems.newProductItem")}
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
                    productId: productId ? [productId] : undefined,
                  },
                });
              }}
              select={{
                options: ProductItemsEnum.SelectOptionsRangeDatePicker(t),
                value:
                  (tableStateRequest?.filters?.fieldDate as string) ||
                  ProductItemsEnum.SortField.createdAt,
                onChange: (value: string) => {
                  setTableStateRequest({
                    ...tableStateRequest,
                    filters: {
                      ...tableStateRequest?.filters,
                      fieldDate: value,
                      productId: productId ? [productId] : undefined,
                    },
                  });
                },
              }}
            />
          </Col>

          <Col md={6}>
            <SelectProducts
              label={"Products"}
              disabled={!!productId}
              selectedProductIds={
                (tableStateRequest?.filters?.productIds as string[]) || []
              }
              onSelectProducts={(selectedProducts: IProduct[]) => {
                setTableStateRequest({
                  ...tableStateRequest,
                  filters: {
                    ...tableStateRequest?.filters,
                    productIds: selectedProducts.map(
                      (product: IProduct) => product._id,
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
          setTableStateRequest={(tableStateRequest: any) => {
            if (!tableStateRequest) {
              setTableStateRequest(tableStateRequest);
              return;
            }

            if (productId) {
              tableStateRequest.filters = {
                ...tableStateRequest.filters,
                productIds: [productId],
              };
            }

            if (
              tableStateRequest?.filters?.rangeDate?.startDate &&
              tableStateRequest?.filters?.rangeDate?.endDate
            ) {
              tableStateRequest.filters = {
                ...tableStateRequest.filters,
                rangeDate: tableStateRequest.filters.rangeDate,
              };
            }

            setTableStateRequest(tableStateRequest);
          }}
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
              title: t("productItems.name"),
              dataIndex: "name",
              key: "name",
              sorter: true,
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
              title: t("productItems.product"),
              dataIndex: "product",
              key: "product",
              align: "center",
              render: (product?: IProduct) => {
                if (!product) return "-";
                return <span>{product.name}</span>;
              },
            },
            {
              title: t("productItems.barcode"),
              dataIndex: "barcode",
              key: "barcode",
              sorter: true,
              align: "center",
            },
            {
              title: t("productItems.sku"),
              dataIndex: "sku",
              sorter: true,
              key: "sku",
              align: "center",
              render: (sku: string) => sku || "-",
            },
            {
              title: t("productItems.quantity"),
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
              title: t("productItems.price"),
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
              title: t("productItems.categories"),
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
              title: t("productItems.tags"),
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
              title: t("productItems.stores"),
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
              title: t("productItems.active"),
              dataIndex: "isActive",
              key: "isActive",
              align: "center",
              filters: Object.keys(CommonEnum.YesNo).map((value: string) => ({
                value: value === CommonEnum.YesNo.YES,
                text: t(CommonEnum.YesNoLabels[value as CommonEnum.YesNo]),
              })),
              render: (isActive: boolean) => (
                <Tag color={isActive ? "green" : "red"}>
                  <YesNo isTrue={isActive} />
                </Tag>
              ),
            },
            {
              title: t("productItems.default"),
              dataIndex: "isDefault",
              key: "isDefault",
              align: "center",
              filters: Object.keys(CommonEnum.YesNo).map((value: string) => ({
                value: value === CommonEnum.YesNo.YES,
                text: t(CommonEnum.YesNoLabels[value as CommonEnum.YesNo]),
              })),
              render: (isDefault: boolean) => (
                <Tag color={isDefault ? "blue" : "gray"}>
                  <YesNo isTrue={isDefault} />
                </Tag>
              ),
            },
            {
              title: t("productItems.releaseDate"),
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
              title: t("productItems.expirationDate"),
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
              title: t("productItems.createdAt"),
              dataIndex: "createdAt",
              key: "createdAt",
              align: "center",
              render: (createdAt: Date) =>
                moment(createdAt).format(DatesEnum.Format.DDMMYYYYhhmmss),
              sorter: true,
            },
            {
              title: t("productItems.updatedAt"),
              dataIndex: "updatedAt",
              key: "updatedAt",
              align: "center",
              render: (updatedAt: Date) =>
                moment(updatedAt).format(DatesEnum.Format.DDMMYYYYhhmmss),
              sorter: true,
            },
            {
              title: t("productItems.action"),
              dataIndex: "action",
              key: "action",
              align: "center",
              fixed: "right",
              render: (_: any, productItem: IProductItem) => (
                <Space.Compact>
                  <Tooltip title={t("productItems.editProductItemTooltip")}>
                    <Button
                      type="success"
                      onClick={() =>
                        router.push(
                          Urls.EDIT_PRODUCT_ITEM.replace(
                            ":productItemId",
                            productItem._id,
                          ),
                        )
                      }
                      icon={<EditOutlined />}
                    />
                  </Tooltip>

                  <Tooltip title={t("productItems.goToProductItemTooltip")}>
                    <Button
                      type="default"
                      onClick={() =>
                        router.push(
                          Urls.PRODUCT_ITEM.replace(
                            ":productItemId",
                            productItem._id,
                          ),
                        )
                      }
                      icon={<EnterOutlined />}
                    />
                  </Tooltip>

                  <Tooltip title={t("productItems.createSale")}>
                    <Button
                      type="primary"
                      onClick={() =>
                        router.push(
                          Urls.SALES_CREATE_BY_PRODUCT_ITEM.replace(
                            ":productItemId",
                            productItem._id,
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
          search={{ placeholder: t("productItems.searchProductItems") }}
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
            formData,
          );

          await filesUploadsTableRef?.current?.fetchFindFilesUploadsByUserTableState();
        }}
        downloadFileName="social-prices-product-items-template.xlsx"
        accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        title={t("productItems.uploadProductItems")}
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
        title={t("productItems.downloadProductItems")}
        width="50%"
        tags={tagsSort}
        categories={categoriesSort}
        stores={stores}
        productId={productId}
      />
    </div>
  );
};
