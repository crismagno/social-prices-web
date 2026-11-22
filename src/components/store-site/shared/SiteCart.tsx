"use client";

import { useEffect, useState } from "react";

import {
  Alert,
  Button,
  ConfigProvider,
  Drawer,
  Empty,
  Form,
  Input,
  InputNumber,
  Select,
} from "antd";

import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import {
  ICreateSiteOrder,
  IPublicSiteProduct,
} from "../../../shared/business/store-sites/store-sites.types";
import { IStoreSiteTheme } from "../../../shared/business/store-sites/store-site.interface";
import brazilStates from "../../../shared/utils/mock-data/brazil-states.json";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import handleClientError from "../../common/HandleClientError/HandleClientError";
import { cssUrl, formatSiteMoney } from "./site-format";
import styles from "./SiteCart.module.css";
import SiteThemeVars from "./SiteThemeVars";
import { ISiteCart, ISiteCartLine } from "./useSiteCart";
import useSiteT from "./useSiteT";

interface Props {
  slug: string;
  theme: IStoreSiteTheme;
  products: IPublicSiteProduct[];
  cart: ISiteCart;
}

type TStep = "cart" | "checkout" | "done";

interface ICheckoutValues {
  name: string;
  email: string;
  phoneNumber: string;
  zip: string;
  address1: string;
  address2?: string;
  district: string;
  city: string;
  stateCode: string;
  note?: string;
}

const STATES: { code: string; name: string }[] = brazilStates as {
  code: string;
  name: string;
}[];

/** The cart, the checkout and the confirmation: the same for every template. */
const SiteCart = ({ slug, theme, products, cart }: Props) => {
  const t = useSiteT();

  const [form] = Form.useForm<ICheckoutValues>();

  const [step, setStep] = useState<TStep>("cart");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [orderNumber, setOrderNumber] = useState<number | null>(null);
  // Refused by the store when the order was sent, whatever the page still shows.
  const [refusedIds, setRefusedIds] = useState<string[]>([]);

  useEffect(() => {
    // Reopening after an order starts a new cart, not the old confirmation.
    if (cart.isOpen && step === "done" && cart.count > 0) {
      setStep("cart");
    }
  }, [cart.isOpen, cart.count, step]);

  const productName = (productId: string): string =>
    products.find((product: IPublicSiteProduct) => product._id === productId)
      ?.name ?? t("storeSite.cart.removedProduct");

  const unavailableIds: string[] = Array.from(
    new Set([...cart.unavailableIds, ...refusedIds]),
  ).filter((productId: string) => cart.quantityOf(productId) > 0);

  const orderableLines: ISiteCartLine[] = cart.lines.filter(
    (line: ISiteCartLine) => !refusedIds.includes(line.product._id),
  );

  const canCheckout: boolean =
    orderableLines.length > 0 && unavailableIds.length === 0;

  const close = (): void => {
    cart.close();

    if (step === "done") {
      setStep("cart");
      setOrderNumber(null);
    }
  };

  const send = async (values: ICheckoutValues): Promise<void> => {
    const state = STATES.find(
      (candidate: { code: string }) => candidate.code === values.stateCode,
    );

    const order: ICreateSiteOrder = {
      buyer: {
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        phoneNumber: values.phoneNumber.trim(),
        address: {
          address1: values.address1.trim(),
          address2: values.address2?.trim() || null,
          district: values.district.trim(),
          city: values.city.trim(),
          stateCode: values.stateCode,
          stateName: state?.name ?? values.stateCode,
          zip: values.zip.trim(),
        },
      },
      items: orderableLines.map((line: ISiteCartLine) => ({
        productId: line.product._id,
        quantity: line.quantity,
      })),
      note: values.note?.trim() || null,
    };

    try {
      setIsSending(true);

      const created =
        await serviceMethodsInstance.storeSitesServiceMethods.createOrder(
          slug,
          order,
        );

      setOrderNumber(created.number);
      setRefusedIds([]);
      setStep("done");
      cart.clear();
      form.resetFields();
    } catch (error: any) {
      const body: any = error?.response?.data?.error ?? error?.response?.data;

      if (body?.code === StoreSitesEnum.ErrorCodes.ORDER_ITEMS_UNAVAILABLE) {
        setRefusedIds(Array.isArray(body.productIds) ? body.productIds : []);
        setStep("cart");
      } else if (error?.response?.status === 429) {
        handleClientError(t("storeSite.checkout.tooManyAttempts"), 4);
      } else if (!error?.response) {
        handleClientError(t("storeSite.checkout.networkError"), 4);
      } else {
        // Never the server's own words: they are about the store, not the visitor.
        handleClientError(t("storeSite.checkout.failed"), 4);
      }
    } finally {
      setIsSending(false);
    }
  };

  const required = [
    { required: true, message: t("storeSite.checkout.required") },
  ];

  const title: string =
    step === "cart"
      ? t("storeSite.cart.title")
      : step === "checkout"
        ? t("storeSite.checkout.title")
        : t("storeSite.checkout.doneTitle");

  return (
    <ConfigProvider
      theme={{ token: { colorPrimary: theme.primary, borderRadius: 10 } }}
    >
      <Drawer
        open={cart.isOpen}
        onClose={close}
        title={title}
        width={440}
        destroyOnClose={false}
      >
        <SiteThemeVars theme={theme}>
          {step === "cart" && (
            <>
              {cart.items.length === 0 ? (
                <Empty description={t("storeSite.cart.empty")} />
              ) : (
                <div className={styles.lines}>
                  {orderableLines.map((line: ISiteCartLine) => (
                    <div key={line.product._id} className={styles.line}>
                      <div
                        className={styles.thumb}
                        style={{
                          backgroundImage: cssUrl(line.product.mainUrl),
                        }}
                      />
                      <div>
                        <div className={styles.name}>{line.product.name}</div>
                        <div className={styles.muted}>
                          {formatSiteMoney(line.product.price)}
                        </div>
                        <InputNumber
                          size="small"
                          min={0}
                          max={StoreSitesEnum.MAX_ORDER_ITEM_QUANTITY}
                          value={line.quantity}
                          aria-label={t("storeSite.cart.quantity")}
                          onChange={(value: number | null) =>
                            cart.setQuantity(line.product._id, value ?? 0)
                          }
                        />
                      </div>
                      <div className={styles.lineTotal}>
                        {formatSiteMoney(line.lineTotal)}
                      </div>
                    </div>
                  ))}

                  {unavailableIds.map((productId: string) => (
                    <div
                      key={productId}
                      className={`${styles.line} ${styles.unavailable}`}
                    >
                      <div className={styles.thumb} />
                      <div>
                        <div className={styles.name}>
                          {productName(productId)}
                        </div>
                        <div className={styles.muted}>
                          {t("storeSite.cart.unavailable")}
                        </div>
                      </div>
                      <Button
                        size="small"
                        onClick={() => {
                          cart.remove(productId);
                          setRefusedIds((current: string[]) =>
                            current.filter((id: string) => id !== productId),
                          );
                        }}
                      >
                        {t("storeSite.cart.remove")}
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {cart.items.length > 0 && (
                <>
                  {unavailableIds.length > 0 && (
                    <Alert
                      style={{ marginTop: 16 }}
                      type="warning"
                      showIcon
                      message={t("storeSite.cart.unavailableHint")}
                    />
                  )}

                  <div className={styles.summary}>
                    <span>{t("storeSite.cart.subtotal")}</span>
                    <span>
                      {formatSiteMoney(
                        orderableLines.reduce(
                          (total: number, line: ISiteCartLine) =>
                            total + line.lineTotal,
                          0,
                        ),
                      )}
                    </span>
                  </div>
                  <div className={styles.note}>
                    {t("storeSite.cart.shippingNote")}
                  </div>

                  <Button
                    type="primary"
                    className={styles.primary}
                    size="large"
                    block
                    disabled={!canCheckout}
                    onClick={() => setStep("checkout")}
                  >
                    {t("storeSite.cart.checkout")}
                  </Button>
                </>
              )}
            </>
          )}

          {step === "checkout" && (
            <Form<ICheckoutValues>
              form={form}
              layout="vertical"
              requiredMark={false}
              onFinish={send}
              disabled={isSending}
            >
              <Form.Item
                name="name"
                label={t("storeSite.checkout.name")}
                rules={required}
              >
                <Input maxLength={120} autoComplete="name" />
              </Form.Item>
              <Form.Item
                name="email"
                label={t("storeSite.checkout.email")}
                rules={[
                  ...required,
                  {
                    type: "email",
                    message: t("storeSite.checkout.invalidEmail"),
                  },
                ]}
              >
                <Input maxLength={160} autoComplete="email" inputMode="email" />
              </Form.Item>
              <Form.Item
                name="phoneNumber"
                label={t("storeSite.checkout.phone")}
                rules={required}
              >
                <Input maxLength={30} autoComplete="tel" inputMode="tel" />
              </Form.Item>
              <Form.Item
                name="zip"
                label={t("storeSite.checkout.zip")}
                rules={required}
              >
                <Input maxLength={16} autoComplete="postal-code" />
              </Form.Item>
              <Form.Item
                name="address1"
                label={t("storeSite.checkout.address1")}
                rules={required}
              >
                <Input maxLength={160} autoComplete="address-line1" />
              </Form.Item>
              <Form.Item
                name="address2"
                label={t("storeSite.checkout.address2")}
              >
                <Input maxLength={160} autoComplete="address-line2" />
              </Form.Item>
              <Form.Item
                name="district"
                label={t("storeSite.checkout.district")}
                rules={required}
              >
                <Input maxLength={80} />
              </Form.Item>
              <Form.Item
                name="city"
                label={t("storeSite.checkout.city")}
                rules={required}
              >
                <Input maxLength={80} autoComplete="address-level2" />
              </Form.Item>
              <Form.Item
                name="stateCode"
                label={t("storeSite.checkout.state")}
                rules={required}
              >
                <Select
                  showSearch
                  optionFilterProp="label"
                  options={STATES.map(
                    (state: { code: string; name: string }) => ({
                      value: state.code,
                      label: `${state.name} (${state.code})`,
                    }),
                  )}
                />
              </Form.Item>
              <Form.Item name="note" label={t("storeSite.checkout.note")}>
                <Input.TextArea maxLength={600} rows={3} />
              </Form.Item>

              <div className={styles.summary}>
                <span>{t("storeSite.cart.subtotal")}</span>
                <span>{formatSiteMoney(cart.subtotal)}</span>
              </div>
              <div className={styles.note}>
                {t("storeSite.cart.shippingNote")}
              </div>

              <Button
                type="primary"
                className={styles.primary}
                size="large"
                block
                htmlType="submit"
                loading={isSending}
              >
                {t("storeSite.checkout.send")}
              </Button>
              <Button
                block
                type="text"
                style={{ marginTop: 8 }}
                onClick={() => setStep("cart")}
              >
                {t("storeSite.checkout.back")}
              </Button>
            </Form>
          )}

          {step === "done" && (
            <div className={styles.done}>
              <div className={styles.doneMark}>✓</div>
              <div>{t("storeSite.checkout.doneLabel")}</div>
              <div className={styles.doneNumber}>#{orderNumber}</div>
              <p>{t("storeSite.checkout.inviteNote")}</p>
              <Button type="primary" className={styles.primary} onClick={close}>
                {t("storeSite.checkout.keepBrowsing")}
              </Button>
            </div>
          )}
        </SiteThemeVars>
      </Drawer>
    </ConfigProvider>
  );
};

export default SiteCart;
