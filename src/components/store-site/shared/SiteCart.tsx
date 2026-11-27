"use client";

import { ReactNode, useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import {
  Alert,
  Button,
  ConfigProvider,
  Drawer,
  Empty,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Select,
} from "antd";

import {
  EnvironmentOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
} from "@ant-design/icons";

import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import {
  CART_WIDTH_PX,
  IStoreSiteCheckout,
  siteCheckoutOf,
} from "../../../shared/business/store-sites/store-site-checkout";
import {
  ICreateSiteOrder,
  IPublicSiteProduct,
} from "../../../shared/business/store-sites/store-sites.types";
import { IStoreSiteTheme } from "../../../shared/business/store-sites/store-site.interface";
import Urls from "../../../shared/common/routes-app/routes-app";
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
  /** What the owner asks before an order is sent. */
  checkout: Partial<IStoreSiteCheckout> | null | undefined;
  /** Shows a product of the cart in full, over the cart. */
  onProductOpen: (productId: string) => void;
  /** A window over the page, or the whole page of the cart. */
  variant?: "drawer" | "page";
  /** Where the page of the cart leads back to. */
  homeUrl?: string;
  /** The name of the site, at the top of the page of the cart. */
  brandName?: string;
}

type TStep = "cart" | "checkout" | "done";

const STEPS: TStep[] = ["cart", "checkout", "done"];

/** One numbered part of the order form. */
const FormSection = ({
  number,
  title,
  hint,
  children,
}: {
  number: number;
  title: string;
  hint?: string;
  children: ReactNode;
}) => (
  <section className={styles.formSection}>
    <header className={styles.formSectionHead}>
      <span className={styles.formSectionNumber}>{number}</span>
      <div>
        <h3>{title}</h3>
        {hint && <p>{hint}</p>}
      </div>
    </header>
    {children}
  </section>
);

// Only the name is always there: the rest is as the owner set the bag.
interface ICheckoutValues {
  name: string;
  email?: string;
  phoneNumber?: string;
  zip?: string;
  address1?: string;
  address2?: string;
  district?: string;
  city?: string;
  stateCode?: string;
  note?: string;
}

const Field = StoreSitesEnum.CheckoutField;
const Mode = StoreSitesEnum.ChatFieldMode;

const ADDRESS_NAMES: (keyof ICheckoutValues)[] = [
  "zip",
  "address1",
  "address2",
  "district",
  "city",
  "stateCode",
];

const STATES: { code: string; name: string }[] = brazilStates as {
  code: string;
  name: string;
}[];

/** The cart, the checkout and the confirmation: the same for every template. */
const SiteCart = ({
  slug,
  theme,
  products,
  cart,
  checkout,
  onProductOpen,
  variant = "drawer",
  homeUrl,
  brandName,
}: Props) => {
  const t = useSiteT();

  const router = useRouter();

  const isPage: boolean = variant === "page";

  const [form] = Form.useForm<ICheckoutValues>();

  const { fields: modes, look } = siteCheckoutOf(checkout);

  // The owner may keep the cart to a list: then a product does not open.
  const openProduct = look.isProductOpened ? onProductOpen : undefined;

  const shippingNote: string | null = look.isShippingNoteShown
    ? (look.shippingNote ?? t("storeSite.cart.shippingNote"))
    : null;

  const typed: Partial<ICheckoutValues> | undefined = Form.useWatch([], form);

  // An address that may be skipped is all or nothing: once any of it is
  // typed, the rest is needed, so the store never gets half an address.
  const isAddressStarted: boolean = ADDRESS_NAMES.some(
    (name: keyof ICheckoutValues) => !!typed?.[name]?.trim(),
  );

  const isAddressNeeded: boolean =
    modes[Field.ADDRESS] === Mode.REQUIRED ||
    (modes[Field.ADDRESS] === Mode.OPTIONAL && isAddressStarted);

  // Whether the order went with an email: only then is there an invite to read.
  const [hasSentEmail, setHasSentEmail] = useState<boolean>(false);

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

  const itemCount: number = orderableLines.reduce(
    (total: number, line: ISiteCartLine) => total + line.quantity,
    0,
  );

  const canCheckout: boolean =
    orderableLines.length > 0 && unavailableIds.length === 0;

  const clear = (): void => {
    cart.clear();

    // Nothing left for the store to have refused.
    setRefusedIds([]);
  };

  const close = (): void => {
    cart.close();

    // The page of the cart has nothing behind it: closing goes back to the site.
    if (isPage && homeUrl) {
      router.push(homeUrl);
    }

    if (step === "done") {
      setStep("cart");
      setOrderNumber(null);
    }
  };

  const send = async (values: ICheckoutValues): Promise<void> => {
    const state = STATES.find(
      (candidate: { code: string }) => candidate.code === values.stateCode,
    );

    const asked = (field: StoreSitesEnum.CheckoutField): boolean =>
      modes[field] !== Mode.HIDDEN;

    const email: string | null =
      (asked(Field.EMAIL) && values.email?.trim().toLowerCase()) || null;

    const order: ICreateSiteOrder = {
      buyer: {
        name: values.name.trim(),
        email,
        phoneNumber: (asked(Field.PHONE) && values.phoneNumber?.trim()) || null,
        address: isAddressNeeded
          ? {
              address1: values.address1?.trim() ?? "",
              address2: values.address2?.trim() || null,
              district: values.district?.trim() ?? "",
              city: values.city?.trim() ?? "",
              stateCode: values.stateCode ?? "",
              stateName: state?.name ?? values.stateCode ?? "",
              zip: values.zip?.trim() ?? "",
            }
          : null,
      },
      items: orderableLines.map((line: ISiteCartLine) => ({
        productId: line.product._id,
        quantity: line.quantity,
      })),
      note: (asked(Field.NOTE) && values.note?.trim()) || null,
    };

    try {
      setIsSending(true);

      const created =
        await serviceMethodsInstance.storeSitesServiceMethods.createOrder(
          slug,
          order,
        );

      setOrderNumber(created.number);
      setHasSentEmail(!!email);
      setRefusedIds([]);
      setStep("done");
      cart.clear();
      form.resetFields();
    } catch (error: any) {
      const body: any = error?.response?.data?.error ?? error?.response?.data;

      if (body?.code === StoreSitesEnum.ErrorCodes.ORDER_ITEMS_UNAVAILABLE) {
        setRefusedIds(Array.isArray(body.productIds) ? body.productIds : []);
        setStep("cart");
      } else if (
        body?.code === StoreSitesEnum.ErrorCodes.ORDER_FIELDS_MISSING
      ) {
        // The store changed what it asks while this page was open.
        handleClientError(t("storeSite.checkout.fieldsChanged"), 6);
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
    {
      required: true,
      whitespace: true,
      message: t("storeSite.checkout.required"),
    },
  ];

  const rulesOf = (field: StoreSitesEnum.CheckoutField) =>
    modes[field] === Mode.REQUIRED ? required : [];

  // A field the visitor may skip says so.
  const labelOf = (field: StoreSitesEnum.CheckoutField, key: string): string =>
    modes[field] === Mode.OPTIONAL
      ? `${t(key)} ${t("storeSite.checkout.optional")}`
      : t(key);

  const addressRules = isAddressNeeded ? required : [];

  const title: string =
    step === "cart"
      ? (look.title ?? t("storeSite.cart.title"))
      : step === "checkout"
        ? t("storeSite.checkout.title")
        : t("storeSite.checkout.doneTitle");

  const clearButton =
    step === "cart" && cart.items.length > 0 ? (
      <Popconfirm
        title={t("storeSite.cart.clearConfirm")}
        okText={t("storeSite.cart.clear")}
        cancelText={t("storeSite.cart.clearCancel")}
        okButtonProps={{ danger: true }}
        placement="bottomRight"
        onConfirm={clear}
      >
        <Button type="text" danger size="small">
          {t("storeSite.cart.clear")}
        </Button>
      </Popconfirm>
    ) : null;

  const stepIndex: number = STEPS.indexOf(step);

  const content = (
    <>
      {(step !== "cart" || cart.items.length > 0) && (
        <ol className={styles.steps}>
          {STEPS.map((key: TStep, index: number) => (
            <li
              key={key}
              className={
                index < stepIndex
                  ? styles.stepDone
                  : index === stepIndex
                    ? styles.stepActive
                    : undefined
              }
            >
              <span>{index < stepIndex ? "✓" : index + 1}</span>
              {t(`storeSite.checkout.steps.${key}`)}
            </li>
          ))}
        </ol>
      )}
      {step === "cart" && (
        <div className={styles.cartLayout}>
          <div className={styles.cartMain}>
            {cart.items.length === 0 ? (
              <Empty description={t("storeSite.cart.empty")} />
            ) : (
              <div className={styles.lines}>
                {orderableLines.map((line: ISiteCartLine) => {
                  const { product } = line;
                  const size: string | undefined = product.dimensions?.size;
                  const colors: string[] = product.colors ?? [];

                  return (
                    <div
                      key={product._id}
                      className={`${styles.line} ${
                        look.isPhotoShown ? "" : styles.noPhoto
                      }`}
                    >
                      {look.isPhotoShown && (
                        <button
                          type="button"
                          className={styles.thumb}
                          style={{
                            backgroundImage: cssUrl(product.mainUrl),
                          }}
                          disabled={!openProduct}
                          aria-label={`${t("storeSite.cart.details")}: ${product.name}`}
                          onClick={() => openProduct?.(product._id)}
                        />
                      )}
                      <div className={styles.info}>
                        {look.isBrandShown && product.brand && (
                          <div className={styles.brand}>{product.brand}</div>
                        )}
                        {openProduct ? (
                          <button
                            type="button"
                            className={styles.name}
                            title={t("storeSite.cart.details")}
                            onClick={() => openProduct(product._id)}
                          >
                            {product.name}
                          </button>
                        ) : (
                          <div className={styles.name}>{product.name}</div>
                        )}
                        {look.isDescriptionShown && product.description && (
                          <div className={styles.description}>
                            {product.description}
                          </div>
                        )}
                        {look.isTagsShown && (size || colors.length > 0) && (
                          <div className={styles.tags}>
                            {size && (
                              <span className={styles.tag}>
                                {t("storeSite.cart.size")}: {size}
                              </span>
                            )}
                            {colors.length > 0 && (
                              <span
                                className={styles.swatches}
                                title={t("storeSite.cart.colors")}
                              >
                                {colors.slice(0, 6).map((color: string) => (
                                  <span
                                    key={color}
                                    className={styles.swatch}
                                    style={{ background: color }}
                                  />
                                ))}
                                {colors.length > 6 && (
                                  <span className={styles.muted}>
                                    +{colors.length - 6}
                                  </span>
                                )}
                              </span>
                            )}
                          </div>
                        )}
                        <div className={styles.lineFoot}>
                          <div className={styles.stepper}>
                            <button
                              type="button"
                              aria-label={t("storeSite.cart.decrease")}
                              onClick={() =>
                                cart.setQuantity(product._id, line.quantity - 1)
                              }
                            >
                              −
                            </button>
                            <InputNumber
                              size="small"
                              variant="borderless"
                              controls={false}
                              min={0}
                              max={StoreSitesEnum.MAX_ORDER_ITEM_QUANTITY}
                              value={line.quantity}
                              aria-label={t("storeSite.cart.quantity")}
                              onChange={(value: number | null) =>
                                cart.setQuantity(product._id, value ?? 0)
                              }
                            />
                            <button
                              type="button"
                              aria-label={t("storeSite.cart.increase")}
                              disabled={
                                line.quantity >=
                                StoreSitesEnum.MAX_ORDER_ITEM_QUANTITY
                              }
                              onClick={() =>
                                cart.setQuantity(product._id, line.quantity + 1)
                              }
                            >
                              +
                            </button>
                          </div>
                          <div className={styles.prices}>
                            <div className={styles.lineTotal}>
                              {formatSiteMoney(line.lineTotal)}
                            </div>
                            {line.quantity > 1 && (
                              <div className={styles.muted}>
                                {t("storeSite.cart.each", {
                                  price: formatSiteMoney(product.price),
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        className={styles.removeLine}
                        aria-label={t("storeSite.cart.remove")}
                        title={t("storeSite.cart.remove")}
                        onClick={() => cart.remove(product._id)}
                      >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M6 6l12 12M18 6L6 18" />
                        </svg>
                      </button>
                    </div>
                  );
                })}

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

            {unavailableIds.length > 0 && (
              <Alert
                style={{ marginTop: 16 }}
                type="warning"
                showIcon
                message={t("storeSite.cart.unavailableHint")}
              />
            )}
          </div>

          {cart.items.length > 0 && (
            <aside className={styles.cartAside}>
              <div className={styles.summaryCard}>
                <div className={styles.summaryRow}>
                  <span>{t("storeSite.cart.total")}</span>
                  <span>
                    {itemCount === 1
                      ? t("storeSite.cart.oneItem")
                      : t("storeSite.cart.items", { count: itemCount })}
                  </span>
                </div>
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
                {shippingNote && (
                  <div className={styles.note}>{shippingNote}</div>
                )}
              </div>

              <Button
                type="primary"
                className={styles.primary}
                size="large"
                block
                disabled={!canCheckout}
                onClick={() => setStep("checkout")}
              >
                {look.buttonLabel ?? t("storeSite.cart.checkout")}
              </Button>
            </aside>
          )}
        </div>
      )}

      {step === "checkout" && (
        <Form<ICheckoutValues>
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={send}
          disabled={isSending}
          size="large"
          className={`${styles.cartLayout} ${styles.checkoutForm}`}
        >
          <div className={styles.formMain}>
            <FormSection
              number={1}
              title={t("storeSite.checkout.sections.contact")}
              hint={t("storeSite.checkout.sections.contactHint")}
            >
              <Form.Item
                name="name"
                label={t("storeSite.checkout.name")}
                rules={required}
              >
                <Input
                  maxLength={120}
                  autoComplete="name"
                  prefix={<UserOutlined className={styles.fieldIcon} />}
                />
              </Form.Item>
              <div className={styles.fieldRow}>
                {modes[Field.EMAIL] !== Mode.HIDDEN && (
                  <Form.Item
                    name="email"
                    label={labelOf(Field.EMAIL, "storeSite.checkout.email")}
                    rules={[
                      ...rulesOf(Field.EMAIL),
                      {
                        type: "email",
                        message: t("storeSite.checkout.invalidEmail"),
                      },
                    ]}
                  >
                    <Input
                      maxLength={160}
                      autoComplete="email"
                      inputMode="email"
                      prefix={<MailOutlined className={styles.fieldIcon} />}
                    />
                  </Form.Item>
                )}
                {modes[Field.PHONE] !== Mode.HIDDEN && (
                  <Form.Item
                    name="phoneNumber"
                    label={labelOf(Field.PHONE, "storeSite.checkout.phone")}
                    rules={rulesOf(Field.PHONE)}
                  >
                    <Input
                      maxLength={30}
                      autoComplete="tel"
                      inputMode="tel"
                      prefix={<PhoneOutlined className={styles.fieldIcon} />}
                    />
                  </Form.Item>
                )}
              </div>
            </FormSection>

            {modes[Field.ADDRESS] !== Mode.HIDDEN && (
              <FormSection
                number={2}
                title={t("storeSite.checkout.sections.address")}
                hint={
                  modes[Field.ADDRESS] === Mode.OPTIONAL
                    ? t("storeSite.checkout.addressOptionalHint")
                    : t("storeSite.checkout.sections.addressHint")
                }
              >
                <div className={styles.fieldRow}>
                  <Form.Item
                    name="zip"
                    label={t("storeSite.checkout.zip")}
                    rules={addressRules}
                  >
                    <Input
                      maxLength={16}
                      autoComplete="postal-code"
                      inputMode="numeric"
                      prefix={
                        <EnvironmentOutlined className={styles.fieldIcon} />
                      }
                    />
                  </Form.Item>
                  <Form.Item
                    name="district"
                    label={t("storeSite.checkout.district")}
                    rules={addressRules}
                  >
                    <Input maxLength={80} />
                  </Form.Item>
                </div>
                <Form.Item
                  name="address1"
                  label={t("storeSite.checkout.address1")}
                  rules={addressRules}
                >
                  <Input maxLength={160} autoComplete="address-line1" />
                </Form.Item>
                <Form.Item
                  name="address2"
                  label={t("storeSite.checkout.address2")}
                >
                  <Input maxLength={160} autoComplete="address-line2" />
                </Form.Item>
                <div className={styles.fieldRow}>
                  <Form.Item
                    name="city"
                    label={t("storeSite.checkout.city")}
                    rules={addressRules}
                  >
                    <Input maxLength={80} autoComplete="address-level2" />
                  </Form.Item>
                  <Form.Item
                    name="stateCode"
                    label={t("storeSite.checkout.state")}
                    rules={
                      isAddressNeeded
                        ? [
                            {
                              required: true,
                              message: t("storeSite.checkout.required"),
                            },
                          ]
                        : []
                    }
                  >
                    <Select
                      showSearch
                      allowClear
                      optionFilterProp="label"
                      options={STATES.map(
                        (state: { code: string; name: string }) => ({
                          value: state.code,
                          label: `${state.name} (${state.code})`,
                        }),
                      )}
                    />
                  </Form.Item>
                </div>
              </FormSection>
            )}

            {modes[Field.NOTE] !== Mode.HIDDEN && (
              <FormSection
                number={modes[Field.ADDRESS] !== Mode.HIDDEN ? 3 : 2}
                title={labelOf(Field.NOTE, "storeSite.checkout.note")}
                hint={t("storeSite.checkout.sections.noteHint")}
              >
                <Form.Item
                  name="note"
                  rules={rulesOf(Field.NOTE)}
                  aria-label={t("storeSite.checkout.note")}
                >
                  <Input.TextArea maxLength={600} rows={3} showCount />
                </Form.Item>
              </FormSection>
            )}
          </div>

          {/* What is being ordered, beside the button that sends it. */}
          <aside className={`${styles.cartAside} ${styles.orderCard}`}>
            <div className={styles.orderTitle}>
              {t("storeSite.checkout.sections.order")}
            </div>
            <div className={styles.orderLines}>
              {orderableLines.map((line: ISiteCartLine) => (
                <div key={line.product._id} className={styles.orderLine}>
                  <span
                    className={styles.orderThumb}
                    style={{ backgroundImage: cssUrl(line.product.mainUrl) }}
                  >
                    <b>{line.quantity}</b>
                  </span>
                  <span className={styles.orderName}>{line.product.name}</span>
                  <span>{formatSiteMoney(line.lineTotal)}</span>
                </div>
              ))}
            </div>
            <div className={styles.summary}>
              <span>{t("storeSite.cart.subtotal")}</span>
              <span>{formatSiteMoney(cart.subtotal)}</span>
            </div>
            {shippingNote && <div className={styles.note}>{shippingNote}</div>}

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
            <div className={styles.privacy}>
              <LockOutlined /> {t("storeSite.checkout.privacy")}
            </div>
          </aside>
        </Form>
      )}

      {step === "done" && (
        <div className={styles.done}>
          <div className={styles.doneMark}>✓</div>
          <div>{t("storeSite.checkout.doneLabel")}</div>
          <div className={styles.doneNumber}>#{orderNumber}</div>
          {hasSentEmail ? (
            <>
              <p>{t("storeSite.checkout.inviteNote")}</p>
              <Button
                block
                type="primary"
                className={styles.primary}
                href={Urls.LOGIN}
                target="_blank"
                rel="noopener"
              >
                {t("storeSite.checkout.followOrder")}
              </Button>
            </>
          ) : (
            <p>{t("storeSite.checkout.doneNote")}</p>
          )}
          <Button block type="text" style={{ marginTop: 8 }} onClick={close}>
            {t("storeSite.checkout.keepBrowsing")}
          </Button>
        </div>
      )}
    </>
  );

  return (
    <ConfigProvider
      theme={{ token: { colorPrimary: theme.primary, borderRadius: 10 } }}
    >
      {isPage ? (
        <SiteThemeVars theme={theme} className={styles.page}>
          <header className={styles.pageTop}>
            <a className={styles.pageBack} href={homeUrl}>
              ← {t("storeSite.cart.keepShopping")}
            </a>
            {brandName && (
              <a className={styles.pageBrand} href={homeUrl}>
                {brandName}
              </a>
            )}
          </header>
          <main className={styles.pageBody}>
            <div className={styles.pageHead}>
              <h1>{title}</h1>
              {clearButton}
            </div>
            {content}
          </main>
        </SiteThemeVars>
      ) : (
        <Drawer
          open={cart.isOpen}
          onClose={close}
          title={title}
          extra={clearButton}
          width={`min(${CART_WIDTH_PX[look.width]}px, 100vw)`}
          placement={
            look.side === StoreSitesEnum.CartSide.LEFT ? "left" : "right"
          }
          destroyOnClose={false}
        >
          <SiteThemeVars theme={theme}>{content}</SiteThemeVars>
        </Drawer>
      )}
    </ConfigProvider>
  );
};

export default SiteCart;
