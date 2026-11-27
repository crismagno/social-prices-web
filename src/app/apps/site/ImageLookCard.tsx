"use client";

import { Card, Segmented } from "antd";

import useLanguageData from "../../../data/context/language/useLanguageData";
import {
  IMAGE_RATIO_VALUE,
  IMAGE_SHAPE_RADIUS,
  IStoreSiteImageLook,
  siteImageStyleOf,
  TSiteImagePlace,
} from "../../../shared/business/store-sites/store-site-image-style";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import { IStoreSiteEditor } from "./useStoreSiteEditor";

interface Props {
  editor: IStoreSiteEditor;
  place: TSiteImagePlace;
}

const Shape = StoreSitesEnum.ImageShape;
const Ratio = StoreSitesEnum.ImageRatio;

/** A small picture of a shape, as the images will be cut. */
const ShapeSample = ({ shape }: { shape: StoreSitesEnum.ImageShape }) => (
  <span
    aria-hidden
    className="block w-9 h-10 mx-auto"
    style={{
      background:
        "linear-gradient(135deg, var(--ant-color-primary, #1677ff), #9cc4ff)",
      opacity: shape === Shape.TEMPLATE ? 0.35 : 0.9,
      borderRadius:
        shape === Shape.TEMPLATE ? "6px" : IMAGE_SHAPE_RADIUS[shape],
      aspectRatio: shape === Shape.CIRCLE ? "1 / 1" : undefined,
      height: shape === Shape.CIRCLE ? "auto" : undefined,
      border: shape === Shape.TEMPLATE ? "1px dashed currentColor" : undefined,
    }}
  />
);

/**
 * The shape and proportion of the images of one place of the site, shown in
 * the tab of that place. It keeps the template's own until the owner picks
 * another.
 */
const ImageLookCard = ({ editor, place }: Props) => {
  const { t } = useLanguageData();

  if (!editor.draft) {
    return null;
  }

  const look: IStoreSiteImageLook = siteImageStyleOf(editor.draft.imageStyle)[
    place
  ];

  // From the draft as it is when applied, like every change of the editor.
  const set = (patch: Partial<IStoreSiteImageLook>): void =>
    editor.update((draft) => {
      const current = siteImageStyleOf(draft.imageStyle);

      return {
        imageStyle: siteImageStyleOf({
          ...current,
          [place]: { ...current[place], ...patch },
        }),
      };
    });

  return (
    <Card size="small" title={t(`storeSite.editor.images.places.${place}`)}>
      <p className="text-xs opacity-60 mt-0 mb-3">
        {t(`storeSite.editor.images.hints.${place}`)}
      </p>
      <div className="text-xs font-medium mb-2">
        {t("storeSite.editor.images.shape")}
      </div>
      <div className="grid grid-cols-4 gap-2 mb-4">
        {Object.values(Shape).map((shape: StoreSitesEnum.ImageShape) => {
          const isOn: boolean = look.shape === shape;

          return (
            <button
              key={shape}
              type="button"
              aria-pressed={isOn}
              onClick={() => set({ shape })}
              className={`flex flex-col items-center gap-1.5 rounded-lg border py-2 px-1 text-[11px] leading-tight transition-colors ${
                isOn
                  ? "border-[var(--ant-color-primary,#1677ff)] bg-[var(--ant-color-primary-bg,#e6f4ff)]"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <ShapeSample shape={shape} />
              {t(`storeSite.editor.images.shapes.${shape}`)}
            </button>
          );
        })}
      </div>

      <div className="text-xs font-medium mb-2">
        {t("storeSite.editor.images.ratio")}
      </div>
      <Segmented<StoreSitesEnum.ImageRatio>
        block
        size="small"
        value={look.ratio}
        disabled={look.shape === Shape.CIRCLE}
        onChange={(ratio) => set({ ratio })}
        options={Object.values(Ratio).map(
          (ratio: StoreSitesEnum.ImageRatio) => ({
            value: ratio,
            label:
              ratio === Ratio.TEMPLATE
                ? t("storeSite.editor.images.template")
                : IMAGE_RATIO_VALUE[ratio].replace(/ /g, ""),
          }),
        )}
      />
      {look.shape === Shape.CIRCLE && (
        <p className="text-xs opacity-60 mt-2 mb-0">
          {t("storeSite.editor.images.circleHint")}
        </p>
      )}
    </Card>
  );
};

export default ImageLookCard;
