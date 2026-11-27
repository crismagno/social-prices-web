"use client";

import { Divider, Form, Switch } from "antd";

import useLanguageData from "../../../data/context/language/useLanguageData";
import { IStoreSiteBlock } from "../../../shared/business/store-sites/store-site-blocks";
import {
  IStoreSiteHeroOptions,
  heroOptionsOf,
} from "../../../shared/business/store-sites/store-site-hero";
import { pageSections } from "../../../shared/business/store-sites/store-site-layout";
import { sitePagesOf } from "../../../shared/business/store-sites/store-site-pages";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import HeroOptionsControls, { THeroPiece } from "./HeroOptionsControls";
import { arrangedBlocks } from "./useSiteBuilder";
import { IStoreSiteEditor } from "./useStoreSiteEditor";

interface Props {
  editor: IStoreSiteEditor;
}

const PIECES: THeroPiece[] = [
  "isTaglineVisible",
  "isTitleVisible",
  "isSubtitleVisible",
  "isButtonVisible",
  "isFeaturedVisible",
];

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

      <HeroOptionsControls
        options={options}
        set={set}
        pages={pages}
        pieces={PIECES}
      />
      <Divider />
    </>
  );
};

export default HeroOptionsFields;
