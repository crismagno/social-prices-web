"use client";

import { ColorPicker, Divider, Form, Input, Segmented, Switch } from "antd";

import useLanguageData from "../../../data/context/language/useLanguageData";
import {
  IStoreSiteBlockButton,
  newBlockButton,
} from "../../../shared/business/store-sites/store-site-blocks";
import {
  HERO_EXTRA_TEXT_MAX,
  IStoreSiteHeroColors,
  IStoreSiteHeroOptions,
} from "../../../shared/business/store-sites/store-site-hero";
import { IStoreSitePage } from "../../../shared/business/store-sites/store-site-pages";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import ButtonFields from "./ButtonFields";

export type THeroPiece =
  | "isTaglineVisible"
  | "isTitleVisible"
  | "isSubtitleVisible"
  | "isButtonVisible"
  | "isFeaturedVisible";

interface Props {
  options: IStoreSiteHeroOptions;
  /** Changes the choices, from the choices as they are when applied. */
  set: (
    change: (current: IStoreSiteHeroOptions) => Partial<IStoreSiteHeroOptions>,
  ) => void;
  pages: IStoreSitePage[];
  /** The pieces this entrance can hide. */
  pieces: THeroPiece[];
  /** Says it of one page instead of the home. */
  isOfPage?: boolean;
}

const COLORS: (keyof IStoreSiteHeroColors)[] = ["background", "text", "button"];

const KEY = "storeSite.editor.hero.options";

/**
 * The choices of an entrance, the home's or a page's: which of its pieces
 * show, its own colours, one more paragraph, where its button leads and a
 * second button.
 */
const HeroOptionsControls = ({
  options,
  set,
  pages,
  pieces,
  isOfPage = false,
}: Props) => {
  const { t } = useLanguageData();

  const setButton = (
    name: "button" | "secondButton",
    patch: Partial<IStoreSiteBlockButton>,
  ): void =>
    set((current) => ({
      [name]: { ...(current[name] ?? newBlockButton()), ...patch },
    }));

  return (
    <>
      <Divider orientation="left" plain>
        {t(`${KEY}.pieces.title`)}
      </Divider>
      <div className="mb-5 flex flex-col gap-2">
        {pieces.map((piece: THeroPiece) => (
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
      <p className="text-xs opacity-70 mb-3">
        {isOfPage ? t(`${KEY}.colors.pageHint`) : t(`${KEY}.colors.hint`)}
      </p>
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
        extra={
          isOfPage
            ? t(`${KEY}.more.extraTextPageHint`)
            : t(`${KEY}.more.extraTextHint`)
        }
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
            extra={
              isOfPage
                ? t(`${KEY}.more.buttonTargetPageHint`)
                : t(`${KEY}.more.buttonTargetHint`)
            }
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
    </>
  );
};

export default HeroOptionsControls;
