"use client";

import { Card, ColorPicker, Input, Segmented, Space, Switch } from "antd";

import useLanguageData from "../../../data/context/language/useLanguageData";
import {
  FILTER_TITLE_MAX,
  IStoreSiteCatalogFilter,
  IStoreSiteCatalogFilterColors,
} from "../../../shared/business/store-sites/store-site-catalog-filter";
import { siteCatalogOf } from "../../../shared/business/store-sites/store-site-catalog";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import { IStoreSiteEditor } from "./useStoreSiteEditor";

interface Props {
  editor: IStoreSiteEditor;
}

const KEY = "storeSite.editor.catalog.filter";

const COLORS: (keyof IStoreSiteCatalogFilterColors)[] = [
  "background",
  "text",
  "accent",
];

/**
 * The filter of the page of products: whether it is there, the side it floats
 * on, its heading, each way of filtering and its own colours.
 */
const CatalogFilterFields = ({ editor }: Props) => {
  const { t } = useLanguageData();

  if (!editor.draft) {
    return null;
  }

  const { filter } = siteCatalogOf(editor.draft.catalog);

  // From the draft as it is when applied, like every change of the editor.
  const set = (
    change: (
      current: IStoreSiteCatalogFilter,
    ) => Partial<IStoreSiteCatalogFilter>,
  ): void =>
    editor.update((draft) => {
      const catalog = siteCatalogOf(draft.catalog);

      return {
        catalog: {
          ...catalog,
          filter: { ...catalog.filter, ...change(catalog.filter) },
        },
      };
    });

  return (
    <Card
      size="small"
      title={t(`${KEY}.title`)}
      extra={
        <Switch
          checked={filter.isShown}
          aria-label={t(`${KEY}.title`)}
          onChange={(isShown: boolean) => set(() => ({ isShown }))}
        />
      }
    >
      <p className="mt-0 mb-3 text-xs opacity-70">{t(`${KEY}.hint`)}</p>

      {filter.isShown && (
        <Space direction="vertical" className="w-full" size="middle">
          <div className="flex flex-col gap-1.5">
            <span>{t(`${KEY}.side`)}</span>
            <Segmented<StoreSitesEnum.CatalogFilterSide>
              block
              value={filter.side}
              options={Object.values(StoreSitesEnum.CatalogFilterSide).map(
                (side: StoreSitesEnum.CatalogFilterSide) => ({
                  value: side,
                  label: t(`${KEY}.sides.${side}`),
                }),
              )}
              onChange={(side) => set(() => ({ side }))}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span>{t(`${KEY}.heading`)}</span>
            <Input
              allowClear
              maxLength={FILTER_TITLE_MAX}
              placeholder={t("storeSite.public.filter.title")}
              value={filter.title ?? ""}
              onChange={(event) =>
                set(() => ({ title: event.target.value || null }))
              }
            />
          </div>

          <div className="flex flex-col gap-2">
            <span>{t(`${KEY}.fields.title`)}</span>
            {Object.values(StoreSitesEnum.CatalogFilterField).map(
              (field: StoreSitesEnum.CatalogFilterField) => (
                <label
                  key={field}
                  className="flex items-center justify-between gap-3"
                >
                  <span>{t(`${KEY}.fields.${field}`)}</span>
                  <Switch
                    size="small"
                    checked={filter.fields[field]}
                    onChange={(isOn: boolean) =>
                      set((current) => ({
                        fields: { ...current.fields, [field]: isOn },
                      }))
                    }
                  />
                </label>
              ),
            )}
          </div>

          <div className="flex flex-col gap-2">
            <span>{t(`${KEY}.colors.title`)}</span>
            {COLORS.map((name: keyof IStoreSiteCatalogFilterColors) => (
              <div
                key={name}
                className="flex items-center justify-between gap-2"
              >
                <span>{t(`${KEY}.colors.${name}`)}</span>
                <ColorPicker
                  allowClear
                  disabledAlpha
                  value={filter.colors[name] ?? undefined}
                  showText={() =>
                    filter.colors[name] ??
                    t("storeSite.editor.pages.colorOfSite")
                  }
                  onChangeComplete={(picked) =>
                    set((current) => ({
                      colors: {
                        ...current.colors,
                        [name]: picked.toHexString().slice(0, 7),
                      },
                    }))
                  }
                  onClear={() =>
                    set((current) => ({
                      colors: { ...current.colors, [name]: null },
                    }))
                  }
                />
              </div>
            ))}
          </div>
        </Space>
      )}
    </Card>
  );
};

export default CatalogFilterFields;
