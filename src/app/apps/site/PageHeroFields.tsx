"use client";

import { Divider, Form, Input, InputNumber, Switch } from "antd";

import useLanguageData from "../../../data/context/language/useLanguageData";
import { IStoreSiteBlock } from "../../../shared/business/store-sites/store-site-blocks";
import {
  IStoreSiteHeroOptions,
  IStoreSitePageHero,
  PAGE_HERO_HEIGHT_RANGE,
  PAGE_HERO_TEXT_MAX,
  newPageHero,
  pageHeroOf,
} from "../../../shared/business/store-sites/store-site-hero";
import { pageSections } from "../../../shared/business/store-sites/store-site-layout";
import {
  IStoreSitePage,
  sitePagesOf,
} from "../../../shared/business/store-sites/store-site-pages";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import { PAGE_TOP_HEIGHT } from "../../../components/store-site/shared/site-page-view";
import HeroOptionsControls, { THeroPiece } from "./HeroOptionsControls";
import ImageField from "./ImageField";
import { arrangedBlocks } from "./useSiteBuilder";
import { IStoreSiteEditor } from "./useStoreSiteEditor";

interface Props {
  editor: IStoreSiteEditor;
  storeId: string;
  page: IStoreSitePage;
}

// A line or picture the page does not want is left empty: only the button,
// which always has words, needs a switch.
const PIECES: THeroPiece[] = ["isButtonVisible"];

const KEY = "storeSite.editor.pages.hero";

/**
 * The entrance of one page: whether the page shows it and, when the page has
 * its own, its line, button, pictures, height and colours. Without its own,
 * the page follows the home's.
 */
const PageHeroFields = ({ editor, storeId, page }: Props) => {
  const { t } = useLanguageData();

  if (!editor.draft) {
    return null;
  }

  const { draft } = editor;

  const own: IStoreSitePageHero | null = pageHeroOf(page.hero);

  const isShown: boolean =
    pageSections(draft.blocks, page, draft.isLayoutCustom).find(
      (section: IStoreSiteBlock) =>
        section.type === StoreSitesEnum.BlockType.HERO,
    )?.isActive !== false;

  // The entrance of a page is one of its sections: hiding it arranges the
  // site, as hiding it in the builder does.
  const setIsShown = (isActive: boolean): void =>
    editor.update((current) => ({
      blocks: arrangedBlocks(current).map((block: IStoreSiteBlock) =>
        block.type === StoreSitesEnum.BlockType.HERO &&
        block.pageKey === page.key
          ? { ...block, isActive }
          : block,
      ),
      isLayoutCustom: true,
    }));

  // From the draft as it is when applied: an upload finishes later.
  const setHero = (
    change: (current: IStoreSitePageHero) => IStoreSitePageHero | null,
  ): void =>
    editor.update((current) => ({
      pages: current.pages.map((candidate: IStoreSitePage) =>
        candidate.key === page.key
          ? {
              ...candidate,
              hero: change(pageHeroOf(candidate.hero) ?? newPageHero()),
            }
          : candidate,
      ),
    }));

  const patch = (values: Partial<IStoreSitePageHero>): void =>
    setHero((current) => ({ ...current, ...values }));

  const setOptions = (
    change: (current: IStoreSiteHeroOptions) => Partial<IStoreSiteHeroOptions>,
  ): void =>
    setHero((current) => ({
      ...current,
      options: { ...current.options, ...change(current.options) },
    }));

  const [minHeight, maxHeight] = PAGE_HERO_HEIGHT_RANGE;

  return (
    <>
      <Divider orientation="left" plain>
        {t(`${KEY}.title`)}
      </Divider>

      <Form.Item label={t(`${KEY}.show`)} extra={t(`${KEY}.showHint`)}>
        <Switch checked={isShown} onChange={setIsShown} />
      </Form.Item>

      {isShown && (
        <Form.Item label={t(`${KEY}.own`)} extra={t(`${KEY}.ownHint`)}>
          <Switch
            checked={!!own}
            onChange={(isOwn: boolean) =>
              setHero((current) => (isOwn ? current : null))
            }
          />
        </Form.Item>
      )}

      {isShown && own && (
        <>
          <Form.Item label={t(`${KEY}.tagline`)}>
            <Input
              maxLength={PAGE_HERO_TEXT_MAX}
              allowClear
              value={own.tagline ?? ""}
              onChange={(event) =>
                patch({ tagline: event.target.value || null })
              }
            />
          </Form.Item>

          {own.options.isButtonVisible && (
            <Form.Item
              label={t(`${KEY}.ctaLabel`)}
              extra={t(`${KEY}.ctaLabelHint`)}
            >
              <Input
                maxLength={PAGE_HERO_TEXT_MAX}
                allowClear
                value={own.ctaLabel ?? ""}
                onChange={(event) =>
                  patch({ ctaLabel: event.target.value || null })
                }
              />
            </Form.Item>
          )}

          <Form.Item
            label={t(`${KEY}.background`)}
            extra={t(`${KEY}.backgroundHint`)}
          >
            <ImageField
              storeId={storeId}
              value={own.backgroundImageUrl}
              onChange={(backgroundImageUrl) => patch({ backgroundImageUrl })}
            />
          </Form.Item>

          <Form.Item
            label={t(`${KEY}.featured`)}
            extra={t(`${KEY}.featuredHint`)}
          >
            <ImageField
              storeId={storeId}
              value={own.featuredImageUrl}
              onChange={(featuredImageUrl) => patch({ featuredImageUrl })}
            />
          </Form.Item>

          <Form.Item label={t(`${KEY}.height`)}>
            <InputNumber
              className="w-full"
              min={minHeight}
              max={maxHeight}
              precision={0}
              addonAfter="px"
              placeholder={String(PAGE_TOP_HEIGHT)}
              value={own.height}
              onChange={(height: number | null) => patch({ height })}
            />
          </Form.Item>

          <HeroOptionsControls
            options={own.options}
            set={setOptions}
            pages={sitePagesOf(draft.pages)}
            pieces={PIECES}
            isOfPage
          />
        </>
      )}
      <Divider />
    </>
  );
};

export default PageHeroFields;
