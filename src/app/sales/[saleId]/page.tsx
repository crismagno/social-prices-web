"use client";

import { useState } from "react";

import { Button, Card, Col, Row, Tag, Tooltip } from "antd";
import moment from "moment";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";
import { useParams, useRouter } from "next/navigation";

import { QuestionCircleTwoTone, TableOutlined } from "@ant-design/icons";

import { DeliveryAddressMapButton } from "../../../components/common/DeliveryAddressMapButton/DeliveryAddressMapButton";
import Description from "../../../components/common/Description/Description";
import { ImageOrDefault } from "../../../components/common/ImageOrDefault/ImageOrDefault";
import LoadingFull from "../../../components/common/LoadingFull/LoadingFull";
import Layout from "../../../components/template/Layout/Layout";
import useAuthData from "../../../data/context/auth/useAuthData";
import { ICustomer } from "../../../shared/business/customers/customer.interface";
import {
  ISaleBuyer,
  ISaleStore,
} from "../../../shared/business/sales/sale.interface";
import SalesEnum from "../../../shared/business/sales/sales.enum";
import { IAddress } from "../../../shared/business/shared/address/address.interface";
import PersonEnum from "../../../shared/business/shared/person/person.enum";
import TagsEnum from "../../../shared/business/tags/tags.enum";
import Urls from "../../../shared/common/routes-app/routes-app";
import DatesEnum from "../../../shared/utils/dates/dates.enum";
import { addressTypesToString } from "../../../shared/utils/strings/string";
import { useFindTagsByType } from "../../tags/useFindTagsByType";
import { SalePaymentsReadOnly } from "../components/SalePaymentsReadOnly/SalePaymentsReadOnly";
import { SaleSelectedProducts } from "../components/SaleSelectedProducts/SaleSelectedProducts";
import { useFindSaleFilledByIdOrFail } from "../useFindSaleFilledByIdOrFail";

export default function SalePage() {
  const { user, employee } = useAuthData();

  const router: AppRouterInstance = useRouter();

  const params: Params = useParams();

  const paramsSaleId: string = params?.saleId;

  const { sale, isLoading } = useFindSaleFilledByIdOrFail(paramsSaleId);

  const { tags, isLoading: isLoadingTags } = useFindTagsByType(
    TagsEnum.Type.SALE
  );
  const [isOpenSalesTable, setIsOpenSalesTable] = useState<boolean>(false);

  if (isLoading || !sale || isLoadingTags) {
    return <LoadingFull />;
  }

  const saleStores: ISaleStore[] = sale?.stores ?? [];

  const customer: ICustomer | undefined = sale?.stores?.[0].customer;

  const buyer: ISaleBuyer | null = sale?.buyer ?? null;

  const buyerAddress: IAddress | null = buyer?.address ?? null;

  return (
    <Layout subtitle={"Information about sale"} title={"Sale"} hasBackButton>
      <Row gutter={[16, 16]} className="mt-5" justify={"end"}>
        <Col xs={24}>
          <div className="flex justify-between bg-white w-full py-3 px-5 rounded-md">
            <div>
              <span className="text-lg mr-2">Sale Number: </span>
              {sale?.number ? (
                <label className="font-bold text-lg">{sale?.number}</label>
              ) : null}
            </div>

            <div>
              <Tooltip title="Open Sales">
                <Button
                  type="primary"
                  onClick={() => setIsOpenSalesTable(true)}
                  icon={<TableOutlined />}
                  className="mr-2"
                >
                  Open Sales
                </Button>
              </Tooltip>

              <Tooltip title="Go to Sales">
                <Button
                  type="primary"
                  onClick={() => router.push(Urls.SALES)}
                  icon={<TableOutlined />}
                >
                  Go to Sales
                </Button>
              </Tooltip>
            </div>
          </div>
        </Col>
      </Row>

      <Row gutter={[8, 8]} className="mt-2">
        {/* Customer Info */}
        <Col xs={24} md={12}>
          <Card
            title={
              <div className="flex">
                <label className="mr-2">Customer </label>
              </div>
            }
            className="h-min-80"
          >
            <Row gutter={[8, 8]}>
              <Col xs={24} md={4}>
                <Tooltip title="See avatar">
                  <ImageOrDefault width={110} src={customer?.avatar} />
                </Tooltip>
              </Col>

              <Col xs={24} md={10}>
                <Description
                  label="Name"
                  containerClassName="mt-0"
                  description={
                    <Button
                      type="link"
                      className="p-0 max-h-fit"
                      onClick={() =>
                        router.push(
                          Urls.CUSTOMER.replace(":customerId", customer?._id!)
                        )
                      }
                    >
                      {buyer?.name}
                    </Button>
                  }
                />

                <Description
                  label="Email"
                  description={
                    <a href={`mailto:${buyer?.email}`}>{buyer?.email}</a>
                  }
                />

                <Description
                  label="Phone Number"
                  description={
                    <a href={`tel:${buyer?.phoneNumber?.number}`}>
                      {buyer?.phoneNumber?.number}
                    </a>
                  }
                />
              </Col>

              <Col xs={24} md={10}>
                <Description
                  label="Birth Date"
                  containerClassName="mt-0"
                  description={
                    buyer?.birthDate
                      ? moment(buyer.birthDate).format(
                          DatesEnum.Format.MMDDYYYY
                        )
                      : ""
                  }
                />

                <Description
                  label="Gender"
                  description={
                    <Tag
                      color={
                        PersonEnum.GenderColors[
                          buyer?.gender as PersonEnum.Gender
                        ]
                      }
                    >
                      {
                        PersonEnum.GenderLabels[
                          buyer?.gender as PersonEnum.Gender
                        ]
                      }
                    </Tag>
                  }
                />
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Customer Address */}
        <Col xs={24} md={12}>
          <Card
            title={
              <div className="flex justify-between">
                <div className="flex">
                  <label className="mr-2">
                    <span className="mr-2">Shipping Address</span>

                    {buyerAddress && (
                      <DeliveryAddressMapButton address={buyerAddress} />
                    )}
                  </label>
                </div>

                <div className="flex">
                  <label className="mr-2">Delivery Type</label>

                  <Tag>
                    {SalesEnum.DeliveryTypeLabels[sale.header.deliveryType]}
                  </Tag>
                </div>
              </div>
            }
            className="h-min-80"
          >
            <Row gutter={[8, 8]} className="pb-2">
              <Col xs={24} md={8}>
                <Description
                  containerClassName="mt-0"
                  label="Country"
                  description={buyerAddress?.country.name}
                />

                <Description
                  label="State"
                  description={buyerAddress?.state?.name}
                />

                <Description label="City" description={buyerAddress?.city} />
              </Col>

              <Col xs={24} md={8}>
                <Description
                  containerClassName="mt-0"
                  label="Address1"
                  description={buyerAddress?.address1}
                />

                <Description
                  label="Address2"
                  description={buyerAddress?.address2}
                />

                <Description
                  label="District"
                  description={buyerAddress?.district}
                />
              </Col>

              <Col xs={24} md={8}>
                <Description
                  containerClassName="mt-0"
                  label="Zipcode"
                  description={buyerAddress?.zip}
                />

                <Description
                  label="Description"
                  description={buyerAddress?.zip}
                />

                <Description
                  label="Types"
                  description={
                    buyerAddress ? addressTypesToString(buyerAddress) : ""
                  }
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Row gutter={[8, 8]} className="mt-2">
        {/* Selected Products */}
        <Col xs={24} md={12}>
          <SaleSelectedProducts sale={sale} />
        </Col>

        {/* Payment */}
        <Col xs={24} md={12}>
          <SalePaymentsReadOnly
            sale={sale}
            title={
              <div className="flex">
                <label className="mr-2">Payment</label>
                <Tooltip title="Here you can see sale payments information">
                  <QuestionCircleTwoTone />
                </Tooltip>
              </div>
            }
          />
        </Col>
      </Row>

      <Row gutter={[8, 8]} className="mt-2">
        {/* Confirmation */}
        {/* <Col xs={24} md={12}>
          <Card
            title={
              <div className="flex justify-between">
                <span>Confirmation</span>
              </div>
            }
          >
            <Row>
              <Col xs={24}>
                <AddSaleFiles sale={saleById} onSetFileList={setFileList} />
              </Col>
            </Row>

            <Row>
              <Col xs={24}>
                <TextareaCustomAntd
                  controller={{ control, name: "note" }}
                  label="Note"
                  divClassName="mt-0"
                  placeholder={"Enter any note if you need"}
                  errorMessage={errors?.note?.message}
                  maxLength={1000}
                />
              </Col>
            </Row>

            <Row className="mt-2">
              <Col xs={24}>
                <TextareaCustomAntd
                  controller={{ control, name: "noteToCustomer" }}
                  label="Note to Customer"
                  divClassName="mt-0"
                  placeholder={"Enter any note if you need"}
                  errorMessage={errors?.noteToCustomer?.message}
                  maxLength={1000}
                />
              </Col>
            </Row>

            <Row>
              <Col xs={24}>
                <SelectCustomAntd<ICustomer>
                  controller={{ control, name: "tagsIds" }}
                  label="Tags"
                  divClassName="mt-3"
                  errorMessage={errors.tagsIds?.message}
                  placeholder={"Select tags"}
                  mode="multiple"
                >
                  {sortArray(tags, "name").map((tag: ITag) => (
                    <Select.Option key={tag._id} value={tag._id}>
                      <TagTagCustomAntd tag={tag} useTag={false} />
                    </Select.Option>
                  ))}
                </SelectCustomAntd>
              </Col>
            </Row>

            <Row>
              <Col xs={24} md={8}>
                <SelectCustomAntd
                  controller={{
                    control,
                    name: `status`,
                  }}
                  label="Sale Status"
                  errorMessage={errors?.status?.message}
                  placeholder={"Select sale status"}
                  style={{ width: "100%" }}
                >
                  {Object.keys(SalesEnum.Status).map((status: string) => (
                    <Select.Option key={status} value={status}>
                      <LabelBadgeCustomAntd
                        label={
                          SalesEnum.StatusLabels[status as SalesEnum.Status]
                        }
                        color={
                          SalesEnum.StatusColors[status as SalesEnum.Status]
                        }
                      />
                    </Select.Option>
                  ))}
                </SelectCustomAntd>
              </Col>

              <Col xs={24} md={8}>
                <SelectCustomAntd
                  controller={{
                    control,
                    name: `paymentStatus`,
                  }}
                  label="Payment Status"
                  errorMessage={errors?.status?.message}
                  placeholder={"Select payment status"}
                  style={{ width: "100%" }}
                >
                  {Object.keys(SalesEnum.PaymentStatus).map(
                    (paymentStatus: string) => (
                      <Select.Option key={paymentStatus} value={paymentStatus}>
                        <LabelBadgeCustomAntd
                          label={
                            SalesEnum.PaymentStatusLabels[
                              paymentStatus as SalesEnum.PaymentStatus
                            ]
                          }
                          color={
                            SalesEnum.PaymentStatusColors[
                              paymentStatus as SalesEnum.PaymentStatus
                            ]
                          }
                        />
                      </Select.Option>
                    )
                  )}
                </SelectCustomAntd>
              </Col>

              {!isEditMode && false && (
                <Col xs={24} md={8}>
                  <CheckboxCustomAntd
                    controller={{ control, name: "isCreateQuote" }}
                    label="Create Quote"
                  />
                </Col>
              )}
            </Row>

            <Row className="mt-3">
              <Col xs={24} md={8} className="pr-5">
                <InputCustomAntd
                  controller={{ control, name: "deliveryAt" }}
                  label="Delivery Date"
                  divClassName="mt-0"
                  type="date"
                  placeholder={"Enter deliveryAt"}
                  errorMessage={errors?.deliveryAt?.message}
                />
              </Col>

              <Col xs={24} md={8} className="pr-5">
                <InputCustomAntd
                  controller={{ control, name: "createdDate" }}
                  label="Created Date"
                  divClassName="mt-0"
                  type="date"
                  placeholder={"Enter created date"}
                  errorMessage={errors?.createdDate?.message}
                />
              </Col>
              <Col xs={24} md={8} className="pr-5">
                <InputCustomAntd
                  controller={{ control, name: "numberManual" }}
                  label="Sale Number Manual"
                  divClassName="mt-0"
                  placeholder={"Enter sale number manual"}
                  errorMessage={errors?.numberManual?.message}
                />
              </Col>
            </Row>

            <Row>
              <Col xs={24}>
                <CheckboxCustomAntd
                  controller={{ control, name: "isSendCustomerNotifications" }}
                  label="Send Customer Notifications"
                  className="ml-1"
                />
              </Col>
            </Row>

            <Row>
              <Col xs={24} md={8}>
                <Tooltip title="See sale summary">
                  <Button
                    type="primary"
                    className="mt-4"
                    onClick={() => setIsOpenSaleSummaryModal(true)}
                    icon={<EyeOutlined />}
                  >
                    See Summary
                  </Button>
                </Tooltip>
              </Col>
            </Row>

            <Row>
              <Col xs={24}>
                <Button
                  type="success"
                  disabled={!isEnableCreateSale}
                  className="w-full text-center mt-5 h-10 font-bold text-lg"
                  onClick={() => callHandleSubmit(true)}
                  loading={isSubmitting}
                >
                  {isEditMode ? "SAVE" : "CREATE"} SALE
                </Button>
              </Col>
            </Row>
          </Card>
        </Col> */}
      </Row>

      {/* <Modal
        title="Sale"
        closable={false}
        open={isOpenSaleSuccessfullyModal}
        cancelButtonProps={{ hidden: true }}
        footer={
          <div className="flex justify-end">
            <Button
              type="primary"
              disabled
              onClick={() => router.refresh()}
              icon={<ShoppingCartOutlined />}
            >
              New Sale
            </Button>

            <Button type="primary" onClick={() => router.push(Urls.SALES)}>
              Ok
            </Button>
          </div>
        }
      >
        <Alert
          type="success"
          icon={<CheckCircleOutlined />}
          message={
            <div>
              <div>
                Sale has been {isEditMode ? "updated" : "created"} successfully!
              </div>
              <div>
                Sale Number: <b>{sale?.number}</b>
              </div>
            </div>
          }
        />
      </Modal>

      <Modal
        title="Sale Summary"
        open={isOpenSaleSummaryModal}
        cancelButtonProps={{ hidden: true }}
        onOk={() => setIsOpenSaleSummaryModal(false)}
        onCancel={() => setIsOpenSaleSummaryModal(false)}
      >
        <SaleSummaryByCreate
          formSchema={watch()}
          selectedCustomer={selectedCustomer}
          stores={stores}
          tags={tags}
          subtotal={saleStoresProductsTotals.subtotal}
          quantity={saleStoresProductsTotals.quantity}
          totalFinal={totalFinal}
          totalAfterDiscount={totalAfterDiscount}
          totalPayment={totalPayment}
          totalAfterPayment={totalAfterPayment}
        />
      </Modal>

      <Drawer
        open={isOpenSalesTable}
        onClose={() => setIsOpenSalesTable(false)}
        placement="right"
        width={"90%"}
      >
        <SalesTable />
      </Drawer> */}
    </Layout>
  );
}
