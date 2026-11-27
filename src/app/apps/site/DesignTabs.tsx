"use client";

import { useState } from "react";

import { Button, Card, ColorPicker, Form, Modal, Select, Tag } from "antd";

import { SITE_FONT_FAMILY } from "../../../components/store-site/shared/site-fonts";
import { TEMPLATE_REGISTRY } from "../../../components/store-site/template-registry";
import useLanguageData from "../../../data/context/language/useLanguageData";
import {
  IStoreSiteFonts,
  SITE_FONT_NAMES,
  SITE_FONT_PLACES,
  siteFontsOf,
  TSiteFontPlace,
} from "../../../shared/business/store-sites/store-site-fonts";
import { IStoreSiteTheme } from "../../../shared/business/store-sites/store-site.interface";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import { IStoreSiteEditor } from "./useStoreSiteEditor";

interface Props {
  editor: IStoreSiteEditor;
}

const COLOR_KEYS: (keyof IStoreSiteTheme)[] = [
  "primary",
  "secondary",
  "accent",
  "background",
  "text",
];

/** Which template draws the site. Changing it never changes the content. */
export const TemplateTab = ({ editor }: Props) => {
  const { t } = useLanguageData();
  // The template asked for, while the owner decides what to do with the colors.
  const [pending, setPending] = useState<StoreSitesEnum.Template | null>(null);

  const current: StoreSitesEnum.Template | undefined = editor.draft?.templateId;

  const choose = (templateId: StoreSitesEnum.Template): void => {
    if (templateId !== current) {
      setPending(templateId);
    }
  };

  const apply = (useDefaultColors: boolean): void => {
    if (pending) {
      editor.changeTemplate(pending, useDefaultColors);
    }

    setPending(null);
  };

  return (
    <>
      <Modal
        open={!!pending}
        title={t("storeSite.editor.changeTemplateTitle")}
        onCancel={() => setPending(null)}
        footer={[
          <Button key="cancel" onClick={() => setPending(null)}>
            {t("storeSite.editor.cancel")}
          </Button>,
          <Button key="keep" onClick={() => apply(false)}>
            {t("storeSite.editor.keepMyColors")}
          </Button>,
          <Button key="use" type="primary" onClick={() => apply(true)}>
            {t("storeSite.editor.useTemplateColors")}
          </Button>,
        ]}
      >
        {t("storeSite.editor.changeTemplateText")}
      </Modal>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(Object.keys(TEMPLATE_REGISTRY) as StoreSitesEnum.Template[]).map(
          (templateId: StoreSitesEnum.Template) => {
            const { defaultTheme, labelKey, descriptionKey } =
              TEMPLATE_REGISTRY[templateId];

            return (
              <Card
                key={templateId}
                size="small"
                hoverable
                onClick={() => choose(templateId)}
                className={
                  templateId === current ? "border-2 border-blue-500" : ""
                }
                cover={
                  <div
                    style={{
                      height: 64,
                      background: `linear-gradient(120deg, ${defaultTheme.background}, ${defaultTheme.secondary}, ${defaultTheme.primary}, ${defaultTheme.accent})`,
                    }}
                  />
                }
              >
                <div className="font-semibold">
                  {t(labelKey)}{" "}
                  {templateId === current && (
                    <Tag color="blue">{t("storeSite.editor.inUse")}</Tag>
                  )}
                </div>
                <div className="text-xs opacity-70">{t(descriptionKey)}</div>
              </Card>
            );
          },
        )}
      </div>
    </>
  );
};

export const ColorsTab = ({ editor }: Props) => {
  const { t } = useLanguageData();

  if (!editor.draft) {
    return null;
  }

  const { theme, templateId } = editor.draft;

  const defaultTheme: IStoreSiteTheme =
    TEMPLATE_REGISTRY[templateId].defaultTheme;

  const isDefault: boolean = COLOR_KEYS.every(
    (key: keyof IStoreSiteTheme) =>
      theme[key].toLowerCase() === defaultTheme[key].toLowerCase(),
  );

  return (
    <Form layout="vertical">
      {COLOR_KEYS.map((key: keyof IStoreSiteTheme) => (
        <Form.Item key={key} label={t(`storeSite.editor.colors.${key}`)}>
          <ColorPicker
            value={theme[key]}
            showText
            disabledAlpha
            onChangeComplete={(color) =>
              editor.update({
                theme: { ...theme, [key]: color.toHexString().slice(0, 7) },
              })
            }
          />
        </Form.Item>
      ))}
      {/* Only the colors: the template and the content stay as they are. */}
      <Button
        disabled={isDefault}
        onClick={() => editor.update({ theme: { ...defaultTheme } })}
      >
        {t("storeSite.editor.colors.reset")}
      </Button>
    </Form>
  );
};

// What the select holds for "as the template has it": it takes no empty value.
const TEMPLATE_FONT: string = "";

/** The typefaces of the site: one for the titles, one for everything else. */
export const FontsTab = ({ editor }: Props) => {
  const { t } = useLanguageData();

  if (!editor.draft) {
    return null;
  }

  const fonts: IStoreSiteFonts = siteFontsOf(editor.draft.fonts);

  const isDefault: boolean = SITE_FONT_PLACES.every(
    (place: TSiteFontPlace) => !fonts[place],
  );

  return (
    <Form layout="vertical">
      <p className="mb-3 text-xs opacity-60">
        {t("storeSite.editor.fonts.hint")}
      </p>
      {SITE_FONT_PLACES.map((place: TSiteFontPlace) => (
        <Form.Item key={place} label={t(`storeSite.editor.fonts.${place}`)}>
          <Select<string>
            showSearch
            optionFilterProp="title"
            value={fonts[place] ?? TEMPLATE_FONT}
            onChange={(font: string) =>
              editor.update({
                fonts: {
                  ...fonts,
                  [place]: (font as StoreSitesEnum.Font) || null,
                },
              })
            }
            options={[
              {
                value: TEMPLATE_FONT,
                title: t("storeSite.editor.fonts.template"),
                label: t("storeSite.editor.fonts.template"),
              },
              ...Object.values(StoreSitesEnum.Font).map(
                (font: StoreSitesEnum.Font) => ({
                  value: font as string,
                  title: SITE_FONT_NAMES[font],
                  // Each one written in itself, to be chosen by eye.
                  label: (
                    <span style={{ fontFamily: SITE_FONT_FAMILY[font] }}>
                      {SITE_FONT_NAMES[font]}
                    </span>
                  ),
                }),
              ),
            ]}
          />
        </Form.Item>
      ))}
      {/* Only the typefaces: the colors and the content stay as they are. */}
      <Button
        disabled={isDefault}
        onClick={() => editor.update({ fonts: siteFontsOf(null) })}
      >
        {t("storeSite.editor.fonts.reset")}
      </Button>
    </Form>
  );
};
