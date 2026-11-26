"use client";

import {
  Button,
  Card,
  ColorPicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Segmented,
  Select,
  Space,
  Switch,
} from "antd";

import {
  ArrowDownOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";

import {
  IStoreSiteMarqueeStyle,
  MARQUEE_SEPARATORS,
  MARQUEE_SEPARATOR_MAX,
  siteMarqueeStyleOf,
} from "../../../shared/business/store-sites/store-site-marquee-style";
import useLanguageData from "../../../data/context/language/useLanguageData";
import {
  IStoreSiteHero,
  IStoreSiteLogo,
  IStoreSiteSection,
} from "../../../shared/business/store-sites/store-site.interface";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import { IStoreSiteSignIn } from "../../../shared/business/store-sites/store-site-sign-in";
import ExtraImagesField from "./ExtraImagesField";
import HeroOptionsFields from "./HeroOptionsFields";
import ImageField from "./ImageField";
import ImageLookCard from "./ImageLookCard";
import SizeFields from "./SizeFields";
import { IStoreSiteEditor } from "./useStoreSiteEditor";

interface Props {
  editor: IStoreSiteEditor;
  storeId: string;
}

interface IHeroTabProps extends Props {
  /** The store's own name: what the top of the site shows when left empty. */
  storeName: string;
}

const move = <T,>(list: T[], from: number, to: number): T[] => {
  if (to < 0 || to >= list.length) {
    return list;
  }

  const next: T[] = [...list];

  next.splice(to, 0, next.splice(from, 1)[0]);

  return next;
};

/** The entrance of the site: its photo and its first words. */
export const HeroTab = ({ editor, storeId, storeName }: IHeroTabProps) => {
  const { t } = useLanguageData();

  if (!editor.draft) {
    return null;
  }

  const { hero, logo } = editor.draft;

  const signIn: IStoreSiteSignIn = editor.draft.signIn;

  // From the draft as it is when applied, like every change of the editor.
  const setSignIn = (patch: Partial<IStoreSiteSignIn>): void =>
    editor.update((draft) => ({ signIn: { ...draft.signIn, ...patch } }));

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

  // From the draft as it is when applied: an upload that finishes later must
  // not bring back what the hero was when it started.
  const set = (patch: Partial<IStoreSiteHero>): void =>
    editor.update((draft) => ({ hero: { ...draft.hero, ...patch } }));

  const setLogo = (patch: Partial<IStoreSiteLogo>): void =>
    editor.update((draft) => ({ logo: { ...draft.logo, ...patch } }));

  return (
    <Form layout="vertical">
      <Form.Item
        label={t("storeSite.editor.hero.fixedHeader")}
        extra={t("storeSite.editor.hero.fixedHeaderHint")}
      >
        <Switch
          checked={editor.draft.header.isFixed}
          onChange={(isFixed: boolean) =>
            editor.update((draft) => ({
              header: { ...draft.header, isFixed },
            }))
          }
        />
      </Form.Item>

      <HeroOptionsFields editor={editor} />

      <Form.Item label={t("storeSite.editor.hero.tagline")}>
        <Input
          maxLength={80}
          value={hero.tagline ?? ""}
          onChange={(event) => set({ tagline: event.target.value || null })}
        />
      </Form.Item>
      <Form.Item
        label={t("storeSite.editor.hero.title")}
        required
        validateStatus={hero.title.trim() ? undefined : "error"}
      >
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
      <Form.Item
        label={t("storeSite.editor.displayName.label")}
        extra={t("storeSite.editor.displayName.hint")}
      >
        <Input
          maxLength={60}
          allowClear
          placeholder={storeName}
          value={editor.draft.displayName ?? ""}
          onChange={(event) =>
            editor.update({ displayName: event.target.value || null })
          }
        />
      </Form.Item>
      <SizeFields
        editor={editor}
        sizes={["brandNameWidth", "brandNameHeight", "brandNameSize"]}
      />
      <Form.Item label={t("storeSite.editor.logo.show")}>
        <Switch
          checked={logo.isActive}
          onChange={(isActive: boolean) => setLogo({ isActive })}
        />
      </Form.Item>
      {logo.isActive && (
        <Form.Item
          label={t("storeSite.editor.logo.image")}
          extra={t("storeSite.editor.logo.imageHint")}
        >
          <ImageField
            storeId={storeId}
            value={logo.imageUrl}
            onChange={(imageUrl) => setLogo({ imageUrl })}
          />
        </Form.Item>
      )}
      {logo.isActive && (
        <SizeFields editor={editor} sizes={["logoWidth", "logoHeight"]} />
      )}

      <Divider orientation="left" plain>
        {t("storeSite.editor.signIn.heading")}
      </Divider>
      <p className="text-xs opacity-70 mb-3">
        {t("storeSite.editor.signIn.hint")}
      </p>
      <Form.Item label={t("storeSite.editor.signIn.show")}>
        <Switch
          checked={signIn.isVisible}
          onChange={(isVisible: boolean) => setSignIn({ isVisible })}
        />
      </Form.Item>
      <Form.Item
        label={t("storeSite.editor.signIn.label")}
        extra={t("storeSite.editor.signIn.labelHint")}
      >
        <Input
          maxLength={30}
          allowClear
          placeholder={t("storeSite.signIn.default")}
          value={signIn.label ?? ""}
          onChange={(event) => setSignIn({ label: event.target.value || null })}
        />
      </Form.Item>
      <Form.Item label={t("storeSite.editor.signIn.destination")}>
        <Select
          value={signIn.destination}
          onChange={(destination: StoreSitesEnum.SignInDestination) =>
            setSignIn({ destination })
          }
          options={Object.values(StoreSitesEnum.SignInDestination).map(
            (destination: StoreSitesEnum.SignInDestination) => ({
              value: destination,
              label: t(`storeSite.editor.signIn.destinations.${destination}`),
            }),
          )}
        />
      </Form.Item>
    </Form>
  );
};

/** The demonstration blocks: a photo, a title and a few words each. */
export const SectionsTab = ({ editor, storeId }: Props) => {
  const { t } = useLanguageData();

  if (!editor.draft) {
    return null;
  }

  const { sections } = editor.draft;

  // By key and from the current draft: a block may have moved or been removed
  // while its image was uploading.
  const setByKey = (key: string, patch: Partial<IStoreSiteSection>): void =>
    editor.update((draft) => ({
      sections: draft.sections.map((section: IStoreSiteSection) =>
        section.key === key ? { ...section, ...patch } : section,
      ),
    }));

  const add = (): void =>
    editor.update({
      sections: [
        ...sections,
        {
          key: `s-${Date.now().toString(36)}`,
          title: t("storeSite.editor.sections.newTitle"),
          description: null,
          imageUrl: null,
          isActive: true,
        },
      ],
    });

  return (
    <Space direction="vertical" className="w-full">
      <Card size="small" title={t("storeSite.editor.sizes.blocksHeading")}>
        <SizeFields
          editor={editor}
          className=""
          sizes={[
            "sectionImageWidth",
            "sectionImageHeight",
            "sectionTitleSize",
            "sectionTextSize",
          ]}
        />
      </Card>
      <ImageLookCard editor={editor} place="section" />
      {sections.map((section: IStoreSiteSection, index: number) => (
        <Card
          key={section.key}
          size="small"
          title={`${t("storeSite.editor.sections.block")} ${index + 1}`}
          extra={
            <Space size={2}>
              <Switch
                size="small"
                checked={section.isActive}
                aria-label={t("storeSite.editor.sections.show")}
                onChange={(isActive: boolean) =>
                  setByKey(section.key, { isActive })
                }
              />
              <Button
                type="text"
                size="small"
                icon={<ArrowUpOutlined />}
                disabled={index === 0}
                aria-label={t("storeSite.editor.moveUp")}
                onClick={() =>
                  editor.update({ sections: move(sections, index, index - 1) })
                }
              />
              <Button
                type="text"
                size="small"
                icon={<ArrowDownOutlined />}
                disabled={index === sections.length - 1}
                aria-label={t("storeSite.editor.moveDown")}
                onClick={() =>
                  editor.update({ sections: move(sections, index, index + 1) })
                }
              />
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                aria-label={t("storeSite.editor.remove")}
                onClick={() =>
                  editor.update({
                    sections: sections.filter(
                      (_: IStoreSiteSection, at: number) => at !== index,
                    ),
                  })
                }
              />
            </Space>
          }
        >
          <Form layout="vertical">
            <Form.Item
              label={t("storeSite.editor.sections.title")}
              required
              validateStatus={section.title.trim() ? undefined : "error"}
            >
              <Input
                maxLength={120}
                value={section.title}
                onChange={(event) =>
                  setByKey(section.key, { title: event.target.value })
                }
              />
            </Form.Item>
            <Form.Item label={t("storeSite.editor.sections.description")}>
              <Input.TextArea
                maxLength={600}
                rows={2}
                value={section.description ?? ""}
                onChange={(event) =>
                  setByKey(section.key, {
                    description: event.target.value || null,
                  })
                }
              />
            </Form.Item>
            <Form.Item
              label={t("storeSite.editor.sections.image")}
              className="mb-0"
            >
              <ImageField
                storeId={storeId}
                value={section.imageUrl}
                onChange={(imageUrl) => setByKey(section.key, { imageUrl })}
              />
            </Form.Item>
          </Form>
        </Card>
      ))}
      <Button
        icon={<PlusOutlined />}
        disabled={sections.length >= StoreSitesEnum.MAX_SECTIONS}
        onClick={add}
      >
        {t("storeSite.editor.sections.add")} ({sections.length}/
        {StoreSitesEnum.MAX_SECTIONS})
      </Button>
    </Space>
  );
};

/** The strip of short phrases that runs across the page. */
export const MarqueeTab = ({ editor }: Omit<Props, "storeId">) => {
  const { t } = useLanguageData();

  if (!editor.draft) {
    return null;
  }

  const { marquee, marqueeStyle } = editor.draft;

  // From the draft as it is when applied, like every change of the editor.
  const setStyle = (patch: Partial<IStoreSiteMarqueeStyle>): void =>
    editor.update((draft) => ({
      marqueeStyle: siteMarqueeStyleOf({ ...draft.marqueeStyle, ...patch }),
    }));

  const isOwnSeparator: boolean =
    !!marqueeStyle.separator &&
    !MARQUEE_SEPARATORS.includes(marqueeStyle.separator);

  return (
    <Form layout="vertical">
      <Form.Item label={t("storeSite.editor.marquee.show")}>
        <Switch
          checked={marquee.isActive}
          onChange={(isActive: boolean) =>
            editor.update({ marquee: { ...marquee, isActive } })
          }
        />
      </Form.Item>
      <Form.Item
        label={t("storeSite.editor.marquee.items")}
        extra={t("storeSite.editor.marquee.itemsHint")}
      >
        <Input.TextArea
          rows={5}
          value={marquee.items.join("\n")}
          onChange={(event) =>
            editor.update({
              marquee: {
                ...marquee,
                items: event.target.value
                  .split("\n")
                  .map((item: string) => item.slice(0, 60))
                  .slice(0, StoreSitesEnum.MAX_MARQUEE_ITEMS),
              },
            })
          }
        />
      </Form.Item>

      {marquee.isActive && (
        <>
          <Divider orientation="left" plain>
            {t("storeSite.editor.marquee.style.title")}
          </Divider>
          <Form.Item label={t("storeSite.editor.marquee.style.speed")}>
            <Segmented<StoreSitesEnum.MarqueeSpeed>
              value={marqueeStyle.speed}
              onChange={(speed) => setStyle({ speed })}
              options={Object.values(StoreSitesEnum.MarqueeSpeed).map(
                (speed: StoreSitesEnum.MarqueeSpeed) => ({
                  value: speed,
                  label: t(`storeSite.editor.marquee.style.speeds.${speed}`),
                }),
              )}
            />
          </Form.Item>
          <Form.Item label={t("storeSite.editor.marquee.style.direction")}>
            <Segmented<StoreSitesEnum.MarqueeDirection>
              value={marqueeStyle.direction}
              onChange={(direction) => setStyle({ direction })}
              options={[
                {
                  value: StoreSitesEnum.MarqueeDirection.LEFT,
                  icon: <ArrowLeftOutlined />,
                  label: t("storeSite.editor.marquee.style.directions.LEFT"),
                },
                {
                  value: StoreSitesEnum.MarqueeDirection.RIGHT,
                  icon: <ArrowRightOutlined />,
                  label: t("storeSite.editor.marquee.style.directions.RIGHT"),
                },
              ]}
            />
          </Form.Item>
          <Form.Item
            label={t("storeSite.editor.marquee.style.separator")}
            extra={t("storeSite.editor.marquee.style.separatorHint")}
          >
            <Space direction="vertical" className="w-full">
              <Segmented<string>
                value={
                  isOwnSeparator ? "__own__" : (marqueeStyle.separator ?? "")
                }
                onChange={(value) =>
                  setStyle({
                    separator:
                      value === "__own__"
                        ? (marqueeStyle.separator ?? "+")
                        : value || null,
                  })
                }
                options={[
                  {
                    value: "",
                    label: t(
                      "storeSite.editor.marquee.style.templateSeparator",
                    ),
                  },
                  ...MARQUEE_SEPARATORS.map((separator: string) => ({
                    value: separator,
                    label: separator,
                  })),
                  {
                    value: "__own__",
                    label: t("storeSite.editor.marquee.style.ownSeparator"),
                  },
                ]}
                style={{
                  flexWrap: "wrap",
                  display: "inline-flex",
                  maxWidth: "100%",
                }}
              />
              {isOwnSeparator && (
                <Input
                  maxLength={MARQUEE_SEPARATOR_MAX}
                  value={marqueeStyle.separator ?? ""}
                  onChange={(event) =>
                    setStyle({ separator: event.target.value || null })
                  }
                  style={{ width: 120 }}
                />
              )}
            </Space>
          </Form.Item>
          <Form.Item label={t("storeSite.editor.marquee.style.size")}>
            <Segmented<StoreSitesEnum.MarqueeSize>
              value={marqueeStyle.size}
              onChange={(size) => setStyle({ size })}
              options={Object.values(StoreSitesEnum.MarqueeSize).map(
                (size: StoreSitesEnum.MarqueeSize) => ({
                  value: size,
                  label: t(`storeSite.editor.marquee.style.sizes.${size}`),
                }),
              )}
            />
          </Form.Item>
          <Space size={24} wrap>
            <Form.Item
              label={t("storeSite.editor.marquee.style.background")}
              extra={t("storeSite.editor.marquee.style.colorHint")}
            >
              <ColorPicker
                allowClear
                disabledAlpha
                value={marqueeStyle.background}
                onChangeComplete={(color) =>
                  setStyle({ background: color.toHexString().slice(0, 7) })
                }
                onClear={() => setStyle({ background: null })}
              />
            </Form.Item>
            <Form.Item label={t("storeSite.editor.marquee.style.color")}>
              <ColorPicker
                allowClear
                disabledAlpha
                value={marqueeStyle.color}
                onChangeComplete={(color) =>
                  setStyle({ color: color.toHexString().slice(0, 7) })
                }
                onClear={() => setStyle({ color: null })}
              />
            </Form.Item>
          </Space>
          <Form.Item label={t("storeSite.editor.marquee.style.pause")}>
            <Switch
              checked={marqueeStyle.pauseOnHover}
              onChange={(pauseOnHover: boolean) => setStyle({ pauseOnHover })}
            />
          </Form.Item>
        </>
      )}
    </Form>
  );
};
