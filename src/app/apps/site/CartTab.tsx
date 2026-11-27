"use client";

import { Divider, Form, Input, Segmented, Switch } from "antd";

import { ShoppingCartOutlined, ShoppingOutlined } from "@ant-design/icons";

import useLanguageData from "../../../data/context/language/useLanguageData";
import {
  CART_BUTTON_LABEL_MAX,
  IStoreSiteCartButton,
  siteCartButtonOf,
} from "../../../shared/business/store-sites/store-site-cart-button";
import {
  CART_BUTTON_LABEL_MAX as CHECKOUT_BUTTON_LABEL_MAX,
  CART_SHIPPING_NOTE_MAX,
  CART_TITLE_MAX,
  IStoreSiteCartLook,
  siteCheckoutOf,
} from "../../../shared/business/store-sites/store-site-checkout";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import ChoiceList from "./ChoiceList";
import { IStoreSiteEditor } from "./useStoreSiteEditor";

interface Props {
  editor: IStoreSiteEditor;
}

/**
 * The bag of the site: whether it sells at all, how the button at the top
 * looks, and what is asked of the visitor before an order is sent.
 */
const CartTab = ({ editor }: Props) => {
  const { t } = useLanguageData();

  if (!editor.draft) {
    return null;
  }

  const cartButton: IStoreSiteCartButton = editor.draft.cartButton;

  // From the draft as it is when applied, like every change of the editor.
  const setCartButton = (patch: Partial<IStoreSiteCartButton>): void =>
    editor.update((draft) => ({
      cartButton: siteCartButtonOf({ ...draft.cartButton, ...patch }),
    }));

  const { fields: checkoutFields, look } = siteCheckoutOf(
    editor.draft.checkout,
  );

  // From the draft as it is when applied, like every change of the editor.
  const setLook = (patch: Partial<IStoreSiteCartLook>): void =>
    editor.update((draft) => {
      const checkout = siteCheckoutOf(draft.checkout);

      return {
        checkout: { ...checkout, look: { ...checkout.look, ...patch } },
      };
    });

  // What the window shows of each product, each one on or off.
  const LOOK_SWITCHES: (keyof IStoreSiteCartLook)[] = [
    "isPhotoShown",
    "isBrandShown",
    "isDescriptionShown",
    "isTagsShown",
    "isProductOpened",
    "isShippingNoteShown",
  ];

  // From the draft as it is when applied, like every change of the editor.
  const setCheckoutField = (
    field: StoreSitesEnum.CheckoutField,
    mode: StoreSitesEnum.ChatFieldMode,
  ): void =>
    editor.update((draft) => {
      const checkout = siteCheckoutOf(draft.checkout);

      return {
        checkout: {
          ...checkout,
          fields: { ...checkout.fields, [field]: mode },
        },
      };
    });

  return (
    <Form layout="vertical">
      <Form.Item
        label={t("storeSite.editor.hero.cart.show")}
        extra={t("storeSite.editor.hero.cart.showHint")}
      >
        <Switch
          checked={cartButton.isVisible}
          onChange={(isVisible: boolean) => setCartButton({ isVisible })}
        />
      </Form.Item>
      {cartButton.isVisible && (
        <>
          <Divider orientation="left" plain>
            {t("storeSite.editor.hero.cart.button")}
          </Divider>
          <Form.Item label={t("storeSite.editor.hero.cart.icon")}>
            <Segmented<StoreSitesEnum.CartButtonIcon>
              value={cartButton.icon}
              onChange={(icon) => setCartButton({ icon })}
              options={[
                {
                  value: StoreSitesEnum.CartButtonIcon.NONE,
                  label: t("storeSite.editor.hero.cart.icons.NONE"),
                },
                {
                  value: StoreSitesEnum.CartButtonIcon.BAG,
                  icon: <ShoppingOutlined />,
                  label: t("storeSite.editor.hero.cart.icons.BAG"),
                },
                {
                  value: StoreSitesEnum.CartButtonIcon.CART,
                  icon: <ShoppingCartOutlined />,
                  label: t("storeSite.editor.hero.cart.icons.CART"),
                },
              ]}
            />
          </Form.Item>
          <Form.Item
            label={t("storeSite.editor.hero.cart.label")}
            extra={t("storeSite.editor.hero.cart.labelHint")}
          >
            <Input
              maxLength={CART_BUTTON_LABEL_MAX}
              value={cartButton.label ?? ""}
              disabled={!cartButton.isLabelVisible}
              onChange={(event) =>
                setCartButton({ label: event.target.value || null })
              }
            />
          </Form.Item>
          <Form.Item label={t("storeSite.editor.hero.cart.onlyIcon")}>
            <Switch
              checked={!cartButton.isLabelVisible}
              disabled={cartButton.icon === StoreSitesEnum.CartButtonIcon.NONE}
              onChange={(onlyIcon: boolean) =>
                setCartButton({ isLabelVisible: !onlyIcon })
              }
            />
          </Form.Item>
          <Form.Item label={t("storeSite.editor.hero.cart.size")}>
            <Segmented<StoreSitesEnum.CartButtonSize>
              value={cartButton.size}
              onChange={(size) => setCartButton({ size })}
              options={Object.values(StoreSitesEnum.CartButtonSize).map(
                (size: StoreSitesEnum.CartButtonSize) => ({
                  value: size,
                  label: t(`storeSite.editor.hero.cart.sizes.${size}`),
                }),
              )}
            />
          </Form.Item>
          <Divider orientation="left" plain>
            {t("storeSite.editor.hero.cart.window.title")}
          </Divider>
          <p className="text-xs opacity-70 mb-3">
            {t("storeSite.editor.hero.cart.window.hint")}
          </p>
          <Form.Item label={t("storeSite.editor.hero.cart.window.name")}>
            <Input
              maxLength={CART_TITLE_MAX}
              placeholder={t("storeSite.cart.title")}
              value={look.title ?? ""}
              onChange={(event) =>
                setLook({ title: event.target.value || null })
              }
            />
          </Form.Item>
          <Form.Item label={t("storeSite.editor.hero.cart.window.mode")}>
            <ChoiceList<StoreSitesEnum.CartMode>
              value={look.mode}
              onChange={(mode) => setLook({ mode })}
              options={Object.values(StoreSitesEnum.CartMode).map(
                (mode: StoreSitesEnum.CartMode) => ({
                  value: mode,
                  label: t(`storeSite.editor.hero.cart.window.modes.${mode}`),
                  hint: t(
                    `storeSite.editor.hero.cart.window.modeHints.${mode}`,
                  ),
                }),
              )}
            />
          </Form.Item>
          {look.mode === StoreSitesEnum.CartMode.DRAWER && (
            <div className="flex flex-wrap gap-x-6">
              <Form.Item label={t("storeSite.editor.hero.cart.window.width")}>
                <Segmented<StoreSitesEnum.CartWidth>
                  value={look.width}
                  onChange={(width) => setLook({ width })}
                  options={Object.values(StoreSitesEnum.CartWidth).map(
                    (width: StoreSitesEnum.CartWidth) => ({
                      value: width,
                      label: t(
                        `storeSite.editor.hero.cart.window.widths.${width}`,
                      ),
                    }),
                  )}
                />
              </Form.Item>
              <Form.Item label={t("storeSite.editor.hero.cart.window.side")}>
                <Segmented<StoreSitesEnum.CartSide>
                  value={look.side}
                  onChange={(side) => setLook({ side })}
                  options={Object.values(StoreSitesEnum.CartSide).map(
                    (side: StoreSitesEnum.CartSide) => ({
                      value: side,
                      label: t(
                        `storeSite.editor.hero.cart.window.sides.${side}`,
                      ),
                    }),
                  )}
                />
              </Form.Item>
            </div>
          )}
          <div className="flex flex-col gap-2 mb-4">
            {LOOK_SWITCHES.map((key: keyof IStoreSiteCartLook) => (
              <div
                key={key}
                className="flex items-center justify-between gap-2"
              >
                <span>{t(`storeSite.editor.hero.cart.window.${key}`)}</span>
                <Switch
                  size="small"
                  checked={look[key] === true}
                  onChange={(checked: boolean) => setLook({ [key]: checked })}
                />
              </div>
            ))}
          </div>
          {look.isShippingNoteShown && (
            <Form.Item
              label={t("storeSite.editor.hero.cart.window.shippingNote")}
            >
              <Input.TextArea
                rows={2}
                maxLength={CART_SHIPPING_NOTE_MAX}
                placeholder={t("storeSite.cart.shippingNote")}
                value={look.shippingNote ?? ""}
                onChange={(event) =>
                  setLook({ shippingNote: event.target.value || null })
                }
              />
            </Form.Item>
          )}
          <Form.Item label={t("storeSite.editor.hero.cart.window.buttonLabel")}>
            <Input
              maxLength={CHECKOUT_BUTTON_LABEL_MAX}
              placeholder={t("storeSite.cart.checkout")}
              value={look.buttonLabel ?? ""}
              onChange={(event) =>
                setLook({ buttonLabel: event.target.value || null })
              }
            />
          </Form.Item>
          <Divider orientation="left" plain>
            {t("storeSite.editor.hero.cart.fields.title")}
          </Divider>
          <p className="text-xs opacity-70 mb-3">
            {t("storeSite.editor.hero.cart.fields.hint")}
          </p>
          <div className="flex flex-col gap-2">
            {Object.values(StoreSitesEnum.CheckoutField).map(
              (field: StoreSitesEnum.CheckoutField) => (
                <div
                  key={field}
                  className="flex flex-wrap items-center justify-between gap-2"
                >
                  <span>
                    {t(`storeSite.editor.hero.cart.fields.names.${field}`)}
                  </span>
                  <Segmented<StoreSitesEnum.ChatFieldMode>
                    size="small"
                    value={checkoutFields[field]}
                    onChange={(mode) => setCheckoutField(field, mode)}
                    options={Object.values(StoreSitesEnum.ChatFieldMode).map(
                      (mode: StoreSitesEnum.ChatFieldMode) => ({
                        value: mode,
                        label: t(`storeSite.editor.chat.modes.${mode}`),
                      }),
                    )}
                  />
                </div>
              ),
            )}
          </div>
        </>
      )}
    </Form>
  );
};

export default CartTab;
