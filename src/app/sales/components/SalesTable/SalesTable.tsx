"use client";

import { RefObject, useEffect, useRef, useState } from "react";

import { Badge, Button, Card, Col, Modal, Row, Tag, Tooltip } from "antd";
import { find, first, includes, map } from "lodash";
import moment from "moment";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import { useRouter } from "next/navigation";

import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  EyeOutlined,
  UploadOutlined,
} from "@ant-design/icons";

import { ButtonCreateSale } from "../../../../components/common/ButtonCreateSale/ButtonCreateSale";
import { CustomRangeDatePicker } from "../../../../components/common/CustomRangeDatePicker/CustomRangeDatePicker";
import handleClientError from "../../../../components/common/handleClientError/handleClientError";
import { ImageOrDefault } from "../../../../components/common/ImageOrDefault/ImageOrDefault";
import LoadingFull from "../../../../components/common/LoadingFull/LoadingFull";
import { SaleResume } from "../../../../components/common/SaleResume/SaleResume";
import SelectProducts from "../../../../components/common/SelectProducts/SelectProducts";
import { TagTagsCustomAntd } from "../../../../components/common/TagTagsCustomAntd/TagTagsCustomAntd";
import { UploadFilesDrawer } from "../../../../components/common/UploadFilesDrawer/UploadFilesDrawer";
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
import Urls from "../../../../shared/common/routes-app/routes-app";
import { sortArray } from "../../../../shared/utils/array/functions";
import DatesEnum from "../../../../shared/utils/dates/dates.enum";
import { createTableState } from "../../../../shared/utils/table/table-state";
import { ITableStateRequest } from "../../../../shared/utils/table/table-state.interface";
import {
  FilesUploadsTable,
  IFilesUploadsTableRefProps,
} from "../../../files-uploads/FilesUploadsTable";
import { useFindStoresByUser } from "../../../stores/useFindStoresByUser";
import { useFindTagsByType } from "../../../tags/useFindTagsByType";
import { useFindSalesByUserTableState } from "../../useFindSalesByUserTableState";
import { DownloadSalesDrawer } from "../DownloadSalesDrawer/DownloadSalesDrawer";

interface Props {
  storeId?: string;
  customerId?: string;
}

const SalesTable: React.FC<Props> = ({ storeId, customerId }) => {
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
      },
    })
  );

  const [isVisibleDeleteSaleModal, setIsVisibleDeleteSaleModal] =
    useState<boolean>(false);

  const [isDeletingSale, setIsDeletingSale] = useState<boolean>(false);

  const [saleToDelete, setSaleToDelete] = useState<ISale | null>(null);

  const [isOpenSaleResumeModal, setIsOpenSaleResumeModal] =
    useState<boolean>(false);

  const [saleSelectedToResume, setSaleSelectedToResume] =
    useState<ISale | null>(null);

  const [isUploadFilesDrawerOpen, setIsUploadFilesDrawerOpen] =
    useState<boolean>(false);

  const [isDownloadSalesDrawerOpen, setIsDownloadSalesDrawerOpen] =
    useState<boolean>(false);

  const filesUploadsTableRef: RefObject<IFilesUploadsTableRefProps> =
    useRef<IFilesUploadsTableRefProps>(null);

  const { isLoading, sales, total, fetchFindSalesByUserTableState } =
    useFindSalesByUserTableState(tableStateRequest);

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

            <ButtonCreateSale storeId={storeId} customerId={customerId} />
          </>
        }
      >
        <Row gutter={[16, 16]}>
          <Col md={6}>
            <CustomRangeDatePicker
              label="Created At:"
              showTime
              onChange={handleFilterSaleByCreatedAt}
            />
          </Col>

          <Col md={6}>
            <SelectProducts
              label={"Products"}
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

                return (
                  <div className="flex flex-row">
                    <div className="mr-2">
                      <ImageOrDefault src={customer?.avatar} width={45} />
                    </div>
                    <div className="flex flex-col justify-start items-start">
                      <Button
                        type="link"
                        className="p-0"
                        onClick={() => router.push(Urls.CUSTOMERS)}
                      >
                        {buyer.name}
                      </Button>
                      <div className="text-xs">{buyer.email}</div>
                    </div>
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
                <Tag>
                  {SalesEnum.DeliveryTypeLabels[sale.header.deliveryType]}
                </Tag>
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
              render: (status: SalesEnum.Status) => (
                <Tag color={SalesEnum.StatusColors[status]}>
                  {SalesEnum.StatusLabels[status]}
                </Tag>
              ),
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
              render: (paymentStatus: SalesEnum.PaymentStatus) => (
                <Tag color={SalesEnum.PaymentStatusColors[paymentStatus]}>
                  {SalesEnum.PaymentStatusLabels[paymentStatus]}
                </Tag>
              ),
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
                      <span className="mr-1">{store.name}</span>
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
              title: "Action",
              dataIndex: "action",
              key: "action",
              align: "center",
              render: (_, sale: ISale) => (
                <Button.Group>
                  <Tooltip title="Edit sale">
                    <Button
                      type="success"
                      onClick={() => handleEditSale(sale)}
                      icon={<EditOutlined />}
                    />
                  </Tooltip>
                  <Tooltip title="See sale resume">
                    <Button
                      type="primary"
                      onClick={() => {
                        setSaleSelectedToResume(sale);
                        setIsOpenSaleResumeModal(true);
                      }}
                      icon={<EyeOutlined />}
                    />
                  </Tooltip>
                  <Tooltip title="Delete sale">
                    <Button
                      loading={saleToDelete?._id === sale._id && isDeletingSale}
                      type="danger"
                      icon={<DeleteOutlined />}
                      onClick={() => {
                        setSaleToDelete(sale);
                        setIsVisibleDeleteSaleModal(true);
                      }}
                    />
                  </Tooltip>
                </Button.Group>
              ),
            },
          ]}
          search={{ placeholder: "Search sales..." }}
          loading={isLoading}
          total={total}
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
        title={`Sale Resume: ${saleSelectedToResume?.number}`}
        open={isOpenSaleResumeModal}
        cancelButtonProps={{ hidden: true }}
        onOk={() => {
          setSaleSelectedToResume(null);
          setIsOpenSaleResumeModal(false);
        }}
        onCancel={() => {
          setSaleSelectedToResume(null);
          setIsOpenSaleResumeModal(false);
        }}
      >
        <SaleResume sale={saleSelectedToResume} stores={stores} tags={tags} />
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
      />
    </>
  );
};

export default SalesTable;
