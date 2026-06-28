"use client";

import { RefObject, useEffect, useRef, useState } from "react";

import {
  Badge,
  Button,
  Card,
  Col,
  Divider,
  message,
  Modal,
  Row,
  Space,
  Tag,
  Tooltip,
} from "antd";
import { find, first, includes, map } from "lodash";
import moment from "moment";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useRouter } from "next/navigation";

import {
  CheckOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  EnterOutlined,
  EyeOutlined,
  UploadOutlined,
} from "@ant-design/icons";

import { ButtonCreateSale } from "../../../../components/common/ButtonCreateSale/ButtonCreateSale";
import { CustomRangeDatePicker } from "../../../../components/common/CustomRangeDatePicker/CustomRangeDatePicker";
import { DeliveryAddressMapButton } from "../../../../components/common/DeliveryAddressMapButton/DeliveryAddressMapButton";
import handleClientError from "../../../../components/common/HandleClientError/HandleClientError";
import { ImageOrDefault } from "../../../../components/common/ImageOrDefault/ImageOrDefault";
import LoadingFull from "../../../../components/common/LoadingFull/LoadingFull";
import { SaleSummary } from "../../../../components/common/SaleSummary/SaleSummary";
import SelectProductItems from "../../../../components/common/SelectProductItems/SelectProductItems";
import SelectProducts from "../../../../components/common/SelectProducts/SelectProducts";
import { StoreNameStatus } from "../../../../components/common/StoreNameStatus/StoreNameStatus";
import { TagCategoriesCustomAntd } from "../../../../components/common/TagCategoriesCustomAntd/TagCategoriesCustomAntd";
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
import { ICustomer } from "../../../../shared/business/customers/customer.interface";
import FilesUploadsEnum from "../../../../shared/business/files-uploads/files-uploads.enum";
import { IProductItem } from "../../../../shared/business/product-items/product-items.interface";
import { IProduct } from "../../../../shared/business/products/products.interface";
import {
  ISale,
  ISaleBuyer,
  ISaleStore,
} from "../../../../shared/business/sales/sale.interface";
import SalesEnum from "../../../../shared/business/sales/sales.enum";
import SocketsEnum from "../../../../shared/business/sockets/sockets.enum";
import { IStore } from "../../../../shared/business/stores/stores.interface";
import TagsEnum from "../../../../shared/business/tags/tags.enum";
import { ITag } from "../../../../shared/business/tags/tags.interface";
import CommonEnum from "../../../../shared/common/enums/common.enum";
import Urls from "../../../../shared/common/routes-app/routes-app";
import { sortArray } from "../../../../shared/utils/array/array-functions";
import DatesEnum from "../../../../shared/utils/dates/dates.enum";
import { formatToMoneyDecimal } from "../../../../shared/utils/strings/string";
import { createTableState } from "../../../../shared/utils/table/table-state";
import { ITableStateRequest } from "../../../../shared/utils/table/table-state.interface";
import { useFindCategoriesByType } from "../../../categories/useFindCategoriesByType";
import {
  FilesUploadsTable,
  IFilesUploadsTableRefProps,
} from "../../../files-uploads/FilesUploadsTable";
import { useFindStoresByUser } from "../../../stores/useFindStoresByUser";
import { useFindTagsByType } from "../../../tags/useFindTagsByType";
import { useFindSalesByUserTableState } from "../../useFindSalesByUserTableState";
import { useGetSalesSummaryByUserTableState } from "../../useGetSalesSummaryByUserTableState";
import { DownloadSalesDrawer } from "../DownloadSalesDrawer/DownloadSalesDrawer";
import { UpdateSaleCustomerButton } from "../UpdateSaleCustomerButton/UpdateSaleCustomerButton";
import SalesMissingPaymentLabel from "./SalesMissingPaymentLabel";
import SelectSalesPaymentStatus from "./SelectSalesPaymentStatus";
import SelectSalesStatus from "./SelectSalesStatus";

interface Props {
  storeId?: string;
  customerId?: string;
  productId?: string;
  productItemId?: string;
  employeeId?: string;
}

const SalesTable: React.FC<Props> = ({
  storeId,
  customerId,
  productId,
  productItemId,
  employeeId,
}) => {
  const { user } = useAuthData();
  const { t } = useLanguageData();

  const { socket } = useSocketData();

  const router: AppRouterInstance = useRouter();

  const [tableStateRequest, setTableStateRequest] = useState<
    ITableStateRequest<ISale> | undefined
  >(
    createTableState({
      sort: { field: "createdAt", order: "descend" },
      filters: {
        stores: storeId ? [storeId] : [],
        customerIds: customerId ? [customerId] : [],
        productIds: productId ? [productId] : [],
        productItemIds: productItemId ? [productItemId] : [],
        employeeId: employeeId,
        isActive: [true],
        rangeField: SalesEnum.SortField.createdAt,
        employeeIds: employeeId ? [employeeId] : [],
      },
    }),
  );

  const [isVisibleDeleteSaleModal, setIsVisibleDeleteSaleModal] =
    useState<boolean>(false);

  const [isDeletingSale, setIsDeletingSale] = useState<boolean>(false);

  const [saleToDelete, setSaleToDelete] = useState<ISale | null>(null);

  const [isVisibleActivateSaleModal, setIsVisibleActivateSaleModal] =
    useState<boolean>(false);

  const [isActivatingSale, setIsIsActivatingSale] = useState<boolean>(false);

  const [saleToActivate, setSaleToActivate] = useState<ISale | null>(null);

  const [isOpenSaleSummaryModal, setIsOpenSaleSummaryModal] =
    useState<boolean>(false);

  const [saleSelectedToSummary, setSaleSelectedToSummary] =
    useState<ISale | null>(null);

  const [isUploadFilesDrawerOpen, setIsUploadFilesDrawerOpen] =
    useState<boolean>(false);

  const [isDownloadSalesDrawerOpen, setIsDownloadSalesDrawerOpen] =
    useState<boolean>(false);

  const [selectedSaleIds, setSelectedSaleIds] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const filesUploadsTableRef: RefObject<IFilesUploadsTableRefProps> =
    useRef<IFilesUploadsTableRefProps>(null);

  const { isLoading, sales, total, fetchFindSalesByUserTableState } =
    useFindSalesByUserTableState(tableStateRequest);

  const {
    isLoadingSalesSummary,
    salesSummary,
    fetchSalesSummaryByUserTableState,
  } = useGetSalesSummaryByUserTableState(tableStateRequest);

  const { stores, isLoading: isLoadingStores } = useFindStoresByUser();

  const { tags, isLoading: isLoadingTags } = useFindTagsByType(
    TagsEnum.Type.SALE,
  );

  const { categories, isLoading: isLoadingCategories } =
    useFindCategoriesByType(CategoriesEnum.Type.SALE);

  useEffect(() => {
    if (socket && filesUploadsTableRef && user) {
      socket.on(
        SocketsEnum.EventNames.RESPONSE_UPLOAD_SALES_FILE_TO_USER(user._id),
        async () => {
          await filesUploadsTableRef?.current?.fetchFindFilesUploadsByUserTableState();
          await fetchFindSalesByUserTableState();
          await fetchSalesSummaryByUserTableState();
        },
      );

      return () => {
        socket.off(
          SocketsEnum.EventNames.RESPONSE_UPLOAD_SALES_FILE_TO_USER(user._id),
        );
      };
    }
  }, [socket, filesUploadsTableRef, user]);

  if (isLoadingStores || isLoadingTags || isLoadingCategories) {
    return <LoadingFull />;
  }

  const tagsSort: ITag[] = sortArray(tags, "name") ?? [];
  const categoriesSort: ICategory[] = sortArray(categories, "name") ?? [];

  const handleEditSale = (sale: ISale) => {
    router.push(Urls.SALES_EDIT.replace(":saleId", sale._id));
  };

  const handleDeleteSale = async (sale: ISale) => {
    try {
      setIsDeletingSale(true);

      await serviceMethodsInstance.salesServiceMethods.deleteManual(sale._id);

      setTableStateRequest({
        ...tableStateRequest,
        pagination: { pageSize: 10, skip: 0, current: undefined, total: 0 },
      });
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsDeletingSale(false);
      setSaleToDelete(null);
      setIsVisibleDeleteSaleModal(false);
    }
  };

  const handleActivateSale = async (sale: ISale) => {
    try {
      setIsIsActivatingSale(true);

      await serviceMethodsInstance.salesServiceMethods.activateManual(sale._id);

      setTableStateRequest({
        ...tableStateRequest,
        pagination: { pageSize: 10, skip: 0, current: undefined, total: 0 },
      });
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsIsActivatingSale(false);
      setSaleToActivate(null);
      setIsVisibleActivateSaleModal(false);
    }
  };

  const handleFilterSaleByRangeDates = (
    startDate: Date | null,
    endDate: Date | null,
  ) => {
    setTableStateRequest({
      ...tableStateRequest,
      filters: {
        ...tableStateRequest?.filters,
        rangeDate: startDate && endDate ? { startDate, endDate } : null,
      },
      pagination: { pageSize: 10, skip: 0, current: undefined, total: 0 },
    });
  };

  const handleFilterSaleByRangeField = (value: string) => {
    setTableStateRequest({
      ...tableStateRequest,
      filters: {
        ...tableStateRequest?.filters,
        rangeField: value,
      },
      pagination: { pageSize: 10, skip: 0, current: undefined, total: 0 },
    });
  };

  const handleCompleteMultipleSales = async () => {
    try {
      setIsSubmitting(true);

      await serviceMethodsInstance.salesServiceMethods.completeMultipleSalesManual(
        {
          saleIds: selectedSaleIds,
        },
      );

      setSelectedSaleIds([]);

      setTableStateRequest({
        ...tableStateRequest,
        filters: { ...tableStateRequest?.filters },
        pagination: { pageSize: 10, skip: 0, current: undefined, total: 0 },
      });

      message.success(t("sales.selectedSalesCompletedSuccessfully"));
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card
        title={t("sales.title")}
        className="h-min-80 mt-2"
        extra={
          <>
            <Button
              type="primary"
              onClick={() => setIsDownloadSalesDrawerOpen(true)}
              className="mr-2"
              icon={<DownloadOutlined />}
            >
              {t("sales.download")}
            </Button>

            <Button
              type="primary"
              onClick={() => setIsUploadFilesDrawerOpen(true)}
              className="mr-2"
              icon={<UploadOutlined />}
            >
              {t("sales.upload")}
            </Button>

            <ButtonCreateSale
              storeId={storeId}
              customerId={customerId}
              productId={productId}
              productItemId={productItemId}
            />
          </>
        }
      >
        <Row className="mb-4" gutter={[16, 16]}>
          <Col xs={24} className="flex justify-end items-center">
            <Tooltip title={t("sales.completeMultipleSales")}>
              <Button
                icon={<CheckOutlined />}
                type="success"
                disabled={selectedSaleIds.length === 0}
                onClick={handleCompleteMultipleSales}
              >
                {t("sales.complete")}
              </Button>
            </Tooltip>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col md={8} className="flex items-end">
            <CustomRangeDatePicker
              showTime
              onChange={handleFilterSaleByRangeDates}
              select={{
                options: SalesEnum.SelectOptionsRangeDatePicker(t),
                onChange: handleFilterSaleByRangeField,
                value: tableStateRequest?.filters?.rangeField,
              }}
            />
          </Col>

          <Col md={6}>
            <SelectProducts
              label={t("products.title")}
              disabled={!!productId}
              selectedProductIds={tableStateRequest?.filters?.productIds ?? []}
              onSelectProducts={(selectProducts: IProduct[]) => {
                setTableStateRequest({
                  ...tableStateRequest,
                  filters: {
                    ...tableStateRequest?.filters,
                    productIds: map(selectProducts, "_id"),
                  },
                  pagination: {
                    pageSize: 10,
                    skip: 0,
                    current: undefined,
                    total: 0,
                  },
                });
              }}
            />
          </Col>

          <Col md={6}>
            <SelectProductItems
              label={t("navigation.productItems")}
              disabled={!!productItemId}
              selectedProductItemIds={
                tableStateRequest?.filters?.productItemIds ?? []
              }
              onSelectProductItems={(selectProductItems: IProductItem[]) => {
                setTableStateRequest({
                  ...tableStateRequest,
                  filters: {
                    ...tableStateRequest?.filters,
                    productItemIds: map(selectProductItems, "_id"),
                  },
                  pagination: {
                    pageSize: 10,
                    skip: 0,
                    current: undefined,
                    total: 0,
                  },
                });
              }}
            />
          </Col>
        </Row>

        <TableCustomAntd2<ISale>
          rowKey={"_id"}
          tableStateRequest={tableStateRequest}
          setTableStateRequest={(tableStateRequestSale: any) => {
            if (!tableStateRequestSale) {
              setTableStateRequest(tableStateRequestSale);
              return;
            }

            if (storeId) {
              tableStateRequestSale.filters = {
                ...tableStateRequestSale.filters,
                stores: [storeId],
              };
            }

            if (customerId) {
              tableStateRequestSale.filters = {
                ...tableStateRequestSale.filters,
                customerIds: [customerId],
              };
            }

            if (productId) {
              tableStateRequestSale.filters = {
                ...tableStateRequestSale.filters,
                productIds: [productId],
              };
            }

            if (productItemId) {
              tableStateRequestSale.filters = {
                ...tableStateRequestSale.filters,
                productItemIds: [productItemId],
              };
            }

            if (employeeId) {
              tableStateRequestSale.filters = {
                ...tableStateRequestSale.filters,
                employeeIds: employeeId ? [employeeId] : [],
              };
            }

            if (
              tableStateRequest?.filters?.rangeDate?.startDate &&
              tableStateRequest?.filters?.rangeDate?.endDate
            ) {
              tableStateRequestSale.filters = {
                ...tableStateRequestSale.filters,
                rangeDate: tableStateRequest.filters.rangeDate,
              };
            }

            setTableStateRequest(tableStateRequestSale);
          }}
          dataSource={sales}
          className="overflow-auto"
          columns={[
            {
              title: t("sales.number"),
              dataIndex: "number",
              key: "number",
              align: "center",
              sorter: true,
              render: (number: string) => (
                <>
                  <strong className="mr-2">{number}</strong>
                </>
              ),
            },
            {
              title: t("sales.numberManual"),
              dataIndex: "numberManual",
              key: "numberManual",
              align: "center",
              sorter: true,
              render: (numberManual: string) => (
                <>
                  <strong className="mr-2">{numberManual ?? "-"}</strong>
                </>
              ),
            },
            {
              title: t("sales.buyer"),
              dataIndex: "buyer",
              key: "buyer",
              align: "center",
              render: (buyer: ISaleBuyer, sale: ISale) => {
                const customer: ICustomer | undefined = first(
                  sale.stores,
                )?.customer;

                const isSaleDeleted: boolean = !!sale.softDelete;

                return (
                  <div className="flex flex-row">
                    <div className="mr-2">
                      <ImageOrDefault src={customer?.avatar} width={45} />
                    </div>
                    <div className="flex flex-col justify-start items-start">
                      <Button
                        type="link"
                        className="p-0"
                        onClick={() =>
                          router.push(
                            Urls.CUSTOMER.replace(
                              ":customerId",
                              customer?._id!,
                            ),
                          )
                        }
                      >
                        {buyer.name}
                      </Button>
                      <div className="text-xs">{buyer.email}</div>
                    </div>
                    {!isSaleDeleted && (
                      <div className="flex items-end ml-2">
                        <UpdateSaleCustomerButton
                          sale={sale}
                          onUpdatedSaleCustomer={() => {
                            setTableStateRequest({
                              ...tableStateRequest,
                              pagination: {
                                pageSize: 10,
                                skip: 0,
                                current: undefined,
                                total: 0,
                              },
                            });
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              },
            },
            {
              title: t("sales.type"),
              dataIndex: "type",
              key: "type",
              align: "center",
              filters: Object.keys(SalesEnum.Type).map((type: string) => ({
                text: t(SalesEnum.TypeLabels[type as SalesEnum.Type]),
                value: type,
              })),
              render: (type: SalesEnum.Type) => (
                <Tag color={SalesEnum.TypeColors[type]}>
                  {t(SalesEnum.TypeLabels[type])}
                </Tag>
              ),
            },
            {
              title: t("sales.deliveryType"),
              dataIndex: "deliveryType",
              key: "deliveryType",
              align: "center",
              filters: Object.keys(SalesEnum.DeliveryType).map(
                (deliveryType: string) => ({
                  text: t(
                    SalesEnum.DeliveryTypeLabels[
                      deliveryType as SalesEnum.DeliveryType
                    ],
                  ),
                  value: deliveryType,
                }),
              ),
              render: (_, sale: ISale) => (
                <div className="flex">
                  <Tag className="mr-2">
                    {t(SalesEnum.DeliveryTypeLabels[sale.header.deliveryType])}
                  </Tag>

                  {sale.buyer?.address && (
                    <DeliveryAddressMapButton address={sale.buyer.address} />
                  )}
                </div>
              ),
            },
            {
              title: t("common.status"),
              dataIndex: "status",
              key: "status",
              align: "center",
              filters: Object.keys(SalesEnum.Status).map((status: string) => ({
                text: t(SalesEnum.StatusLabels[status as SalesEnum.Status]),
                value: status,
              })),
              render: (_, sale: ISale) => {
                const isSaleDeleted: boolean = !!sale.softDelete;

                if (isSaleDeleted) {
                  return (
                    <Tag
                      color={SalesEnum.StatusColors[sale.status]}
                      className="mr-1"
                    >
                      {t(SalesEnum.StatusLabels[sale.status])}
                    </Tag>
                  );
                }

                return (
                  <SelectSalesStatus
                    sale={sale}
                    onUpdateStatusManual={() => {
                      setTableStateRequest({
                        ...tableStateRequest,
                        pagination: {
                          pageSize: 10,
                          skip: 0,
                          current: undefined,
                          total: 0,
                        },
                      });
                    }}
                  />
                );
              },
            },
            {
              title: t("sales.paymentStatus"),
              dataIndex: "paymentStatus",
              key: "paymentStatus",
              align: "center",
              filters: Object.keys(SalesEnum.PaymentStatus).map(
                (paymentStatus: string) => ({
                  text: t(
                    SalesEnum.PaymentStatusLabels[
                      paymentStatus as SalesEnum.PaymentStatus
                    ],
                  ),
                  value: paymentStatus,
                }),
              ),
              render: (_, sale: ISale) => {
                const isSaleDeleted: boolean = !!sale.softDelete;

                if (isSaleDeleted) {
                  return (
                    <>
                      <Tag
                        color={SalesEnum.StatusColors[sale.status]}
                        className="mr-1"
                      >
                        {t(SalesEnum.StatusLabels[sale.status])}
                      </Tag>

                      <SalesMissingPaymentLabel sale={sale} />
                    </>
                  );
                }

                return (
                  <>
                    <SelectSalesPaymentStatus
                      sale={sale}
                      onUpdatePaymentStatusManual={() => {
                        setTableStateRequest({
                          ...tableStateRequest,
                          pagination: {
                            pageSize: 10,
                            skip: 0,
                            current: undefined,
                            total: 0,
                          },
                        });
                      }}
                    />

                    <SalesMissingPaymentLabel sale={sale} />
                  </>
                );
              },
            },
            {
              title: t("stores.title"),
              dataIndex: "stores",
              key: "stores",
              align: "center",
              filters: !storeId
                ? map(stores, (store: IStore) => ({
                    value: store._id,
                    text: store.name,
                  }))
                : undefined,
              render: (saleStores: ISaleStore[]) => {
                return saleStores.map((saleStore: ISaleStore) => {
                  const store: IStore | undefined = find(stores, {
                    _id: saleStore.storeId,
                  });

                  if (!store) {
                    return null;
                  }

                  return (
                    <Tag key={saleStore.storeId}>
                      <StoreNameStatus store={store} />
                    </Tag>
                  );
                });
              },
            },
            {
              title: t("sales.tags"),
              dataIndex: "tagsIds",
              key: "tagsIds",
              filters: tagsSort?.map((tag: ITag) => ({
                text: tag.name,
                value: tag._id,
              })),
              align: "center",
              render: (tagsIds: string[]) => (
                <TagTagsCustomAntd tags={tagsSort} tagsIds={tagsIds} />
              ),
            },
            {
              title: t("sales.categories"),
              dataIndex: "categoriesIds",
              key: "categoriesIds",
              filters: categoriesSort?.map((category: ICategory) => ({
                text: category.name,
                value: category._id,
              })),
              align: "center",
              render: (categoriesIds: string[]) => (
                <TagCategoriesCustomAntd
                  categories={categoriesSort}
                  categoriesIds={categoriesIds}
                />
              ),
            },
            {
              title: t("sales.completedAt"),
              dataIndex: "completedAt",
              key: "completedAt",
              align: "center",
              render: (completedAt: Date | null) =>
                completedAt
                  ? moment(completedAt).format(DatesEnum.Format.DDMMYYYYhhmmss)
                  : "-",
              sorter: true,
            },
            {
              title: t("sales.deliveryAt"),
              dataIndex: "deliveryAt",
              key: "deliveryAt",
              align: "center",
              render: (deliveryAt: Date | null, sale: ISale) => {
                if (!deliveryAt) {
                  return "-";
                }

                return (
                  <>
                    <span>
                      {moment(deliveryAt).format(DatesEnum.Format.DDMMYYY)}
                    </span>

                    {includes(
                      SalesEnum.StatusToShowDeliveryAt,
                      sale.status,
                    ) && (
                      <Tooltip title={t("sales.daysRemaining")}>
                        <Badge
                          offset={[5, -5]}
                          color={SalesEnum.getDeliveryAtColor(deliveryAt)}
                          count={SalesEnum.getDeliveryAtDifferenceDays(
                            deliveryAt,
                          )}
                          showZero
                        />
                      </Tooltip>
                    )}
                  </>
                );
              },
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
              title: t("sales.createdDate"),
              dataIndex: "createdDate",
              key: "createdDate",
              align: "center",
              render: (createdDate: Date) =>
                moment(createdDate).format(DatesEnum.Format.DDMMYYYYhhmmss),
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
              title: t("sales.isActive"),
              dataIndex: "isActive",
              key: "isActive",
              align: "center",
              filters: Object.keys(CommonEnum.YesNo).map((value: string) => ({
                value: value === CommonEnum.YesNo.YES,
                text: t(CommonEnum.YesNoLabels[value as CommonEnum.YesNo]),
              })),
              render: (_, sale: ISale) => (
                <Tag color={sale.softDelete ? "red" : "green"}>
                  <YesNo isTrue={!sale.softDelete} />
                </Tag>
              ),
            },
            {
              title: t("sales.action"),
              dataIndex: "action",
              key: "action",
              align: "center",
              fixed: "right",
              render: (_, sale: ISale) => {
                const isSaleDeleted: boolean = !!sale.softDelete;

                return (
                  <Space.Compact>
                    {!isSaleDeleted && (
                      <Tooltip title={t("sales.editSale")}>
                        <Button
                          type="success"
                          onClick={() => handleEditSale(sale)}
                          icon={<EditOutlined />}
                        />
                      </Tooltip>
                    )}

                    <Tooltip title={t("sales.goToSale")}>
                      <Button
                        type="default"
                        onClick={() =>
                          router.push(Urls.SALE.replace(":saleId", sale._id))
                        }
                        icon={<EnterOutlined />}
                      />
                    </Tooltip>

                    <Tooltip title={t("sales.seeSaleSummary")}>
                      <Button
                        type="primary"
                        onClick={() => {
                          setSaleSelectedToSummary(sale);
                          setIsOpenSaleSummaryModal(true);
                        }}
                        icon={<EyeOutlined />}
                      />
                    </Tooltip>

                    {!isSaleDeleted && (
                      <Tooltip title={t("sales.deleteSale")}>
                        <Button
                          loading={
                            saleToDelete?._id === sale._id && isDeletingSale
                          }
                          type="danger"
                          icon={<DeleteOutlined />}
                          onClick={() => {
                            setSaleToDelete(sale);
                            setIsVisibleDeleteSaleModal(true);
                          }}
                        />
                      </Tooltip>
                    )}

                    {isSaleDeleted && (
                      <Tooltip title={t("sales.activateSale")}>
                        <Button
                          loading={
                            saleToActivate?._id === sale._id && isActivatingSale
                          }
                          type="warning"
                          onClick={() => {
                            setSaleToActivate(sale);
                            setIsVisibleActivateSaleModal(true);
                          }}
                          icon={<CheckOutlined />}
                        />
                      </Tooltip>
                    )}
                  </Space.Compact>
                );
              },
            },
          ]}
          search={{ placeholder: t("sales.searchSales") }}
          loading={isLoading || isSubmitting}
          total={total}
          rowSelection={{
            selectedRowKeys: selectedSaleIds,
            onChange: (selectedRowKeys: React.Key[]) => {
              setSelectedSaleIds(selectedRowKeys as string[]);
            },
          }}
          rowClassName={(sale: ISale) => {
            if (sale.softDelete || includes(SalesEnum.StatusRed, sale.status)) {
              return "bg-red-50";
            }

            if (sale.status === SalesEnum.Status.COMPLETED) {
              return "bg-green-50";
            }

            if (sale.status === SalesEnum.Status.DELIVERY) {
              return "bg-purple-50";
            }

            return "";
          }}
          footer={() => {
            if (isLoadingSalesSummary) {
              return <LoadingFull />;
            }

            return (
              <div className="flex justify-center">
                <div>
                  <b className="mr-2">{t("common.discount")}:</b>
                  <span>{formatToMoneyDecimal(salesSummary.discount)}</span>
                </div>
                <Divider type="vertical" className="mx-7" />
                <div>
                  <b className="mr-2">{t("common.tax")}:</b>
                  <span>{formatToMoneyDecimal(salesSummary.tax)}</span>
                </div>
                <Divider type="vertical" className="mx-7" />
                <div>
                  <b className="mr-2">{t("common.shipping")}:</b>
                  <span>{formatToMoneyDecimal(salesSummary.shipping)}</span>
                </div>
                <Divider type="vertical" className="mx-7" />
                <div>
                  <b className="mr-2">{t("common.subtotal")}:</b>
                  <span>{formatToMoneyDecimal(salesSummary.subtotal)}</span>
                </div>
                <Divider type="vertical" className="mx-7" />
                <div>
                  <b className="mr-2">{t("common.total")}:</b>
                  <span>{formatToMoneyDecimal(salesSummary.totalFinal)}</span>
                </div>
              </div>
            );
          }}
        />
      </Card>

      <Modal
        open={isVisibleDeleteSaleModal}
        title={t("sales.deleteManualSale")}
        destroyOnHidden
        onCancel={() => {
          setSaleToDelete(null);
          setIsVisibleDeleteSaleModal(false);
        }}
        onOk={async () => {
          await handleDeleteSale(saleToDelete!);
        }}
        okText={t("common.yes")}
        cancelText={t("common.no")}
      >
        {t("sales.areYouSureDeleteSale")}{" "}
        <strong>{saleToDelete?.number ?? ""}</strong>
      </Modal>

      <Modal
        title={`${t("sales.saleSummary")}: ${saleSelectedToSummary?.number}`}
        open={isOpenSaleSummaryModal}
        cancelButtonProps={{ hidden: true }}
        onOk={() => {
          setSaleSelectedToSummary(null);
          setIsOpenSaleSummaryModal(false);
        }}
        onCancel={() => {
          setSaleSelectedToSummary(null);
          setIsOpenSaleSummaryModal(false);
        }}
        width={700}
      >
        <SaleSummary sale={saleSelectedToSummary} stores={stores} tags={tags} />
      </Modal>

      <UploadFilesDrawer
        width={"70%"}
        isOpen={isUploadFilesDrawerOpen}
        onClose={() => setIsUploadFilesDrawerOpen(false)}
        onUploadFiles={async (formData: FormData) => {
          await serviceMethodsInstance.salesServiceMethods.uploadSales(
            formData,
          );
          await filesUploadsTableRef?.current?.fetchFindFilesUploadsByUserTableState();
        }}
        downloadFileName="social-prices-sales-template.xlsx"
        accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        title={t("sales.uploadSales")}
      >
        <FilesUploadsTable
          type={FilesUploadsEnum.Type.UPLOAD_SALES}
          ref={filesUploadsTableRef}
        />
      </UploadFilesDrawer>

      <DownloadSalesDrawer
        isOpen={isDownloadSalesDrawerOpen}
        onClose={() => setIsDownloadSalesDrawerOpen(false)}
        tags={tagsSort}
        categories={categoriesSort}
        title={t("sales.downloadSales")}
        stores={stores}
        storeId={storeId}
        customerId={customerId}
        productId={productId}
        productItemId={productItemId}
        employeeId={employeeId}
      />

      <Modal
        open={isVisibleActivateSaleModal}
        title={t("sales.activateManualSale")}
        destroyOnHidden
        onCancel={() => {
          setSaleToActivate(null);
          setIsVisibleActivateSaleModal(false);
        }}
        onOk={async () => {
          await handleActivateSale(saleToActivate!);
        }}
        okText={t("common.yes")}
        cancelText={t("common.no")}
      >
        {t("sales.areYouSureActivateSale")}{" "}
        <strong>{saleToActivate?.number ?? ""}</strong>
      </Modal>
    </>
  );
};

export default SalesTable;
