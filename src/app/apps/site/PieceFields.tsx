"use client";

import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Button, Card, Form, Input, Segmented, Slider, Space } from "antd";

import useLanguageData from "../../../data/context/language/useLanguageData";
import {
  BLOCK_LIMITS,
  IStoreSiteBlock,
  IStoreSiteBlockButton,
  IStoreSiteBlockSettings,
  MAX_SECTION_BUTTONS,
  SPACER_LIMITS,
  newBlockButton,
} from "../../../shared/business/store-sites/store-site-blocks";
import { embedUrlOf } from "../../../shared/business/store-sites/store-site-about";
import { IStoreSitePage } from "../../../shared/business/store-sites/store-site-pages";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import ButtonFields from "./ButtonFields";
import VideoField from "./VideoField";

interface Props {
  section: IStoreSiteBlock;
  pages: IStoreSitePage[];
  storeId: string;
  /** Applied to the section as it is then. */
  onChange: (
    change: (section: IStoreSiteBlock) => Partial<IStoreSiteBlock>,
  ) => void;
}

const T = StoreSitesEnum.BlockType;

/** Which options each piece has, in the order shown. */
const OPTIONS: Partial<
  Record<StoreSitesEnum.BlockType, (keyof IStoreSiteBlockSettings)[]>
> = {
  [T.TEXT]: ["align", "tone"],
  [T.BUTTONS]: ["align"],
  [T.IMAGE]: ["width", "align"],
  [T.VIDEO]: ["width"],
  [T.BOX]: ["tone", "align", "width"],
  [T.SPACER]: ["height"],
  [T.DIVIDER]: ["divider"],
};

const VALUES: Record<string, string[]> = {
  align: Object.values(StoreSitesEnum.SectionAlign),
  width: Object.values(StoreSitesEnum.SectionWidth),
  tone: Object.values(StoreSitesEnum.SectionTone),
  divider: Object.values(StoreSitesEnum.DividerStyle),
};

const move = <V,>(list: V[], from: number, to: number): V[] => {
  const next: V[] = [...list];
  const [moved] = next.splice(from, 1);

  next.splice(to, 0, moved);

  return next;
};

/**
 * The options of a piece (alignment, width, tone, height, style) and what
 * only some pieces have: the buttons of a row, the video of a video.
 */
const PieceFields = ({ section, pages, storeId, onChange }: Props) => {
  const { t } = useLanguageData();

  const setSettings = (patch: Partial<IStoreSiteBlockSettings>): void =>
    onChange((current) => ({ settings: { ...current.settings, ...patch } }));

  const setButtons = (
    change: (buttons: IStoreSiteBlockButton[]) => IStoreSiteBlockButton[],
  ): void => onChange((current) => ({ buttons: change(current.buttons) }));

  const media = section.settings.media;
  const isEmbed: boolean =
    media?.type === StoreSitesEnum.AboutMediaType.EMBED;

  return (
    <Form layout="vertical">
      {section.type === T.VIDEO && (
        <>
          <Form.Item label={t("storeSite.editor.blocks.title")}>
            <Input
              maxLength={BLOCK_LIMITS.title}
              value={section.title ?? ""}
              onChange={(event) =>
                onChange(() => ({ title: event.target.value }))
              }
            />
          </Form.Item>
          <Form.Item label={t("storeSite.editor.builder.fields.videoSource")}>
            <Segmented<string>
              value={isEmbed ? "EMBED" : "VIDEO"}
              onChange={(source) =>
                setSettings({
                  media:
                    source === "EMBED"
                      ? { type: StoreSitesEnum.AboutMediaType.EMBED, url: "" }
                      : null,
                })
              }
              options={["VIDEO", "EMBED"].map((source) => ({
                value: source,
                label: t(`storeSite.editor.builder.videoSources.${source}`),
              }))}
            />
          </Form.Item>
          {isEmbed ? (
            <Form.Item
              label={t("storeSite.editor.builder.fields.videoLink")}
              extra={t("storeSite.editor.builder.fields.videoLinkHint")}
              validateStatus={
                media?.url && !embedUrlOf(media.url) && !media.url.includes("/embed/")
                  ? "warning"
                  : undefined
              }
            >
              <Input
                placeholder="https://www.youtube.com/watch?v=..."
                value={media?.url ?? ""}
                onChange={(event) =>
                  setSettings({
                    media: {
                      type: StoreSitesEnum.AboutMediaType.EMBED,
                      url: embedUrlOf(event.target.value) ?? event.target.value,
                    },
                  })
                }
              />
            </Form.Item>
          ) : (
            <Form.Item label={t("storeSite.editor.builder.fields.videoFile")}>
              <VideoField
                storeId={storeId}
                value={media?.url ?? null}
                onChange={(url: string | null) =>
                  setSettings({
                    media: url
                      ? { type: StoreSitesEnum.AboutMediaType.VIDEO, url }
                      : null,
                  })
                }
              />
            </Form.Item>
          )}
        </>
      )}

      {section.type === T.BUTTONS && (
        <Space direction="vertical" size={10} style={{ width: "100%" }}>
          {section.buttons.map((button: IStoreSiteBlockButton, index: number) => (
            <Card
              key={index}
              size="small"
              title={`${t("storeSite.editor.builder.fields.button")} ${index + 1}`}
              extra={
                <Space size={2}>
                  <Button
                    type="text"
                    size="small"
                    icon={<ArrowUpOutlined />}
                    disabled={index === 0}
                    aria-label={t("storeSite.editor.moveUp")}
                    onClick={() => setButtons((list) => move(list, index, index - 1))}
                  />
                  <Button
                    type="text"
                    size="small"
                    icon={<ArrowDownOutlined />}
                    disabled={index === section.buttons.length - 1}
                    aria-label={t("storeSite.editor.moveDown")}
                    onClick={() => setButtons((list) => move(list, index, index + 1))}
                  />
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    disabled={section.buttons.length === 1}
                    aria-label={t("storeSite.editor.remove")}
                    onClick={() =>
                      setButtons((list) => list.filter((_, at) => at !== index))
                    }
                  />
                </Space>
              }
            >
              <ButtonFields
                button={button}
                pages={pages}
                withVariant
                onChange={(patch) =>
                  setButtons((list) =>
                    list.map((each, at) =>
                      at === index ? newBlockButton({ ...each, ...patch }) : each,
                    ),
                  )
                }
              />
            </Card>
          ))}
          <Button
            block
            type="dashed"
            icon={<PlusOutlined />}
            disabled={section.buttons.length >= MAX_SECTION_BUTTONS}
            onClick={() =>
              setButtons((list) => [
                ...list,
                newBlockButton({ variant: StoreSitesEnum.ButtonVariant.OUTLINE }),
              ])
            }
          >
            {t("storeSite.editor.builder.fields.addButton")} (
            {section.buttons.length}/{MAX_SECTION_BUTTONS})
          </Button>
        </Space>
      )}

      {(OPTIONS[section.type] ?? []).map((option) =>
        option === "height" ? (
          <Form.Item key={option} label={t("storeSite.editor.builder.options.height")}>
            <Slider
              min={SPACER_LIMITS.min}
              max={SPACER_LIMITS.max}
              value={section.settings.height ?? SPACER_LIMITS.initial}
              tooltip={{ formatter: (value?: number) => `${value} px` }}
              onChange={(height: number) => setSettings({ height })}
            />
          </Form.Item>
        ) : (
          <Form.Item key={option} label={t(`storeSite.editor.builder.options.${option}`)}>
            <Segmented<string>
              value={(section.settings[option] as string | null) ?? VALUES[option][0]}
              onChange={(value) => setSettings({ [option]: value })}
              options={VALUES[option].map((value: string) => ({
                value,
                label: t(`storeSite.editor.builder.values.${option}.${value}`),
              }))}
            />
          </Form.Item>
        ),
      )}
    </Form>
  );
};

export default PieceFields;
