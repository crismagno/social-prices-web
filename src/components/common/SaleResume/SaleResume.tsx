import { Col, Divider, Empty, Image, Row } from "antd";
import { find, reduce } from "lodash";
import moment from "moment";

import { ICustomer } from "../../../shared/business/customers/customer.interface";
import PersonEnum from "../../../shared/business/enums/person.enum";
import { IProduct } from "../../../shared/business/products/products.interface";
import {
  ISale,
  ISaleBuyer,
  ISalePayment,
  ISaleStore,
  ISaleStoreProduct,
} from "../../../shared/business/sales/sale.interface";
import SalesEnum from "../../../shared/business/sales/sales.enum";
import { IStore } from "../../../shared/business/stores/stores.interface";
import { ITag } from "../../../shared/business/tags/tags.interface";
import DatesEnum from "../../../shared/utils/dates/dates.enum";
import { defaultAvatarImage } from "../../../shared/utils/images/files-names";
import { getImageUrl } from "../../../shared/utils/images/url-images";
import {
  createAddressName,
  formatToMoneyDecimal,
} from "../../../shared/utils/strings/string";
import { ImageOrDefault } from "../ImageOrDefault/ImageOrDefault";
import { TagTagsCustomAntd } from "../TagTagsCustomAntd/TagTagsCustomAntd";

interface Props {
  sale: ISale | null;
  stores: IStore[];
  tags: ITag[];
}

export const SaleResume: React.FC<Props> = ({ sale, stores, tags }) => {
  let saleStores: ISaleStore[] = sale?.stores ?? [];

  const customer: ICustomer | undefined = sale?.stores?.[0].customer;

  const buyer: ISaleBuyer | null = sale?.buyer ?? null;

  if (!sale || !customer || !buyer) {
    return <Empty />;
  }

  const getQuantity = (): number => {
    const quantity: number = reduce(
      saleStores,
      (accSaleStore: number, saleStore: ISaleStore) => {
        const productsQuantityPrice = reduce(
          saleStore.products,
          (
            accSaleStoreProduct: number,
            saleStoreProduct: ISaleStoreProduct
          ) => {
            accSaleStoreProduct += saleStoreProduct.quantity;

            return accSaleStoreProduct;
          },
          0
        );

        accSaleStore += productsQuantityPrice;

        return accSaleStore;
      },
      0
    );

    return quantity;
  };

  const getTotalAfterDiscount = (): number => {
    const discountAmount: number =
      sale.totals.discount?.distributed.amount ?? 0;

    const totalAfterDiscount: number =
      sale.totals.subtotalAmount - discountAmount;

    return totalAfterDiscount > 0 ? totalAfterDiscount : 0;
  };

  const totalAfterDiscount: number = getTotalAfterDiscount();

  const getTotalPayment = (): number => {
    const total: number = reduce(
      sale.payments,
      (acc: number, payment: ISalePayment) => {
        acc += payment.amount;

        return acc;
      },
      0
    );

    return total > 0 ? total : 0;
  };

  const totalPayment: number = getTotalPayment();

  const totalAfterPayment: number = sale.totals.totalFinalAmount - totalPayment;

  const renderStoresProducts = () => {
    if (!saleStores?.length) {
      return <Empty />;
    }

    const storesProductsElements: JSX.Element[] = saleStores.map(
      (saleStore: ISaleStore, indexSaleStore: number) => {
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
                saleStoreProduct: ISaleStoreProduct,
                indexSaleStoreProduct: number
              ) => {
                const product: IProduct | undefined = saleStoreProduct.product;

                const fileUrl: string = product?.mainUrl
                  ? getImageUrl(product.mainUrl)
                  : defaultAvatarImage;

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
                            {saleStoreProduct.product?.name}
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
        <ImageOrDefault width={80} src={customer.avatar} />

        <label className="mt-3">{customer.name}</label>

        <label>
          {buyer.email} / {buyer.phoneNumber?.number}
        </label>

        <label>
          {buyer.birthDate
            ? moment(buyer.birthDate).format(DatesEnum.Format.MMDDYYYY)
            : ""}{" "}
          / {PersonEnum.GenderLabels[customer.gender as PersonEnum.Gender]}
        </label>

        <div className="text-center">
          <b>Shipping Address: </b>

          <span>{createAddressName(buyer.address)}</span>
        </div>
      </div>

      <Divider />

      <div className="text-center">
        <b>Delivery Type: </b>
        <span>{SalesEnum.DeliveryTypeLabels[sale.header.deliveryType]}</span>
      </div>

      <Divider />

      <div className="text-center">
        <b>Store Products</b>

        <div className="mt-3">{renderStoresProducts()}</div>
      </div>

      <div className="flex justify-between pr-10 mt-2">
        <label className="font-semibold">Quantity: </label>
        <label>x {getQuantity()}</label>
      </div>

      <div className="flex justify-between pr-10 mt-2">
        <label className="font-semibold">Subtotal: </label>
        <label>{formatToMoneyDecimal(sale.totals.subtotalAmount ?? 0)}</label>
      </div>

      <div className="flex justify-between pr-10 mt-2">
        <label className="font-semibold">Discount: </label>
        <label>
          {formatToMoneyDecimal(sale.totals.discount?.distributed.amount ?? 0)}
        </label>
      </div>

      <div className="flex justify-between pr-10 mt-2">
        <label className="font-semibold">Total After Discount: </label>
        <label>{formatToMoneyDecimal(totalAfterDiscount)}</label>
      </div>

      <div className="flex justify-between pr-10 mt-2">
        <label className="font-semibold">Shipping: </label>
        <label>{formatToMoneyDecimal(sale.totals.shipping?.amount ?? 0)}</label>
      </div>

      <div className="flex justify-between pr-10 mt-2">
        <label className="font-semibold">Tax: </label>
        <label>{formatToMoneyDecimal(sale.totals.tax?.amount ?? 0)}</label>
      </div>

      <div className="flex justify-between pr-10 mt-2">
        <label className="font-semibold">Total: </label>
        <label>{formatToMoneyDecimal(sale.totals.totalFinalAmount)}</label>
      </div>

      <Divider />

      <div className="text-center">
        <b>Payment</b>

        {sale.payments.map((payment: ISalePayment) => {
          return (
            <div>
              <div className="flex justify-between pr-10 mt-2">
                <label className="font-semibold">
                  {SalesEnum.PaymentTypeLabels[payment.type]}:{" "}
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
        <label>{SalesEnum.StatusLabels[sale.status]}</label>
      </div>

      <div className="flex justify-between pr-10 mt-2">
        <label className="font-semibold">Payment Status: </label>
        <label>{SalesEnum.PaymentStatusLabels[sale.paymentStatus]}</label>
      </div>

      <div className="flex justify-between pr-10 mt-2">
        <label className="font-semibold">Delivery At: </label>
        <label>
          {sale.deliveryAt
            ? moment(sale.deliveryAt).format(DatesEnum.Format.DDMMYYY)
            : ""}
        </label>
      </div>

      <div className="flex justify-between pr-10 mt-2">
        <label className="font-semibold">Created Date: </label>
        <label>
          {sale.createdDate
            ? moment(sale.createdDate).format(DatesEnum.Format.DDMMYYYYhhmmss)
            : ""}
        </label>
      </div>

      <div className="flex justify-between pr-10 mt-2">
        <label className="font-semibold">Sale Number Manual: </label>
        <label>{sale.numberManual ?? ""}</label>
      </div>

      <Divider />

      <div className="flex pr-10 mt-2">
        <label className="font-semibold mr-1">Note: </label>
        <label>{sale.note}</label>
      </div>

      <Divider />
      <div className="flex pr-10 mt-2">
        <label className="font-semibold mr-1">Tags: </label>
        <TagTagsCustomAntd tags={tags} tagsIds={sale.tagsIds} useTag />
      </div>

      <Divider />
    </div>
  );
};
