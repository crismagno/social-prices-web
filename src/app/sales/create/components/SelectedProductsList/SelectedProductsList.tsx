import { Button, Card, Col, Empty, Image, Row, Tooltip } from "antd";
import { find } from "lodash";
import { Control, UseFormSetValue, UseFormWatch } from "react-hook-form";

import {
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  QuestionCircleTwoTone,
} from "@ant-design/icons";

import ButtonCommon from "../../../../../components/common/ButtonCommon/ButtonCommon";
import { IconTrash } from "../../../../../components/common/icons/icons";
import { InputCustomAntd } from "../../../../../components/custom/antd/InputCustomAntd/InputCustomAntd";
import { InputNumberCustomAntd } from "../../../../../components/custom/antd/InputNumberCustomAntd/InputNumberCustomAntd";
import { TextareaCustomAntd } from "../../../../../components/custom/antd/TextareaCustomAntd/TextareaCustomAntd";
import SalesEnum from "../../../../../shared/business/sales/sales.enum";
import { IStore } from "../../../../../shared/business/stores/stores.interface";
import { defaultAvatarImage } from "../../../../../shared/utils/images/files-names";
import { getImageUrl } from "../../../../../shared/utils/images/url-images";
import {
  formatterMoney,
  parserMoney,
} from "../../../../../shared/utils/string-extensions/string-extensions";
import {
  TFormSchema,
  TSaleStoreFormSchema,
  TSaleStoreProductFormSchema,
} from "../../page";

interface Props {
  stores: IStore[];
  control: Control<TFormSchema>;
  watch: UseFormWatch<TFormSchema>;
  setValue: UseFormSetValue<TFormSchema>;
  handleRemoveAllProduct: () => void;
  handleRemoveAllProductByStore: (storeId: string) => void;
  handleRemoveProduct: (storeId: string, productId: string) => void;
  subtotal: number;
  quantity: number;
  totalFinal: number;
  totalAfterDiscount: number;
}

export const SelectedProductsList: React.FC<Props> = ({
  stores,
  control,
  watch,
  setValue,
  handleRemoveAllProduct,
  handleRemoveAllProductByStore,
  handleRemoveProduct,
  subtotal,
  quantity,
  totalFinal,
  totalAfterDiscount,
}) => {
  let saleStores: TSaleStoreFormSchema[] = watch("saleStores");

  let deliveryType: string = watch("deliveryType");

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
          <div key={store?._id} className="my-2">
            <div
              className={`flex items-center border-b-2 border-slate-100 mb-1 w-full`}
            >
              <label className="my-2 text-lg font-semibold mr-2">
                {store?.name ?? ""}
              </label>

              {saleStore.products.length > 1 ? (
                <Tooltip title="Remove all products by store">
                  <ButtonCommon
                    onClick={() =>
                      handleRemoveAllProductByStore(saleStore.storeId)
                    }
                    color="transparent"
                    className="rounded-r-full rounded-l-full shadow-none"
                  >
                    {IconTrash("w-3 h-3 text-red-500 hover:text-red-600")}
                  </ButtonCommon>
                </Tooltip>
              ) : null}
            </div>

            <Row className="p-1 px-4 bg-zinc-50 text-black font-semibold">
              <Col xs={8}>Product</Col>
              <Col xs={4}>Quantity</Col>
              <Col xs={4}>Price</Col>
              <Col xs={6}>Note</Col>
              <Col xs={2}></Col>
            </Row>

            {saleStore.products?.map(
              (
                saleStoreProduct: TSaleStoreProductFormSchema,
                indexSaleStoreProduct: number
              ) => {
                const fileUrl: string = saleStoreProduct.fileUrl
                  ? getImageUrl(saleStoreProduct.fileUrl)
                  : defaultAvatarImage;

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

                        <div className="flex flex-col">
                          <span className="text-base">
                            {saleStoreProduct.name}
                          </span>

                          <span className="text-xs">
                            {saleStoreProduct.barCode}
                          </span>
                        </div>
                      </div>
                    </Col>

                    <Col xs={4}>
                      <InputNumberCustomAntd
                        divClassName="w-28"
                        min={1}
                        controller={{
                          control,
                          name: `saleStores.${indexSaleStore}.products.${indexSaleStoreProduct}.quantity`,
                        }}
                      />
                    </Col>

                    <Col xs={4}>
                      <InputNumberCustomAntd
                        divClassName="w-28"
                        formatter={formatterMoney}
                        parser={parserMoney}
                        min={0}
                        controller={{
                          control,
                          name: `saleStores.${indexSaleStore}.products.${indexSaleStoreProduct}.price`,
                        }}
                      />
                    </Col>

                    <Col xs={6}>
                      <InputCustomAntd
                        divClassName="w-full pr-2"
                        controller={{
                          control,
                          name: `saleStores.${indexSaleStore}.products.${indexSaleStoreProduct}.note`,
                        }}
                      />
                    </Col>

                    <Col xs={2}>
                      <Tooltip title="Remove product">
                        <ButtonCommon
                          onClick={() =>
                            handleRemoveProduct(
                              saleStore.storeId,
                              saleStoreProduct.productId
                            )
                          }
                          color="transparent"
                          className="rounded-r-full rounded-l-full shadow-none"
                        >
                          {IconTrash("w-3 h-3 text-red-500 hover:text-red-600")}
                        </ButtonCommon>
                      </Tooltip>
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
    <Card
      title={
        <div className="flex justify-between">
          <div className="flex items-center">
            <label className="mr-2">Selected Products</label>

            <Tooltip title="Here you can see what products has been selected and also you can edit in same time the product price, quantity and also add a note for this product if you need">
              <QuestionCircleTwoTone />
            </Tooltip>
          </div>

          {saleStores?.length > 1 ? (
            <Tooltip title="Remove all products">
              <ButtonCommon
                onClick={handleRemoveAllProduct}
                color="transparent"
                className="rounded-r-full rounded-l-full shadow-none"
              >
                {IconTrash("w-3 h-3 text-red-500 hover:text-red-600")}
              </ButtonCommon>
            </Tooltip>
          ) : null}
        </div>
      }
    >
      <div style={{ maxHeight: 500 }} className="overflow-auto">
        {renderStoresProducts()}
      </div>

      {/* Resume totals */}
      <div className="mt-5">
        <Row className="p-2 px-4 bg-zinc-100 text-black font-bold">
          <Col xs={8}>SubTotal:</Col>

          <Col xs={4}></Col>

          <Col xs={12}>
            <Tooltip title="Sum all prices products">
              R$ {subtotal.toFixed(2)}
            </Tooltip>
          </Col>
        </Row>

        {/* Discount */}
        <Row className="border-b px-4 border-slate-100 p-2">
          <Col xs={8}>
            <label className="font-semibold mr-2">Discount:</label>
            {!watch("discount.show") ? (
              <Tooltip title="Edit Discount">
                <Button
                  icon={<EditOutlined />}
                  size="small"
                  onClick={() => {
                    setValue("discount.show", true);
                  }}
                />
              </Tooltip>
            ) : (
              <Button.Group>
                <Tooltip title="Use Discount">
                  <Button
                    icon={<CheckOutlined />}
                    size="small"
                    type="success"
                    onClick={() => {
                      setValue("discount.show", false);
                    }}
                  />
                </Tooltip>
                <Tooltip title="Remove Discount">
                  <Button
                    icon={<CloseOutlined />}
                    size="small"
                    type="danger"
                    onClick={() => {
                      setValue("discount.note", null);
                      setValue("discount.amount", 0);
                      setValue("discount.show", false);
                    }}
                  />
                </Tooltip>
              </Button.Group>
            )}
          </Col>

          <Col xs={4}></Col>

          <Col xs={5}>
            {watch("discount.show") ? (
              <InputNumberCustomAntd
                divClassName="w-28"
                formatter={formatterMoney}
                parser={parserMoney}
                min={0}
                max={subtotal}
                controller={{
                  control,
                  name: `discount.amount`,
                }}
              />
            ) : (
              <Tooltip title="Discount amount">
                - R$ {watch("discount.amount")}
              </Tooltip>
            )}
          </Col>

          <Col xs={7}>
            {watch("discount.show") ? (
              <TextareaCustomAntd
                divClassName="w-full"
                controller={{
                  control,
                  name: `discount.note`,
                }}
              />
            ) : (
              <Tooltip title={watch("discount.note")}>
                {watch("discount.note")}
              </Tooltip>
            )}
          </Col>
        </Row>

        {/* Total Discount */}
        <Row className="p-2 px-4 bg-zinc-100 text-black font-bold">
          <Col xs={8}>Total After Discount:</Col>

          <Col xs={4}></Col>

          <Col xs={12}>
            <Tooltip title="Sum total after all discounts">
              - R$ {totalAfterDiscount.toFixed(2)}
            </Tooltip>
          </Col>
        </Row>

        {/* Shipping */}
        {deliveryType === SalesEnum.DeliveryType.DELIVERY && (
          <Row className="border-b px-4 border-slate-100 p-2">
            <Col xs={8}>
              <label className="font-semibold mr-2">Shipping:</label>

              {!watch("shipping.show") ? (
                <Tooltip title="Edit Shipping">
                  <Button
                    icon={<EditOutlined />}
                    size="small"
                    onClick={() => {
                      setValue("shipping.show", true);
                    }}
                  />
                </Tooltip>
              ) : (
                <Button.Group>
                  <Tooltip title="Use Shipping">
                    <Button
                      icon={<CheckOutlined />}
                      size="small"
                      type="success"
                      onClick={() => {
                        setValue("shipping.show", false);
                      }}
                    />
                  </Tooltip>
                  <Tooltip title="Remove Shipping">
                    <Button
                      icon={<CloseOutlined />}
                      size="small"
                      type="danger"
                      onClick={() => {
                        setValue("shipping.note", null);
                        setValue("shipping.amount", 0);
                        setValue("shipping.show", false);
                      }}
                    />
                  </Tooltip>
                </Button.Group>
              )}
            </Col>

            <Col xs={4}></Col>

            <Col xs={5}>
              {watch("shipping.show") ? (
                <InputNumberCustomAntd
                  divClassName="w-28"
                  formatter={formatterMoney}
                  parser={parserMoney}
                  min={0}
                  controller={{
                    control,
                    name: `shipping.amount`,
                  }}
                />
              ) : (
                <Tooltip title="Shipping amount">
                  R$ {watch("shipping.amount")}
                </Tooltip>
              )}
            </Col>

            <Col xs={7}>
              {watch("shipping.show") ? (
                <TextareaCustomAntd
                  divClassName="w-full"
                  controller={{
                    control,
                    name: `shipping.note`,
                  }}
                />
              ) : (
                <Tooltip title={watch("shipping.note")}>
                  {watch("shipping.note")}
                </Tooltip>
              )}
            </Col>
          </Row>
        )}

        {/* Tax */}
        <Row className="border-b px-4 border-slate-100 p-2">
          <Col xs={8}>
            <label className="font-semibold mr-2">Tax:</label>

            {!watch("tax.show") ? (
              <Tooltip title="Edit Tax">
                <Button
                  icon={<EditOutlined />}
                  size="small"
                  onClick={() => {
                    setValue("tax.show", true);
                  }}
                />
              </Tooltip>
            ) : (
              <Button.Group>
                <Tooltip title="Use Tax">
                  <Button
                    icon={<CheckOutlined />}
                    size="small"
                    type="success"
                    onClick={() => {
                      setValue("tax.show", false);
                    }}
                  />
                </Tooltip>
                <Tooltip title="Remove Tax">
                  <Button
                    icon={<CloseOutlined />}
                    size="small"
                    type="danger"
                    onClick={() => {
                      setValue("tax.note", null);
                      setValue("tax.amount", 0);
                      setValue("tax.show", false);
                    }}
                  />
                </Tooltip>
              </Button.Group>
            )}
          </Col>

          <Col xs={4}></Col>

          <Col xs={5}>
            {watch("tax.show") ? (
              <InputNumberCustomAntd
                divClassName="w-28"
                formatter={formatterMoney}
                parser={parserMoney}
                min={0}
                controller={{
                  control,
                  name: `tax.amount`,
                }}
              />
            ) : (
              <Tooltip title="Tax amount">R$ {watch("tax.amount")}</Tooltip>
            )}
          </Col>

          <Col xs={7}>
            {watch("tax.show") ? (
              <TextareaCustomAntd
                divClassName="w-full"
                controller={{
                  control,
                  name: `tax.note`,
                }}
              />
            ) : (
              <Tooltip title={watch("tax.note")}>{watch("tax.note")}</Tooltip>
            )}
          </Col>
        </Row>

        {/* Total */}
        <Row className="p-2 px-4 bg-emerald-50 text-black font-bold">
          <Col xs={7}></Col>

          <Col xs={5}>
            <Tooltip title="Quantity products selected">
              Qty: {quantity}
            </Tooltip>
          </Col>

          <Col xs={12}>
            <Tooltip title="Sum all prices products">
              Total: R$ {totalFinal.toFixed(2)}
            </Tooltip>
          </Col>
        </Row>
      </div>
    </Card>
  );
};
