"use client";

import { ColorPicker, Divider, Form, Input, Segmented, Switch } from "antd";

import useLanguageData from "../../../data/context/language/useLanguageData";
import {
  IStoreSiteBlock,
  IStoreSiteBlockButton,
  newBlockButton,
} from "../../../shared/business/store-sites/store-site-blocks";
import {
  HERO_EXTRA_TEXT_MAX,
  IStoreSiteHeroColors,
  IStoreSiteHeroOptions,
  heroOptionsOf,
} from "../../../shared/business/store-sites/store-site-hero";
import { pageSections } from "../../../shared/business/store-sites/store-site-layout";
import { sitePagesOf } from "../../../shared/business/store-sites/store-site-pages";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import ButtonFields from "./ButtonFields";
import { arrangedBlocks } from "./useSiteBuilder";
import { IStoreSiteEditor } from "./useStoreSiteEditor";

interface Props {
  editor: IStoreSiteEditor;
}

type TPiece =
  | "isTaglineVisible"
  | "isSubtitleVisible"
  | "isButtonVisible"
  | "isFeaturedVisible";

const PIECES: TPiece[] = [
  "isTaglineVisible",
  "isSubtitleVisible",
  "isButtonVisible",
  "isFeaturedVisible",
];

const COLORS: (keyof IStoreSiteHeroColors)[] = ["background", "text", "button"];

const KEY = "storeSite.editor.hero.options";

/**
 * The owner's own choices for the entrance: whether the home shows it, which
 * of its pieces show, one more paragraph, where its button leads, a second
 * button and its own colours. Where it sits on each page, the builder says.
 */
const HeroOptionsFields = ({ editor }: Props) => {
  const { t } = useLanguageData();

  if (!editor.draft) {
    return null;
  }

  const { draft } = editor;

  const options: IStoreSiteHeroOptions = heroOptionsOf(draft.hero.options);

  // From the draft as it is when applied, like every change of the editor.
  const set = (
    change: (current: IStoreSiteHeroOptions) => Partial<IStoreSiteHeroOptions>,
  ): void =>
    editor.update((current) => {
      const before: IStoreSiteHeroOptions = heroOptionsOf(current.hero.options);

      return {
        hero: { ...current.hero, options: { ...before, ...change(before) } },
      };
    });

  const setButton = (
    name: "button" | "secondButton",
    patch: Partial<IStoreSiteBlockButton>,
  ): void =>
    set((current) => ({
      [name]: { ...(current[name] ?? newBlockButton()), ...patch },
    }));

  const isOnHome: boolean =
    pageSections(draft.blocks, null, draft.isLayoutCustom).find(
      (section: IStoreSiteBlock) =>
        section.type === StoreSitesEnum.BlockType.HERO,
    )?.isActive !== false;

  // The entrance of the home is one of its sections: hiding it arranges the
  // site, as hiding it in the builder does.
  const setIsOnHome = (isActive: boolean): void =>
    editor.update((current) => ({
      blocks: arrangedBlocks(current).map((block: IStoreSiteBlock) =>
        block.type === StoreSitesEnum.BlockType.HERO && block.pageKey === null
          ? { ...block, isActive }
          : block,
      ),
      isLayoutCustom: true,
    }));

  const pages = sitePagesOf(draft.pages);

  return (
    <>
      <Form.Item
        label={t(`${KEY}.showOnHome`)}
        extra={t(`${KEY}.showOnHomeHint`)}
      >
        <Switch checked={isOnHome} onChange={setIsOnHome} />
      </Form.Item>

      <Divider orientation="left" plain>
        {t(`${KEY}.pieces.title`)}
      </Divider>
      <div className="mb-5 flex flex-col gap-2">
        {PIECES.map((piece: TPiece) => (
          <label
            key={piece}
            className="flex items-center justify-between gap-2"
          >
            <span>{t(`${KEY}.pieces.${piece}`)}</span>
            <Switch
              size="small"
              checked={options[piece]}
              onChange={(isVisible: boolean) =>
                set(() => ({ [piece]: isVisible }))
              }
            />
          </label>
        ))}
      </div>

      <Divider orientation="left" plain>
        {t(`${KEY}.colors.title`)}
      </Divider>
      <p className="text-xs opacity-70 mb-3">{t(`${KEY}.colors.hint`)}</p>
      <div className="mb-5 flex flex-col gap-2">
        {COLORS.map((name: keyof IStoreSiteHeroColors) => (
          <div key={name} className="flex items-center justify-between gap-2">
            <span>{t(`${KEY}.colors.${name}`)}</span>
            <ColorPicker
              allowClear
              disabledAlpha
              value={options.colors[name]}
              onChangeComplete={(color) =>
                set((current) => ({
                  colors: {
                    ...current.colors,
                    [name]: color.toHexString().slice(0, 7),
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

      <Divider orientation="left" plain>
        {t(`${KEY}.more.title`)}
      </Divider>
      <Form.Item
        label={t(`${KEY}.more.extraText`)}
        extra={t(`${KEY}.more.extraTextHint`)}
      >
        <Input.TextArea
          autoSize={{ minRows: 2, maxRows: 6 }}
          maxLength={HERO_EXTRA_TEXT_MAX}
          value={options.extraText ?? ""}
          onChange={(event) =>
            set(() => ({ extraText: event.target.value || null }))
          }
        />
      </Form.Item>

      {options.isButtonVisible && (
        <>
          <Form.Item
            label={t(`${KEY}.more.buttonTarget`)}
            extra={t(`${KEY}.more.buttonTargetHint`)}
          >
            <Segmented<"products" | "other">
              value={options.button ? "other" : "products"}
              onChange={(next) =>
                set(() => ({
                  button: next === "other" ? newBlockButton() : null,
                }))
              }
              options={[
                { value: "products", label: t(`${KEY}.more.toProducts`) },
                { value: "other", label: t(`${KEY}.more.toOther`) },
              ]}
            />
          </Form.Item>
          {options.button && (
            <ButtonFields
              button={options.button}
              pages={pages}
              withoutLabel
              onChange={(patch) => setButton("button", patch)}
            />
          )}
        </>
      )}

      <Form.Item label={t(`${KEY}.more.secondButton`)}>
        <Switch
          checked={!!options.secondButton}
          onChange={(isOn: boolean) =>
            set(() => ({
              secondButton: isOn
                ? newBlockButton({
                    variant: StoreSitesEnum.ButtonVariant.OUTLINE,
                  })
                : null,
            }))
          }
        />
      </Form.Item>
      {options.secondButton && (
        <ButtonFields
          button={options.secondButton}
          pages={pages}
          withVariant
          onChange={(patch) => setButton("secondButton", patch)}
        />
      )}
      <Divider />
    </>
  );
};

export default HeroOptionsFields;
