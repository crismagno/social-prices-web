import { CANVAS_LIMITS, boxWithin } from "./store-site-canvas";
import {
  IStoreSiteBlock,
  SECTION_BOX_HEIGHT_RANGE,
  SPACER_LIMITS,
} from "./store-site-blocks";
import { MAP_LIMITS } from "./store-site-map";
import StoreSitesEnum from "./store-sites.enum";

/**
 * How tall a section is, as the owner pulls its bottom edge in the builder.
 * A spacer, a free canvas and a map already have a height of their own, which
 * is the one changed; any other section keeps an own height (`boxHeight`):
 * at least that tall, never cut shorter than what it shows.
 * Mirrors the API (store-site-blocks.ts, SECTION_HEIGHT_RANGE).
 */

const T = StoreSitesEnum.BlockType;

const clamp = (value: number, [min, max]: [number, number]): number =>
  Math.min(max, Math.max(min, Math.round(value)));

/** The range the height of a section of this kind moves in. */
export const sectionHeightRange = (
  type: StoreSitesEnum.BlockType,
): [number, number] => {
  switch (type) {
    case T.SPACER:
      return [SPACER_LIMITS.min, SPACER_LIMITS.max];
    case T.CANVAS:
      return CANVAS_LIMITS.height;
    case T.MAP:
      return MAP_LIMITS.height;
    default:
      return SECTION_BOX_HEIGHT_RANGE;
  }
};

/** Whether the height is the section's own kind of height, not `boxHeight`. */
export const hasNativeHeight = (type: StoreSitesEnum.BlockType): boolean =>
  type === T.SPACER || type === T.CANVAS || type === T.MAP;

/** The height the section has now; null when it is as tall as it needs. */
export const sectionHeightOf = (section: IStoreSiteBlock): number | null => {
  switch (section.type) {
    case T.SPACER:
      return section.settings.height ?? SPACER_LIMITS.initial;
    case T.CANVAS:
      return section.settings.canvas?.height ?? null;
    case T.MAP:
      return section.settings.map?.height ?? null;
    default:
      return section.settings.boxHeight;
  }
};

/**
 * The section with another height, kept in its range; null lets a section
 * with no height of its own be as tall as it needs again. A canvas made
 * shorter brings what no longer fits back inside it.
 */
export const withSectionHeight = (
  section: IStoreSiteBlock,
  height: number | null,
): IStoreSiteBlock => {
  const range: [number, number] = sectionHeightRange(section.type);
  const settings = section.settings;

  if (!hasNativeHeight(section.type)) {
    return {
      ...section,
      settings: {
        ...settings,
        boxHeight: height === null ? null : clamp(height, range),
      },
    };
  }

  // One with a height of its own always keeps one.
  if (height === null) {
    return section;
  }

  const next: number = clamp(height, range);

  switch (section.type) {
    case T.SPACER:
      return { ...section, settings: { ...settings, height: next } };
    case T.CANVAS:
      return settings.canvas
        ? {
            ...section,
            settings: {
              ...settings,
              canvas: {
                ...settings.canvas,
                height: next,
                elements: settings.canvas.elements.map((element) => ({
                  ...element,
                  ...boxWithin(element, next),
                })),
              },
            },
          }
        : section;
    default:
      return settings.map
        ? {
            ...section,
            settings: { ...settings, map: { ...settings.map, height: next } },
          }
        : section;
  }
};
