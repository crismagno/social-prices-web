import {
  Button,
  Card,
  Col,
  Empty,
  Image,
  Row,
  Space,
  Tooltip,
} from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { find } from 'lodash';
import {
  Control,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';

import {
  CheckCircleTwoTone,
  CheckOutlined,
  CloseCircleTwoTone,
  CloseOutlined,
  EditOutlined,
  ProfileOutlined,
  QuestionCircleTwoTone,
} from '@ant-design/icons';

import ButtonCommon
  from '../../../../../components/common/ButtonCommon/ButtonCommon';
import { IconTrash } from '../../../../../components/common/icons/icons';
import {
  CheckboxCustomAntd,
} from '../../../../../components/custom/antd/CheckboxCustomAntd/CheckboxCustomAntd';
import {
  InputNumberCustomAntd,
} from '../../../../../components/custom/antd/InputNumberCustomAntd/InputNumberCustomAntd';
import {
  TextareaCustomAntd,
} from '../../../../../components/custom/antd/TextareaCustomAntd/TextareaCustomAntd';
import useLanguageData
  from '../../../../../data/context/language/useLanguageData';
import SalesEnum from '../../../../../shared/business/sales/sales.enum';
import { IStore } from '../../../../../shared/business/stores/stores.interface';
import { getImageUrl } from '../../../../../shared/utils/images/images-url';
import ImagesEnum from '../../../../../shared/utils/images/images.enum';
import {
  formatterMoney,
  formatToMoneyDecimal,
  parserMoney,
} from '../../../../../shared/utils/strings/string';
import {
  TFormSchema,
  TSaleStoreFormSchema,
  TSaleStoreProductFormSchema,
} from '../../page';
import { EditSelectedProductNoteButton } from './EditSelectedProductNoteButton';

interface Props {
  stores: IStore[];
  control: Control<TFormSchema>;
  watch: UseFormWatch<TFormSchema>;
  setValue: UseFormSetValue<TFormSchema>;
  handleRemoveAllProduct: () => void;
  handleRemoveAllProductByStore: (storeId: string) => void;
  handleRemoveProduct: (storeId: string, indexToRemove: number) => void;
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
  const { t } = useLanguageData();

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
                <Tooltip title={t("stores.storeName")}>{store?.name ?? ""}</Tooltip>
              </label>

              {saleStore.products.length > 1 ? (
                <Tooltip title={t("sales.removeAllProductsByStore")}>
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
              <Col xs={3}>{t("common.quantity")}</Col>
              <Col xs={4}>{t("common.price")}</Col>
              <Col xs={3} className="text-center">
                {t("common.total")}
              </Col>
              <Col xs={2}>{t("common.actions")}</Col>
            </Row>

            {saleStore.products?.map(
              (
                saleStoreProduct: TSaleStoreProductFormSchema,
                indexSaleStoreProduct: number
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
                    gutter={[2, 2]}
                    key={`${saleStoreProduct.productId}-${indexSaleStoreProduct}`}
                    className={`border-b border-slate-100 p-2 ${rowBackgroundColor}`}
                  >
                    <Col xs={1}>
                      <Tooltip title={t("sales.isCompleted")}>
                        <CheckboxCustomAntd
                          controller={{
                            control,
                            name: `saleStores.${indexSaleStore}.products.${indexSaleStoreProduct}.isCompleted`,
                          }}
                        />
                      </Tooltip>
                    </Col>

                    <Col xs={1}>
                      <Tooltip title={t("sales.isValid")}>
                        <CheckboxCustomAntd
                          controller={{
                            control,
                            name: `saleStores.${indexSaleStore}.products.${indexSaleStoreProduct}.isValid`,
                          }}
                        />
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
                            {saleStoreProduct.name}
                          </span>

                          <span className="text-xs">
                            {`${t("products.barcode")}: ${saleStoreProduct.barcode}`}
                          </span>

                          <span className="text-xs">
                            {`${t("products.sku")}: ${saleStoreProduct.sku || ""}`}
                          </span>
                        </div>
                      </div>
                    </Col>

                    <Col xs={3} className="flex items-center justify-center">
                      <InputNumberCustomAntd
                        min={1}
                        controller={{
                          control,
                          name: `saleStores.${indexSaleStore}.products.${indexSaleStoreProduct}.quantity`,
                        }}
                      />
                    </Col>

                    <Col xs={4} className="flex items-center justify-center">
                      <InputNumberCustomAntd
                        formatter={formatterMoney}
                        parser={parserMoney}
                        min={0}
                        controller={{
                          control,
                          name: `saleStores.${indexSaleStore}.products.${indexSaleStoreProduct}.price`,
                        }}
                      />
                    </Col>

                    <Col xs={3} className="flex items-center justify-center">
                      <label className="font-semibold">
                        {formatToMoneyDecimal(total)}
                      </label>
                    </Col>

                    <Col xs={2} className="flex items-center justify-center">
                      <Tooltip title={t("sales.removeProduct")}>
                        <ButtonCommon
                          onClick={() =>
                            handleRemoveProduct(
                              saleStore.storeId,
                              indexSaleStoreProduct
                            )
                          }
                          color="transparent"
                          className="rounded-r-full rounded-l-full shadow-none"
                        >
                          {IconTrash("w-3 h-3 text-red-500 hover:text-red-600")}
                        </ButtonCommon>
                      </Tooltip>

                      <EditSelectedProductNoteButton
                        saleStoreProduct={watch(
                          `saleStores.${indexSaleStore}.products.${indexSaleStoreProduct}`
                        )}
                        onConfirmNote={(note: string | null) => {
                          setValue(
                            `saleStores.${indexSaleStore}.products.${indexSaleStoreProduct}.note`,
                            note
                          );
                        }}
                      />
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
        <div className="flex items-center gap-2">
          <ProfileOutlined className="text-amber-500" />
          <span className="font-semibold">{t("sales.selectedProducts")}</span>
          <Tooltip title={t("sales.selectedProductsTooltip")}>
            <QuestionCircleTwoTone />
          </Tooltip>
        </div>
      }
      extra={
        saleStores?.length > 1 ? (
          <Tooltip title={t("sales.removeAllProducts")}>
            <ButtonCommon
              onClick={handleRemoveAllProduct}
              color="transparent"
              className="rounded-r-full rounded-l-full shadow-none"
            >
              {IconTrash("w-3 h-3 text-red-500 hover:text-red-600")}
            </ButtonCommon>
          </Tooltip>
        ) : null
      }
      className="border-l-4 border-l-amber-500"
    >
      <div style={{ maxHeight: 878 }}>{renderStoresProducts()}</div>

      {/* Summary totals */}
      <div className="mt-5">
        {/* Subtotal */}
        <Row className="p-2 px-4 bg-zinc-100 text-black font-bold">
          <Col xs={4}>{t("common.subtotal")}:</Col>

          <Col xs={17} className="text-end">
            <Tooltip title={t("sales.sumAllPricesProducts")} className="mr-4">
              {formatToMoneyDecimal(subtotal)}
            </Tooltip>
          </Col>
        </Row>

        {/* Discount */}
        <Row className="border-b px-4 border-slate-100 p-2">
          <Col xs={4}>
            <label className="font-semibold mr-2">{t("common.discount")}:</label>
            {!watch("discount.show") ? (
              <Tooltip title={t("sales.editDiscount")}>
                <Button
                  icon={<EditOutlined />}
                  size="small"
                  onClick={() => {
                    setValue("discount.show", true);
                  }}
                />
              </Tooltip>
            ) : (
              <Space.Compact>
                <Tooltip title={t("sales.useDiscount")}>
                  <Button
                    icon={<CheckOutlined />}
                    size="small"
                    type="success"
                    onClick={() => {
                      setValue("discount.show", false);
                    }}
                  />
                </Tooltip>
                <Tooltip title={t("sales.removeDiscount")}>
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
              </Space.Compact>
            )}
          </Col>

          <Col xs={17} className="flex justify-end">
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
              <Tooltip title={t("sales.discountAmount")} className="mr-4">
                - {formatToMoneyDecimal(watch("discount.amount") ?? 0)}
              </Tooltip>
            )}
          </Col>

          <Col xs={24} className="py-2">
            <label className="font-semibold">{t("common.note")}: </label>
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
                <TextArea readOnly value={watch("discount.note") || ""} />
              </Tooltip>
            )}
          </Col>
        </Row>

        {/* Total Discount */}
        <Row className="p-2 px-4 bg-zinc-100 text-black font-bold">
          <Col xs={5}>{t("sales.subtotalAfterDiscount")}</Col>

          <Col xs={16} className="text-end">
            <Tooltip title={t("sales.sumTotalAfterDiscounts")} className="mr-4">
              - {formatToMoneyDecimal(totalAfterDiscount)}
            </Tooltip>
          </Col>
        </Row>

        {/* Shipping */}
        {deliveryType === SalesEnum.DeliveryType.DELIVERY && (
          <Row className="border-b px-4 border-slate-100 p-2">
            <Col xs={4}>
              <label className="font-semibold mr-2">{t("common.shipping")}:</label>

              {!watch("shipping.show") ? (
                <Tooltip title={t("sales.editShipping")}>
                  <Button
                    icon={<EditOutlined />}
                    size="small"
                    onClick={() => {
                      setValue("shipping.show", true);
                    }}
                  />
                </Tooltip>
              ) : (
                <Space.Compact>
                  <Tooltip title={t("sales.useShipping")}>
                    <Button
                      icon={<CheckOutlined />}
                      size="small"
                      type="success"
                      onClick={() => {
                        setValue("shipping.show", false);
                      }}
                    />
                  </Tooltip>
                  <Tooltip title={t("sales.removeShipping")}>
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
                </Space.Compact>
              )}
            </Col>

            <Col xs={17} className="flex justify-end">
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
                <Tooltip title={t("sales.shippingAmount")} className="mr-4">
                  {formatToMoneyDecimal(watch("shipping.amount") ?? 0)}
                </Tooltip>
              )}
            </Col>

            <Col xs={24}>
              <label className="font-semibold">{t("common.note")}: </label>
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
                  <TextArea readOnly value={watch("shipping.note") || ""} />
                </Tooltip>
              )}
            </Col>
          </Row>
        )}

        {/* Tax */}
        <Row className="border-b px-4 border-slate-100 p-2">
          <Col xs={4}>
            <label className="font-semibold mr-2">{t("common.tax")}:</label>

            {!watch("tax.show") ? (
              <Tooltip title={t("sales.editTax")}>
                <Button
                  icon={<EditOutlined />}
                  size="small"
                  onClick={() => {
                    setValue("tax.show", true);
                  }}
                />
              </Tooltip>
            ) : (
              <Space.Compact>
                <Tooltip title={t("sales.useTax")}>
                  <Button
                    icon={<CheckOutlined />}
                    size="small"
                    type="success"
                    onClick={() => {
                      setValue("tax.show", false);
                    }}
                  />
                </Tooltip>
                <Tooltip title={t("sales.removeTax")}>
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
              </Space.Compact>
            )}
          </Col>

          <Col xs={17} className="flex justify-end">
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
              <Tooltip title={t("sales.taxAmount")} className="mr-4">
                {formatToMoneyDecimal(watch("tax.amount") ?? 0)}
              </Tooltip>
            )}
          </Col>

          <Col xs={24}>
            <label className="font-semibold">{t("common.note")}: </label>
            {watch("tax.show") ? (
              <TextareaCustomAntd
                divClassName="w-full"
                controller={{
                  control,
                  name: `tax.note`,
                }}
              />
            ) : (
              <Tooltip title={watch("tax.note")}>
                <TextArea readOnly value={watch("tax.note") || ""} />
              </Tooltip>
            )}
          </Col>
        </Row>

        {/* Total */}
        <Row className="p-2 px-4 bg-emerald-50 text-black font-bold">
          <Col xs={5}>{t("common.total")}:</Col>

          <Col xs={8} className="text-end">
            <Tooltip title={t("sales.productQuantity")}>
              {t("common.qty")}: {quantity}
            </Tooltip>
          </Col>

          <Col xs={8} className="text-end">
            <Tooltip title={t("sales.sumAllPricesProducts")} className="mr-4">
              {formatToMoneyDecimal(totalFinal)}
            </Tooltip>
          </Col>
        </Row>
      </div>
    </Card>
  );
};
