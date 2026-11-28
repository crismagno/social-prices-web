"use client";

import {
  Card,
  ColorPicker,
  Form,
  InputNumber,
  Segmented,
  Slider,
  Switch,
} from "antd";

import useLanguageData from "../../../data/context/language/useLanguageData";
import { IStoreSiteBlock } from "../../../shared/business/store-sites/store-site-blocks";
import {
  IStoreSiteSectionBackground,
  SECTION_BACKGROUND_LIMITS,
  newSectionBackground,
} from "../../../shared/business/store-sites/store-site-section-background";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import ImageField from "./ImageField";

interface Props {
  section: IStoreSiteBlock;
  storeId: string;
  /** Applied to the section as it is then. */
  onChange: (
    change: (section: IStoreSiteBlock) => Partial<IStoreSiteBlock>,
  ) => void;
}

const KEY = "storeSite.editor.builder.background";

const Type = StoreSitesEnum.SectionBackgroundType;

type TColorKey = "color" | "color2";

const percent = (value?: number): string => `${value ?? 0}%`;

/**
 * What lies behind one section: none, a colour, a gradient or an image, how
 * solid and how faded at its edges, and the room above and below.
 */
const SectionBackgroundFields = ({ section, storeId, onChange }: Props) => {
  const { t } = useLanguageData();

  const background: IStoreSiteSectionBackground =
    section.settings.background ?? newSectionBackground();

  // From the section as it is when applied, like every change of the editor.
  const set = (patch: Partial<IStoreSiteSectionBackground>): void =>
    onChange((current) => ({
      settings: {
        ...current.settings,
        background: {
          ...(current.settings.background ?? newSectionBackground()),
          ...patch,
        },
      },
    }));

  const colorField = (name: TColorKey) => (
    <Form.Item label={t(`${KEY}.${name}.${background.type}`)}>
      <ColorPicker
        allowClear
        disabledAlpha
        value={background[name] ?? undefined}
        showText={() =>
          background[name] ?? t("storeSite.editor.pages.colorOfSite")
        }
        onChangeComplete={(picked) =>
          set({ [name]: picked.toHexString().slice(0, 7) })
        }
        onClear={() => set({ [name]: null })}
      />
    </Form.Item>
  );

  const isPainted: boolean = background.type !== Type.NONE;

  return (
    <Card size="small" className="mt-3" title={t(`${KEY}.title`)}>
      <Form layout="vertical">
        <Form.Item>
          <Segmented
            block
            value={background.type}
            options={Object.values(Type).map(
              (type: StoreSitesEnum.SectionBackgroundType) => ({
                value: type,
                label: t(`${KEY}.types.${type}`),
              }),
            )}
            onChange={(type) =>
              set({ type: type as StoreSitesEnum.SectionBackgroundType })
            }
          />
        </Form.Item>

        {background.type === Type.COLOR && colorField("color")}

        {background.type === Type.GRADIENT && (
          <>
            <div className="flex flex-wrap gap-x-6">
              {colorField("color")}
              {colorField("color2")}
            </div>
            <Form.Item label={t(`${KEY}.angle`)}>
              <Slider
                min={0}
                max={360}
                step={15}
                marks={{
                  0: "0°",
                  90: "90°",
                  180: "180°",
                  270: "270°",
                  360: "360°",
                }}
                tooltip={{ formatter: (value?: number) => `${value ?? 0}°` }}
                value={background.angle}
                onChange={(angle: number) => set({ angle })}
              />
            </Form.Item>
            <label className="mb-4 flex items-center justify-between gap-2">
              <span>{t(`${KEY}.isAnimated`)}</span>
              <Switch
                size="small"
                checked={background.isAnimated}
                onChange={(isAnimated: boolean) => set({ isAnimated })}
              />
            </label>
          </>
        )}

        {background.type === Type.IMAGE && (
          <>
            <Form.Item label={t(`${KEY}.image`)}>
              <ImageField
                storeId={storeId}
                value={background.imageUrl}
                onChange={(imageUrl) => set({ imageUrl })}
              />
            </Form.Item>
            <Form.Item label={t(`${KEY}.blur`)}>
              <Slider
                min={0}
                max={SECTION_BACKGROUND_LIMITS.blur}
                tooltip={{ formatter: (value?: number) => `${value ?? 0}px` }}
                value={background.blur}
                onChange={(blur: number) => set({ blur })}
              />
            </Form.Item>
          </>
        )}

        {isPainted && (
          <>
            <Form.Item label={t(`${KEY}.opacity`)}>
              <Slider
                min={0}
                max={100}
                step={5}
                marks={{ 0: "0%", 50: "50%", 100: "100%" }}
                tooltip={{ formatter: percent }}
                value={background.opacity}
                onChange={(opacity: number) => set({ opacity })}
              />
            </Form.Item>
            <Form.Item label={t(`${KEY}.fade`)} extra={t(`${KEY}.fadeHint`)}>
              <Slider
                min={0}
                max={100}
                step={5}
                marks={{ 0: "0%", 50: "50%", 100: "100%" }}
                tooltip={{ formatter: percent }}
                value={background.fade}
                onChange={(fade: number) => set({ fade })}
              />
            </Form.Item>
            <label className="mb-4 flex items-center justify-between gap-2">
              <span>{t(`${KEY}.isWide`)}</span>
              <Switch
                size="small"
                checked={background.isWide}
                onChange={(isWide: boolean) => set({ isWide })}
              />
            </label>
          </>
        )}

        <Form.Item label={t(`${KEY}.space`)} extra={t(`${KEY}.spaceHint`)}>
          <div className="grid grid-cols-2 gap-2">
            {(["spaceTop", "spaceBottom"] as const).map((side) => (
              <InputNumber
                key={side}
                className="w-full"
                min={0}
                max={SECTION_BACKGROUND_LIMITS.space}
                addonBefore={t(`${KEY}.${side}`)}
                addonAfter="px"
                placeholder="0"
                value={background[side]}
                onChange={(pixels: number | null) =>
                  set({ [side]: pixels || null })
                }
              />
            ))}
          </div>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default SectionBackgroundFields;
