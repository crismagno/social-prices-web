import { Checkbox, Col, Empty, Image, Row, Tooltip } from "antd";

import { CheckCircleTwoTone, CloseCircleTwoTone } from "@ant-design/icons";

import useLanguageData from "../../../../data/context/language/useLanguageData";

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
  const { t } = useLanguageData();

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
            <Tooltip title={t("stores.storeName")}>{store?.name ?? ""}</Tooltip>
          </label>
        </div>

        <Row
          gutter={[2, 2]}
          className="p-1 px-2 bg-zinc-50 text-black font-semibold"
        >
          <Col xs={1}>
            <Tooltip title={t("sales.markProductAsCompleted")}>
              <CheckCircleTwoTone
                twoToneColor={["green", "yellow"]}
                style={{ fontSize: 18 }}
              />
            </Tooltip>
          </Col>
          <Col xs={1}>
            <Tooltip title={t("sales.markProductAsValid")}>
              <CloseCircleTwoTone
                twoToneColor={["red", "orange"]}
                style={{ fontSize: 18 }}
              />
            </Tooltip>
          </Col>
          <Col xs={9}>{t("products.product")}</Col>
          <Col xs={3} className="text-center">
            {t("common.quantity")}
          </Col>
          <Col xs={4} className="text-center">
            {t("common.price")}
          </Col>
          <Col xs={3} className="text-center">
            {t("common.total")}
          </Col>
          <Col xs={2} className="text-center">
            {t("common.actions")}
          </Col>
        </Row>

        {saleStore.products?.map(
          (
            saleStoreProduct: ISaleStoreProduct,
            indexSaleStoreProduct: number
          ) => {
            const productItem = saleStoreProduct.productItem;
            const product = saleStoreProduct.product;

            const name = productItem?.name || product?.name || "";
            const mainUrl = productItem?.mainUrl || product?.mainUrl;

            const fileUrl: string = mainUrl
              ? getImageUrl(mainUrl)
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
                  <Tooltip title={t("sales.isCompleted")}>
                    <Checkbox checked={saleStoreProduct.isCompleted} />
                  </Tooltip>
                </Col>

                <Col xs={1}>
                  <Tooltip title={t("sales.isValid")}>
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
                      <span className="text-base">{name}</span>

                      <span className="text-xs">
                        {t("products.barcode")}: {saleStoreProduct.barcode}
                      </span>
                      <span className="text-xs">
                        {t("products.sku")}: {saleStoreProduct.sku}
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
