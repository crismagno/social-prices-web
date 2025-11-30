"use client";

import { RefObject, useEffect, useRef, useState } from "react";

import {
  Badge,
  Button,
  Card,
  Col,
  Divider,
  Modal,
  Row,
  Tag,
  Tooltip,
} from "antd";
import { find, first, includes, map } from "lodash";
import moment from "moment";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import { useRouter } from "next/navigation";

import {
  CheckOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  EyeOutlined,
  UploadOutlined,
} from "@ant-design/icons";

import { ButtonCreateSale } from "../../../../components/common/ButtonCreateSale/ButtonCreateSale";
import { CustomRangeDatePicker } from "../../../../components/common/CustomRangeDatePicker/CustomRangeDatePicker";
import { DeliveryAddressMapButton } from "../../../../components/common/DeliveryAddressMapButton/DeliveryAddressMapButton";
import handleClientError from "../../../../components/common/handleClientError/handleClientError";
import { ImageOrDefault } from "../../../../components/common/ImageOrDefault/ImageOrDefault";
import LoadingFull from "../../../../components/common/LoadingFull/LoadingFull";
import { SaleSummary } from "../../../../components/common/SaleSummary/SaleSummary";
import SelectProducts from "../../../../components/common/SelectProducts/SelectProducts";
import { StoreNameStatus } from "../../../../components/common/StoreNameStatus/StoreNameStatus";
import { TagTagsCustomAntd } from "../../../../components/common/TagTagsCustomAntd/TagTagsCustomAntd";
import { UploadFilesDrawer } from "../../../../components/common/UploadFilesDrawer/UploadFilesDrawer";
import YesNo from "../../../../components/common/YesNo/YesNo";
import TableCustomAntd2 from "../../../../components/custom/antd/TableCustomAntd2/TableCustomAntd2";
import useAuthData from "../../../../data/context/auth/useAuthData";
import useSocketData from "../../../../data/context/socket/useSocketData";
import { serviceMethodsInstance } from "../../../../services/social-prices-api/service-methods";
import { ICustomer } from "../../../../shared/business/customers/customer.interface";
import FilesUploadsEnum from "../../../../shared/business/files-uploads/files-uploads.enum";
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
}

const SalesTable: React.FC<Props> = ({ storeId, customerId, productId }) => {
  const { user } = useAuthData();

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
        isActive: [true],
      },
    })
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
    TagsEnum.Type.SALE
  );

  useEffect(() => {
    if (socket && filesUploadsTableRef && user) {
      socket.on(
        SocketsEnum.EventNames.RESPONSE_UPLOAD_SALES_FILE_TO_USER(user._id),
        async () => {
          await filesUploadsTableRef?.current?.fetchFindFilesUploadsByUserTableState();
          await fetchFindSalesByUserTableState();
          await fetchSalesSummaryByUserTableState();
        }
      );

      return () => {
        socket.off(
          SocketsEnum.EventNames.RESPONSE_UPLOAD_SALES_FILE_TO_USER(user._id)
        );
      };
    }
  }, [socket, filesUploadsTableRef, user]);

  if (isLoadingStores || isLoadingTags) {
    return <LoadingFull />;
  }

  const tagsSort: ITag[] = sortArray(tags, "name");

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

  const handleFilterSaleByCreatedAt = (
    startDate: Date | null,
    endDate: Date | null
  ) => {
    setTableStateRequest({
      ...tableStateRequest,
      filters: {
        ...tableStateRequest?.filters,
        createdAtRange: startDate && endDate ? { startDate, endDate } : null,
      },
      pagination: { pageSize: 10, skip: 0, current: undefined, total: 0 },
    });
  };

  return (
    <>
      <Card
        title="Sales"
        className="h-min-80 mt-2"
        extra={
          <>
            <Button
              type="primary"
              onClick={() => setIsDownloadSalesDrawerOpen(true)}
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

            <ButtonCreateSale
              storeId={storeId}
              customerId={customerId}
              productId={productId}
            />
          </>
        }
      >
        <Row gutter={[16, 16]}>
          <Col md={6}>
            <CustomRangeDatePicker
              label="Created Date:"
              showTime
              onChange={handleFilterSaleByCreatedAt}
            />
          </Col>

          <Col md={6}>
            <SelectProducts
              label={"Products"}
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

            if (
              tableStateRequest?.filters?.createdAtRange?.startDate &&
              tableStateRequest?.filters?.createdAtRange?.endDate
            ) {
              tableStateRequestSale.filters = {
                ...tableStateRequestSale.filters,
                createdAtRange: tableStateRequest.filters.createdAtRange,
              };
            }

            setTableStateRequest(tableStateRequestSale);
          }}
          dataSource={sales}
          className="overflow-auto"
          columns={[
            {
              title: "Number",
              dataIndex: "number",
              key: "number",
              align: "center",
              render: (number: string) => (
                <>
                  <strong className="mr-2">{number}</strong>
                </>
              ),
            },
            {
              title: "Number Manual",
              dataIndex: "numberManual",
              key: "numberManual",
              align: "center",
              render: (numberManual: string) => (
                <>
                  <strong className="mr-2">{numberManual}</strong>
                </>
              ),
            },
            {
              title: "Buyer",
              dataIndex: "buyer",
              key: "buyer",
              align: "center",
              render: (buyer: ISaleBuyer, sale: ISale) => {
                const customer: ICustomer | undefined = first(
                  sale.stores
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
                            Urls.CUSTOMER.replace(":customerId", customer?._id!)
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
              title: "Type",
              dataIndex: "type",
              key: "type",
              align: "center",
              filters: Object.keys(SalesEnum.Type).map((type: string) => ({
                text: SalesEnum.TypeLabels[type as SalesEnum.Type],
                value: type,
              })),
              render: (type: SalesEnum.Type) => (
                <Tag color={SalesEnum.TypeColors[type]}>
                  {SalesEnum.TypeLabels[type]}
                </Tag>
              ),
            },
            {
              title: "Delivery Type",
              dataIndex: "deliveryType",
              key: "deliveryType",
              align: "center",
              filters: Object.keys(SalesEnum.DeliveryType).map(
                (deliveryType: string) => ({
                  text: SalesEnum.DeliveryTypeLabels[
                    deliveryType as SalesEnum.DeliveryType
                  ],
                  value: deliveryType,
                })
              ),
              render: (_, sale: ISale) => (
                <div className="flex">
                  <Tag className="mr-2">
                    {SalesEnum.DeliveryTypeLabels[sale.header.deliveryType]}
                  </Tag>

                  {sale.buyer?.address && (
                    <DeliveryAddressMapButton address={sale.buyer.address} />
                  )}
                </div>
              ),
            },
            {
              title: "Status",
              dataIndex: "status",
              key: "status",
              align: "center",
              filters: Object.keys(SalesEnum.Status).map((status: string) => ({
                text: SalesEnum.StatusLabels[status as SalesEnum.Status],
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
                      {SalesEnum.StatusLabels[sale.status]}
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
              title: "Payment Status",
              dataIndex: "paymentStatus",
              key: "paymentStatus",
              align: "center",
              filters: Object.keys(SalesEnum.PaymentStatus).map(
                (paymentStatus: string) => ({
                  text: SalesEnum.PaymentStatusLabels[
                    paymentStatus as SalesEnum.PaymentStatus
                  ],
                  value: paymentStatus,
                })
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
                        {SalesEnum.StatusLabels[sale.status]}
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
              title: "Stores",
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
              title: "Delivery At",
              dataIndex: "deliveryAt",
              key: "deliveryAt",
              align: "center",
              render: (deliveryAt: Date | null, sale: ISale) => {
                if (!deliveryAt) {
                  return null;
                }

                return (
                  <>
                    <span>
                      {moment(deliveryAt).format(DatesEnum.Format.DDMMYYY)}
                    </span>

                    {includes(
                      SalesEnum.StatusToShowDeliveryAt,
                      sale.status
                    ) && (
                      <Tooltip title="Days Remaining">
                        <Badge
                          offset={[5, -5]}
                          color={SalesEnum.getDeliveryAtColor(deliveryAt)}
                          count={SalesEnum.getDeliveryAtDifferenceDays(
                            deliveryAt
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
              title: "Created At",
              dataIndex: "createdAt",
              key: "createdAt",
              align: "center",
              render: (createdAt: Date) =>
                moment(createdAt).format(DatesEnum.Format.DDMMYYYYhhmmss),
              sorter: true,
            },
            {
              title: "Created Date",
              dataIndex: "createdDate",
              key: "createdDate",
              align: "center",
              render: (createdDate: Date) =>
                moment(createdDate).format(DatesEnum.Format.DDMMYYYYhhmmss),
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
              title: "Is Active",
              dataIndex: "isActive",
              key: "isActive",
              align: "center",
              filters: Object.keys(CommonEnum.YesNo).map((value: string) => ({
                value: value === CommonEnum.YesNo.YES,
                text: CommonEnum.YesNoLabels[value as CommonEnum.YesNo],
              })),
              render: (_, sale: ISale) => (
                <Tag color={sale.softDelete ? "red" : "green"}>
                  <YesNo isTrue={!sale.softDelete} />
                </Tag>
              ),
            },
            {
              title: "Action",
              dataIndex: "action",
              key: "action",
              align: "center",
              fixed: "right",
              render: (_, sale: ISale) => {
                const isSaleDeleted: boolean = !!sale.softDelete;

                return (
                  <Button.Group>
                    {!isSaleDeleted && (
                      <Tooltip title="Edit sale">
                        <Button
                          type="success"
                          onClick={() => handleEditSale(sale)}
                          icon={<EditOutlined />}
                        />
                      </Tooltip>
                    )}

                    <Tooltip title="See sale summary">
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
                      <Tooltip title="Delete sale">
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
                      <Tooltip title="Activate sale">
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
                  </Button.Group>
                );
              },
            },
          ]}
          search={{ placeholder: "Search sales..." }}
          loading={isLoading}
          total={total}
          footer={() => {
            if (isLoadingSalesSummary) {
              return <LoadingFull />;
            }

            return (
              <div className="flex justify-center">
                <div>
                  <b className="mr-2">Discount:</b>
                  <span>{formatToMoneyDecimal(salesSummary.discount)}</span>
                </div>
                <Divider type="vertical" className="mx-7" />
                <div>
                  <b className="mr-2">Tax:</b>
                  <span>{formatToMoneyDecimal(salesSummary.tax)}</span>
                </div>
                <Divider type="vertical" className="mx-7" />
                <div>
                  <b className="mr-2">Shipping:</b>
                  <span>{formatToMoneyDecimal(salesSummary.shipping)}</span>
                </div>
                <Divider type="vertical" className="mx-7" />
                <div>
                  <b className="mr-2">Subtotal:</b>
                  <span>{formatToMoneyDecimal(salesSummary.subtotal)}</span>
                </div>
                <Divider type="vertical" className="mx-7" />
                <div>
                  <b className="mr-2">Total:</b>
                  <span>{formatToMoneyDecimal(salesSummary.totalFinal)}</span>
                </div>
              </div>
            );
          }}
        />
      </Card>

      <Modal
        open={isVisibleDeleteSaleModal}
        title={`Delete Manual Sale`}
        destroyOnClose
        onCancel={() => {
          setSaleToDelete(null);
          setIsVisibleDeleteSaleModal(false);
        }}
        onOk={async () => {
          await handleDeleteSale(saleToDelete!);
        }}
        okText={"Yes"}
        cancelText={"No"}
      >
        Are you sure delete sale? Sale Number:{" "}
        <strong>{saleToDelete?.number ?? ""}</strong>
      </Modal>

      <Modal
        title={`Sale Summary: ${saleSelectedToSummary?.number}`}
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
      >
        <SaleSummary sale={saleSelectedToSummary} stores={stores} tags={tags} />
      </Modal>

      <UploadFilesDrawer
        width={"70%"}
        isOpen={isUploadFilesDrawerOpen}
        onClose={() => setIsUploadFilesDrawerOpen(false)}
        onUploadFiles={async (formData: FormData) => {
          await serviceMethodsInstance.salesServiceMethods.uploadSales(
            formData
          );
          await filesUploadsTableRef?.current?.fetchFindFilesUploadsByUserTableState();
        }}
        downloadFileName="social-prices-sales-template.xlsx"
        accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        title="Upload Sales"
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
        title="Download Sales"
        stores={stores}
        storeId={storeId}
        customerId={customerId}
        productId={productId}
      />

      <Modal
        open={isVisibleActivateSaleModal}
        title={`Activate Manual Sale`}
        destroyOnClose
        onCancel={() => {
          setSaleToActivate(null);
          setIsVisibleActivateSaleModal(false);
        }}
        onOk={async () => {
          await handleActivateSale(saleToActivate!);
        }}
        okText={"Yes"}
        cancelText={"No"}
      >
        Are you sure activate sale? Sale Number:{" "}
        <strong>{saleToActivate?.number ?? ""}</strong>
      </Modal>
    </>
  );
};

export default SalesTable;
