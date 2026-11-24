"use client";

import { Form, Input, Segmented, Select } from "antd";

import useLanguageData from "../../../data/context/language/useLanguageData";
import {
  BLOCK_LIMITS,
  IStoreSiteBlockButton,
} from "../../../shared/business/store-sites/store-site-blocks";
import { IStoreSitePage } from "../../../shared/business/store-sites/store-site-pages";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";

/** The page select's value for the home: a page key is never this. */
export const HOME_PAGE: string = "__home__";

interface Props {
  button: IStoreSiteBlockButton | null;
  pages: IStoreSitePage[];
  /** Applied to the button as it is then. */
  onChange: (patch: Partial<IStoreSiteBlockButton>) => void;
  /** Main or outline: for rows of buttons and boxes. */
  withVariant?: boolean;
}

/** One button: its words, where it goes and, where asked, its style. */
const ButtonFields = ({ button, pages, onChange, withVariant }: Props) => {
  const { t } = useLanguageData();

  const target: StoreSitesEnum.BlockButtonTarget =
    button?.target ?? StoreSitesEnum.BlockButtonTarget.PAGE;

  const pageOptions = [
    { value: HOME_PAGE, label: t("storeSite.editor.blocks.home") },
    ...pages.map((page: IStoreSitePage) => ({
      value: page.key,
      label: page.label ?? t(`storeSite.pages.types.${page.type}`),
    })),
  ];

  return (
    <>
      <Form.Item label={t("storeSite.editor.blocks.button.label")}>
        <Input
          maxLength={BLOCK_LIMITS.buttonLabel}
          placeholder={t("storeSite.blocks.ctaButton")}
          value={button?.label ?? ""}
          onChange={(event) => onChange({ label: event.target.value })}
        />
      </Form.Item>
      {withVariant && (
        <Form.Item label={t("storeSite.editor.builder.fields.variant")}>
          <Segmented<StoreSitesEnum.ButtonVariant>
            value={button?.variant ?? StoreSitesEnum.ButtonVariant.PRIMARY}
            onChange={(variant) => onChange({ variant })}
            options={Object.values(StoreSitesEnum.ButtonVariant).map(
              (variant: StoreSitesEnum.ButtonVariant) => ({
                value: variant,
                label: t(`storeSite.editor.builder.variants.${variant}`),
              }),
            )}
          />
        </Form.Item>
      )}
      <Form.Item label={t("storeSite.editor.blocks.button.target")}>
        <Segmented<StoreSitesEnum.BlockButtonTarget>
          block
          value={target}
          onChange={(next) => onChange({ target: next })}
          options={Object.values(StoreSitesEnum.BlockButtonTarget).map(
            (each: StoreSitesEnum.BlockButtonTarget) => ({
              value: each,
              label: t(`storeSite.editor.blocks.button.targets.${each}`),
            }),
          )}
        />
      </Form.Item>
      {target === StoreSitesEnum.BlockButtonTarget.PAGE ? (
        <Form.Item label={t("storeSite.editor.blocks.button.page")}>
          <Select
            value={button?.pageKey ?? HOME_PAGE}
            options={pageOptions}
            onChange={(value: string) =>
              onChange({ pageKey: value === HOME_PAGE ? null : value })
            }
          />
        </Form.Item>
      ) : (
        <Form.Item label={t(`storeSite.editor.blocks.button.values.${target}`)}>
          <Input
            maxLength={BLOCK_LIMITS.buttonValue}
            placeholder={t(
              `storeSite.editor.blocks.button.placeholders.${target}`,
            )}
            value={button?.value ?? ""}
            onChange={(event) => onChange({ value: event.target.value })}
          />
        </Form.Item>
      )}
    </>
  );
};

export default ButtonFields;
