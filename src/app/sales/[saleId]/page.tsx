"use client";

import { useState } from "react";

import {
  Button,
  Card,
  Col,
  Divider,
  Drawer,
  Modal,
  Row,
  Space,
  Tag,
  Tooltip,
} from "antd";
import TextArea from "antd/es/input/TextArea";
import moment from "moment";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";
import { useParams, useRouter } from "next/navigation";

import {
  CarOutlined,
  CheckSquareOutlined,
  DollarCircleOutlined,
  EditOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  QuestionCircleTwoTone,
  ShoppingCartOutlined,
  TableOutlined,
  UserOutlined,
} from "@ant-design/icons";

import { DeliveryAddressMapButton } from "../../../components/common/DeliveryAddressMapButton/DeliveryAddressMapButton";
import Description from "../../../components/common/Description/Description";
import { ImageOrDefault } from "../../../components/common/ImageOrDefault/ImageOrDefault";
import LoadingFull from "../../../components/common/LoadingFull/LoadingFull";
import { SaleSummary } from "../../../components/common/SaleSummary/SaleSummary";
import Layout from "../../../components/template/Layout/Layout";
import useLanguageData from "../../../data/context/language/useLanguageData";
import CategoriesEnum from "../../../shared/business/categories/categories.enum";
import { ICustomer } from "../../../shared/business/customers/customer.interface";
import { ISaleBuyer } from "../../../shared/business/sales/sale.interface";
import SalesEnum from "../../../shared/business/sales/sales.enum";
import { IAddress } from "../../../shared/business/shared/address/address.interface";
import PersonEnum from "../../../shared/business/shared/person/person.enum";
import TagsEnum from "../../../shared/business/tags/tags.enum";
import Urls from "../../../shared/common/routes-app/routes-app";
import DatesEnum from "../../../shared/utils/dates/dates.enum";
import { addressTypesToString } from "../../../shared/utils/strings/string";
import { useFindCategoriesByType } from "../../categories/useFindCategoriesByType";
import { useFindStoresByUser } from "../../stores/useFindStoresByUser";
import { useFindTagsByType } from "../../tags/useFindTagsByType";
import { SaleCategoriesList } from "../components/SaleCategoriesList/SaleCategoriesList";
import { SaleExtraInfo } from "../components/SaleExtraInfo/SaleExtraInfo";
import { SaleFilesList } from "../components/SaleFilesList/SaleFilesList";
import { SalePaymentsReadOnly } from "../components/SalePaymentsReadOnly/SalePaymentsReadOnly";
import { SaleSelectedProducts } from "../components/SaleSelectedProducts/SaleSelectedProducts";
import SalesTable from "../components/SalesTable/SalesTable";
import { SaleStoresListCard } from "../components/SaleStoresListCard/SaleStoresListCard";
import { SaleTagsList } from "../components/SaleTagsList/SaleTagsList";
import { useFindSaleFilledByIdOrFail } from "../useFindSaleFilledByIdOrFail";

export default function SalePage() {
  const router: AppRouterInstance = useRouter();

  const params: Params = useParams();

  const paramsSaleId: string = params?.saleId;

  const { sale, isLoading, fetchFindSaleById } =
    useFindSaleFilledByIdOrFail(paramsSaleId);

  const { stores, isLoading: isLoadingStores } = useFindStoresByUser();

  const { tags, isLoading: isLoadingTags } = useFindTagsByType(
    TagsEnum.Type.SALE,
  );

  const { categories, isLoading: isLoadingCategories } =
    useFindCategoriesByType(CategoriesEnum.Type.SALE);
  const [isOpenSalesTable, setIsOpenSalesTable] = useState<boolean>(false);

  const [isOpenSaleSummaryModal, setIsOpenSaleSummaryModal] =
    useState<boolean>(false);

  const { t } = useLanguageData();

  if (
    isLoading ||
    !sale ||
    isLoadingTags ||
    isLoadingStores ||
    isLoadingCategories
  ) {
    return <LoadingFull />;
  }

  const customer: ICustomer | undefined = sale?.stores?.[0].customer;

  const buyer: ISaleBuyer | null = sale?.buyer ?? null;

  const buyerAddress: IAddress | null = buyer?.address ?? null;

  return (
    <Layout
      subtitle={t("sales.saleInfo")}
      title={t("sales.sale")}
      hasBackButton
    >
      <Row gutter={[16, 16]} className="mt-5">
        <Col xs={24}>
          <Card
            size="small"
            className="w-full bg-white dark:bg-gray-800 border-l-4 border-l-indigo-500 shadow-sm"
          >
            <div className="flex justify-between w-full items-center">
              <div className="flex items-center gap-3">
                <ShoppingCartOutlined className="text-indigo-500 text-xl" />
                <span className="text-base font-medium text-gray-500 dark:text-gray-400">
                  {t("sales.saleNumberLabel")}
                </span>
                {sale?.number ? (
                  <span className="bg-indigo-500 text-white font-bold text-lg px-4 py-0.5 rounded-full shadow-sm">
                    #{sale?.number}
                  </span>
                ) : null}
              </div>

              <Space>
                <Tooltip title={t("sales.editSaleInfo")}>
                  <Button
                    type="success"
                    onClick={() =>
                      router.push(Urls.SALES_EDIT.replace(":saleId", sale._id!))
                    }
                    className="px-3 shadow-lg"
                    icon={<EditOutlined />}
                  >
                    {t("sales.editSale")}
                  </Button>
                </Tooltip>

                <Tooltip title={t("sales.seeSummaryTooltip")}>
                  <Button
                    type="primary"
                    onClick={() => setIsOpenSaleSummaryModal(true)}
                    icon={<EyeOutlined />}
                  >
                    {t("sales.seeSummary")}
                  </Button>
                </Tooltip>

                <Tooltip title={t("sales.openSalesTooltip")}>
                  <Button
                    type="primary"
                    onClick={() => setIsOpenSalesTable(true)}
                    icon={<TableOutlined />}
                  >
                    {t("sales.openSales")}
                  </Button>
                </Tooltip>

                <Tooltip title={t("sales.goToSalesTooltip")}>
                  <Button
                    type="primary"
                    onClick={() => router.push(Urls.SALES)}
                    icon={<TableOutlined />}
                  >
                    {t("sales.goToSales")}
                  </Button>
                </Tooltip>
              </Space>
            </div>

            <Divider className="my-2" />

            <SaleExtraInfo
              allowEvents
              sale={sale}
              onActivateSale={() => fetchFindSaleById()}
              onRemoveSale={() => fetchFindSaleById()}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mt-4">
        {/* Customer Info */}
        <Col xs={24} md={12} className="flex flex-col">
          <Card
            title={
              <div className="flex items-center gap-2">
                <UserOutlined className="text-blue-500" />
                <span className="font-semibold">{t("sales.customer")}</span>
              </div>
            }
            className="flex-1 border-l-4 border-l-blue-500"
          >
            <Row gutter={[8, 8]}>
              <Col xs={24} md={4} className="flex flex-col items-center pt-1">
                <Tooltip title={t("profile.seeAvatar")}>
                  <div className="w-24 h-24 rounded-full border-4 border-blue-100 dark:border-blue-900 overflow-hidden shadow-md">
                    <ImageOrDefault width={96} src={customer?.avatar} />
                  </div>
                </Tooltip>
              </Col>

              <Col xs={24} md={10}>
                <Description
                  label={t("sales.name")}
                  containerClassName="mt-0"
                  description={
                    <Button
                      type="link"
                      className="p-0 max-h-fit"
                      onClick={() =>
                        router.push(
                          Urls.CUSTOMER.replace(":customerId", customer?._id!),
                        )
                      }
                    >
                      {buyer?.name}
                    </Button>
                  }
                />

                <Description
                  label={t("sales.email")}
                  description={
                    <a href={`mailto:${buyer?.email}`}>{buyer?.email}</a>
                  }
                />

                <Description
                  label={t("sales.phoneNumber")}
                  description={
                    <a href={`tel:${buyer?.phoneNumber?.number}`}>
                      {buyer?.phoneNumber?.number}
                    </a>
                  }
                />
              </Col>

              <Col xs={24} md={10}>
                <Description
                  label={t("sales.birthDate")}
                  containerClassName="mt-0"
                  description={
                    buyer?.birthDate
                      ? moment(buyer.birthDate).format(
                          DatesEnum.Format.MMDDYYYY,
                        )
                      : ""
                  }
                />

                <Description
                  label={t("sales.gender")}
                  description={
                    <Tag
                      color={
                        PersonEnum.GenderColors[
                          buyer?.gender as PersonEnum.Gender
                        ]
                      }
                    >
                      {t(
                        PersonEnum.GenderLabels[
                          buyer?.gender as PersonEnum.Gender
                        ],
                      )}
                    </Tag>
                  }
                />
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Customer Address */}
        <Col xs={24} md={12} className="flex flex-col">
          <Card
            title={
              <div className="flex items-center gap-2">
                <EnvironmentOutlined className="text-green-500" />
                <span className="font-semibold">
                  {t("address.shippingAddress")}
                </span>
                {buyerAddress && (
                  <DeliveryAddressMapButton address={buyerAddress} />
                )}
              </div>
            }
            className="flex-1 border-l-4 border-l-green-500"
          >
            {/* Delivery Type banner */}
            <div className="flex items-center gap-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-5 py-3 mb-4">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 whitespace-nowrap">
                <CarOutlined className="text-lg" />
                <span className="font-semibold text-sm">
                  {t("sales.deliveryType")}
                </span>
              </div>
              <Tag className="font-medium">
                {t(SalesEnum.DeliveryTypeLabels[sale.header.deliveryType])}
              </Tag>
            </div>

            <Row gutter={[8, 8]} className="pb-2">
              <Col xs={24} md={8}>
                <Description
                  containerClassName="mt-0"
                  label={t("sales.country")}
                  description={buyerAddress?.country.name || "-"}
                />

                <Description
                  label={t("sales.state")}
                  description={buyerAddress?.state?.name || "-"}
                />

                <Description
                  label={t("sales.city")}
                  description={buyerAddress?.city || "-"}
                />
              </Col>

              <Col xs={24} md={8}>
                <Description
                  containerClassName="mt-0"
                  label={t("sales.address1")}
                  description={buyerAddress?.address1 || "-"}
                />

                <Description
                  label={t("sales.address2")}
                  description={buyerAddress?.address2 || "-"}
                />

                <Description
                  label={t("sales.district")}
                  description={buyerAddress?.district || "-"}
                />
              </Col>

              <Col xs={24} md={8}>
                <Description
                  containerClassName="mt-0"
                  label={t("sales.zipcode")}
                  description={buyerAddress?.zip || "-"}
                />

                <Description
                  label={t("common.description")}
                  description={buyerAddress?.description || "-"}
                />

                <Description
                  label={t("sales.types")}
                  description={
                    buyerAddress ? addressTypesToString(buyerAddress, t) : "-"
                  }
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mt-4">
        {/* Stores */}
        <Col xs={24} md={24}>
          <SaleStoresListCard sale={sale} stores={stores} />
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mt-4">
        {/* Selected Products */}
        <Col xs={24} md={24}>
          <SaleSelectedProducts sale={sale} />
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mt-4">
        {/* Payment */}
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
                <Tooltip title={t("sales.salePaymentsInfoTooltip")}>
                  <QuestionCircleTwoTone />
                </Tooltip>
              </div>
            }
          />
        </Col>

        {/* Confirmation */}
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
              <Col xs={24}>
                <SaleFilesList sale={sale} />
              </Col>
            </Row>

            <Divider orientation="left" className="my-2">
              {t("common.note")}
            </Divider>

            <Row>
              <Col xs={24}>
                <Description
                  label={t("sales.note")}
                  className="w-full"
                  description={<TextArea readOnly value={sale?.note!} />}
                />
              </Col>
            </Row>

            <Row className="mt-2">
              <Col xs={24}>
                <Description
                  label={t("sales.noteToCustomer")}
                  className="w-full"
                  description={
                    <TextArea readOnly value={sale?.noteToCustomer!} />
                  }
                />
              </Col>
            </Row>

            <Divider orientation="left" className="my-2">
              {t("sales.tagsAndCategories")}
            </Divider>

            <Row>
              <Col xs={24}>
                <Description
                  label={t("sales.tags")}
                  className="w-full"
                  description={<SaleTagsList sale={sale} tags={tags} />}
                />
              </Col>
            </Row>

            <Row>
              <Col xs={24}>
                <Description
                  label={t("sales.categories")}
                  className="w-full"
                  description={
                    <SaleCategoriesList sale={sale} categories={categories} />
                  }
                />
              </Col>
            </Row>

            <Divider orientation="left" className="my-2">
              {t("common.status")}
            </Divider>

            <Row>
              <Col xs={24} md={12}>
                <Description
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
                  label={t("sales.paymentStatus")}
                  description={
                    <Tag
                      className="w-fit"
                      color={SalesEnum.PaymentStatusColors[sale.paymentStatus]}
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
              <Col xs={24} md={8} className="pr-5">
                <Description
                  label={t("sales.deliveryDate")}
                  containerClassName="mt-0"
                  description={
                    sale?.deliveryAt
                      ? moment(sale.deliveryAt).format(
                          DatesEnum.Format.MMDDYYYY,
                        )
                      : "-"
                  }
                />
              </Col>

              <Col xs={24} md={8} className="pr-5">
                <Description
                  label={t("sales.createdDate")}
                  containerClassName="mt-0"
                  description={
                    sale?.createdAt
                      ? moment(sale.createdAt).format(DatesEnum.Format.MMDDYYYY)
                      : "-"
                  }
                />
              </Col>
              <Col xs={24} md={8} className="pr-5">
                <Description
                  label={t("sales.saleNumberManual")}
                  containerClassName="mt-0"
                  description={<b>{sale?.numberManual || "-"}</b>}
                />
              </Col>
            </Row>

            <Row>
              <Col xs={24}>
                <Description
                  label={t("sales.sendCustomerNotifications")}
                  description={
                    <div>
                      <Tag>
                        {sale.isSendCustomerNotifications
                          ? t("common.yes")
                          : t("common.no")}
                      </Tag>
                    </div>
                  }
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Modal
        title={t("sales.saleSummary")}
        open={isOpenSaleSummaryModal}
        cancelButtonProps={{ hidden: true }}
        onOk={() => setIsOpenSaleSummaryModal(false)}
        onCancel={() => setIsOpenSaleSummaryModal(false)}
        width={700}
      >
        <SaleSummary
          sale={sale}
          stores={stores}
          tags={tags}
          categories={categories}
        />
      </Modal>

      <Drawer
        open={isOpenSalesTable}
        onClose={() => setIsOpenSalesTable(false)}
        placement="right"
        width={"90%"}
      >
        <SalesTable />
      </Drawer>
    </Layout>
  );
}
