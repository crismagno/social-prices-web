"use client";

import { useEffect, useState } from "react";

import { Button, Form, Input, Segmented, Select, Space } from "antd";

import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";

import useLanguageData from "../../../data/context/language/useLanguageData";
import {
  embedUrlOf,
  IStoreSiteAbout,
} from "../../../shared/business/store-sites/store-site-about";
import {
  BLOCK_LIMITS,
  IStoreSiteBlock,
  IStoreSiteBlockItem,
  newBlockItem,
} from "../../../shared/business/store-sites/store-site-blocks";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import ImageField from "./ImageField";
import SizeFields from "./SizeFields";
import { IStoreSiteEditor } from "./useStoreSiteEditor";
import VideoField from "./VideoField";

interface Props {
  editor: IStoreSiteEditor;
  storeId: string;
  /** The store's own description: what the site shows when no text is written. */
  storeAbout: string | null;
  /** A text with media, with content of its own (see ownPartOf). */
  block: IStoreSiteBlock;
  /** Applied to the block as it is then. */
  onChange: (
    change: (block: IStoreSiteBlock) => Partial<IStoreSiteBlock>,
  ) => void;
}

/** The block read as the about it draws. */
const aboutOf = (block: IStoreSiteBlock): IStoreSiteAbout => ({
  isActive: true,
  title: block.title,
  texts: block.items.map((item: IStoreSiteBlockItem) => item.text ?? ""),
  media: block.settings.media,
  mediaPosition:
    block.settings.mediaPosition ?? StoreSitesEnum.AboutMediaPosition.LEFT,
});

type TMediaChoice = "NONE" | StoreSitesEnum.AboutMediaType;

/**
 * A text with media (the "about" of a page): a title, as many paragraphs as
 * the owner wants, and an image, a video file or a YouTube/Vimeo video beside
 * them. Each one on the site has its own.
 */
const AboutFields = ({
  editor,
  storeId,
  storeAbout,
  block,
  onChange,
}: Props) => {
  const { t } = useLanguageData();

  const about: IStoreSiteAbout = aboutOf(block);

  // What was typed in the video link field, valid or not: the draft keeps
  // only the player of a valid one.
  const [typedLink, setTypedLink] = useState<string>("");

  const [choice, setChoice] = useState<TMediaChoice>(
    about?.media?.type ?? "NONE",
  );

  useEffect(() => {
    // Another one was picked, or the site was reset to the defaults.
    setChoice(about?.media?.type ?? "NONE");
    setTypedLink(
      about?.media?.type === StoreSitesEnum.AboutMediaType.EMBED
        ? about.media.url
        : "",
    );
    // Only when the media itself changes from outside this tab.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [block.key, about?.media?.url]);

  // From the block as it is when applied, like every change of the editor.
  const set = (patch: Partial<IStoreSiteAbout>): void =>
    onChange((current: IStoreSiteBlock) => ({
      ...("title" in patch ? { title: patch.title ?? null } : {}),
      settings: {
        ...current.settings,
        isOwn: true,
        ...("media" in patch ? { media: patch.media ?? null } : {}),
        ...(patch.mediaPosition ? { mediaPosition: patch.mediaPosition } : {}),
      },
    }));

  const setTexts = (change: (texts: string[]) => string[]): void =>
    onChange((current: IStoreSiteBlock) => ({
      // A paragraph keeps its item where it stays in its place.
      items: change(aboutOf(current).texts).map(
        (text: string, index: number): IStoreSiteBlockItem => ({
          ...(current.items[index] ?? newBlockItem(current.type)),
          text,
        }),
      ),
      settings: { ...current.settings, isOwn: true },
    }));

  const setMediaUrl = (
    type: StoreSitesEnum.AboutMediaType,
    url: string | null,
  ): void => set({ media: url ? { type, url } : null });

  const chooseMedia = (next: TMediaChoice): void => {
    setChoice(next);
    setTypedLink("");
    // Another kind of media: the one chosen before no longer applies.
    set({ media: null });
  };

  const isLinkInvalid: boolean = !!typedLink.trim() && !embedUrlOf(typedLink);

  const canAddText: boolean =
    about.texts.length < StoreSitesEnum.MAX_ABOUT_TEXTS;

  return (
    <Form layout="vertical">
      {
        <>
          <Form.Item
            label={t("storeSite.editor.about.title")}
            extra={t("storeSite.editor.about.titleHint")}
          >
            <Input
              maxLength={80}
              allowClear
              value={about.title ?? ""}
              onChange={(event) => set({ title: event.target.value || null })}
            />
          </Form.Item>
          <SizeFields editor={editor} sizes={["aboutTitleSize"]} />

          <div className="font-medium mb-1">
            {t("storeSite.editor.about.texts")}
          </div>
          <p className="text-xs opacity-70 mb-2">
            {about.texts.length === 0 && storeAbout
              ? t("storeSite.editor.about.textsFromStore")
              : t("storeSite.editor.about.textsHint")}
          </p>
          <Space direction="vertical" className="w-full mb-2">
            {about.texts.map((text: string, index: number) => (
              <div key={index} className="flex gap-1 items-start">
                <Input.TextArea
                  autoSize={{ minRows: 2, maxRows: 8 }}
                  maxLength={BLOCK_LIMITS.paragraph}
                  value={text}
                  placeholder={t("storeSite.editor.about.textPlaceholder")}
                  onChange={(event) =>
                    setTexts((texts) => {
                      texts[index] = event.target.value;
                      return texts;
                    })
                  }
                />
                <Space direction="vertical" size={2}>
                  <Button
                    size="small"
                    type="text"
                    icon={<ArrowUpOutlined />}
                    disabled={index === 0}
                    aria-label={t("storeSite.editor.moveUp")}
                    onClick={() =>
                      setTexts((texts) => {
                        texts.splice(index - 1, 0, texts.splice(index, 1)[0]);
                        return texts;
                      })
                    }
                  />
                  <Button
                    size="small"
                    type="text"
                    icon={<ArrowDownOutlined />}
                    disabled={index === about.texts.length - 1}
                    aria-label={t("storeSite.editor.moveDown")}
                    onClick={() =>
                      setTexts((texts) => {
                        texts.splice(index + 1, 0, texts.splice(index, 1)[0]);
                        return texts;
                      })
                    }
                  />
                  <Button
                    size="small"
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    aria-label={t("storeSite.editor.remove")}
                    onClick={() =>
                      setTexts((texts) => texts.filter((_, at) => at !== index))
                    }
                  />
                </Space>
              </div>
            ))}
            <Button
              icon={<PlusOutlined />}
              disabled={!canAddText}
              onClick={() => setTexts((texts) => [...texts, ""])}
            >
              {t("storeSite.editor.about.addText")} ({about.texts.length}/
              {StoreSitesEnum.MAX_ABOUT_TEXTS})
            </Button>
          </Space>
          <SizeFields
            editor={editor}
            sizes={["aboutTextSize"]}
            className="mb-5"
          />

          <Form.Item label={t("storeSite.editor.about.media")}>
            <Segmented<TMediaChoice>
              block
              value={choice}
              onChange={chooseMedia}
              options={[
                { value: "NONE", label: t("storeSite.editor.about.mediaNone") },
                {
                  value: StoreSitesEnum.AboutMediaType.IMAGE,
                  label: t("storeSite.editor.about.mediaImage"),
                },
                {
                  value: StoreSitesEnum.AboutMediaType.VIDEO,
                  label: t("storeSite.editor.about.mediaVideo"),
                },
                {
                  value: StoreSitesEnum.AboutMediaType.EMBED,
                  label: t("storeSite.editor.about.mediaLink"),
                },
              ]}
            />
          </Form.Item>

          {choice === StoreSitesEnum.AboutMediaType.IMAGE && (
            <Form.Item>
              <ImageField
                storeId={storeId}
                value={about.media?.url ?? null}
                onChange={(url) =>
                  setMediaUrl(StoreSitesEnum.AboutMediaType.IMAGE, url)
                }
              />
            </Form.Item>
          )}

          {choice === StoreSitesEnum.AboutMediaType.VIDEO && (
            <Form.Item extra={t("storeSite.editor.about.videoHint")}>
              <VideoField
                storeId={storeId}
                value={about.media?.url ?? null}
                onChange={(url) =>
                  setMediaUrl(StoreSitesEnum.AboutMediaType.VIDEO, url)
                }
              />
            </Form.Item>
          )}

          {choice === StoreSitesEnum.AboutMediaType.EMBED && (
            <Form.Item
              validateStatus={isLinkInvalid ? "error" : undefined}
              help={
                isLinkInvalid
                  ? t("storeSite.editor.about.linkInvalid")
                  : t("storeSite.editor.about.linkHint")
              }
            >
              <Input
                maxLength={600}
                allowClear
                placeholder="https://www.youtube.com/watch?v=…"
                value={typedLink}
                onChange={(event) => {
                  const typed: string = event.target.value;

                  setTypedLink(typed);
                  setMediaUrl(
                    StoreSitesEnum.AboutMediaType.EMBED,
                    embedUrlOf(typed),
                  );
                }}
              />
            </Form.Item>
          )}

          {choice !== "NONE" && (
            <>
              <Form.Item label={t("storeSite.editor.about.position")}>
                <Select
                  value={about.mediaPosition}
                  onChange={(
                    mediaPosition: StoreSitesEnum.AboutMediaPosition,
                  ) => set({ mediaPosition })}
                  options={Object.values(StoreSitesEnum.AboutMediaPosition).map(
                    (position: StoreSitesEnum.AboutMediaPosition) => ({
                      value: position,
                      label: t(`storeSite.editor.about.positions.${position}`),
                    }),
                  )}
                />
              </Form.Item>
              <SizeFields
                editor={editor}
                sizes={["aboutMediaWidth", "aboutMediaHeight"]}
              />
            </>
          )}
        </>
      }
    </Form>
  );
};

export default AboutFields;
