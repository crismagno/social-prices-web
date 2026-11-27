"use client";

import { useCallback, useMemo, useState } from "react";

import { TBuilderAction } from "../../../components/store-site/shared/blocks/builder-types";
import useLanguageData from "../../../data/context/language/useLanguageData";
import { IStoreSiteBlock } from "../../../shared/business/store-sites/store-site-blocks";
import {
  canAdd,
  duplicateSection,
  insertSection,
  materializeLayout,
  moveSection,
  newSection,
  pageSections,
  withEveryPage,
} from "../../../shared/business/store-sites/store-site-layout";
import {
  IStoreSitePage,
  sitePagesOf,
} from "../../../shared/business/store-sites/store-site-pages";
import { ISaveStoreSite } from "../../../shared/business/store-sites/store-site.interface";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import { IStoreSiteEditor } from "./useStoreSiteEditor";

export interface ISiteBuilder {
  /** The page being built; null is the home. */
  pageKey: string | null;
  page: IStoreSitePage | null;
  setPageKey: (pageKey: string | null) => void;
  /** The sections of that page, in order, as the preview frames them. */
  sections: IStoreSiteBlock[];
  selectedKey: string | null;
  selected: IStoreSiteBlock | null;
  select: (key: string | null) => void;
  /** Whether the builder tab is open: only then the preview frames sections. */
  isActive: boolean;
  setIsActive: (isActive: boolean) => void;
  canAdd: (type: StoreSitesEnum.BlockType) => boolean;
  /** Adds a section after the selected one, or at the end of the page. */
  add: (type: StoreSitesEnum.BlockType) => void;
  /** Applies what the owner did in the preview, or in the panel. */
  apply: (action: TBuilderAction) => void;
  /**
   * A new section made for one item of a menu of tabs: it goes on the page
   * right after what that item already shows (or after the menu), the item
   * shows it, and it is picked so the owner fills it in.
   */
  addToTab: (
    tabsKey: string,
    itemKey: string,
    type: StoreSitesEnum.BlockType,
  ) => void;
  /** Changes one section, from the section as it is when applied. */
  updateSection: (
    key: string,
    change: (section: IStoreSiteBlock) => Partial<IStoreSiteBlock>,
  ) => void;
}

/** The layout the owner arranges: the site's own the first time they touch it. */
export const arrangedBlocks = (draft: ISaveStoreSite): IStoreSiteBlock[] =>
  draft.isLayoutCustom
    ? withEveryPage(draft.blocks, draft.pages)
    : materializeLayout(draft.blocks, draft.pages);

/**
 * The page builder of the editor: which page is built, which section is
 * picked, and every change to the sections. A site its owner never arranged
 * gets its current layout the first time something changes, so nothing moves
 * on the public site until it is saved.
 */
const useSiteBuilder = (editor: IStoreSiteEditor): ISiteBuilder => {
  const { t } = useLanguageData();

  const [pageKey, setPageKeyState] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [isActive, setIsActive] = useState<boolean>(false);

  const draft: ISaveStoreSite | null = editor.draft;

  const page: IStoreSitePage | null = useMemo(
    () =>
      sitePagesOf(draft?.pages).find(
        (candidate: IStoreSitePage) => candidate.key === pageKey,
      ) ?? null,
    [draft?.pages, pageKey],
  );

  const sections: IStoreSiteBlock[] = useMemo(
    () => (draft ? pageSections(draft.blocks, page, draft.isLayoutCustom) : []),
    [draft, page],
  );

  const selected: IStoreSiteBlock | null =
    sections.find((section: IStoreSiteBlock) => section.key === selectedKey) ??
    null;

  const setPageKey = useCallback((next: string | null): void => {
    setPageKeyState(next);
    setSelectedKey(null);
  }, []);

  /** Every change goes through here: the layout is the owner's from now on. */
  const change = useCallback(
    (next: (blocks: IStoreSiteBlock[]) => IStoreSiteBlock[]): void =>
      editor.update((current: ISaveStoreSite) => ({
        blocks: next(arrangedBlocks(current)),
        isLayoutCustom: true,
      })),
    [editor],
  );

  const canAddType = useCallback(
    (type: StoreSitesEnum.BlockType): boolean =>
      !!draft && canAdd(type, page?.key ?? null, arrangedBlocks(draft)),
    [draft, page],
  );

  const insert = useCallback(
    (type: StoreSitesEnum.BlockType, atIndex: number): void => {
      if (!canAddType(type)) {
        return;
      }

      const section: IStoreSiteBlock = newSection(type, page?.key ?? null, t);

      change((blocks: IStoreSiteBlock[]) =>
        insertSection(blocks, section, atIndex),
      );
      setSelectedKey(section.key);
    },
    [canAddType, change, page, t],
  );

  const apply = useCallback(
    (action: TBuilderAction): void => {
      switch (action.kind) {
        case "select":
          setSelectedKey(action.key);
          return;
        case "page":
          setPageKey(action.pageKey);
          return;
        case "insert":
          insert(action.type, action.atIndex);
          return;
        case "move":
          change((blocks) => moveSection(blocks, action.key, action.toIndex));
          setSelectedKey(action.key);
          return;
        case "duplicate":
          change((blocks) => duplicateSection(blocks, action.key));
          return;
        case "toggle":
          change((blocks) =>
            blocks.map((block: IStoreSiteBlock) =>
              block.key === action.key
                ? { ...block, isActive: !block.isActive }
                : block,
            ),
          );
          return;
        case "remove":
          change((blocks) =>
            blocks.filter(
              (block: IStoreSiteBlock) =>
                block.key !== action.key ||
                // The entrance is hidden, never removed: a page without one
                // in its list is one arranged before it could be moved.
                block.type === StoreSitesEnum.BlockType.HERO,
            ),
          );
          setSelectedKey((current: string | null) =>
            current === action.key ? null : current,
          );
          return;
      }
    },
    [change, insert, setPageKey],
  );

  const add = useCallback(
    (type: StoreSitesEnum.BlockType): void => {
      const at: number = sections.findIndex(
        (section: IStoreSiteBlock) => section.key === selectedKey,
      );

      insert(type, at >= 0 ? at + 1 : sections.length);
    },
    [insert, sections, selectedKey],
  );

  const addToTab = useCallback(
    (
      tabsKey: string,
      itemKey: string,
      type: StoreSitesEnum.BlockType,
    ): void => {
      if (!canAddType(type)) {
        return;
      }

      const section: IStoreSiteBlock = newSection(type, page?.key ?? null, t);

      change((blocks: IStoreSiteBlock[]) => {
        const own: IStoreSiteBlock[] = blocks.filter(
          (block: IStoreSiteBlock) => block.pageKey === section.pageKey,
        );

        const shown: string[] =
          own
            .find((block: IStoreSiteBlock) => block.key === tabsKey)
            ?.items.find((item) => item.key === itemKey)?.sectionKeys ?? [];

        // After the last section the item shows; with none, after the menu.
        const after: number = own.reduce(
          (last: number, block: IStoreSiteBlock, at: number) =>
            block.key === tabsKey || shown.includes(block.key) ? at : last,
          own.length - 1,
        );

        return insertSection(blocks, section, after + 1).map(
          (block: IStoreSiteBlock) =>
            block.key === tabsKey
              ? {
                  ...block,
                  items: block.items.map((item) =>
                    item.key === itemKey
                      ? {
                          ...item,
                          sectionKeys: [...item.sectionKeys, section.key],
                        }
                      : item,
                  ),
                }
              : block,
        );
      });
      setSelectedKey(section.key);
    },
    [canAddType, change, page, t],
  );

  const updateSection = useCallback(
    (
      key: string,
      update: (section: IStoreSiteBlock) => Partial<IStoreSiteBlock>,
    ): void =>
      change((blocks: IStoreSiteBlock[]) =>
        blocks.map((block: IStoreSiteBlock) =>
          block.key === key ? { ...block, ...update(block) } : block,
        ),
      ),
    [change],
  );

  return {
    pageKey: page?.key ?? null,
    page,
    setPageKey,
    sections,
    selectedKey: selected?.key ?? null,
    selected,
    select: setSelectedKey,
    isActive,
    setIsActive,
    canAdd: canAddType,
    add,
    apply,
    addToTab,
    updateSection,
  };
};

export default useSiteBuilder;
