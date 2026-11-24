import {
  IStoreSiteBlock,
  MAX_BLOCKS,
  blockSettingsOf,
  isPartType,
  newBlock,
  newBlockButton,
  newBlockItem,
  newBlockKey,
  showableSection,
} from "./store-site-blocks";
import { IStoreSitePage, sitePagesOf } from "./store-site-pages";
import StoreSitesEnum from "./store-sites.enum";

/** The template's own parts a section can be. */
export type TPartType =
  | StoreSitesEnum.BlockType.MARQUEE
  | StoreSitesEnum.BlockType.CARDS
  | StoreSitesEnum.BlockType.PRODUCTS
  | StoreSitesEnum.BlockType.ABOUT
  | StoreSitesEnum.BlockType.PAGE_BODY;

type TTranslate = (key: string) => string;

const T = StoreSitesEnum.BlockType;

/**
 * The parts a page showed before the owner arranged it, in the templates'
 * order: the home shows them all; the products and about pages their own
 * part and then their content; any other page only its content.
 */
export const defaultPartsFor = (
  page: Pick<IStoreSitePage, "type"> | null | undefined,
): TPartType[] => {
  if (!page) {
    return [T.MARQUEE, T.CARDS, T.PRODUCTS, T.ABOUT];
  }

  if (page.type === StoreSitesEnum.SitePageType.PRODUCTS) {
    return [T.PRODUCTS, T.PAGE_BODY];
  }

  if (page.type === StoreSitesEnum.SitePageType.ABOUT) {
    return [T.ABOUT, T.PAGE_BODY];
  }

  return [T.PAGE_BODY];
};

/**
 * The key of a part a page shows by default: the same before and after the
 * owner arranges the page, so what is selected stays selected.
 */
export const defaultPartKey = (
  pageKey: string | null,
  type: StoreSitesEnum.BlockType,
): string =>
  `default-${pageKey ?? "home"}-${type.toLowerCase().replace(/_/g, "-")}`.slice(
    0,
    40,
  );

/** A part of the template as a section: it has nothing of its own. */
export const newPart = (
  type: StoreSitesEnum.BlockType,
  pageKey: string | null,
): IStoreSiteBlock => ({
  key: newBlockKey(),
  type,
  isActive: true,
  pageKey,
  kicker: null,
  title: null,
  subtitle: null,
  items: [],
  button: null,
  buttons: [],
  settings: blockSettingsOf(type, {}),
});

/**
 * The sections of one page, in order. A site its owner has not arranged
 * shows the template's parts first, as it always did, then its blocks.
 */
export const pageSections = (
  blocks: IStoreSiteBlock[],
  page: IStoreSitePage | null,
  isLayoutCustom: boolean,
): IStoreSiteBlock[] => {
  const pageKey: string | null = page?.key ?? null;
  const own: IStoreSiteBlock[] = blocks.filter(
    (block: IStoreSiteBlock) => block.pageKey === pageKey,
  );

  if (isLayoutCustom) {
    return own;
  }

  return [
    ...defaultPartsFor(page).map((type: TPartType) => ({
      ...newPart(type, pageKey),
      // Stable, so drawing twice gives the same keys.
      key: defaultPartKey(pageKey, type),
    })),
    ...own.filter((block: IStoreSiteBlock) => !isPartType(block.type)),
  ];
};

/** What visitors see of a page: active sections with something to show. */
export const visiblePageSections = (
  blocks: IStoreSiteBlock[],
  page: IStoreSitePage | null,
  isLayoutCustom: boolean,
): IStoreSiteBlock[] =>
  pageSections(blocks, page, isLayoutCustom)
    .filter((block: IStoreSiteBlock) => block.isActive)
    .map(showableSection)
    .filter((block: IStoreSiteBlock | null) => !!block) as IStoreSiteBlock[];

/**
 * The layout the owner starts arranging from: every page with the parts it
 * shows today in front of its blocks, the home first. Blocks of pages that
 * no longer exist are kept at the end, as they were.
 */
export const materializeLayout = (
  blocks: IStoreSiteBlock[],
  pages: IStoreSitePage[] | null | undefined,
): IStoreSiteBlock[] => {
  const all: (IStoreSitePage | null)[] = [null, ...sitePagesOf(pages)];
  const known: Set<string | null> = new Set(
    all.map((page: IStoreSitePage | null) => page?.key ?? null),
  );

  return [
    ...all.flatMap((page: IStoreSitePage | null) => {
      const pageKey: string | null = page?.key ?? null;
      const own: IStoreSiteBlock[] = blocks.filter(
        (block: IStoreSiteBlock) => block.pageKey === pageKey,
      );
      const present: Set<StoreSitesEnum.BlockType> = new Set(
        own.map((block: IStoreSiteBlock) => block.type),
      );

      return [
        ...defaultPartsFor(page)
          .filter((type: TPartType) => !present.has(type))
          .map((type: TPartType) => ({
            ...newPart(type, pageKey),
            key: defaultPartKey(pageKey, type),
          })),
        ...own,
      ];
    }),
    ...blocks.filter((block: IStoreSiteBlock) => !known.has(block.pageKey)),
  ];
};

/** Whether a section of this type can still go on this page. */
export const canAdd = (
  type: StoreSitesEnum.BlockType,
  pageKey: string | null,
  blocks: IStoreSiteBlock[],
): boolean => {
  if (blocks.length >= MAX_BLOCKS) {
    return false;
  }

  if (!isPartType(type)) {
    return true;
  }

  if (type === T.PAGE_BODY && pageKey === null) {
    return false;
  }

  return !blocks.some(
    (block: IStoreSiteBlock) =>
      block.pageKey === pageKey && block.type === type,
  );
};

const SAMPLE = "storeSite.editor.builder.samples";

/** A new section of any kind, with sample words so the preview shows it. */
export const newSection = (
  type: StoreSitesEnum.BlockType,
  pageKey: string | null,
  t: TTranslate,
): IStoreSiteBlock => {
  if (isPartType(type)) {
    return newPart(type as TPartType, pageKey);
  }

  if (StoreSitesEnum.CONTENT_BLOCK_TYPES.includes(type)) {
    return { ...newBlock(type, t), pageKey };
  }

  // Pieces start empty, like a part, and get their own words below.
  const base: IStoreSiteBlock = newPart(type, pageKey);
  const settings = blockSettingsOf(type, {});

  switch (type) {
    case T.TEXT:
      return {
        ...base,
        settings,
        kicker: t(`${SAMPLE}.TEXT.kicker`),
        title: t(`${SAMPLE}.TEXT.title`),
        subtitle: t(`${SAMPLE}.TEXT.text`),
      };
    case T.BUTTONS:
      return {
        ...base,
        settings,
        buttons: [
          newBlockButton({ label: t(`${SAMPLE}.BUTTONS.first`) }),
          newBlockButton({
            label: t(`${SAMPLE}.BUTTONS.second`),
            variant: StoreSitesEnum.ButtonVariant.OUTLINE,
          }),
        ],
      };
    case T.BOX:
      return {
        ...base,
        settings,
        title: t(`${SAMPLE}.BOX.title`),
        items: [0, 1, 2].map((index: number) => ({
          ...newBlockItem(T.BOX),
          title: t(`${SAMPLE}.BOX.items.${index}.title`),
          text: t(`${SAMPLE}.BOX.items.${index}.text`),
        })),
      };
    case T.IMAGE:
      return { ...base, settings, items: [newBlockItem(T.IMAGE)] };
    default:
      // A video, a spacer or a divider: nothing to say yet.
      return { ...base, settings };
  }
};

const keysOfPage = (
  blocks: IStoreSiteBlock[],
  pageKey: string | null,
): string[] =>
  blocks
    .filter((block: IStoreSiteBlock) => block.pageKey === pageKey)
    .map((block: IStoreSiteBlock) => block.key);

/**
 * Puts a section at a place of its page. The place counts only that page's
 * sections; the other pages keep their order and their place in the list.
 */
export const insertSection = (
  blocks: IStoreSiteBlock[],
  section: IStoreSiteBlock,
  atIndex: number,
): IStoreSiteBlock[] => {
  const pageKeys: string[] = keysOfPage(blocks, section.pageKey);
  const clamped: number = Math.max(0, Math.min(atIndex, pageKeys.length));

  if (!pageKeys.length) {
    return [...blocks, section];
  }

  const anchor: string =
    clamped < pageKeys.length ? pageKeys[clamped] : pageKeys[pageKeys.length - 1];
  const at: number = blocks.findIndex(
    (block: IStoreSiteBlock) => block.key === anchor,
  );
  const position: number = clamped < pageKeys.length ? at : at + 1;

  return [...blocks.slice(0, position), section, ...blocks.slice(position)];
};

/** Moves a section to another place of its own page. */
export const moveSection = (
  blocks: IStoreSiteBlock[],
  key: string,
  toIndex: number,
): IStoreSiteBlock[] => {
  const moving: IStoreSiteBlock | undefined = blocks.find(
    (block: IStoreSiteBlock) => block.key === key,
  );

  if (!moving) {
    return blocks;
  }

  const without: IStoreSiteBlock[] = blocks.filter(
    (block: IStoreSiteBlock) => block.key !== key,
  );

  return insertSection(without, moving, toIndex);
};

/** A copy right after the original, with keys of its own. Parts are unique. */
export const duplicateSection = (
  blocks: IStoreSiteBlock[],
  key: string,
): IStoreSiteBlock[] => {
  const original: IStoreSiteBlock | undefined = blocks.find(
    (block: IStoreSiteBlock) => block.key === key,
  );

  if (!original || isPartType(original.type) || blocks.length >= MAX_BLOCKS) {
    return blocks;
  }

  const copy: IStoreSiteBlock = {
    ...original,
    key: newBlockKey(),
    items: original.items.map((item) => ({ ...item, key: newBlockKey() })),
  };

  const at: number = blocks.indexOf(original);

  return [...blocks.slice(0, at + 1), copy, ...blocks.slice(at + 1)];
};
