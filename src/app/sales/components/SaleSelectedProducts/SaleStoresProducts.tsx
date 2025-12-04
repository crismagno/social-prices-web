import { Checkbox, Col, Empty, Image, Row, Tooltip } from "antd";

import { CheckCircleTwoTone, CloseCircleTwoTone } from "@ant-design/icons";

import {
  ISale,
  ISaleStore,
  ISaleStoreProduct,
} from "../../../../shared/business/sales/sale.interface";
import { IStore } from "../../../../shared/business/stores/stores.interface";
import { getImageUrl } from "../../../../shared/utils/images/images-url";
import ImagesEnum from "../../../../shared/utils/images/images.enum";
import { formatToMoneyDecimal } from "../../../../shared/utils/strings/string";
import { SelectedProductNoteButton } from "./SelectedProductNoteButton";

interface Props {
  sale: ISale;
}

export const SaleStoresProducts: React.FC<Props> = ({ sale }) => {
  if (!sale) {
    return <Empty />;
  }

  const saleStores: ISaleStore[] = sale?.stores ?? [];

  if (!saleStores?.length) {
    return <Empty />;
  }

  return saleStores.map((saleStore: ISaleStore, indexSaleStore: number) => {
    const store: IStore = saleStore.store!;

    return (
      <div key={store?._id} className="my-2">
        <div
          className={`flex items-center border-b-2 border-slate-100 mb-1 w-full`}
        >
          <label className="my-2 text-lg font-semibold mr-2">
            <Tooltip title="Store Name">{store?.name ?? ""}</Tooltip>
          </label>
        </div>

        <Row
          gutter={[2, 2]}
          className="p-1 px-2 bg-zinc-50 text-black font-semibold"
        >
          <Col xs={1}>
            <Tooltip title="Mark product as completed">
              <CheckCircleTwoTone
                twoToneColor={["green", "yellow"]}
                style={{ fontSize: 18 }}
              />
            </Tooltip>
          </Col>
          <Col xs={1}>
            <Tooltip title="Mark product as valid">
              <CloseCircleTwoTone
                twoToneColor={["red", "orange"]}
                style={{ fontSize: 18 }}
              />
            </Tooltip>
          </Col>
          <Col xs={9}>Product</Col>
          <Col xs={3} className="text-center">
            Quantity
          </Col>
          <Col xs={4} className="text-center">
            Price
          </Col>
          <Col xs={3} className="text-center">
            Total
          </Col>
          <Col xs={2} className="text-center">
            Action
          </Col>
        </Row>

        {saleStore.products?.map(
          (
            saleStoreProduct: ISaleStoreProduct,
            indexSaleStoreProduct: number
          ) => {
            const fileUrl: string = saleStoreProduct.product?.mainUrl
              ? getImageUrl(saleStoreProduct.product.mainUrl)
              : ImagesEnum.FilesNames.DefaultAvatarImage;

            const quantity: number =
              saleStores[indexSaleStore].products[indexSaleStoreProduct]
                .quantity;

            const price: number =
              saleStores[indexSaleStore].products[indexSaleStoreProduct].price;

            const total: number = quantity * price;

            let rowBackgroundColor: string = "bg-white";

            if (!saleStoreProduct.isValid) {
              rowBackgroundColor = "bg-red-100";
            } else if (saleStoreProduct.isCompleted) {
              rowBackgroundColor = "bg-green-100";
            }

            return (
              <Row
                gutter={[2, 2]}
                key={`${saleStoreProduct.productId}-${indexSaleStoreProduct}`}
                className={`border-b border-slate-100 p-2 ${rowBackgroundColor}`}
              >
                <Col xs={1}>
                  <Tooltip title="Is Completed?">
                    <Checkbox checked={saleStoreProduct.isCompleted} />
                  </Tooltip>
                </Col>

                <Col xs={1}>
                  <Tooltip title="Is Valid?">
                    <Checkbox checked={saleStoreProduct.isValid} />
                  </Tooltip>
                </Col>

                <Col xs={9}>
                  <div className="flex items-center">
                    <div className="mr-2">
                      <Image
                        key={`${fileUrl}-${Date.now()}`}
                        width={30}
                        height={30}
                        src={fileUrl}
                        onError={() => (
                          <Image
                            width={30}
                            height={30}
                            src={ImagesEnum.FilesNames.DefaultAvatarImage}
                            alt="mainUrl"
                            className="rounded-full"
                          />
                        )}
                        alt="mainUrl"
                        className="rounded-full"
                      />
                    </div>

                    <div className="flex flex-col">
                      <span className="text-base">
                        {saleStoreProduct.product?.name}
                      </span>

                      <span className="text-xs">
                        {saleStoreProduct.barcode}
                      </span>
                    </div>
                  </div>
                </Col>

                <Col xs={3} className="text-center">
                  <label>{quantity}</label>
                </Col>

                <Col xs={4} className="text-center">
                  <label className="ml-2">{formatToMoneyDecimal(price)}</label>
                </Col>

                <Col xs={3} className="text-center">
                  <label className="font-semibold">
                    {formatToMoneyDecimal(total)}
                  </label>
                </Col>

                <Col xs={2} className="flex justify-center">
                  <SelectedProductNoteButton
                    saleStoreProduct={saleStoreProduct}
                  />
                </Col>
              </Row>
            );
          }
        )}
      </div>
    );
  });
};
