"use client";

import { useState } from "react";

import { Button, Form, Input, Segmented, Select, Space } from "antd";

import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";

import useLanguageData from "../../../data/context/language/useLanguageData";
import { embedUrlOf } from "../../../shared/business/store-sites/store-site-about";
import { IStoreSitePageContent } from "../../../shared/business/store-sites/store-site-pages";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import ImageField from "./ImageField";
import VideoField from "./VideoField";

interface Props {
  storeId: string;
  content: IStoreSitePageContent;
  /**
   * Changes the content. Computed from the content as it is when applied: an
   * upload finishes later, and the content may have changed meanwhile.
   */
  update: (
    change: (content: IStoreSitePageContent) => Partial<IStoreSitePageContent>,
  ) => void;
}

type TMediaChoice = "NONE" | StoreSitesEnum.AboutMediaType;

/** The heading and texts of a page, and the image or video beside them. */
const PageContentFields = ({ storeId, content, update }: Props) => {
  const { t } = useLanguageData();

  const [choice, setChoice] = useState<TMediaChoice>(
    content.media?.type ?? "NONE",
  );

  const [typedLink, setTypedLink] = useState<string>(
    content.media?.type === StoreSitesEnum.AboutMediaType.EMBED
      ? content.media.url
      : "",
  );

  const setTexts = (change: (texts: string[]) => string[]): void =>
    update((current) => ({ texts: change([...current.texts]) }));

  const setMedia = (type: StoreSitesEnum.AboutMediaType, url: string | null) =>
    update(() => ({ media: url ? { type, url } : null }));

  const isLinkInvalid: boolean = !!typedLink.trim() && !embedUrlOf(typedLink);

  return (
    <>
      <Form.Item
        label={t("storeSite.editor.pages.contentTitle")}
        extra={t("storeSite.editor.pages.contentTitleHint")}
      >
        <Input
          maxLength={80}
          allowClear
          value={content.title ?? ""}
          onChange={(event) =>
            update(() => ({ title: event.target.value || null }))
          }
        />
      </Form.Item>

      <div className="font-medium mb-2">
        {t("storeSite.editor.about.texts")}
      </div>
      <Space direction="vertical" className="w-full mb-4">
        {content.texts.map((text: string, index: number) => (
          <div key={index} className="flex gap-1 items-start">
            <Input.TextArea
              autoSize={{ minRows: 2, maxRows: 8 }}
              maxLength={1500}
              value={text}
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
                disabled={index === content.texts.length - 1}
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
          disabled={content.texts.length >= StoreSitesEnum.MAX_ABOUT_TEXTS}
          onClick={() => setTexts((texts) => [...texts, ""])}
        >
          {t("storeSite.editor.about.addText")} ({content.texts.length}/
          {StoreSitesEnum.MAX_ABOUT_TEXTS})
        </Button>
      </Space>

      <Form.Item label={t("storeSite.editor.about.media")}>
        <Segmented<TMediaChoice>
          block
          value={choice}
          onChange={(next: TMediaChoice) => {
            setChoice(next);
            setTypedLink("");
            update(() => ({ media: null }));
          }}
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
            value={content.media?.url ?? null}
            onChange={(url) =>
              setMedia(StoreSitesEnum.AboutMediaType.IMAGE, url)
            }
          />
        </Form.Item>
      )}

      {choice === StoreSitesEnum.AboutMediaType.VIDEO && (
        <Form.Item extra={t("storeSite.editor.about.videoHint")}>
          <VideoField
            storeId={storeId}
            value={content.media?.url ?? null}
            onChange={(url) =>
              setMedia(StoreSitesEnum.AboutMediaType.VIDEO, url)
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
              setTypedLink(event.target.value);
              setMedia(
                StoreSitesEnum.AboutMediaType.EMBED,
                embedUrlOf(event.target.value),
              );
            }}
          />
        </Form.Item>
      )}

      {choice !== "NONE" && (
        <Form.Item label={t("storeSite.editor.about.position")}>
          <Select
            value={content.mediaPosition}
            onChange={(mediaPosition: StoreSitesEnum.AboutMediaPosition) =>
              update(() => ({ mediaPosition }))
            }
            options={Object.values(StoreSitesEnum.AboutMediaPosition).map(
              (position: StoreSitesEnum.AboutMediaPosition) => ({
                value: position,
                label: t(`storeSite.editor.about.positions.${position}`),
              }),
            )}
          />
        </Form.Item>
      )}
    </>
  );
};

export default PageContentFields;
