"use client";

import { useEffect, useState } from "react";

import {
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Modal,
  Row,
  Tag,
  Tooltip,
} from "antd";
import moment from "moment";
import Link from "next/link";
import { useParams } from "next/navigation";

import {
  CarOutlined,
  CheckSquareOutlined,
  DollarCircleOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  MessageOutlined,
  ProfileOutlined,
  QuestionCircleTwoTone,
  ShopOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";

import { DeliveryAddressMapButton } from "../../../../components/common/DeliveryAddressMapButton/DeliveryAddressMapButton";
import { SaleSummary } from "../../../../components/common/SaleSummary/SaleSummary";
import { DownloadSalesSummaryButton } from "../../../../components/common/DownloadSalesSummaryButton/DownloadSalesSummaryButton";
import Description from "../../../../components/common/Description/Description";
import handleClientError from "../../../../components/common/HandleClientError/HandleClientError";
import LoadingFull from "../../../../components/common/LoadingFull/LoadingFull";
import { TrackingNumberLine } from "../../../../components/common/TrackingNumberLine/TrackingNumberLine";
import Layout from "../../../../components/template/Layout/Layout";
import useLanguageData from "../../../../data/context/language/useLanguageData";
import { serviceMethodsInstance } from "../../../../services/social-prices-api/service-methods";
import { ICustomerPortalSale } from "../../../../shared/business/customer-portal/customer-portal.types";
import { IProduct } from "../../../../shared/business/products/products.interface";
import {
  ISale,
  ISaleStore,
  ISaleStoreProduct,
} from "../../../../shared/business/sales/sale.interface";
import Urls from "../../../../shared/common/routes-app/routes-app";
import SalesEnum from "../../../../shared/business/sales/sales.enum";
import { IStore } from "../../../../shared/business/stores/stores.interface";
import { IAddress } from "../../../../shared/business/shared/address/address.interface";
import DatesEnum from "../../../../shared/utils/dates/dates.enum";
import { addressTypesToString } from "../../../../shared/utils/strings/string";
import { SalePaymentsReadOnly } from "../../../sales/components/SalePaymentsReadOnly/SalePaymentsReadOnly";
import { SaleCartTotals } from "../../../sales/components/SaleSelectedProducts/SaleCartTotals";
import { SaleStoresProducts } from "../../../sales/components/SaleSelectedProducts/SaleStoresProducts";

// One purchase, read only, laid out like the store's sale page: what was
// bought, where, how it is being delivered and paid. Nothing internal to the
// store (who sold it, internal notes, tags) is shown.
export default function CustomerPurchasePage() {
  const { t } = useLanguageData();

  const params = useParams();

  const saleId: string = String(params?.saleId ?? "");

  const [sale, setSale] = useState<ICustomerPortalSale | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [isOpenSummary, setIsOpenSummary] = useState<boolean>(false);

  useEffect(() => {
    if (!saleId) {
      return;
    }

    serviceMethodsInstance.customerPortalServiceMethods
      .findSale(saleId)
      .then(setSale)
      .catch(handleClientError)
      .finally(() => setIsLoading(false));
  }, [saleId]);

  if (isLoading) {
    return <LoadingFull />;
  }

  if (!sale) {
    return (
      <Layout title={t("customerPortal.purchase")} hasBackButton>
        <Empty
          className="mt-5"
          description={t("customerPortal.purchaseNotFound")}
        />
      </Layout>
    );
  }

  const address: IAddress | null = sale.buyer?.address ?? null;

  const storeName = (store: ISaleStore): string =>
    sale.storesNames[String(store.storeId)] ?? "-";

  // The portal sends names and pictures as maps instead of filled documents;
  // fill the store and product of each line so the sale's cart can draw them.
  const cartSale: ISale = {
    ...sale,
    stores: sale.stores.map((store: ISaleStore) => ({
      ...store,
      store: { _id: String(store.storeId), name: storeName(store) } as IStore,
      products: store.products.map((product: ISaleStoreProduct) => ({
        ...product,
        product: {
          _id: String(product.productId),
          name: sale.productsNames[String(product.productId)] ?? "-",
          mainUrl: sale.productsImages?.[String(product.productId)] ?? null,
        } as IProduct,
      })),
    })),
  };

  return (
    <Layout
      title={t("customerPortal.purchase")}
      subtitle={t("customerPortal.purchaseSubtitle")}
      hasBackButton
    >
      {/* Number and where it stands */}
      <Row gutter={[16, 16]} className="mt-5">
        <Col xs={24}>
          <Card
            size="small"
            className="w-full bg-white dark:bg-gray-800 border-l-4 border-l-indigo-500 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <ShoppingCartOutlined className="text-indigo-500 text-xl" />
                <span className="text-base font-medium text-gray-500 dark:text-gray-400">
                  {t("sales.saleNumberLabel")}
                </span>
                <span className="bg-indigo-500 text-white font-bold text-lg px-4 py-0.5 rounded-full shadow-sm">
                  #{sale.number}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Each tag says what it is about, with a hint on hover. */}
                <Tooltip title={t("customerPortal.orderStatusHint")}>
                  <Tag
                    color={SalesEnum.StatusColors[sale.status]}
                    className="m-0 px-3 py-1 text-sm"
                  >
                    <span className="font-normal">
                      {t("customerPortal.orderStatus")}:
                    </span>{" "}
                    <b>{t(SalesEnum.StatusLabels[sale.status])}</b>
                  </Tag>
                </Tooltip>

                <Tooltip title={t("customerPortal.paymentStatusHint")}>
                  <Tag
                    color={
                      (SalesEnum.PaymentStatusColors as any)[sale.paymentStatus]
                    }
                    className="m-0 px-3 py-1 text-sm"
                  >
                    <span className="font-normal">
                      {t("customerPortal.paymentStatus")}:
                    </span>{" "}
                    <b>
                      {t(SalesEnum.PaymentStatusLabels[sale.paymentStatus])}
                    </b>
                  </Tag>
                </Tooltip>

                <Tooltip title={t("sales.seeSummaryTooltip")}>
                  <Button
                    type="primary"
                    onClick={() => setIsOpenSummary(true)}
                    icon={<EyeOutlined />}
                  >
                    {t("sales.seeSummary")}
                  </Button>
                </Tooltip>

                <DownloadSalesSummaryButton
                  sale={sale}
                  buttonText={t("customerPortal.downloadSummary")}
                />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mt-4">
        {/* Delivery */}
        <Col xs={24} md={16} className="flex flex-col">
          <Card
            title={
              <div className="flex items-center gap-2">
                <EnvironmentOutlined className="text-green-500" />
                <span className="font-semibold">
                  {t("address.shippingAddress")}
                </span>
                {address && <DeliveryAddressMapButton address={address} />}
              </div>
            }
            className="flex-1 border-l-4 border-l-green-500"
          >
            <div className="flex items-center gap-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-5 py-3 mb-4">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 whitespace-nowrap">
                <CarOutlined className="text-lg" />
                <span className="font-semibold text-sm">
                  {t("sales.deliveryType")}
                </span>
              </div>
              <Tag className="font-medium">
                {sale.header?.deliveryType
                  ? t(SalesEnum.DeliveryTypeLabels[sale.header.deliveryType])
                  : "-"}
              </Tag>
            </div>

            <TrackingNumberLine
              value={sale.header?.shipping?.trackingNumber}
              className="mb-4"
            />

            <Row gutter={[8, 8]} className="pb-2">
              <Col xs={24} md={8}>
                <Description
                  containerClassName="mt-0"
                  label={t("sales.country")}
                  description={address?.country?.name || "-"}
                />
                <Description
                  label={t("sales.state")}
                  description={address?.state?.name || "-"}
                />
                <Description
                  label={t("sales.city")}
                  description={address?.city || "-"}
                />
              </Col>

              <Col xs={24} md={8}>
                <Description
                  containerClassName="mt-0"
                  label={t("sales.address1")}
                  description={address?.address1 || "-"}
                />
                <Description
                  label={t("sales.address2")}
                  description={address?.address2 || "-"}
                />
                <Description
                  label={t("sales.district")}
                  description={address?.district || "-"}
                />
              </Col>

              <Col xs={24} md={8}>
                <Description
                  containerClassName="mt-0"
                  label={t("sales.zipcode")}
                  description={address?.zip || "-"}
                />
                <Description
                  label={t("sales.types")}
                  description={address ? addressTypesToString(address, t) : "-"}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Where it was bought */}
        <Col xs={24} md={8} className="flex flex-col">
          <Card
            title={
              <div className="flex items-center gap-2">
                <ShopOutlined className="text-slate-500" />
                <span className="font-semibold">{t("sales.storesCard")}</span>
              </div>
            }
            className="flex-1 border-l-4 border-l-slate-500"
          >
            <div className="flex flex-wrap gap-2">
              {sale.stores.map((store: ISaleStore) => (
                <Tag key={String(store.storeId)} className="m-0 text-sm">
                  {storeName(store)}

                  <Link
                    className="ml-2"
                    href={Urls.CUSTOMER_CHAT_STORE.replace(
                      ":storeId",
                      String(store.storeId),
                    )}
                  >
                    <MessageOutlined /> {t("customerChats.talkToStore")}
                  </Link>
                </Tag>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* The cart, drawn by the same component as the store's sale page */}
      <Row gutter={[16, 16]} className="mt-4">
        <Col xs={24}>
          <Card
            title={
              <div className="flex items-center gap-2">
                <ProfileOutlined className="text-amber-500" />
                <span className="font-semibold">{t("sales.cart")}</span>
                <Tooltip title={t("sales.selectedProductsTooltip")}>
                  <QuestionCircleTwoTone />
                </Tooltip>
              </div>
            }
            className="border-l-4 border-l-amber-500"
          >
            <div style={{ maxHeight: 878 }}>
              <SaleStoresProducts sale={cartSale} />
            </div>

            <SaleCartTotals sale={sale} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mt-4">
        {/* Payments, with what is still to pay */}
        <Col xs={24} md={12} className="flex flex-col">
          <SalePaymentsReadOnly
            sale={sale}
            className="flex-1 border-l-4 border-l-teal-500"
            title={
              <div className="flex items-center gap-2">
                <DollarCircleOutlined className="text-teal-500" />
                <span className="font-semibold">
                  {t("sales.paymentConfirmation")}
                </span>
              </div>
            }
          />
        </Col>

        {/* Status and dates */}
        <Col xs={24} md={12} className="flex flex-col">
          <Card
            title={
              <div className="flex items-center gap-2">
                <CheckSquareOutlined className="text-purple-500" />
                <span className="font-semibold">{t("sales.confirmation")}</span>
              </div>
            }
            className="flex-1 border-l-4 border-l-purple-500"
          >
            <Row>
              <Col xs={24} md={12}>
                <Description
                  containerClassName="mt-0"
                  label={t("sales.status")}
                  description={
                    <>
                      <Tag
                        color={SalesEnum.StatusColors[sale.status]}
                        className="w-fit h-fit"
                      >
                        {t(SalesEnum.StatusLabels[sale.status])}
                      </Tag>

                      {sale.completedAt && (
                        <Tooltip title={t("sales.completedAt")}>
                          <small className="ml-1 italic">
                            {moment(sale.completedAt).format(
                              DatesEnum.Format.DDMMYYYYhhmmss,
                            )}
                          </small>
                        </Tooltip>
                      )}
                    </>
                  }
                />
              </Col>

              <Col xs={24} md={12}>
                <Description
                  containerClassName="mt-0"
                  label={t("sales.paymentStatus")}
                  description={
                    <Tag
                      className="w-fit"
                      color={
                        (SalesEnum.PaymentStatusColors as any)[
                          sale.paymentStatus
                        ]
                      }
                    >
                      {t(SalesEnum.PaymentStatusLabels[sale.paymentStatus])}
                    </Tag>
                  }
                />
              </Col>
            </Row>

            <Divider orientation="left" className="my-2">
              {t("common.details")}
            </Divider>

            <Row>
              <Col xs={24} md={12}>
                <Description
                  containerClassName="mt-0"
                  label={t("sales.createdDate")}
                  description={moment(sale.createdAt).format(
                    DatesEnum.Format.DDMMYYYYhhmmss,
                  )}
                />
              </Col>

              <Col xs={24} md={12}>
                <Description
                  containerClassName="mt-0"
                  label={t("sales.deliveryDate")}
                  description={
                    sale.deliveryAt
                      ? moment(sale.deliveryAt).format(
                          DatesEnum.Format.DDMMYYYYhhmmss,
                        )
                      : "-"
                  }
                />
              </Col>
            </Row>

            {sale.noteToCustomer && (
              <Description
                label={t("sales.noteToCustomer")}
                description={sale.noteToCustomer}
              />
            )}
          </Card>
        </Col>
      </Row>

      <Modal
        title={t("sales.saleSummary")}
        open={isOpenSummary}
        cancelButtonProps={{ hidden: true }}
        onOk={() => setIsOpenSummary(false)}
        onCancel={() => setIsOpenSummary(false)}
        width={700}
      >
        <SaleSummary sale={cartSale} stores={[]} tags={[]} isCustomerView />
      </Modal>
    </Layout>
  );
}
