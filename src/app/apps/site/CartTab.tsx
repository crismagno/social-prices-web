"use client";

import { Divider, Form, Input, Segmented, Switch } from "antd";

import { ShoppingCartOutlined, ShoppingOutlined } from "@ant-design/icons";

import useLanguageData from "../../../data/context/language/useLanguageData";
import {
  CART_BUTTON_LABEL_MAX,
  IStoreSiteCartButton,
  siteCartButtonOf,
} from "../../../shared/business/store-sites/store-site-cart-button";
import { siteCheckoutOf } from "../../../shared/business/store-sites/store-site-checkout";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
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

  const checkoutFields = siteCheckoutOf(editor.draft.checkout).fields;

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
