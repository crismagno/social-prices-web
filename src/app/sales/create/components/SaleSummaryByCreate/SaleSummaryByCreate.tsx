import React from "react";

import { Col, Divider, Empty, Image, Row } from "antd";
import { find } from "lodash";
import moment from "moment";

import { DeliveryAddressMapButton } from "../../../../../components/common/DeliveryAddressMapButton/DeliveryAddressMapButton";
import { ImageOrDefault } from "../../../../../components/common/ImageOrDefault/ImageOrDefault";
import { TagTagsCustomAntd } from "../../../../../components/common/TagTagsCustomAntd/TagTagsCustomAntd";
import useLanguageData from "../../../../../data/context/language/useLanguageData";
import { ICustomer } from "../../../../../shared/business/customers/customer.interface";
import SalesEnum from "../../../../../shared/business/sales/sales.enum";
import AddressEnum from "../../../../../shared/business/shared/address/address.enum";
import PersonEnum from "../../../../../shared/business/shared/person/person.enum";
import { IStore } from "../../../../../shared/business/stores/stores.interface";
import { ITag } from "../../../../../shared/business/tags/tags.interface";
import DatesEnum from "../../../../../shared/utils/dates/dates.enum";
import { getImageUrl } from "../../../../../shared/utils/images/images-url";
import ImagesEnum from "../../../../../shared/utils/images/images.enum";
import {
  createAddressName,
  formatToMoneyDecimal,
} from "../../../../../shared/utils/strings/string";
import {
  TFormSchema,
  TSaleStoreFormSchema,
  TSaleStoreProductFormSchema,
} from "../../page";
import { TSalePaymentFormSchema } from "../SalePayments/SalePayments";

interface Props {
  formSchema: TFormSchema;
  selectedCustomer: ICustomer | null;
  stores: IStore[];
  tags: ITag[];
  subtotal: number;
  quantity: number;
  totalFinal: number;
  totalAfterDiscount: number;
  totalPayment: number;
  totalAfterPayment: number;
}

export const SaleSummaryByCreate: React.FC<Props> = ({
  formSchema,
  selectedCustomer,
  stores,
  tags,
  subtotal,
  quantity,
  totalFinal,
  totalAfterDiscount,
  totalPayment,
  totalAfterPayment,
}) => {
  const { t } = useLanguageData();
  const saleStores: TSaleStoreFormSchema[] = formSchema.saleStores;

  const customerAddress = formSchema.customer.address;

  const renderStoresProducts = () => {
    if (!saleStores?.length) {
      return <Empty />;
    }

    const storesProductsElements: JSX.Element[] = saleStores.map(
      (saleStore: TSaleStoreFormSchema, indexSaleStore: number) => {
        const store: IStore | undefined = find(stores, {
          _id: saleStore.storeId,
        });

        return (
          <div key={store?._id} className="my-1">
            <div
              className={`flex items-center border-b-2 border-slate-100 mb-1 w-full`}
            >
              <label className="my-1 text-base font-semibold mr-2">
                {store?.name ?? ""}
              </label>
            </div>

            {saleStore.products?.map(
              (
                saleStoreProduct: TSaleStoreProductFormSchema,
                indexSaleStoreProduct: number,
              ) => {
                const fileUrl: string = saleStoreProduct.fileUrl
                  ? getImageUrl(saleStoreProduct.fileUrl)
                  : ImagesEnum.FilesNames.DefaultAvatarImage;

                const quantity: number =
                  saleStores[indexSaleStore].products[indexSaleStoreProduct]
                    .quantity;

                const price: number =
                  saleStores[indexSaleStore].products[indexSaleStoreProduct]
                    .price;

                const total: number = quantity * price;

                let rowBackgroundColor: string = "bg-white";

                if (!saleStoreProduct.isValid) {
                  rowBackgroundColor = "bg-red-100";
                } else if (saleStoreProduct.isCompleted) {
                  rowBackgroundColor = "bg-green-100";
                }

                return (
                  <Row
                    key={saleStoreProduct.productId}
                    className={`border-b border-slate-100 p-2 ${rowBackgroundColor}`}
                  >
                    <Col xs={8}>
                      <div className="flex items-center">
                        <div className="mr-2">
                          <Image
                            key={`${fileUrl}-${Date.now()}`}
                            width={30}
                            src={fileUrl}
                            onError={() => (
                              <Image
                                width={30}
                                src={ImagesEnum.FilesNames.DefaultAvatarImage}
                                alt="mainUrl"
                                className="rounded-full"
                              />
                            )}
                            alt="mainUrl"
                            className="rounded-full"
                          />
                        </div>

                        <div className="flex flex-col text-start">
                          <span className="text-base">
                            {saleStoreProduct.name}
                          </span>

                          <span className="text-xs">
                            {t("products.barcode")}: {saleStoreProduct.barcode}
                          </span>

                          <span className="text-xs">
                            {t("products.sku")}: {saleStoreProduct.sku}
                          </span>
                        </div>
                      </div>
                    </Col>

                    <Col xs={6} className="text-center">
                      <label>x {quantity}</label>
                    </Col>

                    <Col xs={4} className="text-center">
                      <label>{formatToMoneyDecimal(price)}</label>
                    </Col>

                    <Col xs={6}>
                      <label>{formatToMoneyDecimal(total)}</label>
                    </Col>
                  </Row>
                );
              },
            )}
          </div>
        );
      },
    );

    return storesProductsElements;
  };

  return (
    <div className="w-full">
      <div className="flex flex-col w-full justify-center items-center mt-5">
        <ImageOrDefault width={80} src={selectedCustomer?.avatar} />

        <label className="mt-3">{formSchema.customer.name}</label>

        <label>
          {formSchema.customer.email} / {formSchema.customer.phoneNumber}
        </label>

        <label>
          {formSchema.customer.birthDate
            ? moment(formSchema.customer.birthDate).format(
                DatesEnum.Format.DDMMYYY,
              )
            : ""}{" "}
          /{" "}
          {t(
            PersonEnum.GenderLabels[
              formSchema.customer.gender as PersonEnum.Gender
            ],
          )}
        </label>

        <div className="text-center">
          <b>{t("address.shippingAddress")}: </b>

          <span className="mr-1">{createAddressName(customerAddress, t)}</span>

          <DeliveryAddressMapButton
            address={{
              ...customerAddress,
              country: {
                code: customerAddress.countryCode,
                name: customerAddress.countryCode,
              },
              state: {
                code: customerAddress.stateCode,
                name: customerAddress.stateCode,
              },
              types: customerAddress.types as AddressEnum.Type[],
            }}
          />
        </div>
      </div>

      <Divider />

      <div className="text-center">
        <b>{t("sales.deliveryType")}: </b>
        <span>
          {t(
            SalesEnum.DeliveryTypeLabels[
              formSchema.deliveryType as SalesEnum.DeliveryType
            ],
          )}
        </span>
      </div>

      <Divider />

      <div className="text-center">
        <b>{t("sales.storeProducts")}</b>

        <div className="mt-3">{renderStoresProducts()}</div>
      </div>

      <div className="flex justify-between pr-10 mt-2">
        <label className="font-semibold">{t("common.quantity")}: </label>
        <label>x {quantity}</label>
      </div>

      <div className="flex justify-between pr-10 mt-2">
        <label className="font-semibold">{t("common.subtotal")}: </label>
        <label>{formatToMoneyDecimal(subtotal ?? 0)}</label>
      </div>

      <div className="flex justify-between pr-10 mt-2">
        <label className="font-semibold">{t("common.discount")}: </label>
        <label>{formatToMoneyDecimal(formSchema.discount.amount ?? 0)}</label>
      </div>

      <div className="flex justify-between pr-10 mt-2">
        <label className="font-semibold">
          {t("sales.subtotalAfterDiscount")}{" "}
        </label>
        <label>{formatToMoneyDecimal(totalAfterDiscount)}</label>
      </div>

      <div className="flex justify-between pr-10 mt-2">
        <label className="font-semibold">{t("common.shipping")}: </label>
        <label>{formatToMoneyDecimal(formSchema.shipping.amount ?? 0)}</label>
      </div>

      <div className="flex justify-between pr-10 mt-2">
        <label className="font-semibold">{t("common.tax")}: </label>
        <label>{formatToMoneyDecimal(formSchema.tax.amount ?? 0)}</label>
      </div>

      <div className="flex justify-between pr-10 mt-2">
        <label className="font-semibold">{t("common.total")}: </label>
        <label>{formatToMoneyDecimal(totalFinal)}</label>
      </div>

      <Divider />

      <div className="text-center">
        <b>{t("sales.payment")}</b>

        {formSchema.payments.map((payment: TSalePaymentFormSchema) => {
          return (
            <div key={payment.type}>
              <div className="flex justify-between pr-10 mt-2">
                <label className="font-semibold">
                  {t(
                    SalesEnum.PaymentTypeLabels[
                      payment.type as SalesEnum.PaymentType
                    ],
                  )}
                  :{" "}
                </label>
                <label>{formatToMoneyDecimal(payment.amount)}</label>
              </div>
            </div>
          );
        })}
      </div>

      <Divider className="my-1" />

      <div className="flex justify-between pr-10 mt-2">
        <label className="font-semibold">{t("sales.totalPayment")}: </label>
        <label>{formatToMoneyDecimal(totalPayment)}</label>
      </div>

      <div className="flex justify-between pr-10 mt-2">
        <label className="font-semibold">
          {t("sales.totalAfterPayment")}:{" "}
        </label>
        <label>{formatToMoneyDecimal(totalAfterPayment)}</label>
      </div>

      <Divider />

      <div className="flex justify-between pr-10 mt-2">
        <label className="font-semibold">{t("sales.saleStatus")} </label>
        <label>
          {t(SalesEnum.StatusLabels[formSchema.status as SalesEnum.Status])}
        </label>
      </div>

      <div className="flex justify-between pr-10 mt-2">
        <label className="font-semibold">{t("sales.paymentStatus")} </label>
        <label>
          {t(
            SalesEnum.PaymentStatusLabels[
              formSchema.paymentStatus as SalesEnum.PaymentStatus
            ],
          )}
        </label>
      </div>

      <div className="flex justify-between pr-10 mt-2">
        <label className="font-semibold">{t("sales.deliveryDate")} </label>
        <label>
          {formSchema.deliveryAt
            ? moment(formSchema.deliveryAt).format(DatesEnum.Format.DDMMYYY)
            : ""}
        </label>
      </div>

      <div className="flex justify-between pr-10 mt-2">
        <label className="font-semibold">{t("sales.createdDate")} </label>
        <label>
          {formSchema.createdDate
            ? moment(formSchema.createdDate).format(
                DatesEnum.Format.DDMMYYYYhhmmss,
              )
            : ""}
        </label>
      </div>

      <div className="flex justify-between pr-10 mt-2">
        <label className="font-semibold">{t("sales.saleNumberManual")} </label>
        <label>{formSchema.numberManual ?? ""}</label>
      </div>

      <Divider />

      <div className="flex pr-10 mt-2">
        <label className="font-semibold mr-1">{t("sales.note")} </label>
        <label>{formSchema.note}</label>
      </div>

      <Divider />

      <div className="flex pr-10 mt-2">
        <label className="font-semibold mr-1">
          {t("sales.noteToCustomer")}{" "}
        </label>
        <label>{formSchema.noteToCustomer}</label>
      </div>

      <Divider />

      <div className="flex pr-10 mt-2">
        <label className="font-semibold mr-1">{t("sales.tags")} </label>
        <TagTagsCustomAntd tags={tags} tagsIds={formSchema.tagsIds} useTag />
      </div>

      <Divider />
    </div>
  );
};
