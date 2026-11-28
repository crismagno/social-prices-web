"use client";

import { Form, Input, Segmented } from "antd";

import useLanguageData from "../../../data/context/language/useLanguageData";
import {
  IStoreSiteBackdrop,
  siteBackdropOf,
} from "../../../shared/business/store-sites/store-site-backdrop";
import { IStoreSiteHero } from "../../../shared/business/store-sites/store-site.interface";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import BackdropFields from "./BackdropFields";
import ExtraImagesField from "./ExtraImagesField";
import HeroOptionsFields from "./HeroOptionsFields";
import ImageField from "./ImageField";
import SizeFields from "./SizeFields";
import { IStoreSiteEditor } from "./useStoreSiteEditor";

interface Props {
  editor: IStoreSiteEditor;
  storeId: string;
}

const MODE = "storeSite.editor.hero.backgroundMode";

// Behind the whole site there is something to see: images or a video.
const SITE_WIDE_TYPES: StoreSitesEnum.BackdropType[] = [
  StoreSitesEnum.BackdropType.IMAGES,
  StoreSitesEnum.BackdropType.VIDEO,
];

/** The entrance of the site: its photo and its first words. */
export const HeroTab = ({ editor, storeId }: Props) => {
  const { t } = useLanguageData();

  if (!editor.draft) {
    return null;
  }

  const { hero } = editor.draft;

  type TExtraImagesKey = "backgroundImageUrls" | "featuredImageUrls";

  // From the draft as it is when applied: an upload finishes later, and the
  // list may have changed meanwhile. An emptied field removes its image.
  const setExtraImage = (
    field: TExtraImagesKey,
    index: number,
    imageKey: string | null,
  ): void =>
    editor.update((draft) => {
      const images: string[] = [...(draft.hero[field] ?? [])];

      if (imageKey) {
        images[index] = imageKey;
      } else {
        images.splice(index, 1);
      }

      return {
        hero: {
          ...draft.hero,
          [field]: images
            .filter(Boolean)
            .slice(0, StoreSitesEnum.MAX_HERO_EXTRA_IMAGES),
        },
      };
    });

  const backdrop: IStoreSiteBackdrop = siteBackdropOf(editor.draft.backdrop);

  // Images or a video behind the whole site, the entrance included.
  const isSiteWide: boolean =
    backdrop.type !== StoreSitesEnum.BackdropType.COLOR;

  // Going behind the whole site starts from the images of the entrance, when
  // none were chosen for it yet; coming back leaves both as they are.
  const setSiteWide = (isOn: boolean): void =>
    editor.update((draft) => {
      const current: IStoreSiteBackdrop = siteBackdropOf(draft.backdrop);

      if (!isOn) {
        return {
          backdrop: { ...current, type: StoreSitesEnum.BackdropType.COLOR },
        };
      }

      const ofEntrance: string[] = [
        draft.hero.backgroundImageUrl,
        ...(draft.hero.backgroundImageUrls ?? []),
      ].filter((key: string | null | undefined): key is string => !!key);

      return {
        backdrop: {
          ...current,
          type: current.videoUrl
            ? StoreSitesEnum.BackdropType.VIDEO
            : StoreSitesEnum.BackdropType.IMAGES,
          imageUrls: current.imageUrls.length
            ? current.imageUrls
            : ofEntrance.slice(0, StoreSitesEnum.MAX_BACKDROP_IMAGES),
        },
      };
    });

  // From the draft as it is when applied: an upload that finishes later must
  // not bring back what the hero was when it started.
  const set = (patch: Partial<IStoreSiteHero>): void =>
    editor.update((draft) => ({ hero: { ...draft.hero, ...patch } }));

  return (
    <Form layout="vertical">
      <HeroOptionsFields editor={editor} />

      <Form.Item label={t("storeSite.editor.hero.tagline")}>
        <Input
          maxLength={80}
          value={hero.tagline ?? ""}
          onChange={(event) => set({ tagline: event.target.value || null })}
        />
      </Form.Item>
      <Form.Item label={t("storeSite.editor.hero.title")}>
        <Input
          maxLength={120}
          value={hero.title}
          onChange={(event) => set({ title: event.target.value })}
        />
      </Form.Item>
      <SizeFields editor={editor} sizes={["heroTitleWidth", "heroTitleSize"]} />
      <Form.Item label={t("storeSite.editor.hero.subtitle")}>
        <Input.TextArea
          maxLength={400}
          rows={3}
          value={hero.subtitle ?? ""}
          onChange={(event) => set({ subtitle: event.target.value || null })}
        />
      </Form.Item>
      <SizeFields
        editor={editor}
        sizes={["heroSubtitleWidth", "heroSubtitleSize"]}
      />
      <Form.Item label={t("storeSite.editor.hero.ctaLabel")}>
        <Input
          maxLength={40}
          value={hero.ctaLabel ?? ""}
          onChange={(event) => set({ ctaLabel: event.target.value || null })}
        />
      </Form.Item>
      {/* Behind the entrance alone, or behind the whole site. */}
      <Form.Item
        label={t(`${MODE}.label`)}
        extra={t(`${MODE}.hints.${isSiteWide ? "SITE" : "ENTRANCE"}`)}
      >
        <Segmented<boolean>
          block
          value={isSiteWide}
          onChange={setSiteWide}
          options={[
            { value: false, label: t(`${MODE}.modes.ENTRANCE`) },
            { value: true, label: t(`${MODE}.modes.SITE`) },
          ]}
        />
      </Form.Item>
      {isSiteWide ? (
        <BackdropFields
          storeId={storeId}
          backdrop={backdrop}
          types={SITE_WIDE_TYPES}
          onChange={(change) =>
            editor.update((draft) => {
              const current = siteBackdropOf(draft.backdrop);

              return { backdrop: { ...current, ...change(current) } };
            })
          }
        />
      ) : (
        <>
          <Form.Item
            label={t("storeSite.editor.hero.backgroundImage")}
            extra={t("storeSite.editor.hero.backgroundImageHint")}
          >
            <ImageField
              storeId={storeId}
              value={hero.backgroundImageUrl}
              onChange={(backgroundImageUrl) => set({ backgroundImageUrl })}
            />
          </Form.Item>
          <ExtraImagesField
            storeId={storeId}
            images={hero.backgroundImageUrls ?? []}
            hasFirst={!!hero.backgroundImageUrl}
            seconds={hero.slideSeconds}
            label={t("storeSite.editor.hero.slides.label")}
            hint={t("storeSite.editor.hero.slides.hint")}
            onImageChange={(index, imageKey) =>
              setExtraImage("backgroundImageUrls", index, imageKey)
            }
            onSecondsChange={(slideSeconds) => set({ slideSeconds })}
          />
        </>
      )}
      <SizeFields editor={editor} sizes={["heroHeight"]} />
      <Form.Item label={t("storeSite.editor.hero.featuredImage")}>
        <ImageField
          storeId={storeId}
          value={hero.featuredImageUrl}
          onChange={(featuredImageUrl) => set({ featuredImageUrl })}
        />
      </Form.Item>
      <ExtraImagesField
        storeId={storeId}
        images={hero.featuredImageUrls ?? []}
        hasFirst={!!hero.featuredImageUrl}
        seconds={hero.featuredSlideSeconds}
        label={t("storeSite.editor.hero.featuredSlides.label")}
        hint={t("storeSite.editor.hero.featuredSlides.hint")}
        onImageChange={(index, imageKey) =>
          setExtraImage("featuredImageUrls", index, imageKey)
        }
        onSecondsChange={(featuredSlideSeconds) =>
          set({ featuredSlideSeconds })
        }
      />
      <SizeFields
        editor={editor}
        sizes={["featuredImageWidth", "featuredImageHeight"]}
      />
    </Form>
  );
};
