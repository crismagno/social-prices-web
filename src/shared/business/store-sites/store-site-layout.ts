import {
  IStoreSiteBlock,
  IStoreSiteBlockItem,
  MAX_BLOCKS,
  blockSettingsOf,
  isOwnPartType,
  isPartType,
  isUniquePartType,
  newBlock,
  newBlockButton,
  newBlockItem,
  newBlockKey,
  showableSection,
} from "./store-site-blocks";
import { IStoreSiteAbout, siteAboutOf } from "./store-site-about";
import { newCanvasElement } from "./store-site-canvas";
import { newMapPin } from "./store-site-map";
import { siteMarqueeStyleOf } from "./store-site-marquee-style";
import { IStoreSitePage, sitePagesOf } from "./store-site-pages";
import { IStoreSiteMarquee, IStoreSiteSection } from "./store-site.interface";
import { IStoreSiteMarqueeStyle } from "./store-site-marquee-style";
import StoreSitesEnum from "./store-sites.enum";

/** The template's own parts a section can be. */
export type TPartType =
  | StoreSitesEnum.BlockType.HERO
  | StoreSitesEnum.BlockType.MARQUEE
  | StoreSitesEnum.BlockType.CARDS
  | StoreSitesEnum.BlockType.PRODUCTS
  | StoreSitesEnum.BlockType.ABOUT
  | StoreSitesEnum.BlockType.PAGE_BODY;

/** The parts each template draws its own way; the entrance it draws apart. */
export type TTemplatePartType = Exclude<
  TPartType,
  StoreSitesEnum.BlockType.HERO
>;

type TTranslate = (key: string) => string;

const T = StoreSitesEnum.BlockType;

/**
 * The parts a page showed before the owner arranged it, in the templates'
 * order, always under the entrance: the home shows them all; the products and
 * about pages their own part and then their content; any other page only its
 * content.
 */
export const defaultPartsFor = (
  page: Pick<IStoreSitePage, "type"> | null | undefined,
): TPartType[] => {
  if (!page) {
    return [T.HERO, T.MARQUEE, T.CARDS, T.PRODUCTS, T.ABOUT];
  }

  if (page.type === StoreSitesEnum.SitePageType.PRODUCTS) {
    return [T.HERO, T.PRODUCTS, T.PAGE_BODY];
  }

  if (page.type === StoreSitesEnum.SitePageType.ABOUT) {
    return [T.HERO, T.ABOUT, T.PAGE_BODY];
  }

  return [T.HERO, T.PAGE_BODY];
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

  // A page added after the owner arranged the site has no sections yet: it
  // shows its own parts (its texts, at least) until the owner arranges it.
  if (isLayoutCustom) {
    return withHero(
      own.length || pageKey === null ? own : defaultSectionsOf(page),
      pageKey,
    );
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

/**
 * The sections of a page with its entrance among them. A page arranged before
 * the entrance could be moved has none in its list: it gets one at the top,
 * where it always was. That is why the entrance is hidden, never removed.
 */
const withHero = (
  sections: IStoreSiteBlock[],
  pageKey: string | null,
): IStoreSiteBlock[] =>
  sections.some((section: IStoreSiteBlock) => section.type === T.HERO)
    ? sections
    : [
        { ...newPart(T.HERO, pageKey), key: defaultPartKey(pageKey, T.HERO) },
        ...sections,
      ];

/** Whether the page starts with its entrance, which then carries the menu. */
export const isHeroOnTop = (sections: IStoreSiteBlock[]): boolean =>
  sections[0]?.type === T.HERO && sections[0].isActive;

/** One item of a menu of tabs, with the sections of the page it shows. */
export interface ITabsEntry {
  key: string;
  label: string;
  sections: IStoreSiteBlock[];
}

/** The item of a menu of tabs a section is shown by. */
export interface ITabOwner {
  tabsKey: string;
  itemKey: string;
  label: string;
}

/** A menu of tabs shows any section but the entrance and another menu. */
export const canBeTab = (section: IStoreSiteBlock): boolean =>
  section.type !== T.HERO && section.type !== T.TABS;

/**
 * Which item of which menu of tabs shows each section of a page. A section
 * goes with the first item that points to it, and the menu and the section
 * must both be on the page.
 */
export const tabOwnersOf = (
  sections: IStoreSiteBlock[],
): Map<string, ITabOwner> => {
  const owners: Map<string, ITabOwner> = new Map();

  sections
    .filter((section: IStoreSiteBlock) => section.type === T.TABS)
    .forEach((tabs: IStoreSiteBlock) =>
      tabs.items.forEach((item) =>
        item.sectionKeys.forEach((sectionKey: string) => {
          const section: IStoreSiteBlock | undefined = sections.find(
            (each: IStoreSiteBlock) => each.key === sectionKey,
          );

          if (section && canBeTab(section) && !owners.has(sectionKey)) {
            owners.set(sectionKey, {
              tabsKey: tabs.key,
              itemKey: item.key,
              label: item.title?.trim() ?? "",
            });
          }
        }),
      ),
    );

  return owners;
};

/**
 * What the menus of tabs of a page show. Each item with a name shows its
 * sections, in the order the page has them; a section an item shows is drawn
 * only inside its menu, so the page leaves it out of its own order.
 */
export const tabsLayoutOf = (
  sections: IStoreSiteBlock[],
): { taken: Set<string>; entriesOf: (tabsKey: string) => ITabsEntry[] } => {
  const owners: Map<string, ITabOwner> = tabOwnersOf(sections);
  const taken: Set<string> = new Set();
  const entries: Map<string, ITabsEntry[]> = new Map();

  sections
    .filter((section: IStoreSiteBlock) => section.type === T.TABS)
    .forEach((tabs: IStoreSiteBlock) =>
      entries.set(
        tabs.key,
        tabs.items
          .map((item) => ({
            key: item.key,
            label: item.title?.trim() ?? "",
            sections: sections.filter(
              (each: IStoreSiteBlock) =>
                owners.get(each.key)?.tabsKey === tabs.key &&
                owners.get(each.key)?.itemKey === item.key,
            ),
          }))
          .filter((entry: ITabsEntry) => {
            const isShown: boolean = !!entry.label && entry.sections.length > 0;

            if (isShown) {
              entry.sections.forEach((each: IStoreSiteBlock) =>
                taken.add(each.key),
              );
            }

            return isShown;
          }),
      ),
    );

  return { taken, entriesOf: (tabsKey: string) => entries.get(tabsKey) ?? [] };
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

/** The parts a page shows by default, with the keys they keep once arranged. */
const defaultSectionsOf = (page: IStoreSitePage | null): IStoreSiteBlock[] =>
  defaultPartsFor(page).map((type: TPartType) => ({
    ...newPart(type, page?.key ?? null),
    key: defaultPartKey(page?.key ?? null, type),
  }));

/**
 * An arranged site with every page in it: a page with no section yet (added
 * after the owner arranged the site) gets its own parts, as it shows them.
 */
export const withEveryPage = (
  blocks: IStoreSiteBlock[],
  pages: IStoreSitePage[] | null | undefined,
): IStoreSiteBlock[] => {
  const all: IStoreSiteBlock[] = [
    ...blocks,
    ...sitePagesOf(pages)
      .filter(
        (page: IStoreSitePage) =>
          !blocks.some((block: IStoreSiteBlock) => block.pageKey === page.key),
      )
      .flatMap(defaultSectionsOf),
  ];

  // A page arranged before the entrance could be moved gets it at its top.
  return [null, ...sitePagesOf(pages).map((page: IStoreSitePage) => page.key)]
    .filter(
      (pageKey: string | null) =>
        !all.some(
          (block: IStoreSiteBlock) =>
            block.pageKey === pageKey && block.type === T.HERO,
        ),
    )
    .reduce(
      (result: IStoreSiteBlock[], pageKey: string | null) =>
        insertSection(
          result,
          { ...newPart(T.HERO, pageKey), key: defaultPartKey(pageKey, T.HERO) },
          0,
        ),
      all,
    );
};

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

  if (!isUniquePartType(type)) {
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
  // A strip or cards start with sample content of their own.
  if (type === T.MARQUEE) {
    return {
      ...newPart(type, pageKey),
      items: [0, 1, 2].map((index: number) => ({
        ...newBlockItem(type),
        title: t(`${SAMPLE}.MARQUEE.items.${index}`),
      })),
      settings: blockSettingsOf(type, { isOwn: true }),
    };
  }

  if (type === T.CARDS) {
    return {
      ...newPart(type, pageKey),
      items: [0, 1].map((index: number) => ({
        ...newBlockItem(type),
        title: t(`${SAMPLE}.CARDS.items.${index}.title`),
        text: t(`${SAMPLE}.CARDS.items.${index}.text`),
      })),
      settings: blockSettingsOf(type, { isOwn: true }),
    };
  }

  if (type === T.ABOUT) {
    return {
      ...newPart(type, pageKey),
      title: t(`${SAMPLE}.ABOUT.title`),
      items: [{ ...newBlockItem(type), text: t(`${SAMPLE}.ABOUT.text`) }],
      settings: blockSettingsOf(type, { isOwn: true }),
    };
  }

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
    case T.TABS:
      // Two items to name and point at sections of this page.
      return {
        ...base,
        settings,
        items: [0, 1].map((index: number) => ({
          ...newBlockItem(T.TABS),
          title: t(`${SAMPLE}.TABS.items.${index}`),
        })),
      };
    case T.MAP:
      // One pin to start from: the owner moves it to where the store is.
      return {
        ...base,
        title: t(`${SAMPLE}.MAP.title`),
        settings: blockSettingsOf(type, {
          map: {
            pins: [
              {
                ...newMapPin(-23.55052, -46.633308, t(`${SAMPLE}.MAP.pin`)),
              },
            ],
          },
        }),
      };
    case T.CANVAS: {
      // A panel, a title and a button to move about: something to start from.
      const E = StoreSitesEnum.CanvasElementType;

      return {
        ...base,
        settings: blockSettingsOf(type, {
          canvas: {
            height: 420,
            elements: [
              {
                ...newCanvasElement(E.BOX, null, 0, null),
                x: 60,
                y: 50,
                width: 1080,
                height: 320,
              },
              {
                ...newCanvasElement(
                  E.TEXT,
                  t(`${SAMPLE}.CANVAS.title`),
                  0,
                  null,
                ),
                x: 120,
                y: 110,
                width: 640,
                height: 110,
                fontSize: 52,
              },
              {
                ...newCanvasElement(
                  E.BUTTON,
                  t(`${SAMPLE}.CANVAS.button`),
                  0,
                  newBlockButton(),
                ),
                x: 120,
                y: 250,
              },
            ],
          },
        }),
      };
    }
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
    clamped < pageKeys.length
      ? pageKeys[clamped]
      : pageKeys[pageKeys.length - 1];
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

/** A copy right after the original, with keys of its own. Unique parts stay one. */
export const duplicateSection = (
  blocks: IStoreSiteBlock[],
  key: string,
): IStoreSiteBlock[] => {
  const original: IStoreSiteBlock | undefined = blocks.find(
    (block: IStoreSiteBlock) => block.key === key,
  );

  if (
    !original ||
    isUniquePartType(original.type) ||
    blocks.length >= MAX_BLOCKS
  ) {
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

/** What a site had for every strip and every set of cards, before each had its own. */
export interface ISharedPartContent {
  sections: IStoreSiteSection[];
  marquee: IStoreSiteMarquee;
  marqueeStyle?: Partial<IStoreSiteMarqueeStyle> | null;
  about?: Partial<IStoreSiteAbout> | null;
}

/**
 * A strip or cards with content of its own. One placed before they had any
 * takes a copy of what the site had for all of them, so nothing changes on
 * the page, and from then on it is only its own.
 */
export const ownPartOf = (
  block: IStoreSiteBlock,
  shared: ISharedPartContent,
): IStoreSiteBlock => {
  if (!isOwnPartType(block.type) || block.settings.isOwn === true) {
    return block;
  }

  const item = (patch: Partial<IStoreSiteBlockItem>): IStoreSiteBlockItem => ({
    ...newBlockItem(block.type),
    ...patch,
  });

  if (block.type === T.MARQUEE) {
    return {
      ...block,
      // A strip the owner had switched off stays hidden.
      isActive: block.isActive && shared.marquee.isActive !== false,
      items: shared.marquee.items
        .filter((phrase: string) => phrase.trim())
        .map((phrase: string) => item({ title: phrase.trim() })),
      settings: {
        ...block.settings,
        isOwn: true,
        marquee: siteMarqueeStyleOf(shared.marqueeStyle),
      },
    };
  }

  if (block.type === T.ABOUT) {
    const about: IStoreSiteAbout = siteAboutOf(shared.about);

    return {
      ...block,
      // An about the owner had switched off stays hidden.
      isActive: block.isActive && about.isActive,
      title: about.title,
      items: about.texts
        .filter((text: string) => text.trim())
        .map((text: string) => item({ text })),
      settings: {
        ...block.settings,
        isOwn: true,
        media: about.media,
        mediaPosition: about.mediaPosition,
      },
    };
  }

  return {
    ...block,
    items: shared.sections
      .filter((section: IStoreSiteSection) => section.isActive)
      .map((section: IStoreSiteSection) =>
        item({
          key: section.key.slice(0, 40),
          title: section.title,
          text: section.description,
          imageUrl: section.imageUrl,
        }),
      ),
    settings: { ...block.settings, isOwn: true },
  };
};
