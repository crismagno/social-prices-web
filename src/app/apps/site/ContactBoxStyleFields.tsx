"use client";

import { Button, Form, Segmented, Switch } from "antd";

import useLanguageData from "../../../data/context/language/useLanguageData";
import {
  IStoreSiteContactBox,
  contactBoxOf,
} from "../../../shared/business/store-sites/store-site-contact";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import { ColorField, PixelsField } from "./ContactStyleControls";

interface Props {
  box: IStoreSiteContactBox;
  onChange: (patch: Partial<IStoreSiteContactBox>) => void;
  onReset: () => void;
}

const KEY = "storeSite.editor.contactForm.box";

const LIMITS = StoreSitesEnum.CONTACT_BOX_LIMITS;

/** Where the template's own sizes rest when the owner chose none. */
const USUAL = { width: 640, padding: 28, radius: 22 };

/** The box around the form: how wide, how roomy, its corners and colours. */
const ContactBoxStyleFields = ({ box, onChange, onReset }: Props) => {
  const { t } = useLanguageData();

  const isDefault: boolean =
    JSON.stringify(box) === JSON.stringify(contactBoxOf(null));

  return (
    <>
      <Form.Item label={t(`${KEY}.widthMode`)}>
        <Segmented<"AUTO" | "CUSTOM">
          block
          value={box.width === null ? "AUTO" : "CUSTOM"}
          onChange={(mode) =>
            onChange({ width: mode === "AUTO" ? null : USUAL.width })
          }
          options={[
            { value: "AUTO", label: t(`${KEY}.widthAuto`) },
            { value: "CUSTOM", label: t(`${KEY}.widthCustom`) },
          ]}
        />
      </Form.Item>

      {box.width !== null && (
        <PixelsField
          label={t(`${KEY}.width`)}
          value={box.width}
          fallback={USUAL.width}
          limits={LIMITS.width}
          step={10}
          onChange={(width) => onChange({ width })}
        />
      )}

      <PixelsField
        label={t(`${KEY}.padding`)}
        value={box.padding}
        fallback={USUAL.padding}
        limits={LIMITS.padding}
        onChange={(padding) => onChange({ padding })}
      />

      <PixelsField
        label={t(`${KEY}.radius`)}
        value={box.radius}
        fallback={USUAL.radius}
        limits={LIMITS.radius}
        onChange={(radius) => onChange({ radius })}
      />

      <div className="grid grid-cols-2 gap-x-3">
        <ColorField
          label={t(`${KEY}.background`)}
          value={box.background}
          emptyLabel={t(`${KEY}.usual`)}
          onChange={(background) => onChange({ background })}
        />
        <ColorField
          label={t(`${KEY}.textColor`)}
          value={box.textColor}
          emptyLabel={t(`${KEY}.usual`)}
          onChange={(textColor) => onChange({ textColor })}
        />
        <ColorField
          label={t(`${KEY}.fieldBackground`)}
          value={box.fieldBackground}
          emptyLabel={t(`${KEY}.usual`)}
          onChange={(fieldBackground) => onChange({ fieldBackground })}
        />
        {box.isBorderVisible && (
          <ColorField
            label={t(`${KEY}.borderColor`)}
            value={box.borderColor}
            emptyLabel={t(`${KEY}.usual`)}
            onChange={(borderColor) => onChange({ borderColor })}
          />
        )}
      </div>

      <label className="mb-4 flex items-center justify-between gap-3">
        <span>{t(`${KEY}.border`)}</span>
        <Switch
          checked={box.isBorderVisible}
          onChange={(isBorderVisible: boolean) => onChange({ isBorderVisible })}
        />
      </label>

      <Form.Item label={t(`${KEY}.shadow`)}>
        <Segmented<StoreSitesEnum.ContactBoxShadow>
          block
          value={box.shadow}
          onChange={(shadow) => onChange({ shadow })}
          options={Object.values(StoreSitesEnum.ContactBoxShadow).map(
            (shadow: StoreSitesEnum.ContactBoxShadow) => ({
              value: shadow,
              label: t(`${KEY}.shadows.${shadow}`),
            }),
          )}
        />
      </Form.Item>

      <Button size="small" disabled={isDefault} onClick={onReset}>
        {t("storeSite.editor.contactForm.reset")}
      </Button>
    </>
  );
};

export default ContactBoxStyleFields;
