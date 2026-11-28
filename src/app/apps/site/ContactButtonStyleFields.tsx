"use client";

import { Button, Form, Segmented, Switch } from "antd";

import useLanguageData from "../../../data/context/language/useLanguageData";
import {
  IStoreSiteContactButton,
  contactButtonOf,
} from "../../../shared/business/store-sites/store-site-contact";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import { ColorField } from "./ContactStyleControls";
import FeatureIconPicker from "./FeatureIconPicker";

interface Props {
  button: IStoreSiteContactButton;
  onChange: (patch: Partial<IStoreSiteContactButton>) => void;
  onReset: () => void;
}

const KEY = "storeSite.editor.contactForm.button";

/** Everything about the send button: colours, icon, size, corners and place. */
const ContactButtonStyleFields = ({ button, onChange, onReset }: Props) => {
  const { t } = useLanguageData();

  const options = <T extends string>(values: T[], group: string) =>
    values.map((value: T) => ({
      value,
      label: t(`${KEY}.${group}.${value}`),
    }));

  const isDefault: boolean =
    JSON.stringify(button) === JSON.stringify(contactButtonOf(null));

  return (
    <>
      <div className="grid grid-cols-2 gap-x-3">
        <ColorField
          label={t(`${KEY}.color`)}
          value={button.color}
          onChange={(color) => onChange({ color })}
        />
        <ColorField
          label={t(`${KEY}.textColor`)}
          value={button.textColor}
          emptyLabel={t(`${KEY}.textColorAuto`)}
          onChange={(textColor) => onChange({ textColor })}
        />
      </div>

      <Form.Item label={t(`${KEY}.icon`)}>
        <FeatureIconPicker
          value={button.icon}
          noneLabel={t(`${KEY}.iconNone`)}
          onChange={(icon) => onChange({ icon })}
          onClear={() => onChange({ icon: null })}
        />
      </Form.Item>

      {button.icon && (
        <Form.Item label={t(`${KEY}.iconPosition`)}>
          <Segmented<StoreSitesEnum.ContactIconPosition>
            value={button.iconPosition}
            onChange={(iconPosition) => onChange({ iconPosition })}
            options={options(
              Object.values(StoreSitesEnum.ContactIconPosition),
              "iconPositions",
            )}
          />
        </Form.Item>
      )}

      <Form.Item label={t(`${KEY}.size`)}>
        <Segmented<StoreSitesEnum.ContactButtonSize>
          block
          value={button.size}
          onChange={(size) => onChange({ size })}
          options={options(
            Object.values(StoreSitesEnum.ContactButtonSize),
            "sizes",
          )}
        />
      </Form.Item>

      <Form.Item label={t(`${KEY}.shape`)}>
        <Segmented<StoreSitesEnum.ContactButtonShape>
          block
          value={button.shape}
          onChange={(shape) => onChange({ shape })}
          options={options(
            Object.values(StoreSitesEnum.ContactButtonShape),
            "shapes",
          )}
        />
      </Form.Item>

      <label className="mb-4 flex items-center justify-between gap-3">
        <span>{t(`${KEY}.fullWidth`)}</span>
        <Switch
          checked={button.isFullWidth}
          onChange={(isFullWidth: boolean) => onChange({ isFullWidth })}
        />
      </label>

      {!button.isFullWidth && (
        <Form.Item label={t(`${KEY}.align`)}>
          <Segmented<StoreSitesEnum.ContactButtonAlign>
            block
            value={button.align}
            onChange={(align) => onChange({ align })}
            options={options(
              Object.values(StoreSitesEnum.ContactButtonAlign),
              "aligns",
            )}
          />
        </Form.Item>
      )}

      <Button size="small" disabled={isDefault} onClick={onReset}>
        {t("storeSite.editor.contactForm.reset")}
      </Button>
    </>
  );
};

export default ContactButtonStyleFields;
