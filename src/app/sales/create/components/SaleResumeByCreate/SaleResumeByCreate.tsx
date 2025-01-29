import { Col, Divider, Empty, Image, Row } from "antd";
import { find } from "lodash";
import moment from "moment";

import { ImageOrDefault } from "../../../../../components/common/ImageOrDefault/ImageOrDefault";
import { TagTagsCustomAntd } from "../../../../../components/common/TagTagsCustomAntd/TagTagsCustomAntd";
import { ICustomer } from "../../../../../shared/business/customers/customer.interface";
import PersonEnum from "../../../../../shared/business/enums/person.enum";
import SalesEnum from "../../../../../shared/business/sales/sales.enum";
import { IStore } from "../../../../../shared/business/stores/stores.interface";
import { ITag } from "../../../../../shared/business/tags/tags.interface";
import DatesEnum from "../../../../../shared/utils/dates/dates.enum";
import { defaultAvatarImage } from "../../../../../shared/utils/images/files-names";
import { getImageUrl } from "../../../../../shared/utils/images/url-images";
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

export const SaleResumeByCreate: React.FC<Props> = ({
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
  let saleStores: TSaleStoreFormSchema[] = formSchema.saleStores;

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
                indexSaleStoreProduct: number
              ) => {
                const fileUrl: string = saleStoreProduct.fileUrl
                  ? getImageUrl(saleStoreProduct.fileUrl)
                  : defaultAvatarImage;

                const quantity: number =
                  saleStores[indexSaleStore].products[indexSaleStoreProduct]
                    .quantity;

                const price: number =
                  saleStores[indexSaleStore].products[indexSaleStoreProduct]
                    .price;

                const total: number = quantity * price;

                return (
                  <Row
                    key={saleStoreProduct.productId}
                    className="border-b border-slate-100 p-2"
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
                                src={defaultAvatarImage}
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
                            {saleStoreProduct.barcode}
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
              }
            )}
          </div>
        );
      }
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
                DatesEnum.Format.DDMMYYY
              )
            : ""}{" "}
          /{" "}
          {
            PersonEnum.GenderLabels[
              formSchema.customer.gender as PersonEnum.Gender
            ]
          }
        </label>

        <div className="text-center">
          <b>Shipping Address: </b>

          <span>{createAddressName(formSchema.customer.address)}</span>
        </div>
      </div>

      <Divider />

      <div className="text-center">
        <b>Delivery Type: </b>
        <span>
          {
            SalesEnum.DeliveryTypeLabels[
              formSchema.deliveryType as SalesEnum.DeliveryType
            ]
          }
        </span>
      </div>

      <Divider />

      <div className="text-center">
        <b>Store Products</b>

        <div className="mt-3">{renderStoresProducts()}</div>
      </div>

      <div className="flex justify-between pr-10 mt-2">
        <label className="font-semibold">Quantity: </label>
        <label>x {quantity}</label>
      </div>

      <div className="flex justify-between pr-10 mt-2">
        <label className="font-semibold">Subtotal: </label>
        <label>{formatToMoneyDecimal(subtotal ?? 0)}</label>
      </div>

      <div className="flex justify-between pr-10 mt-2">
        <label className="font-semibold">Discount: </label>
        <label>{formatToMoneyDecimal(formSchema.discount.amount ?? 0)}</label>
      </div>

      <div className="flex justify-between pr-10 mt-2">
        <label className="font-semibold">Total After Discount: </label>
        <label>{formatToMoneyDecimal(totalAfterDiscount)}</label>
      </div>

      <div className="flex justify-between pr-10 mt-2">
        <label className="font-semibold">Shipping: </label>
        <label>{formatToMoneyDecimal(formSchema.shipping.amount ?? 0)}</label>
      </div>

      <div className="flex justify-between pr-10 mt-2">
        <label className="font-semibold">Tax: </label>
        <label>{formatToMoneyDecimal(formSchema.tax.amount ?? 0)}</label>
      </div>

      <div className="flex justify-between pr-10 mt-2">
        <label className="font-semibold">Total: </label>
        <label>{formatToMoneyDecimal(totalFinal)}</label>
      </div>

      <Divider />

      <div className="text-center">
        <b>Payment</b>

        {formSchema.payments.map((payment: TSalePaymentFormSchema) => {
          return (
            <div>
              <div className="flex justify-between pr-10 mt-2">
                <label className="font-semibold">
                  {
                    SalesEnum.PaymentTypeLabels[
                      payment.type as SalesEnum.PaymentType
                    ]
                  }
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
        <label className="font-semibold">Total Payment: </label>
        <label>{formatToMoneyDecimal(totalPayment)}</label>
      </div>

      <div className="flex justify-between pr-10 mt-2">
        <label className="font-semibold">Total After Payment: </label>
        <label>{formatToMoneyDecimal(totalAfterPayment)}</label>
      </div>

      <Divider />

      <div className="flex justify-between pr-10 mt-2">
        <label className="font-semibold">Sale Status: </label>
        <label>
          {SalesEnum.StatusLabels[formSchema.status as SalesEnum.Status]}
        </label>
      </div>

      <div className="flex justify-between pr-10 mt-2">
        <label className="font-semibold">Payment Status: </label>
        <label>
          {
            SalesEnum.PaymentStatusLabels[
              formSchema.paymentStatus as SalesEnum.PaymentStatus
            ]
          }
        </label>
      </div>

      <div className="flex justify-between pr-10 mt-2">
        <label className="font-semibold">Delivery At: </label>
        <label>
          {formSchema.deliveryAt
            ? moment(formSchema.deliveryAt).format(DatesEnum.Format.DDMMYYY)
            : ""}
        </label>
      </div>

      <Divider />

      <div className="flex pr-10 mt-2">
        <label className="font-semibold mr-1">Note: </label>
        <label>{formSchema.note}</label>
      </div>

      <Divider />
      <div className="flex pr-10 mt-2">
        <label className="font-semibold mr-1">Tags: </label>
        <TagTagsCustomAntd tags={tags} tagsIds={formSchema.tagsIds} useTag />
      </div>

      <Divider />
    </div>
  );
};
