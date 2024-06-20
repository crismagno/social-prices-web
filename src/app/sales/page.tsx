"use client";

import { useState } from "react";

import { Button, Card, Modal, Tag, Tooltip } from "antd";
import { find, first, map } from "lodash";
import moment from "moment";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import { useRouter } from "next/navigation";

import { DeleteOutlined, EditOutlined } from "@ant-design/icons";

import { ButtonCreateSale } from "../../components/common/ButtonCreateSale/ButtonCreateSale";
import { CustomRangeDatePicker } from "../../components/common/CustomRangeDatePicker/CustomRangeDatePicker";
import handleClientError from "../../components/common/handleClientError/handleClientError";
import { ImageOrDefault } from "../../components/common/ImageOrDefault/ImageOrDefault";
import LoadingFull from "../../components/common/LoadingFull/LoadingFull";
import TableCustomAntd2 from "../../components/custom/antd/TableCustomAntd2/TableCustomAntd2";
import Layout from "../../components/template/Layout/Layout";
import useAuthData from "../../data/context/auth/useAuthData";
import { serviceMethodsInstance } from "../../services/social-prices-api/ServiceMethods";
import { ICustomer } from "../../shared/business/customers/customer.interface";
import {
  ISale,
  ISaleBuyer,
  ISaleStore,
} from "../../shared/business/sales/sale.interface";
import SalesEnum from "../../shared/business/sales/sales.enum";
import { IStore } from "../../shared/business/stores/stores.interface";
import Urls from "../../shared/common/routes-app/routes-app";
import DatesEnum from "../../shared/utils/dates/dates.enum";
import { createTableState } from "../../shared/utils/table/table-state";
import { ITableStateRequest } from "../../shared/utils/table/table-state.interface";
import { useFindStoresByUser } from "../stores/useFindStoresByUser";
import { useFindSalesByUserTableState } from "./useFindSalesByUserTableState";

export default function SalesPage() {
  const { user } = useAuthData();
  const router: AppRouterInstance = useRouter();

  const [tableStateRequest, setTableStateRequest] = useState<
    ITableStateRequest<ISale> | undefined
  >(createTableState({ sort: { field: "createdAt", order: "ascend" } }));

  const [isVisibleDeleteSaleModal, setIsVisibleDeleteSaleModal] =
    useState<boolean>(false);

  const [isDeletingSale, setIsDeletingSale] = useState<boolean>(false);

  const [saleToDelete, setSaleToDelete] = useState<ISale | null>(null);

  const { isLoading, sales, total } =
    useFindSalesByUserTableState(tableStateRequest);

  const {
    stores,
    isLoading: isLoadingStores,
    fetchFindStoresByUser,
  } = useFindStoresByUser();

  if (isLoadingStores) {
    return <LoadingFull />;
  }

  const handleEditSale = (sale: ISale) => {
    router.push(Urls.SALES_EDIT.replace(":saleId", sale._id));
  };

  const handleDeleteSale = async (sale: ISale) => {
    try {
      setIsDeletingSale(true);

      await serviceMethodsInstance.salesServiceMethods.deleteManual(
        sale._id,
        user!._id
      );

      await fetchFindStoresByUser();
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
    <Layout subtitle="Sales information" title="Sales">
      <Card
        title="Sales"
        className="h-min-80 mt-5"
        extra={<ButtonCreateSale />}
      >
        <CustomRangeDatePicker
          label="Created At:"
          showTime
          onChange={handleFilterSaleByCreatedAt}
        />

        <TableCustomAntd2<ISale>
          rowKey={"_id"}
          tableStateRequest={tableStateRequest}
          setTableStateRequest={setTableStateRequest}
          dataSource={sales}
          className="overflow-auto"
          columns={[
            {
              title: "Sale Number",
              dataIndex: "number",
              key: "number",
              align: "center",
              render: (number: string) => (
                <strong className="mr-2">{number}</strong>
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
              title: "Created At",
              dataIndex: "createdAt",
              key: "createdAt",
              align: "center",
              render: (createdAt: Date) =>
                moment(createdAt).format(DatesEnum.Format.DDMMYYYYhhmmss),
              sorter: true,
            },
            {
              title: "Stores",
              dataIndex: "stores",
              key: "stores",
              align: "center",
              filters: map(stores, (store: IStore) => ({
                value: store._id,
                text: store.name,
              })),
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
              title: "Action",
              dataIndex: "action",
              key: "action",
              align: "center",
              render: (_, sale: ISale) => (
                <Button.Group>
                  <Tooltip title="Edit Sale">
                    <Button
                      type="success"
                      onClick={() => handleEditSale(sale)}
                      icon={<EditOutlined />}
                    />
                  </Tooltip>
                  <Tooltip title="Delete Sale">
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
          pagination={{
            total,
            showTotal(totalCount: number, range: [number, number]) {
              return `${range[0]}-${range[1]} of ${totalCount} items`;
            },
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
    </Layout>
  );
}
